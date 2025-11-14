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
   *
   * Uses Promise.race() for reliable timeout handling since Gemini SDK
   * doesn't support AbortController signals.
   */
  async generate(prompt: string): Promise<ImageResult> {
    if (!this.genAI || !this.apiKey) {
      return this.failure('Gemini API key not configured');
    }

    try {
      console.debug(`[Gemini Flash Image] Generating with ${this.model}...`);

      const imageModel = this.genAI.getGenerativeModel({
        model: this.model,
        generationConfig: {
          // Configure for image output (critical for image generation)
          responseMimeType: 'image/png',
        }
      });

      // Create timeout promise that rejects after specified duration
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('Image generation timeout')),
          this.requestTimeout
        )
      );

      // Race between image generation and timeout
      const result = await Promise.race([
        imageModel.generateContent(prompt),
        timeoutPromise,
      ]);

      const response = result.response;

      // Validate response structure before accessing
      if (!Array.isArray(response.candidates) || response.candidates.length === 0) {
        console.warn('[Gemini Flash Image] No candidates in response');
        return this.failure('No candidates in response');
      }

      const candidate = response.candidates[0];

      // Validate candidate content structure
      if (!candidate.content || !Array.isArray(candidate.content.parts) || candidate.content.parts.length === 0) {
        console.warn('[Gemini Flash Image] No content parts in candidate');
        return this.failure('No content parts in response');
      }

      // Iterate through parts to find inline image data
      for (const part of candidate.content.parts) {
        // Base64 encoded image (primary format for Gemini Flash Image)
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType;

          // Validate mimeType - warn if missing but provide fallback
          if (!mimeType) {
            console.warn('[Gemini Flash Image] Missing mimeType, defaulting to image/png');
          }

          const base64Data = part.inlineData.data;
          const dataUrl = `data:${mimeType || 'image/png'};base64,${base64Data}`;

          console.debug('[Gemini Flash Image] ✓ Generated successfully');
          return this.success(dataUrl);
        }

        // File URI (alternative format)
        if (part.fileData && part.fileData.fileUri) {
          console.debug('[Gemini Flash Image] ✓ Generated successfully (file URI)');
          return this.success(part.fileData.fileUri);
        }
      }

      // No image data found in any part
      console.warn('[Gemini Flash Image] No image data found in response parts');
      return this.failure('No image data in response');

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      // Check for specific error types
      if (message.includes('Image generation timeout')) {
        console.warn(`[Gemini Flash Image] Timeout after ${this.requestTimeout}ms`);
        return this.failure('Image generation timeout');
      }

      if (message.includes('quota') || message.includes('rate limit')) {
        console.warn('[Gemini Flash Image] Quota/rate limit exceeded');
        return this.failure('API quota exceeded');
      }

      console.warn('[Gemini Flash Image] Generation failed:', message);
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
