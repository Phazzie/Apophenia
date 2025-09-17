import { getConfig } from '../config';

interface ImageVariation {
  url: string;
  prompt: string;
  quality: 'nano_banana' | 'imagen' | 'unsplash';
}

interface ImageGenerationResult {
  variations: ImageVariation[];
  selectedIndex?: number;
}

class ImageGenerationService {
  constructor() {
    // Mock implementation for Nano Banana and Imagen
    // In production, would use actual Google AI clients
  }

  async generateImageVariations(prompt: string, count: number = 3): Promise<ImageGenerationResult> {
    const variations: ImageVariation[] = [];
    
    try {
      // Try Nano Banana first (conceptual - would use real API in production)
      const nanoBananaVariations = await this.generateNanoBananaVariations(prompt, count);
      variations.push(...nanoBananaVariations);
      
      if (variations.length < count) {
        // Fallback to Imagen (mock implementation)
        const imagenVariations = await this.generateImagenVariations(prompt, count - variations.length);
        variations.push(...imagenVariations);
      }
      
      if (variations.length < count) {
        // Final fallback to Enhanced Unsplash
        const unsplashVariations = await this.generateUnsplashVariations(prompt, count - variations.length);
        variations.push(...unsplashVariations);
      }
      
    } catch (error) {
      console.error('Image generation failed:', error);
      // Fallback to Unsplash only
      const unsplashVariations = await this.generateUnsplashVariations(prompt, count);
      variations.push(...unsplashVariations);
    }

    return {
      variations: variations.slice(0, count),
      selectedIndex: 0 // Default to first variation
    };
  }

  private async generateNanoBananaVariations(prompt: string, count: number): Promise<ImageVariation[]> {
    const config = getConfig();
    
    // Mock implementation - would use real Nano Banana API in production
    const horrorPrompts = this.enhanceHorrorPrompt(prompt);
    const promises = horrorPrompts.slice(0, count).map(async (enhancedPrompt, index) => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100 + index * 50));
      
      return {
        url: `https://via.placeholder.com/800x600/1a1a2e/e94560?text=Nano+Banana+${index + 1}`,
        prompt: enhancedPrompt,
        quality: 'nano_banana' as const
      };
    });

    return Promise.all(promises);
  }

  private async generateImagenVariations(prompt: string, count: number): Promise<ImageVariation[]> {
    const config = getConfig();
    
    // Mock implementation - would use real Google Imagen API in production
    const horrorPrompts = this.enhanceHorrorPrompt(prompt);
    const promises = horrorPrompts.slice(0, count).map(async (enhancedPrompt, index) => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 200 + index * 100));

        return {
          url: `https://via.placeholder.com/800x600/2d1b69/e94560?text=Imagen+${index + 1}`,
          prompt: enhancedPrompt,
          quality: 'imagen' as const
        };
      } catch (error) {
        console.error(`Imagen generation ${index + 1} failed:`, error);
        return {
          url: `https://via.placeholder.com/800x600/2d1b69/e94560?text=Imagen+Error+${index + 1}`,
          prompt: enhancedPrompt,
          quality: 'imagen' as const
        };
      }
    });

    return Promise.all(promises);
  }

  private async generateUnsplashVariations(prompt: string, count: number): Promise<ImageVariation[]> {
    const keywords = this.extractHorrorKeywords(prompt);
    const variations: ImageVariation[] = [];

    for (let i = 0; i < count; i++) {
      const keyword = keywords[i % keywords.length];
      const url = `https://source.unsplash.com/800x600/?${keyword},dark,horror`;
      
      variations.push({
        url,
        prompt: `${prompt} (${keyword})`,
        quality: 'unsplash'
      });
    }

    return variations;
  }

  private enhanceHorrorPrompt(basePrompt: string): string[] {
    const horrorEnhancements = [
      `${basePrompt}, cosmic horror, lovecraftian atmosphere, dark shadows, eerie lighting, psychological terror`,
      `${basePrompt}, disturbing reality, glitching existence, digital corruption, AI consciousness horror`,
      `${basePrompt}, existential dread, reality breakdown, consciousness fragmentation, horror aesthetic`
    ];

    return horrorEnhancements;
  }

  private extractHorrorKeywords(prompt: string): string[] {
    const baseKeywords = ['horror', 'dark', 'eerie', 'shadows', 'abandoned', 'mysterious'];
    const promptWords = prompt.toLowerCase().split(' ');
    
    // Extract relevant words from prompt
    const relevantWords = promptWords.filter(word => 
      word.length > 3 && !['the', 'and', 'but', 'for', 'are', 'with'].includes(word)
    );

    return [...relevantWords.slice(0, 3), ...baseKeywords];
  }
}

export const imageGenerationService = new ImageGenerationService();
export type { ImageVariation, ImageGenerationResult };