import { imageFallbackService } from './imageFallbackService';

interface ImageVariation {
  url: string;
  prompt: string;
  quality: 'imagen' | 'unsplash';
}

interface ImageGenerationResult {
  variations: ImageVariation[];
  selectedIndex?: number;
}

/**
 * Image Generation Service - now uses fallback service
 * Maintains backward compatibility with existing interface
 */
class ImageGenerationService {
  constructor() {
    // Enhanced Google Imagen integration with production-ready fallbacks
    // Now delegates to unified imageFallbackService with strategy pattern
  }

  async generateImageVariations(prompt: string, count: number = 3): Promise<ImageGenerationResult> {
    try {
      // Use the unified fallback service for variations
      const result = await imageFallbackService.generateImageVariations({
        prompt,
        useHorrorIntensity: true,
        variationCount: count,
      });

      // Convert to legacy format for backward compatibility
      const variations: ImageVariation[] = result.variations.map((variation) => ({
        url: variation.url,
        prompt: variation.prompt,
        quality: (variation.source === 'unsplash' ? 'unsplash' : 'imagen') as 'imagen' | 'unsplash',
      }));

      return {
        variations,
        selectedIndex: result.selectedIndex,
      };

    } catch (error) {
      console.error('Image generation failed:', error);

      // Emergency fallback
      const fallback = imageFallbackService.generateImage({
        prompt,
        useHorrorIntensity: true,
      });

      return fallback
        .then((result) => ({
          variations: [{
            url: result.url,
            prompt,
            quality: (result.source === 'unsplash' ? 'unsplash' : 'imagen') as 'imagen' | 'unsplash',
          }],
          selectedIndex: 0,
        }))
        .catch((fallbackError: Error) => {
          console.error('Emergency fallback also failed:', fallbackError);
          // Final fallback: return a placeholder
          return {
            variations: [{
              url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiI+SW1hZ2UgVW5hdmFpbGFibGU8L3RleHQ+PC9zdmc+',
              prompt,
              quality: 'unsplash' as 'imagen' | 'unsplash',
            }],
            selectedIndex: 0,
          };
        });
    }
  }
}

export const imageGenerationService = new ImageGenerationService();
export type { ImageVariation, ImageGenerationResult };