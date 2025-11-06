/**
 * Image Generation Strategy Pattern
 * Implements various image generation strategies with clear separation of concerns
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_MODELS } from '../../config';
import { generateUnsplashUrl } from './unsplashFallback';

/**
 * Image generation result interface
 */
export interface ImageGenerationResult {
  url: string;
  source: 'backend' | 'imagen-primary' | 'imagen-secondary' | 'unsplash' | 'svg-fallback';
  model?: string;
  success: boolean;
}

/**
 * Base strategy interface for image generation
 */
export interface ImageGenerationStrategy {
  name: string;
  priority: number;
  canAttempt(): boolean;
  generate(prompt: string): Promise<ImageGenerationResult | null>;
}

/**
 * Backend API Strategy
 * Uses backend API with Grok-first and Imagen fallback on backend
 */
export class BackendAPIStrategy implements ImageGenerationStrategy {
  name = 'Backend API';
  priority = 1; // Highest priority

  canAttempt(): boolean {
    // Can always attempt backend (it has its own internal fallbacks)
    return true;
  }

  async generate(prompt: string): Promise<ImageGenerationResult | null> {
    try {
      console.log('[BackendAPIStrategy] Attempting backend API generation...');

      const { backendAPIService } = await import('../backendAPIService');
      const result = await backendAPIService.generateImage(prompt);

      if (result.imageGenerated && result.fallbackUrl) {
        console.log(`[BackendAPIStrategy] Success with ${result.model}`);
        return {
          url: result.fallbackUrl,
          source: 'backend',
          model: result.model,
          success: true,
        };
      }

      if (result.fallbackUrl) {
        console.log(`[BackendAPIStrategy] Fallback with ${result.model}`);
        return {
          url: result.fallbackUrl,
          source: 'backend',
          model: result.model,
          success: true,
        };
      }

      console.log('[BackendAPIStrategy] No image URL returned');
      return null;
    } catch (error) {
      console.warn('[BackendAPIStrategy] Failed:', error);
      return null;
    }
  }
}

/**
 * Direct Imagen API Strategy (Primary)
 * Uses Google Imagen API directly with primary model
 */
export class ImagenPrimaryStrategy implements ImageGenerationStrategy {
  name = 'Imagen Primary';
  priority = 2;

  private genAI: GoogleGenerativeAI | null = null;
  private googleApiKey: string;

  constructor() {
    this.googleApiKey =
      (typeof process !== 'undefined'
        ? process.env.VITE_GEMINI_API_KEY
        : import.meta.env.VITE_GEMINI_API_KEY) || '';

    if (this.googleApiKey) {
      this.genAI = new GoogleGenerativeAI(this.googleApiKey);
    }
  }

  canAttempt(): boolean {
    return this.genAI !== null && this.googleApiKey !== '';
  }

  async generate(prompt: string): Promise<ImageGenerationResult | null> {
    if (!this.genAI) {
      return null;
    }

    try {
      const modelName = AI_MODELS.FALLBACK_IMAGE || 'imagen-3.0-generate-001';
      console.log(`[ImagenPrimaryStrategy] Generating with ${modelName}...`);

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
              console.log('[ImagenPrimaryStrategy] Success with base64 image');
              return {
                url: dataUrl,
                source: 'imagen-primary',
                model: modelName,
                success: true,
              };
            }

            // Check for image URL
            if (part.fileData && part.fileData.fileUri) {
              console.log('[ImagenPrimaryStrategy] Success with file URI');
              return {
                url: part.fileData.fileUri,
                source: 'imagen-primary',
                model: modelName,
                success: true,
              };
            }
          }
        }

        // Check for text response with URL
        const text = response.text();
        if (text && (text.includes('http') || text.includes('data:'))) {
          console.log('[ImagenPrimaryStrategy] Success with URL in text');
          return {
            url: text.trim(),
            source: 'imagen-primary',
            model: modelName,
            success: true,
          };
        }
      }

      console.log('[ImagenPrimaryStrategy] Response did not contain image data');
      return null;
    } catch (error) {
      console.warn('[ImagenPrimaryStrategy] Failed:', error);
      return null;
    }
  }
}

/**
 * Direct Imagen API Strategy (Secondary/Fallback)
 * Uses Google Imagen API with fallback model
 */
export class ImagenSecondaryStrategy implements ImageGenerationStrategy {
  name = 'Imagen Secondary';
  priority = 3;

  private genAI: GoogleGenerativeAI | null = null;
  private googleApiKey: string;

  constructor() {
    this.googleApiKey =
      (typeof process !== 'undefined'
        ? process.env.VITE_GEMINI_API_KEY
        : import.meta.env.VITE_GEMINI_API_KEY) || '';

    if (this.googleApiKey) {
      this.genAI = new GoogleGenerativeAI(this.googleApiKey);
    }
  }

  canAttempt(): boolean {
    return this.genAI !== null && AI_MODELS.SECONDARY_FALLBACK_IMAGE !== undefined;
  }

  async generate(prompt: string): Promise<ImageGenerationResult | null> {
    if (!this.genAI || !AI_MODELS.SECONDARY_FALLBACK_IMAGE) {
      return null;
    }

    try {
      const modelName = AI_MODELS.SECONDARY_FALLBACK_IMAGE;
      console.log(`[ImagenSecondaryStrategy] Generating with ${modelName}...`);

      const imageModel = this.genAI.getGenerativeModel({ model: modelName });
      const result = await imageModel.generateContent(prompt);
      const response = result.response;

      // Extract image data from response (same logic as primary)
      if (response.candidates && response.candidates[0]) {
        const candidate = response.candidates[0];

        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.data) {
              const mimeType = part.inlineData.mimeType || 'image/png';
              const base64Data = part.inlineData.data;
              const dataUrl = `data:${mimeType};base64,${base64Data}`;
              console.log('[ImagenSecondaryStrategy] Success with base64 image');
              return {
                url: dataUrl,
                source: 'imagen-secondary',
                model: modelName,
                success: true,
              };
            }

            if (part.fileData && part.fileData.fileUri) {
              console.log('[ImagenSecondaryStrategy] Success with file URI');
              return {
                url: part.fileData.fileUri,
                source: 'imagen-secondary',
                model: modelName,
                success: true,
              };
            }
          }
        }

        const text = response.text();
        if (text && (text.includes('http') || text.includes('data:'))) {
          console.log('[ImagenSecondaryStrategy] Success with URL in text');
          return {
            url: text.trim(),
            source: 'imagen-secondary',
            model: modelName,
            success: true,
          };
        }
      }

      console.log('[ImagenSecondaryStrategy] Response did not contain image data');
      return null;
    } catch (error) {
      console.warn('[ImagenSecondaryStrategy] Failed:', error);
      return null;
    }
  }
}

/**
 * Unsplash Fallback Strategy
 * Always succeeds with horror-themed Unsplash images
 */
export class UnsplashFallbackStrategy implements ImageGenerationStrategy {
  name = 'Unsplash Fallback';
  priority = 4; // Low priority, used as fallback

  canAttempt(): boolean {
    return true; // Always available
  }

  async generate(prompt: string): Promise<ImageGenerationResult | null> {
    console.log('[UnsplashFallbackStrategy] Using Unsplash fallback...');

    const url = generateUnsplashUrl(prompt);

    return {
      url,
      source: 'unsplash',
      success: true,
    };
  }
}

/**
 * SVG Emergency Fallback Strategy
 * Generates a themed SVG when all other methods fail
 */
export class SVGFallbackStrategy implements ImageGenerationStrategy {
  name = 'SVG Emergency';
  priority = 5; // Lowest priority

  canAttempt(): boolean {
    return true; // Always available
  }

  async generate(prompt: string): Promise<ImageGenerationResult | null> {
    console.log('[SVGFallbackStrategy] Using emergency SVG fallback...');

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

    return {
      url: `data:image/svg+xml;base64,${btoa(svgContent)}`,
      source: 'svg-fallback',
      success: true,
    };
  }
}
