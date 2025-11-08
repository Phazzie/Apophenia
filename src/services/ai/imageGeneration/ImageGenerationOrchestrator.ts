/**
 * Image Generation Orchestrator
 * Manages the fallback chain of image generation strategies
 */

import {
  ImageGenerationStrategy,
  ImageGenerationResult,
  BackendAPIStrategy,
  ImagenPrimaryStrategy,
  ImagenSecondaryStrategy,
  UnsplashFallbackStrategy,
  SVGFallbackStrategy,
} from './ImageGenerationStrategy';
import { enhancePromptWithWorldState, generatePromptVariations } from './imagePromptEnhancer';

/**
 * Options for image generation
 */
export interface ImageGenerationOptions {
  prompt: string;
  useHorrorIntensity?: boolean;
  generateMultiple?: boolean;
  variationCount?: number;
}

/**
 * Result for single image generation
 */
export interface SingleImageResult {
  url: string;
  source: string;
  model?: string;
}

/**
 * Result for multiple image variations
 */
export interface ImageVariationResult {
  variations: Array<{
    url: string;
    prompt: string;
    source: string;
  }>;
  selectedIndex: number;
}

/**
 * Orchestrates image generation across multiple strategies with fallback chain
 */
export class ImageGenerationOrchestrator {
  private strategies: ImageGenerationStrategy[];

  constructor() {
    // Initialize strategies in priority order
    this.strategies = [
      new BackendAPIStrategy(),
      new ImagenPrimaryStrategy(),
      new ImagenSecondaryStrategy(),
      new UnsplashFallbackStrategy(),
      new SVGFallbackStrategy(),
    ].sort((a, b) => a.priority - b.priority);
  }

  /**
   * Generate a single image using the fallback chain
   * @param options Image generation options
   * @returns Image generation result
   */
  async generateImage(options: ImageGenerationOptions): Promise<SingleImageResult> {
    const enhancedPrompt = enhancePromptWithWorldState(
      options.prompt,
      options.useHorrorIntensity ?? true
    );

    console.log(`[ImageGenerationOrchestrator] Starting image generation for: "${options.prompt}"`);

    // Try each strategy in order
    for (const strategy of this.strategies) {
      if (!strategy.canAttempt()) {
        console.log(`[ImageGenerationOrchestrator] Skipping ${strategy.name} (cannot attempt)`);
        continue;
      }

      try {
        console.log(`[ImageGenerationOrchestrator] Trying ${strategy.name}...`);
        const result = await strategy.generate(enhancedPrompt);

        if (result && result.success) {
          console.log(`[ImageGenerationOrchestrator] ✓ Success with ${strategy.name}`);
          return {
            url: result.url,
            source: result.source,
            model: result.model,
          };
        }
      } catch (error) {
        console.warn(`[ImageGenerationOrchestrator] ${strategy.name} failed:`, error);
      }
    }

    // This should never happen because SVGFallbackStrategy always succeeds
    throw new Error('All image generation strategies failed (including emergency fallback)');
  }

  /**
   * Generate multiple image variations in parallel
   * @param options Image generation options with variation count
   * @returns Multiple image variations with selected index
   */
  async generateImageVariations(
    options: ImageGenerationOptions
  ): Promise<ImageVariationResult> {
    const count = options.variationCount || 3;
    const basePrompt = enhancePromptWithWorldState(
      options.prompt,
      options.useHorrorIntensity ?? true
    );

    console.log(`[ImageGenerationOrchestrator] Generating ${count} variations in parallel...`);

    const variations = generatePromptVariations(basePrompt, count);

    try {
      const imagePromises = variations.map(async (prompt, index) => {
        try {
          const result = await this.generateImage({
            prompt,
            useHorrorIntensity: false, // Already enhanced
          });

          return {
            url: result.url,
            prompt,
            source: result.source,
          };
        } catch (error) {
          console.warn(`[ImageGenerationOrchestrator] Variation ${index + 1} failed:`, error);

          // Emergency fallback for this variation
          const unsplashStrategy = new UnsplashFallbackStrategy();
          const fallbackResult = await unsplashStrategy.generate(prompt);

          return {
            url: fallbackResult!.url,
            prompt,
            source: 'unsplash',
          };
        }
      });

      const results = await Promise.all(imagePromises);

      // Select the best result (prefer non-fallback sources)
      const preferredIndex = results.findIndex(
        (r) => r.source === 'backend' || r.source.includes('imagen')
      );

      console.log(
        `[ImageGenerationOrchestrator] ✓ Generated ${results.length} variations, selected #${preferredIndex >= 0 ? preferredIndex : 0}`
      );

      return {
        variations: results,
        selectedIndex: preferredIndex >= 0 ? preferredIndex : 0,
      };
    } catch (error) {
      console.warn('[ImageGenerationOrchestrator] Parallel generation failed:', error);

      // Return single Unsplash fallback
      const unsplashStrategy = new UnsplashFallbackStrategy();
      const fallback = await unsplashStrategy.generate(basePrompt);

      return {
        variations: [
          {
            url: fallback!.url,
            prompt: basePrompt,
            source: 'unsplash',
          },
        ],
        selectedIndex: 0,
      };
    }
  }

  /**
   * Get list of available strategies
   * @returns Array of strategy names and their availability
   */
  getAvailableStrategies(): Array<{ name: string; available: boolean; priority: number }> {
    return this.strategies.map((strategy) => ({
      name: strategy.name,
      available: strategy.canAttempt(),
      priority: strategy.priority,
    }));
  }

  /**
   * Test fallback chain by attempting all strategies
   * @param prompt Test prompt
   * @returns Results for each strategy
   */
  async testFallbackChain(
    prompt: string
  ): Promise<Array<{ strategy: string; success: boolean; error?: string }>> {
    const results = [];

    for (const strategy of this.strategies) {
      if (!strategy.canAttempt()) {
        results.push({
          strategy: strategy.name,
          success: false,
          error: 'Cannot attempt (prerequisites not met)',
        });
        continue;
      }

      try {
        const result = await strategy.generate(prompt);
        results.push({
          strategy: strategy.name,
          success: result !== null && result.success,
          error: result === null ? 'Returned null' : undefined,
        });
      } catch (error) {
        results.push({
          strategy: strategy.name,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }
}

// Export singleton instance
export const imageGenerationOrchestrator = new ImageGenerationOrchestrator();
