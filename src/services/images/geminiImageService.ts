/**
 * Gemini Image Generation Service
 *
 * Integrates with Google's Gemini image generation API.
 * Priority: 2 (secondary fallback)
 */

import { ImageResult } from '../../core/types/seams';
import { BaseImageService } from './base/ImageService';

/**
 * Gemini Image Service - Google Gemini image generation
 * Uses Gemini 2.5 Pro for image generation
 */
export class GeminiImageService extends BaseImageService {
  readonly provider = 'gemini';
  readonly priority = 2;

  private apiKey: string | undefined;
  private apiBase = 'https://generativelanguage.googleapis.com/v1beta/models';
  private requestTimeout = 30000; // 30 seconds

  constructor() {
    super();
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  }

  /**
   * Check if Gemini API is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      console.debug('[Gemini] No API key configured (VITE_GEMINI_API_KEY)');
      return false;
    }

    try {
      // Quick health check by listing models
      const response = await fetch(`${this.apiBase}?key=${this.apiKey}`, {
        signal: AbortSignal.timeout(5000),
      });

      return response.ok;
    } catch (error) {
      console.debug('[Gemini] Service unavailable:', error instanceof Error ? error.message : error);
      return false;
    }
  }

  /**
   * Generate an image using Gemini API
   */
  async generate(prompt: string): Promise<ImageResult> {
    if (!this.apiKey) {
      return this.failure('Gemini API key not configured');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

      // Use Gemini 2.5 Pro Experimental with vision
      const response = await fetch(
        `${this.apiBase}/gemini-2.5-pro-exp-01-21:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Generate an image that matches this description: ${prompt}\n\nRespond with ONLY a valid image URL starting with http.`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              topK: 40,
              maxOutputTokens: 1024,
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        console.warn(`[Gemini] API error (${response.status}):`, error);
        return this.failure(`Gemini API error: ${response.status}`);
      }

      const data = await response.json() as {
        candidates: Array<{
          content: {
            parts: Array<{ text: string }>;
          };
        }>;
      };

      if (!data.candidates || data.candidates.length === 0) {
        return this.failure('Gemini returned no response');
      }

      const textContent = data.candidates[0].content.parts[0]?.text;
      if (!textContent) {
        return this.failure('Gemini returned empty response');
      }

      // Extract URL from text (Gemini might include explanation)
      const urlMatch = textContent.match(/https?:\/\/[^\s]+/);
      const imageUrl = urlMatch ? urlMatch[0] : textContent.trim();

      if (!imageUrl.startsWith('http')) {
        return this.failure('Gemini did not return a valid image URL');
      }

      return this.success(imageUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('[Gemini] Generation failed:', message);
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
