/**
 * Comprehensive Image Cache Service
 * 
 * Provides a unified interface for:
 * - Image generation with caching
 * - Smart prompt optimization
 * - localStorage persistence
 * - Cache statistics and management
 */

import { useImageCacheStore } from '../core/state/imageCacheStore';
import { generateOptimizedImagePrompt } from './imagePromptTemplates';
import { processAdvancedImageGeneration } from './ai/secureGenkit';
import { imageGenerationService } from './ai/imageGeneration';

export interface ImageGenerationOptions {
  horrorIntensity?: number;
  fearTriggers?: string[];
  setting?: string;
  useOptimizedPrompt?: boolean;
  variationCount?: number;
}

export interface ImageResult {
  url: string;
  cached: boolean;
  quality: 'imagen' | 'unsplash' | 'fallback';
  prompt: string;
}

class ImageCacheService {
  /**
   * Get or generate an image with comprehensive caching
   */
  async getOrGenerate(
    basePrompt: string,
    options: ImageGenerationOptions = {}
  ): Promise<ImageResult> {
    const {
      horrorIntensity = 5,
      fearTriggers = [],
      setting,
      useOptimizedPrompt = true,
      variationCount = 3,
    } = options;

    // Optimize the prompt if requested
    const finalPrompt = useOptimizedPrompt
      ? generateOptimizedImagePrompt(basePrompt, horrorIntensity, fearTriggers, setting)
      : basePrompt;

    console.log('🎨 Image generation requested:', {
      basePrompt: basePrompt.substring(0, 50) + '...',
      optimized: useOptimizedPrompt,
      horrorIntensity,
    });

    // Check cache first
    const cached = useImageCacheStore.getState().getFromCache(finalPrompt);
    if (cached) {
      console.log('✅ Image found in cache');
      return {
        url: cached,
        cached: true,
        quality: 'imagen', // Assume cached images were successfully generated
        prompt: finalPrompt,
      };
    }

    // Generate new image
    console.log('🔄 Generating new image...');
    try {
      // Try generating multiple variations
      const result = await imageGenerationService.generateImageVariations(
        finalPrompt,
        variationCount
      );

      if (result.variations.length > 0) {
        const bestVariation = result.variations[0];
        
        // Cache the result
        useImageCacheStore.getState().addToCache(finalPrompt, bestVariation.url);
        
        console.log(`✨ Generated image with ${result.variations.length} variations (quality: ${bestVariation.quality})`);
        
        return {
          url: bestVariation.url,
          cached: false,
          quality: bestVariation.quality,
          prompt: finalPrompt,
        };
      }

      // Fallback to basic generation
      const fallbackUrl = await processAdvancedImageGeneration(finalPrompt);
      useImageCacheStore.getState().addToCache(finalPrompt, fallbackUrl);
      
      return {
        url: fallbackUrl,
        cached: false,
        quality: 'fallback',
        prompt: finalPrompt,
      };
      
    } catch (error) {
      console.error('❌ Image generation failed:', error);
      
      // Return thematic fallback
      const fallbackUrl = this.generateThematicFallback(basePrompt);
      
      return {
        url: fallbackUrl,
        cached: false,
        quality: 'fallback',
        prompt: finalPrompt,
      };
    }
  }

  /**
   * Pregenerate images for upcoming story segments
   */
  async pregenerateImages(prompts: Array<{ prompt: string; options?: ImageGenerationOptions }>): Promise<void> {
    console.log(`🔮 Pregenerating ${prompts.length} images...`);
    
    const promises = prompts.map(({ prompt, options }) =>
      this.getOrGenerate(prompt, options).catch(error => {
        console.warn(`Failed to pregenerate image for: ${prompt}`, error);
        return null;
      })
    );

    await Promise.all(promises);
    console.log('✅ Pregeneration complete');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const cache = useImageCacheStore.getState().imageCache;
    const telemetry = useImageCacheStore.getState().getTelemetry();
    
    const now = Date.now();
    const TTL = 30 * 60 * 1000; // 30 minutes
    
    let fresh = 0;
    let stale = 0;
    let totalSize = 0;

    Object.values(cache).forEach(entry => {
      if (now - entry.timestamp <= TTL) {
        fresh++;
      } else {
        stale++;
      }
      // Rough estimate: 100KB per image URL
      totalSize += 0.1;
    });

    const hitRate = telemetry.totalRequests > 0
      ? ((telemetry.hits / telemetry.totalRequests) * 100).toFixed(1)
      : '0.0';

    return {
      totalEntries: fresh + stale,
      freshEntries: fresh,
      staleEntries: stale,
      cacheHits: telemetry.hits,
      cacheMisses: telemetry.misses,
      cacheEvictions: telemetry.evictions,
      hitRate: `${hitRate}%`,
      estimatedSize: `${totalSize.toFixed(1)}MB`,
    };
  }

  /**
   * Clear all cached images
   */
  clearCache() {
    useImageCacheStore.getState().clearCache();
    console.log('🗑️ Image cache cleared');
  }

  /**
   * Perform cache maintenance (evict stale entries)
   */
  performMaintenance() {
    const beforeSize = useImageCacheStore.getState().getCacheSize();
    useImageCacheStore.getState().evictStaleEntries();
    const afterSize = useImageCacheStore.getState().getCacheSize();
    
    if (beforeSize !== afterSize) {
      console.log(`🧹 Cache maintenance: ${beforeSize} → ${afterSize} entries`);
    }
  }

  /**
   * Generate a thematic SVG fallback
   */
  private generateThematicFallback(prompt: string): string {
    const keywords = prompt.toLowerCase().split(' ').slice(0, 3).join(' ');
    
    const svgContent = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="#1a1a2e"/>
            <stop offset="70%" stop-color="#16213e"/>
            <stop offset="100%" stop-color="#0f0f23"/>
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <circle cx="400" cy="300" r="150" fill="none" stroke="#e94560" stroke-width="2" opacity="0.3" stroke-dasharray="5,5">
          <animate attributeName="r" values="150;160;150" dur="4s" repeatCount="indefinite"/>
        </circle>
        <text x="50%" y="45%" font-family="serif" font-size="20" fill="#e94560" text-anchor="middle" dy=".3em" filter="url(#glow)">
          The whispers from beyond grow faint...
        </text>
        <text x="50%" y="55%" font-family="monospace" font-size="12" fill="#666" text-anchor="middle" dy=".3em">
          ${keywords}
        </text>
        <text x="50%" y="65%" font-family="monospace" font-size="10" fill="#444" text-anchor="middle" dy=".3em">
          [Cosmic forces disrupted image generation]
        </text>
      </svg>
    `.trim();

    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  }
}

export const imageCacheService = new ImageCacheService();
