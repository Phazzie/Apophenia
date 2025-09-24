import { getConfig } from '../config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { API_KEYS } from '../config';

interface ImageVariation {
  url: string;
  prompt: string;
  quality: 'imagen' | 'unsplash';
}

interface ImageGenerationResult {
  variations: ImageVariation[];
  selectedIndex?: number;
}

class ImageGenerationService {
  private imageClient: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;

  constructor() {
    // Initialize Google Imagen client if API key is available
    if (API_KEYS.googleImagen || API_KEYS.googleGenAI) {
      const genAI = new GoogleGenerativeAI(API_KEYS.googleImagen || API_KEYS.googleGenAI);
      this.imageClient = genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" });
    }
  }

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


  private async generateImagenVariations(prompt: string, count: number): Promise<ImageVariation[]> {
    const variations: ImageVariation[] = [];
    
    if (!this.imageClient) {
      console.log('Google Imagen client not available - skipping AI generation');
      return variations;
    }

    const horrorPrompts = this.enhanceHorrorPrompt(prompt);
    
    // Generate images sequentially to avoid API rate limits
    for (let i = 0; i < Math.min(count, horrorPrompts.length); i++) {
      try {
        const enhancedPrompt = horrorPrompts[i];
        console.log(`Generating Imagen variation ${i + 1}: ${enhancedPrompt}`);
        
        const result = await this.imageClient.generateContent(enhancedPrompt);
        const response = result.response;
        
        // Check if the response contains image data
        if (response.candidates && response.candidates.length > 0) {
          const candidate = response.candidates[0];
          
          if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
              if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')) {
                const base64Data = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                const dataUrl = `data:${mimeType};base64,${base64Data}`;
                
                variations.push({
                  url: dataUrl,
                  prompt: enhancedPrompt,
                  quality: 'imagen' as const
                });
                
                console.log(`Imagen variation ${i + 1} generated successfully`);
                break;
              }
            }
          }
        }
        
        // Add a small delay between requests to be respectful to the API
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (error) {
        console.error(`Imagen generation ${i + 1} failed:`, error);
        // Continue with next variation instead of failing completely
      }
    }

    return variations;
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