/**
 * GENERATE IMAGE EXECUTOR
 *
 * Triggers asynchronous image generation for a story segment.
 * Implements ImageGenerationExecutor interface with caching support.
 */

import { BaseCommandExecutor } from './base/CommandExecutor';
import { Command, ExecutionResult, ValidationResult, ImageGenerationExecutor } from '../types/seams';
import { useHistoryStore } from '../state/historyStore';

/**
 * Executor for generateImage commands
 *
 * Initiates async image generation and updates the segment when complete.
 * Uses the image pipeline with fallback support.
 *
 * Note: This executor returns success immediately, even if image generation
 * is still in progress. The actual image URL is updated asynchronously.
 */
export class GenerateImageExecutor extends BaseCommandExecutor implements ImageGenerationExecutor {
  // Simple in-memory cache for this session
  private imageCache: Map<string, string> = new Map();

  /**
   * Check if this executor can handle the given command
   *
   * @param command - The command to check
   * @returns true if this executor can handle the command
   */
  canExecute(command: Command): boolean {
    return command.type === 'generateImage';
  }

  /**
   * Validate the generateImage command before execution
   *
   * Checks for:
   * - Required fields (prompt, segmentId)
   * - Type correctness (prompt must be string)
   * - Segment existence
   *
   * @param command - The command to validate
   * @returns Validation result with any errors
   */
  validate(command: Command): ValidationResult {
    if (command.type !== 'generateImage') {
      return { valid: false, errors: ['Wrong command type'] };
    }

    if (!command.payload.prompt) {
      return { valid: false, errors: ['Missing prompt'] };
    }

    if (!command.payload.segmentId) {
      return { valid: false, errors: ['Missing segmentId'] };
    }

    if (typeof command.payload.prompt !== 'string') {
      return { valid: false, errors: ['Prompt must be a string'] };
    }

    // Verify segment exists
    const segments = useHistoryStore.getState().segments;
    const segment = segments.find(s => s.id === command.payload.segmentId);
    if (!segment) {
      return { valid: false, errors: [`Segment not found: ${command.payload.segmentId}`] };
    }

    return { valid: true, errors: [] };
  }

  protected async executeInternal(command: Command): Promise<ExecutionResult> {
    if (command.type !== 'generateImage') {
      return { success: false, command, error: 'Invalid command type' };
    }

    try {
      const { prompt, segmentId, priority = 'low' } = command.payload;

      // Check cache first
      const cached = this.getCachedImage(prompt);
      if (cached) {
        useHistoryStore.getState().updateSegment(segmentId, {
          images: {
            main: cached,
            mainStatus: 'loaded',
          },
        });

        return {
          success: true,
          command,
          metadata: {
            segmentId,
            cached: true,
            priority,
          },
        };
      }

      // Mark as loading
      useHistoryStore.getState().updateSegment(segmentId, {
        images: {
          mainStatus: 'loading',
        },
      });

      // Generate image asynchronously
      // Note: We return success immediately, image generation happens in background
      this.generateWithFallback(prompt).then((imageUrl) => {
        if (imageUrl) {
          this.imageCache.set(prompt, imageUrl);
          useHistoryStore.getState().updateSegment(segmentId, {
            images: {
              main: imageUrl,
              mainStatus: 'loaded',
            },
          });
        } else {
          // Image generation failed
          useHistoryStore.getState().updateSegment(segmentId, {
            images: {
              mainStatus: 'failed',
            },
          });
        }
      });

      return {
        success: true,
        command,
        metadata: {
          segmentId,
          cached: false,
          priority,
          async: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        command,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Generate image with fallback support
   *
   * Tries multiple image providers in order:
   * 1. Gemini 2.5 Flash Image (primary)
   * 2. XAI Grok-2-image (fallback)
   * 3. Unsplash stock photos (emergency)
   *
   * Returns null if all providers fail.
   */
  async generateWithFallback(prompt: string): Promise<string | null> {
    try {
      console.log('[GenerateImageExecutor] Image generation requested for prompt:', prompt);

      // Import the ImagePipeline dynamically to avoid circular dependencies
      // Circular dependency path: generateImage.ts → ImagePipeline.ts → commandQueue.ts → generateImage.ts
      // Dynamic import breaks this cycle by deferring ImagePipeline loading until runtime
      const { imagePipeline } = await import('../../services/images/ImagePipeline');

      // Generate image using the full fallback chain
      const imageUrl = await imagePipeline.generate(prompt, 'command-generated');

      if (imageUrl) {
        console.log('[GenerateImageExecutor] ✓ Image generated successfully');
      } else {
        console.warn('[GenerateImageExecutor] All image generation providers failed');
      }

      return imageUrl;
    } catch (error) {
      console.error('[GenerateImageExecutor] Image generation error:', error);
      return null;
    }
  }

  /**
   * Get cached image URL for a prompt
   */
  getCachedImage(prompt: string): string | null {
    return this.imageCache.get(prompt) || null;
  }
}

/**
 * Retry image generation for a segment
 * Helper function for manual retry from UI
 */
export function retryImageGeneration(segmentId: string, prompt: string): void {
  const executor = new GenerateImageExecutor();
  const command: Command = {
    type: 'generateImage',
    payload: {
      segmentId,
      prompt,
      priority: 'high',
    },
  };

  // Execute immediately (fire and forget)
  executor.execute(command).catch((error) => {
    console.error('Failed to retry image generation:', error);
  });
}
