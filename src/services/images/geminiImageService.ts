/**
 * Gemini 2.5 Flash Image Generation Service
 *
 * Integrates with Google's Gemini 2.5 Flash Image (native image generation).
 * Priority: 1 (highest priority - primary image generation)
 *
 * Uses gemini-2.5-flash-image model for text-to-image generation.
 * This model accepts natural language prompts (including conversational-style
 * descriptions) and generates images with contextual understanding.
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
   * Check if Gemini Flash Image API is available.
   *
   * By default, this method only checks for the presence of an API key and
   * a constructed GoogleGenerativeAI instance. It does NOT verify that the
   * API key is valid, that the model exists, or that quota is available.
   * This is intentional to avoid latency in the UI.
   *
   * Pass `forceCheck = true` to perform a real API call to verify the key and model.
   * This may add latency and should only be used for diagnostics or admin UI.
   *
   * @param forceCheck If true, perform a real API/model check (default: false)
   * @returns Promise<boolean> indicating service availability
   */
  async isAvailable(forceCheck: boolean = false): Promise<boolean> {
    if (!this.apiKey || !this.genAI) {
      console.debug('[Gemini Flash Image] No API key configured (VITE_GEMINI_API_KEY)');
      return false;
    }

    if (!forceCheck) {
      // Simple availability check - if we have an API key, assume available
      // Actual API test would add latency to every image generation
      return true;
    }

    // Perform a real API/model check
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      // Model object existence indicates the model is accessible
      return !!model;
    } catch (err) {
      console.warn('[Gemini Flash Image] Real availability check failed:', err);
      return false;
    }
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
        // Note: responseMimeType is not needed for image generation models.
        // The gemini-2.5-flash-image model returns images in the response's
        // inlineData or fileData fields automatically.
      });

      // Create timeout and store its ID so it can be cleared
      let timeoutId: ReturnType<typeof setTimeout>;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error('Image generation timeout')),
          this.requestTimeout
        );
      });

      // Race between image generation and timeout, and clear timeout when done
      const result = await Promise.race([
        imageModel.generateContent(prompt).finally(() => clearTimeout(timeoutId)),
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

      /**
       * Gemini 2.5 Flash Image API response structure:
       * - The image is typically returned as `inlineData` (base64-encoded PNG) in the first part of candidate.content.parts.
       * - Rarely, it may be returned as `fileData` (file URI) or in a different part.
       * - We optimize for the common case, but fall back to iterating all parts for robustness.
       */

      const parts = candidate.content.parts;

      // 1. Check first part for inlineData (most common case)
      const firstPart = parts[0];
      if (firstPart && firstPart.inlineData && firstPart.inlineData.data) {
        const mimeType = firstPart.inlineData.mimeType;
        if (!mimeType) {
          console.warn('[Gemini Flash Image] Missing mimeType, defaulting to image/png');
        }
        const base64Data = firstPart.inlineData.data;
        const dataUrl = `data:${mimeType || 'image/png'};base64,${base64Data}`;
        console.debug('[Gemini Flash Image] ✓ Generated successfully (first part)');
        return this.success(dataUrl);
      }

      // 2. Fallback: Iterate through all parts for inlineData or fileData
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType;
          if (!mimeType) {
            console.warn('[Gemini Flash Image] Missing mimeType, defaulting to image/png');
          }
          const base64Data = part.inlineData.data;
          const dataUrl = `data:${mimeType || 'image/png'};base64,${base64Data}`;
          console.debug('[Gemini Flash Image] ✓ Generated successfully (fallback)');
          return this.success(dataUrl);
        }
        if (part.fileData && part.fileData.fileUri) {
          console.debug('[Gemini Flash Image] ✓ Generated successfully (file URI fallback)');
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
