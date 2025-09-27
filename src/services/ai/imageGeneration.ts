/**
 * @file imageGeneration.ts
 * @description A dedicated service for generating multiple, high-quality image variations for a given prompt.
 * It orchestrates different generation strategies, primarily using Google's Imagen, and provides
 * robust fallbacks to Unsplash to ensure a visual is always available.
 */

import { processAdvancedImageGeneration } from './genkit';

/**
 * @interface ImageVariation
 * @description Represents a single generated image variation, including its URL, the prompt used, and its quality source.
 * @property {string} url - The URL of the generated image.
 * @property {string} prompt - The specific prompt used to generate this image.
 * @property {'imagen' | 'unsplash'} quality - The source of the image, indicating if it was AI-generated ('imagen') or a fallback ('unsplash').
 */
interface ImageVariation {
  url: string;
  prompt: string;
  quality: 'imagen' | 'unsplash';
}

/**
 * @interface ImageGenerationResult
 * @description Represents the result of a request to generate image variations.
 * @property {ImageVariation[]} variations - An array of the generated image variations.
 * @property {number} [selectedIndex] - The index of the recommended variation to use.
 */
interface ImageGenerationResult {
  variations: ImageVariation[];
  selectedIndex?: number;
}

/**
 * Service class responsible for orchestrating the generation of image variations.
 * It attempts to use high-quality AI generation and gracefully falls back to lower-quality
 * but reliable sources if needed.
 */
class ImageGenerationService {
  /**
   * Initializes the image generation service.
   * The constructor can be expanded to configure API clients or other dependencies.
   */
  constructor() {
    // The service is designed for production-ready use with real AI image generation (Imagen)
    // and a curated horror imagery fallback system (Unsplash).
  }

  /**
   * Generates a specified number of image variations for a given prompt.
   * It prioritizes using the advanced Imagen generation and supplements with Unsplash fallbacks if necessary.
   *
   * @param {string} prompt - The base prompt for which to generate images.
   * @param {number} [count=3] - The desired number of image variations.
   * @returns {Promise<ImageGenerationResult>} A promise that resolves to an object containing the generated variations.
   */
  async generateImageVariations(prompt: string, count: number = 3): Promise<ImageGenerationResult> {
    const variations: ImageVariation[] = [];
    
    try {
      // Try Google Imagen first (production-ready implementation)
      const imagenVariations = await this.generateImagenVariations(prompt, count);
      variations.push(...imagenVariations);
      
      if (variations.length < count) {
        // Fallback to Enhanced Unsplash
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


  /**
   * Generates image variations using the primary AI service (Google Imagen).
   * It enhances the base prompt with horror-specific themes before sending requests.
   *
   * @private
   * @param {string} prompt - The base prompt.
   * @param {number} count - The number of variations to generate.
   * @returns {Promise<ImageVariation[]>} A promise that resolves to an array of generated image variations.
   */
  private async generateImagenVariations(prompt: string, count: number): Promise<ImageVariation[]> {
    const horrorPrompts = this.enhanceHorrorPrompt(prompt);
    const promises = horrorPrompts.slice(0, count).map(async (enhancedPrompt, index) => {
      try {
        // Delegate to the advanced generation flow in genkit.ts
        const imageUrl = await processAdvancedImageGeneration(enhancedPrompt);
        
        // Determine the quality based on whether the result is from the primary AI or a fallback
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
          quality: 'unsplash' as const // An error results in a fallback-quality image
        };
      }
    });

    return Promise.all(promises);
  }

  /**
   * Generates fallback image variations using the Unsplash API.
   * This method is used when the primary AI image generation fails or is insufficient.
   *
   * @private
   * @param {string} prompt - The original prompt to extract keywords from.
   * @param {number} count - The number of Unsplash images to fetch.
   * @returns {Promise<ImageVariation[]>} A promise that resolves to an array of Unsplash image variations.
   */
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

  /**
   * Creates several enhanced, horror-themed prompts from a single base prompt.
   * This is used to generate a diverse set of image variations.
   *
   * @private
   * @param {string} basePrompt - The user-provided prompt.
   * @returns {string[]} An array of enhanced prompts.
   */
  private enhanceHorrorPrompt(basePrompt: string): string[] {
    const horrorEnhancements = [
      `${basePrompt}, cosmic horror, lovecraftian atmosphere, dark shadows, eerie lighting, psychological terror`,
      `${basePrompt}, disturbing reality, glitching existence, digital corruption, AI consciousness horror`,
      `${basePrompt}, existential dread, reality breakdown, consciousness fragmentation, horror aesthetic`
    ];

    return horrorEnhancements;
  }

  /**
   * Extracts relevant keywords from a prompt to use in a fallback Unsplash search.
   * It combines keywords from the prompt with a base set of horror-themed words.
   *
   * @private
   * @param {string} prompt - The prompt to extract keywords from.
   * @returns {string[]} An array of keywords for the image search.
   */
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