import { getConfig } from '../config';
import { generateImageFlow } from './genkit';

interface ImageVariation {
  url: string;
  prompt: string;
  quality: 'gemini' | 'unsplash';
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
    const horrorPrompts = this.enhanceHorrorPrompt(prompt);

    try {
      const imagePromises = horrorPrompts.slice(0, count).map(p => generateImageFlow(p));
      const results = await Promise.all(imagePromises);
      
      const variations: ImageVariation[] = await Promise.all(results.map(async (url, index) => {
        const fallbackUrl = (await this.generateUnsplashVariations(prompt, 1))[0].url;
        return {
          url: url || fallbackUrl,
          prompt: horrorPrompts[index],
          quality: url && !url.includes('unsplash') ? 'gemini' : 'unsplash',
        };
      }));

      return {
        variations,
        selectedIndex: 0
      };
    } catch (error) {
      console.error('Parallel image generation failed, falling back to Unsplash:', error);
      const unsplashVariations = await this.generateUnsplashVariations(prompt, count);
      return {
        variations: unsplashVariations,
        selectedIndex: 0,
      };
    }
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