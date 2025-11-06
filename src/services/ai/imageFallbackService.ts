/**
 * Unified Image Generation Fallback Service
 * Consolidates all image generation fallback strategies into a single, reusable implementation
 *
 * Fallback Chain:
 * 1. Backend API (Grok-first with Imagen fallback on backend)
 * 2. Direct Imagen API (primary model)
 * 3. Direct Imagen API (secondary fallback model)
 * 4. Unsplash with horror keywords
 * 5. SVG fallback (emergency)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_MODELS } from '../config';
import { useWorldStateStore } from '../../stores/worldStateStore';

export interface ImageGenerationOptions {
  prompt: string;
  useHorrorIntensity?: boolean;
  generateMultiple?: boolean;
  variationCount?: number;
}

export interface ImageGenerationResult {
  url: string;
  source: 'backend' | 'imagen-primary' | 'imagen-secondary' | 'unsplash' | 'svg-fallback';
  model?: string;
}

export interface ImageVariationResult {
  variations: Array<{
    url: string;
    prompt: string;
    source: string;
  }>;
  selectedIndex: number;
}

/**
 * Unified Image Fallback Service
 */
class ImageFallbackService {
  private googleApiKey: string;
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    this.googleApiKey =
      (typeof process !== 'undefined'
        ? process.env.VITE_GEMINI_API_KEY
        : import.meta.env.VITE_GEMINI_API_KEY) || '';

    if (this.googleApiKey) {
      this.genAI = new GoogleGenerativeAI(this.googleApiKey);
    }
  }

  /**
   * Main entry point for image generation with full fallback chain
   */
  async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const enhancedPrompt = this.enhancePromptWithHorrorIntensity(
      options.prompt,
      options.useHorrorIntensity ?? true
    );

    console.log(`Image generation for prompt: "${options.prompt}"`);

    // Try each fallback in sequence
    try {
      // 1. Backend API (Grok-first with Imagen fallback)
      const backendResult = await this.tryBackendGeneration(enhancedPrompt);
      if (backendResult) return backendResult;

      // 2. Direct Imagen API (primary model)
      const imagenPrimaryResult = await this.tryImagenGeneration(enhancedPrompt, 'primary');
      if (imagenPrimaryResult) return imagenPrimaryResult;

      // 3. Direct Imagen API (secondary fallback model)
      const imagenSecondaryResult = await this.tryImagenGeneration(enhancedPrompt, 'secondary');
      if (imagenSecondaryResult) return imagenSecondaryResult;

      // 4. Unsplash with horror keywords
      console.log('All AI generation methods failed, using Unsplash fallback');
      return this.generateUnsplashFallback(options.prompt);

    } catch (error) {
      console.warn('All image generation methods failed:', error);
      // 5. SVG fallback (emergency)
      return this.generateSVGFallback(options.prompt);
    }
  }

  /**
   * Generate multiple image variations in parallel
   */
  async generateImageVariations(options: ImageGenerationOptions): Promise<ImageVariationResult> {
    const count = options.variationCount || 3;
    const basePrompt = this.enhancePromptWithHorrorIntensity(
      options.prompt,
      options.useHorrorIntensity ?? true
    );

    const variations = [
      `${basePrompt}, close-up perspective, intimate horror`,
      `${basePrompt}, wide-angle view, environmental terror`,
      `${basePrompt}, dramatic lighting, shadow play emphasis`,
    ];

    try {
      console.log(`Generating ${count} image variations in parallel...`);

      const imagePromises = variations.slice(0, count).map(async (prompt, index) => {
        try {
          const result = await this.generateImage({
            prompt,
            useHorrorIntensity: false // Already enhanced
          });
          return {
            url: result.url,
            prompt,
            source: result.source,
          };
        } catch (error) {
          console.warn(`Variation ${index + 1} failed:`, error);
          return {
            url: this.generateUnsplashFallback(prompt).url,
            prompt,
            source: 'unsplash',
          };
        }
      });

      const results = await Promise.all(imagePromises);

      // Select the best result (prefer non-fallback sources)
      const preferredIndex = results.findIndex(r =>
        r.source === 'backend' || r.source.includes('imagen')
      );

      return {
        variations: results,
        selectedIndex: preferredIndex >= 0 ? preferredIndex : 0,
      };

    } catch (error) {
      console.warn('Parallel image generation failed:', error);
      // Return single Unsplash fallback
      const fallback = this.generateUnsplashFallback(basePrompt);
      return {
        variations: [{
          url: fallback.url,
          prompt: basePrompt,
          source: fallback.source,
        }],
        selectedIndex: 0,
      };
    }
  }

  /**
   * Enhance prompt with horror intensity keywords
   */
  private enhancePromptWithHorrorIntensity(prompt: string, useIntensity: boolean): string {
    if (!useIntensity) {
      return prompt;
    }

    const { horrorIntensity } = useWorldStateStore.getState().worldState;

    const intensityKeywords = [
      '', // 0
      'subtle unease,', // 1
      'eerie, unsettling,', // 2
      'dread-filled, macabre,', // 3
      'disturbing, nightmarish,', // 4
      'grotesque, body horror,', // 5
      'surreal, reality-bending,', // 6
      'mind-shattering, cosmic horror,', // 7
      'incomprehensible, sanity-breaking,', // 8
      'eldritch abomination, visceral,', // 9
      'apocalyptic, pure terror,', // 10
    ];

    const keyword = intensityKeywords[Math.round(horrorIntensity)] || '';

    return `${prompt}. ${keyword}Photorealistic cosmic horror style, atmospheric nightmare lighting, surreal otherworldly aesthetics, lovecraftian eldritch elements, psychological horror atmosphere, high contrast cinematic composition, digital consciousness themes, reality distortion effects`;
  }

  /**
   * Try backend API image generation
   */
  private async tryBackendGeneration(prompt: string): Promise<ImageGenerationResult | null> {
    try {
      console.log('Attempting backend API image generation (Grok-first with Imagen fallback)...');

      const { backendAPIService, BackendAPIError } = await import('./backendAPIService');
      const result = await backendAPIService.generateImage(prompt);

      if (result.imageGenerated && result.fallbackUrl) {
        console.log(`Backend image generation successful with ${result.model}!`);
        return {
          url: result.fallbackUrl,
          source: 'backend',
          model: result.model,
        };
      }

      if (result.fallbackUrl) {
        console.log(`Backend returned fallback image with ${result.model}`);
        return {
          url: result.fallbackUrl,
          source: 'backend',
          model: result.model,
        };
      }

      return null;

    } catch (error) {
      console.warn('Backend API image generation failed:', error);
      return null;
    }
  }

  /**
   * Try direct Imagen API generation
   */
  private async tryImagenGeneration(
    prompt: string,
    tier: 'primary' | 'secondary'
  ): Promise<ImageGenerationResult | null> {
    if (!this.genAI || !this.googleApiKey) {
      console.log('Google AI API key not available');
      return null;
    }

    try {
      const modelName = tier === 'primary'
        ? (AI_MODELS.FALLBACK_IMAGE || 'imagen-3.0-generate-001')
        : AI_MODELS.SECONDARY_FALLBACK_IMAGE;

      console.log(`Generating image with Google Imagen API (${tier} model: ${modelName})...`);

      const imageModel = this.genAI.getGenerativeModel({ model: modelName });
      const result = await imageModel.generateContent(prompt);
      const response = result.response;

      // Extract image data from response
      if (response.candidates && response.candidates[0]) {
        const candidate = response.candidates[0];

        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            // Check for base64 encoded image
            if (part.inlineData && part.inlineData.data) {
              const mimeType = part.inlineData.mimeType || 'image/png';
              const base64Data = part.inlineData.data;
              const dataUrl = `data:${mimeType};base64,${base64Data}`;
              console.log(`Successfully generated image with Google Imagen (${tier})`);
              return {
                url: dataUrl,
                source: tier === 'primary' ? 'imagen-primary' : 'imagen-secondary',
                model: modelName,
              };
            }

            // Check for image URL
            if (part.fileData && part.fileData.fileUri) {
              console.log(`Successfully generated image with Google Imagen (${tier})`);
              return {
                url: part.fileData.fileUri,
                source: tier === 'primary' ? 'imagen-primary' : 'imagen-secondary',
                model: modelName,
              };
            }
          }
        }

        // Check for text response with URL
        const text = response.text();
        if (text && (text.includes('http') || text.includes('data:'))) {
          console.log(`Successfully generated image with Google Imagen (${tier})`);
          return {
            url: text.trim(),
            source: tier === 'primary' ? 'imagen-primary' : 'imagen-secondary',
            model: modelName,
          };
        }
      }

      console.log(`Google Imagen (${tier}) response did not contain image data`);
      return null;

    } catch (error) {
      console.warn(`Google Imagen (${tier}) generation failed:`, error);
      return null;
    }
  }

  /**
   * Generate Unsplash fallback with horror-specific keywords
   */
  private generateUnsplashFallback(prompt: string): ImageGenerationResult {
    const horrorKeywords = [
      'dark', 'horror', 'nightmare', 'cosmic', 'surreal', 'atmospheric',
      'eerie', 'ominous', 'mysterious', 'otherworldly', 'abstract', 'shadows'
    ];

    // Extract meaningful words from prompt
    const promptKeywords = prompt
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 3)
      .slice(0, 2)
      .join(',');

    // Select random horror keywords
    const randomHorrorKeywords = horrorKeywords
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .join(',');

    const keywords = promptKeywords
      ? `${randomHorrorKeywords},${promptKeywords}`
      : randomHorrorKeywords;

    const imageUrl = `https://source.unsplash.com/1920x1080/?${encodeURIComponent(keywords)}`;
    console.log(`Using Unsplash fallback with keywords: ${keywords}`);

    return {
      url: imageUrl,
      source: 'unsplash',
    };
  }

  /**
   * Generate SVG fallback for complete failure scenarios
   */
  private generateSVGFallback(prompt: string): ImageGenerationResult {
    const keywords = prompt.toLowerCase().split(' ').slice(0, 3).join('-');
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
          [Image generation failed - cosmic forces disrupted]
        </text>
      </svg>
    `.trim();

    console.log('Using emergency SVG fallback');
    return {
      url: `data:image/svg+xml;base64,${btoa(svgContent)}`,
      source: 'svg-fallback',
    };
  }

  /**
   * Extract horror keywords from prompt for Unsplash search
   * (Utility method for backward compatibility)
   */
  extractHorrorKeywords(prompt: string): string[] {
    const baseKeywords = ['horror', 'dark', 'eerie', 'shadows', 'abandoned', 'mysterious'];
    const promptWords = prompt.toLowerCase().split(' ');

    // Extract relevant words from prompt
    const relevantWords = promptWords.filter(word =>
      word.length > 3 && !['the', 'and', 'but', 'for', 'are', 'with'].includes(word)
    );

    return [...relevantWords.slice(0, 3), ...baseKeywords];
  }
}

// Export singleton instance
export const imageFallbackService = new ImageFallbackService();
