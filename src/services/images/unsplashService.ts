/**
 * Unsplash Fallback Image Service
 *
 * Searches Unsplash API for stock photos matching the prompt.
 * Priority: 3 (tertiary fallback, best-effort)
 */

import { ImageResult } from '../../core/types/seams';
import { BaseImageService } from './base/ImageService';

/**
 * Unsplash Image Service - Stock photo fallback
 * Searches Unsplash for photos matching the mood/keywords
 */
export class UnsplashService extends BaseImageService {
  readonly provider = 'unsplash';
  readonly priority = 3;

  private accessKey: string | undefined;
  private apiBase = 'https://api.unsplash.com';
  private requestTimeout = 10000; // 10 seconds

  constructor() {
    super();
    // Unsplash is free but requires an API key for reliability
    this.accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  }

  /**
   * Check if Unsplash API is available (always attempts, even without key)
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Unsplash allows limited unauthenticated requests
      const response = await fetch(`${this.apiBase}/search/photos?query=test&page=1&per_page=1`, {
        headers: this.accessKey ? { Authorization: `Client-ID ${this.accessKey}` } : {},
        signal: AbortSignal.timeout(3000),
      });

      return response.ok || response.status === 403; // 403 is rate limit, service is up
    } catch {
      return false; // Network error
    }
  }

  /**
   * Generate an image by searching Unsplash
   */
  async generate(prompt: string): Promise<ImageResult> {
    try {
      // Simplify prompt for Unsplash search (stock photos don't need detailed descriptions)
      const searchQuery = this.simplifyPrompt(prompt);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

      const headers: Record<string, string> = {
        'Accept-Version': 'v1',
      };

      if (this.accessKey) {
        headers['Authorization'] = `Client-ID ${this.accessKey}`;
      }

      const response = await fetch(
        `${this.apiBase}/search/photos?query=${encodeURIComponent(searchQuery)}&page=1&per_page=5&order_by=popular&content_filter=high`,
        {
          headers,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      // Rate limited or no key
      if (response.status === 403) {
        return this.failure('Unsplash rate limit reached');
      }

      if (!response.ok) {
        console.warn(`[Unsplash] API error (${response.status})`);
        return this.failure(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json() as {
        results: Array<{
          urls: { regular: string };
          links: { download: string };
        }>;
      };

      if (!data.results || data.results.length === 0) {
        return this.failure('Unsplash found no matching photos');
      }

      // Use first result's regular-size image
      const imageUrl = data.results[0].urls.regular;

      if (!imageUrl) {
        return this.failure('Unsplash returned invalid image data');
      }

      return this.success(imageUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('[Unsplash] Search failed:', message);
      return this.failure(message);
    }
  }

  /**
   * Convert detailed prompt into Unsplash search terms
   * Removes jargon and abstractions, keeps visual keywords
   *
   * @private
   * @param prompt - The original generation prompt
   * @returns Simplified search query
   */
  private simplifyPrompt(prompt: string): string {
    // Extract key visual words, remove descriptors
    const keywords = prompt
      .toLowerCase()
      .split(/[\s,]+/)
      .filter(
        (word) =>
          word.length > 3 &&
          !['with', 'dark', 'cosmic', 'horror', 'eerie', 'unsettling'].includes(word)
      )
      .slice(0, 3) // Keep top 3 keywords
      .join(' ');

    return keywords || 'dark abstract'; // Fallback search
  }

  /**
   * Validate Unsplash configuration (optional API key)
   */
  protected hasRequiredEnvVars(): boolean {
    // Unsplash doesn't require auth, so always true
    // But log if we don't have a key for rate limiting purposes
    if (!this.accessKey) {
      console.debug(
        '[Unsplash] No API key configured - rate limits apply. Set VITE_UNSPLASH_ACCESS_KEY for better reliability'
      );
    }
    return true;
  }
}

export const unsplashService = new UnsplashService();
