import { getConfig } from '../config';
import { processAdvancedImageGeneration } from './genkit';

interface ImageVariation {
  url: string;
  prompt: string;
  quality: 'xai' | 'imagen' | 'unsplash';
}

interface ImageGenerationResult {
  variations: ImageVariation[];
  selectedIndex?: number;
}

class ImageGenerationService {
  constructor() {
    // Enhanced multi-provider image generation
    // X.AI (primary) → Google Imagen (secondary) → Unsplash (fallback)
  }

  async generateImageVariations(prompt: string, count: number = 3): Promise<ImageGenerationResult> {
    const variations: ImageVariation[] = [];
    
    try {
      // Try X.AI batch generation first
      const xaiVariations = await this.generateXAIVariations(prompt, count);
      variations.push(...xaiVariations);
      
      if (variations.length < count) {
        // Fallback to Google Imagen for remaining images
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

  private async generateXAIVariations(prompt: string, count: number): Promise<ImageVariation[]> {
    try {
      // Import xaiClient to avoid circular dependencies
      const { xaiClient } = await import('./grokService');
      
      if (!xaiClient) {
        console.log('X.AI client not available');
        return [];
      }
      
      console.log(`Generating ${count} X.AI image variations...`);
      const results = await xaiClient.generateMultipleImages(prompt, count);
      
      if (!results || results.length === 0) {
        console.log('X.AI returned no image results');
        return [];
      }
      
      return results.map((url, index) => ({
        url,
        prompt: `${prompt} (X.AI variation ${index + 1})`,
        quality: 'xai' as const // Mark as X.AI generated
      }));
      
    } catch (error) {
      console.error('X.AI image generation failed:', error);
      return [];
    }
  }


  private async generateImagenVariations(prompt: string, count: number): Promise<ImageVariation[]> {
    const config = getConfig();
    
    // Real implementation using Google Imagen API
    const horrorPrompts = this.enhanceHorrorPrompt(prompt);
    const promises = horrorPrompts.slice(0, count).map(async (enhancedPrompt, index) => {
      try {
        // Use the real Imagen API instead of mock
        const imageResult = await processAdvancedImageGeneration(enhancedPrompt);
        
        // Handle both single and array results
        const imageUrl = Array.isArray(imageResult) ? imageResult[0] : imageResult;
        
        // Check if we got a real generated image (not Unsplash fallback)
        const isRealImageGeneration = imageUrl && !imageUrl.includes('unsplash.com');
        
        return {
          url: imageUrl || `https://via.placeholder.com/800x600/2d1b69/e94560?text=Imagen+Error+${index + 1}`,
          prompt: enhancedPrompt,
          quality: isRealImageGeneration ? 'imagen' as const : 'unsplash' as const
        };
      } catch (error) {
        console.error(`Imagen generation ${index + 1} failed:`, error);
        return {
          url: `https://via.placeholder.com/800x600/2d1b69/e94560?text=Imagen+Error+${index + 1}`,
          prompt: enhancedPrompt,
          quality: 'unsplash' as const // Error fallback is not real Imagen generation
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