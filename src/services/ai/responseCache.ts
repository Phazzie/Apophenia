/**
 * Response Cache Service
 * Caches AI responses to reduce redundant API calls
 * 5-minute TTL for cache entries
 */

import { AIResponse } from '../../core/types/seams';

interface CacheEntry {
  response: AIResponse;
  timestamp: number;
}

class ResponseCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start automatic cleanup every 2 minutes
    this.startCleanup();

    // Register cleanup on window unload to prevent memory leaks
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.stopCleanup();
      });
    }
  }

  /**
   * Generate a cache key from prompt and context
   * Uses SHA-256 for collision-resistant hashing
   */
  async generateKey(prompt: string, context?: Record<string, unknown>): Promise<string> {
    const data = context ? `${prompt}::${JSON.stringify(context)}` : prompt;

    // Use crypto.subtle for SHA-256 hashing
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get cached response if available and not expired
   */
  get(key: string): AIResponse | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.response;
  }

  /**
   * Set cache entry with current timestamp
   */
  set(key: string, response: AIResponse): void {
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; ttl: number } {
    return {
      size: this.cache.size,
      ttl: this.TTL,
    };
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    // Find expired keys
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL) {
        expiredKeys.push(key);
      }
    }

    // Delete expired entries
    for (const key of expiredKeys) {
      this.cache.delete(key);
    }

    if (expiredKeys.length > 0) {
      console.log(`Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanup(): void {
    if (this.cleanupInterval) {
      return;
    }

    // Run cleanup every 2 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 2 * 60 * 1000);
  }

  /**
   * Stop automatic cleanup (for testing or cleanup)
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

}

// Export singleton instance
export const responseCache = new ResponseCache();

/**
 * Destroy the response cache and stop cleanup interval
 * Call this when unmounting or cleaning up to prevent memory leaks
 */
export function destroyResponseCache(): void {
  responseCache.stopCleanup();
}
