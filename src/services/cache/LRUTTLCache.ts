/**
 * LRU + TTL Cache Implementation
 *
 * Combines Least Recently Used eviction with Time-To-Live expiration.
 * - Max 50 items (LRU evicts oldest when full)
 * - 30 minute TTL (entries expire regardless of usage)
 * - Transparent to consumers
 */

import { LRUTTLCache } from '../../core/types/seams';

interface CacheEntry {
  value: string;
  expiresAt: number;
  accessCount: number;
  lastAccessedAt: number;
}

/**
 * LRU + TTL Cache for image URLs
 *
 * When cache reaches maxSize, the least recently used item is evicted.
 * When current time exceeds an entry's TTL, it's automatically removed.
 */
export class LRUTTLCacheImpl implements LRUTTLCache {
  readonly maxSize = 50;
  readonly defaultTTL = 30 * 60 * 1000; // 30 minutes in milliseconds

  private cache = new Map<string, CacheEntry>();
  private accessOrder: string[] = []; // Track insertion order for LRU

  /**
   * Retrieve a value from cache
   *
   * @param key - The cache key
   * @returns The cached value, or null if not found or expired
   */
  get(key: string): string | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check TTL expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return null;
    }

    // Update access time (for LRU purposes)
    entry.lastAccessedAt = Date.now();
    entry.accessCount++;

    // Move to end of access order (most recently used)
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);

    return entry.value;
  }

  /**
   * Store a value in cache
   *
   * @param key - The cache key
   * @param url - The value to cache (image URL)
   * @param ttl - Optional TTL in milliseconds (uses defaultTTL if not provided)
   */
  set(key: string, url: string, ttl: number = this.defaultTTL): void {
    // If at capacity, evict least recently used
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evict();
    }

    const now = Date.now();

    // If key exists, update it; otherwise, create new entry
    if (this.cache.has(key)) {
      // Remove from access order to re-add at end
      this.removeFromAccessOrder(key);
    }

    this.cache.set(key, {
      value: url,
      expiresAt: now + ttl,
      accessCount: 0,
      lastAccessedAt: now,
    });

    this.accessOrder.push(key);
  }

  /**
   * Check if a key exists in cache (ignores TTL)
   *
   * @param key - The cache key
   * @returns true if key exists, false otherwise
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return false;
    }

    return true;
  }

  /**
   * Get current number of items in cache
   *
   * @returns Number of items (including expired, not yet pruned)
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clear all cached items
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Evict the least recently used item
   *
   * @returns The key that was evicted, or null if cache is empty
   */
  evict(): string | null {
    if (this.accessOrder.length === 0) {
      return null;
    }

    // Remove first item (least recently used)
    const lruKey = this.accessOrder.shift();

    if (lruKey) {
      this.cache.delete(lruKey);
      return lruKey;
    }

    return null;
  }

  /**
   * Remove all expired entries from cache
   *
   * @returns Number of entries pruned
   */
  prune(): number {
    const now = Date.now();
    let prunedCount = 0;

    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      prunedCount++;
    }

    return prunedCount;
  }

  /**
   * Get cache statistics for debugging/monitoring
   *
   * @returns Stats object with current state and TTL info
   */
  getStats(): {
    size: number;
    maxSize: number;
    fillPercentage: number;
    expiredCount: number;
    oldestExpiresIn: number | null; // milliseconds
  } {
    const now = Date.now();
    let expiredCount = 0;
    let oldestExpiresIn: number | null = null;

    for (const [, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        expiredCount++;
      } else {
        const expiresIn = entry.expiresAt - now;
        if (oldestExpiresIn === null || expiresIn < oldestExpiresIn) {
          oldestExpiresIn = expiresIn;
        }
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      fillPercentage: (this.cache.size / this.maxSize) * 100,
      expiredCount,
      oldestExpiresIn,
    };
  }

  /**
   * Remove a key from access order tracking
   *
   * @private
   * @param key - The key to remove
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }
}

/**
 * Singleton instance of the cache
 */
export const lruTTLCache = new LRUTTLCacheImpl();
