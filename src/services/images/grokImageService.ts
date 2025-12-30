/**
 * Grok Image Generation Service
 *
 * Integrates with X.AI's Grok image generation API.
 * Priority: 1 (highest priority fallback)
 */

import { ImageResult } from '../../core/types/seams';
import { BaseImageService } from './base/ImageService';

/**
 * Grok Image Service - X.AI image generation
 * Uses Grok-2 vision model for image generation
 * Priority: 2 (fallback for Gemini 2.5 Flash Image)
 */
export class GrokImageService extends BaseImageService {
  readonly provider = 'grok';
  // #TODO: Critical Priority Mismatch - Tests expect priority 1 but this was set to 2.
  // This causes 'tests/contracts/image-services.contract.test.ts' and 'tests/unit/images/imageServices.test.ts' to fail.
  // Verify if 1 or 2 is the intended priority and align code and tests.
  // Reference: #TODO.md - Task 1
  readonly priority = 2;

  private apiKey: string | undefined;
  private apiBase = 'https://api.x.ai/v1';
  private requestTimeout = 30000; // 30 seconds

  constructor() {
    super();
    this.apiKey = import.meta.env.VITE_XAI_API_KEY;
  }

  /**
   * Check if Grok API is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      console.debug('[Grok] No API key configured (VITE_XAI_API_KEY)');
      return false;
    }

    try {
      // Quick health check
      const response = await fetch(`${this.apiBase}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        signal: AbortSignal.timeout(5000),
      });

      return response.ok;
    } catch (error) {
      console.debug('[Grok] Service unavailable:', error instanceof Error ? error.message : error);
      return false;
    }
  }

  /**
   * Generate an image using Grok API
   */
  async generate(prompt: string): Promise<ImageResult> {
    if (!this.apiKey) {
      return this.failure('Grok API key not configured');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

      const response = await fetch(`${this.apiBase}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'grok-2-image-1212',
          prompt: prompt,
          response_format: 'url',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        console.warn(`[Grok] API error (${response.status}):`, error);
        return this.failure(`Grok API error: ${response.status}`);
      }

      const data = await response.json() as { data: Array<{ url: string }> };

      if (!data.data || data.data.length === 0) {
        return this.failure('Grok returned no image');
      }

      return this.success(data.data[0].url);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('[Grok] Generation failed:', message);
      return this.failure(message);
    }
  }

  /**
   * Validate Grok configuration
   */
  protected hasRequiredEnvVars(): boolean {
    return !!import.meta.env.VITE_XAI_API_KEY;
  }
}

export const grokImageService = new GrokImageService();
