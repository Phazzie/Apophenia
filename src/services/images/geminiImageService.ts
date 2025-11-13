/**
 * Gemini 2.5 Flash Image Generation Service
 *
 * Integrates with Google's Gemini 2.5 Flash Image (native image generation).
 * Priority: 1 (highest priority - primary image generation)
 *
 * Uses gemini-2.5-flash-image model for conversational image generation
 * with unparalleled flexibility and contextual understanding.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ImageResult } from '../../core/types/seams';
import { BaseImageService } from './base/ImageService';

/**
 * Gemini Image Service - Google AI native image generation
 * Uses Gemini 2.5 Flash Image for flexible, conversational image generation
 */
export class GeminiImageService extends BaseImageService {
  readonly provider = 'gemini-flash-image';
  readonly priority = 1; // Highest priority (primary)

  private apiKey: string | undefined;
  private genAI: GoogleGenerativeAI | null = null;
  private model = 'gemini-2.5-flash-image';
  private requestTimeout = 30000; // 30 seconds (optimized for fast generation)

  constructor() {
    super();
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }

  /**
   * Check if Gemini Flash Image API is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.apiKey || !this.genAI) {
      console.debug('[Gemini Flash Image] No API key configured (VITE_GEMINI_API_KEY)');
      return false;
    }

    // Simple availability check - if we have an API key, assume available
    // Actual API test would add latency to every image generation
    return true;
  }

  /**
   * Generate an image using Gemini 2.5 Flash Image
   */
  async generate(prompt: string): Promise<ImageResult> {
    if (!this.genAI || !this.apiKey) {
      return this.failure('Gemini API key not configured');
    }

    try {
      console.debug(`[Gemini Flash Image] Generating with ${this.model}...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

      const imageModel = this.genAI.getGenerativeModel({ model: this.model });

      // Generate the image - Gemini Flash Image accepts simple text prompt
      const result = await imageModel.generateContent(prompt);

      clearTimeout(timeoutId);

      const response = result.response;

      // Extract image from response parts (Gemini native format)
      if (response.candidates && response.candidates[0]) {
        const candidate = response.candidates[0];

        // Iterate through parts to find inline image data
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            // Base64 encoded image (primary format for Gemini Flash Image)
            if (part.inlineData && part.inlineData.data) {
              const mimeType = part.inlineData.mimeType || 'image/png';
              const base64Data = part.inlineData.data;
              const dataUrl = `data:${mimeType};base64,${base64Data}`;

              console.log(`[Gemini Flash Image] ✓ Generated successfully`);
              return this.success(dataUrl);
            }

            // File URI (alternative format)
            if (part.fileData && part.fileData.fileUri) {
              console.log(`[Gemini Flash Image] ✓ Generated successfully (file URI)`);
              return this.success(part.fileData.fileUri);
            }
          }
        }
      }

      console.warn(`[Gemini Flash Image] Response did not contain image data`);
      return this.failure('No image data in response');

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      // Check for specific error types
      if (message.includes('aborted')) {
        console.warn(`[Gemini Flash Image] Timeout after ${this.requestTimeout}ms`);
        return this.failure('Image generation timeout');
      }

      if (message.includes('quota') || message.includes('rate limit')) {
        console.warn(`[Gemini Flash Image] Quota/rate limit exceeded`);
        return this.failure('API quota exceeded');
      }

      console.warn(`[Gemini Flash Image] Generation failed:`, message);
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
