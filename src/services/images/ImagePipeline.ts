/**
 * Image Generation Pipeline
 *
 * Coordinates multiple image generation services with caching.
 * - Checks cache first
 * - Tries services in priority order (Grok → Unsplash)
 * - Returns null if all fail (best-effort, non-blocking)
 * - Caches successful results transparently
 */

import { ImagePipeline, ImageResult, ImageService } from '../../core/types/seams';
import { grokImageService } from './grokImageService';
import { unsplashService } from './unsplashService';
import { lruTTLCache } from '../cache/LRUTTLCache';

/**
 * Image Pipeline Implementation
 *
 * Orchestrates image generation across multiple providers with caching.
 * Provides best-effort generation - null return doesn't block game flow.
 */
export class ImagePipelineImpl implements ImagePipeline {
  private services: ImageService[] = [];
  private cache = lruTTLCache;

  constructor(services: ImageService[] = []) {
    // Use provided services or default to all available
    this.services = services.length > 0 ? services : [grokImageService, unsplashService];

    // Sort by priority (lower number = higher priority)
    this.services.sort((a, b) => a.priority - b.priority);

    console.log(
      '[ImagePipeline] Initialized with providers:',
      this.services.map((s) => `${s.provider} (priority: ${s.priority})`).join(', ')
    );
  }

  /**
   * Generate an image with fallback chain
   *
   * Attempts to generate an image using services in priority order.
   * Uses cache to avoid redundant API calls.
   *
   * @param prompt - The image generation prompt
   * @param segmentId - The story segment ID (for tracking)
   * @returns Image URL or null if generation fails
   */
  async generate(prompt: string, segmentId: string): Promise<string | null> {
    const result = await this.generateWithFallback(prompt);

    console.log(
      `[ImagePipeline] Generated for segment ${segmentId}:`,
      result.cached ? '(cached)' : `via ${result.provider}`,
      result.url ? '✓' : '✗'
    );

    return result.url;
  }

  /**
   * Generate with full fallback chain and detailed result
   *
   * @param prompt - The image generation prompt
   * @returns ImageResult with URL, provider, and cache status
   */
  async generateWithFallback(prompt: string): Promise<ImageResult> {
    // Check cache first
    const cachedUrl = this.cache.get(prompt);
    if (cachedUrl) {
      return {
        url: cachedUrl,
        provider: 'cache',
        cached: true,
      };
    }

    // Try services in priority order
    for (const service of this.services) {
      try {
        const available = await service.isAvailable();

        if (!available) {
          console.debug(`[ImagePipeline] ${service.provider} not available`);
          continue;
        }

        console.debug(`[ImagePipeline] Trying ${service.provider}...`);
        const result = await service.generate(prompt);

        if (result.url) {
          // Cache successful result
          this.cache.set(prompt, result.url);

          console.log(`[ImagePipeline] ✓ Generated via ${service.provider}`);

          return result;
        }

        // Service returned null, try next
        console.debug(`[ImagePipeline] ${service.provider} returned null:`, result.error);
      } catch (error) {
        console.warn(`[ImagePipeline] ${service.provider} error:`, error instanceof Error ? error.message : error);
        // Continue to next service
      }
    }

    // All services failed
    console.warn('[ImagePipeline] All services exhausted, returning null');

    return {
      url: null,
      provider: 'none',
      cached: false,
      error: 'All image generation services failed or unavailable',
    };
  }

  /**
   * Get list of registered providers
   *
   * @returns Array of ImageService instances
   */
  getProviders(): ImageService[] {
    return [...this.services];
  }

  /**
   * Test all providers for availability
   *
   * @returns Map of provider name to availability boolean
   */
  async testProviders(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const service of this.services) {
      try {
        const available = await service.isAvailable();
        results.set(service.provider, available);
      } catch (error) {
        results.set(service.provider, false);
        console.warn(`[ImagePipeline] Provider test failed for ${service.provider}:`, error);
      }
    }

    return results;
  }

  /**
   * Get cache statistics
   *
   * @returns Cache stats for monitoring
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[ImagePipeline] Cache cleared');
  }

  /**
   * Prune expired cache entries
   *
   * @returns Number of entries removed
   */
  pruneCache(): number {
    return this.cache.prune();
  }
}

/**
 * Singleton instance of the image pipeline
 */
export const imagePipeline = new ImagePipelineImpl();
