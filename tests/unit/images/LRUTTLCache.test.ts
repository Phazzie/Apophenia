/**
 * LRU + TTL Cache Tests
 *
 * Tests cache eviction, TTL expiration, and LRU ordering.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LRUTTLCacheImpl } from '../../../src/services/cache/LRUTTLCache';

describe('LRUTTLCache', () => {
  let cache: LRUTTLCacheImpl;

  beforeEach(() => {
    cache = new LRUTTLCacheImpl();
    vi.useFakeTimers();
  });

  describe('basic operations', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', 'url1');

      expect(cache.get('key1')).toBe('url1');
    });

    it('should return null for missing keys', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should update existing keys', () => {
      cache.set('key1', 'url1');
      cache.set('key1', 'url2');

      expect(cache.get('key1')).toBe('url2');
    });

    it('should track size correctly', () => {
      expect(cache.size()).toBe(0);

      cache.set('key1', 'url1');
      expect(cache.size()).toBe(1);

      cache.set('key2', 'url2');
      expect(cache.size()).toBe(2);
    });

    it('should clear all entries', () => {
      cache.set('key1', 'url1');
      cache.set('key2', 'url2');

      cache.clear();

      expect(cache.size()).toBe(0);
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });

    it('should check key existence', () => {
      cache.set('key1', 'url1');

      expect(cache.has('key1')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });
  });

  describe('TTL expiration', () => {
    it('should expire entries after TTL', () => {
      const ttl = 10000; // 10 seconds
      cache.set('key1', 'url1', ttl);

      // Before expiration
      expect(cache.get('key1')).toBe('url1');

      // After expiration
      vi.advanceTimersByTime(ttl + 1);
      expect(cache.get('key1')).toBeNull();
    });

    it('should use defaultTTL when not specified', () => {
      cache.set('key1', 'url1');

      // Advance by default TTL
      vi.advanceTimersByTime(cache.defaultTTL + 1);

      expect(cache.get('key1')).toBeNull();
    });

    it('should respect custom TTL', () => {
      const shortTTL = 5000;
      const longTTL = 20000;

      cache.set('key1', 'url1', shortTTL);
      cache.set('key2', 'url2', longTTL);

      vi.advanceTimersByTime(10000);

      expect(cache.get('key1')).toBeNull(); // Expired
      expect(cache.get('key2')).toBe('url2'); // Still valid
    });

    it('prune should remove expired entries', () => {
      cache.set('key1', 'url1', 5000);
      cache.set('key2', 'url2', 20000);

      expect(cache.size()).toBe(2);

      vi.advanceTimersByTime(10000);

      const pruned = cache.prune();

      expect(pruned).toBe(1);
      expect(cache.size()).toBe(1);
      expect(cache.get('key2')).toBe('url2');
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used when at capacity', () => {
      // Fill cache to max
      for (let i = 0; i < cache.maxSize; i++) {
        cache.set(`key${i}`, `url${i}`);
      }

      expect(cache.size()).toBe(cache.maxSize);

      // Add one more, should evict key0 (least recently used)
      cache.set(`key${cache.maxSize}`, `url${cache.maxSize}`);

      expect(cache.size()).toBe(cache.maxSize);
      expect(cache.get('key0')).toBeNull();
      expect(cache.get(`key${cache.maxSize}`)).toBe(`url${cache.maxSize}`);
    });

    it('should move accessed items to end of LRU order', () => {
      cache.set('key1', 'url1');
      cache.set('key2', 'url2');
      cache.set('key3', 'url3');

      // Access key1, making it most recently used
      cache.get('key1');

      // Fill to capacity (key1 is most recent)
      for (let i = 0; i < cache.maxSize - 3; i++) {
        cache.set(`keyX${i}`, `urlX${i}`);
      }

      // Add one more, should evict key2 (least recently used after key1)
      cache.set('newKey', 'newUrl');

      expect(cache.get('key1')).toBe('url1'); // Still there
      expect(cache.get('key2')).toBeNull(); // Evicted
      expect(cache.get('key3')).toBe('url3'); // Still there
    });

    it('should evict and return the key', () => {
      cache.set('key1', 'url1');
      cache.set('key2', 'url2');

      const evicted = cache.evict();

      expect(evicted).toBe('key1');
      expect(cache.size()).toBe(1);
      expect(cache.get('key1')).toBeNull();
    });
  });

  describe('cache statistics', () => {
    it('should return correct stats', () => {
      cache.set('key1', 'url1', 10000);
      cache.set('key2', 'url2', 5000);

      vi.advanceTimersByTime(6000);

      const stats = cache.getStats();

      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(50);
      expect(stats.fillPercentage).toBe(4); // 2/50 * 100
      expect(stats.expiredCount).toBe(1); // key2 expired
      expect(stats.oldestExpiresIn).toBeLessThanOrEqual(4000); // key1 expires in ~4s
    });

    it('should report fill percentage correctly', () => {
      for (let i = 0; i < 25; i++) {
        cache.set(`key${i}`, `url${i}`);
      }

      const stats = cache.getStats();

      expect(stats.fillPercentage).toBe(50); // 25/50 * 100
    });
  });

  describe('edge cases', () => {
    it('should handle empty eviction gracefully', () => {
      const evicted = cache.evict();

      expect(evicted).toBeNull();
      expect(cache.size()).toBe(0);
    });

    it('should handle multiple accesses to same key', () => {
      cache.set('key1', 'url1');

      cache.get('key1');
      cache.get('key1');
      cache.get('key1');

      expect(cache.get('key1')).toBe('url1');
    });

    it('should handle updating key with different TTL', () => {
      cache.set('key1', 'url1', 20000);
      vi.advanceTimersByTime(15000);

      cache.set('key1', 'url1-updated', 10000);
      vi.advanceTimersByTime(5000);

      expect(cache.get('key1')).toBe('url1-updated'); // Still valid
    });
  });
});
