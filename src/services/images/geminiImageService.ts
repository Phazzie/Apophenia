/**
 * Gemini Image Generation Service (Imagen 3.0)
 *
 * Integrates with Google's Imagen 3.0 via Generative AI SDK.
 * Priority: 1 (highest priority - primary image generation)
 *
 * Note: "Gemini Flash" is a text model. For image generation,
 * we use Imagen 3.0, Google's image generation model.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ImageResult } from '../../core/types/seams';
import { BaseImageService } from './base/ImageService';

/**
 * Gemini/Imagen Image Service - Google AI image generation
 * Uses Imagen 3.0 model for high-quality image generation
 */
export class GeminiImageService extends BaseImageService {
  readonly provider = 'gemini-imagen';
  readonly priority = 1; // Highest priority (primary)

  private apiKey: string | undefined;
  private genAI: GoogleGenerativeAI | null = null;
  private model = 'imagen-3.0-generate-001';
  private fallbackModel = 'imagen-3.0-fast-generate-001';
  private requestTimeout = 45000; // 45 seconds (image gen is slower)

  constructor() {
    super();
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }

  /**
   * Check if Gemini/Imagen API is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.apiKey || !this.genAI) {
      console.debug('[Gemini/Imagen] No API key configured (VITE_GEMINI_API_KEY)');
      return false;
    }

    // Simple availability check - if we have an API key, assume available
    // Actual API test would add latency to every image generation
    return true;
  }

  /**
   * Generate an image using Google Imagen 3.0
   */
  async generate(prompt: string): Promise<ImageResult> {
    if (!this.genAI || !this.apiKey) {
      return this.failure('Gemini API key not configured');
    }

    // Try primary model first
    let result = await this.tryImagenModel(prompt, this.model);
    if (result.url) {
      return result;
    }

    // Try fallback model (fast variant)
    console.debug('[Gemini/Imagen] Primary model failed, trying fast model...');
    result = await this.tryImagenModel(prompt, this.fallbackModel);

    return result;
  }

  /**
   * Try generating with a specific Imagen model
   */
  private async tryImagenModel(prompt: string, modelName: string): Promise<ImageResult> {
    if (!this.genAI) {
      return this.failure('Gemini API not initialized');
    }

    try {
      console.debug(`[Gemini/Imagen] Attempting generation with ${modelName}...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

      const imageModel = this.genAI.getGenerativeModel({ model: modelName });

      // Generate the image - Imagen models accept simple text prompt
      const result = await imageModel.generateContent(prompt);

      clearTimeout(timeoutId);

      const response = result.response;

      // Extract image from response
      if (response.candidates && response.candidates[0]) {
        const candidate = response.candidates[0];

        // Check for inline data (base64 encoded image)
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            // Base64 encoded image
            if (part.inlineData && part.inlineData.data) {
              const mimeType = part.inlineData.mimeType || 'image/png';
              const base64Data = part.inlineData.data;
              const dataUrl = `data:${mimeType};base64,${base64Data}`;

              console.log(`[Gemini/Imagen] ✓ Generated with ${modelName}`);
              return this.success(dataUrl);
            }

            // Image URL
            if (part.fileData && part.fileData.fileUri) {
              console.log(`[Gemini/Imagen] ✓ Generated with ${modelName}`);
              return this.success(part.fileData.fileUri);
            }
          }
        }

        // Check text response for URL
        const text = response.text();
        if (text && (text.includes('http://') || text.includes('https://') || text.includes('data:'))) {
          const urlMatch = text.match(/(https?:\/\/[^\s]+|data:[^,]+,[^\s]+)/);
          if (urlMatch) {
            console.log(`[Gemini/Imagen] ✓ Generated with ${modelName}`);
            return this.success(urlMatch[0].trim());
          }
        }
      }

      console.warn(`[Gemini/Imagen] ${modelName} response did not contain image data`);
      return this.failure(`No image data in ${modelName} response`);

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      // Check for specific error types
      if (message.includes('aborted')) {
        console.warn(`[Gemini/Imagen] ${modelName} timeout after ${this.requestTimeout}ms`);
        return this.failure('Image generation timeout');
      }

      if (message.includes('quota') || message.includes('rate limit')) {
        console.warn(`[Gemini/Imagen] ${modelName} quota/rate limit exceeded`);
        return this.failure('API quota exceeded');
      }

      console.warn(`[Gemini/Imagen] ${modelName} generation failed:`, message);
      return this.failure(message);
    }
  }

  /**
   * Validate Gemini configuration
   */
  protected hasRequiredEnvVars(): boolean {
    return !!import.meta.env.VITE_GEMINI_API_KEY;
  }
}

export const geminiImageService = new GeminiImageService();
