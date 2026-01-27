/**
 * PREGENERATE IMAGE EXECUTOR
 *
 * Queues image generation without blocking game flow.
 * Images are cached for later use when needed.
 */

import { BaseCommandExecutor } from './base/CommandExecutor';
import { Command, ExecutionResult, ValidationResult } from '../types/seams';

/**
 * Executor for pregenerateImage commands
 *
 * Pre-generates images based on prompts and caches them for later use.
 * This executor returns success immediately - image generation happens
 * asynchronously in the background.
 *
 * Use case: Generate images ahead of time to reduce loading delays
 * when they're actually needed in the narrative.
 */
export class PregenerateImageExecutor extends BaseCommandExecutor {
  // Simple in-memory cache for pre-generated images
  private static imageCache: Map<string, string> = new Map();

  canExecute(command: Command): boolean {
    return command.type === 'pregenerateImage';
  }

  validate(command: Command): ValidationResult {
    if (command.type !== 'pregenerateImage') {
      return { valid: false, errors: ['Wrong command type'] };
    }

    if (!command.payload.prompt) {
      return { valid: false, errors: ['Missing prompt'] };
    }

    if (typeof command.payload.prompt !== 'string') {
      return { valid: false, errors: ['Prompt must be a string'] };
    }

    if (command.payload.prompt.trim().length === 0) {
      return { valid: false, errors: ['Prompt cannot be empty'] };
    }

    return { valid: true, errors: [] };
  }

  protected async executeInternal(command: Command): Promise<ExecutionResult> {
    if (command.type !== 'pregenerateImage') {
      return { success: false, command, error: 'Invalid command type' };
    }

    try {
      const { prompt } = command.payload;

      // Check if already cached
      if (PregenerateImageExecutor.imageCache.has(prompt)) {
        return {
          success: true,
          command,
          metadata: {
            cached: true,
            prompt,
          },
        };
      }

      // Queue image generation asynchronously (fire and forget)
      // Image will be cached when generation completes
      this.generateAndCache(prompt).catch((error) => {
        console.error('Failed to pregenerate image:', error);
      });

      return {
        success: true,
        command,
        metadata: {
          cached: false,
          prompt,
          queued: true,
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
   * Generate and cache an image
   *
   * This method runs asynchronously and caches the result.
   * The actual image pipeline will be implemented by Agent 7.
   */
  private async generateAndCache(prompt: string): Promise<void> {
    /*
     * #TODO [MISSING INTEGRATION] Image Pipeline Integration
     *
     * Requirements:
     * 1. Import `ImagePipeline` from `src/services/images/ImagePipeline`.
     * 2. Call `imagePipeline.generate(prompt)` to start generation.
     * 3. The pipeline handles caching internally (LRU Cache), so this class
     *    should leverage that instead of maintaining its own static `imageCache`.
     * 4. Update `getCachedImage` to query the pipeline's cache.
     *
     * Reference: See SEAMS.md "Seam #7: Image Service Interface"
     */
    console.log('Pregenerate image requested for prompt:', prompt);
  }

  /**
   * Get cached image URL for a prompt
   *
   * @param prompt - The image prompt
   * @returns The cached image URL, or null if not cached
   */
  static getCachedImage(prompt: string): string | null {
    return PregenerateImageExecutor.imageCache.get(prompt) || null;
  }

  /**
   * Clear the image cache
   *
   * Useful for testing or memory management.
   */
  static clearCache(): void {
    PregenerateImageExecutor.imageCache.clear();
  }
}
