import { useImageCacheStore } from '../imageCacheStore';

// Mock the config module to control cache settings
jest.mock('../services/config', () => ({
  CACHE_CONFIG: {
    IMAGE_CACHE_TTL: 10000, // 10 seconds for testing
    IMAGE_CACHE_MAX_SIZE: 3, // Small size for testing
    ENABLE_CACHE_TELEMETRY: true,
  },
}));

describe('ImageCacheStore', () => {
  beforeEach(() => {
    // Clear the cache and reset timers before each test
    useImageCacheStore.getState().clearCache();
    jest.useRealTimers();
  });

  describe('basic cache operations', () => {
    it('should add and retrieve images from cache', () => {
      const store = useImageCacheStore.getState();
      store.addToCache('test prompt', 'test-url');
      const result = store.getFromCache('test prompt');
      expect(result).toBe('test-url');
    });

    it('should return null for non-existent cache entries', () => {
      const store = useImageCacheStore.getState();
      const result = store.getFromCache('non-existent prompt');
      expect(result).toBeNull();
    });

    it('should track cache size correctly', () => {
      const store = useImageCacheStore.getState();
      expect(store.getCacheSize()).toBe(0);
      store.addToCache('prompt1', 'url1');
      expect(store.getCacheSize()).toBe(1);
      store.addToCache('prompt2', 'url2');
      expect(store.getCacheSize()).toBe(2);
    });
  });

  describe('telemetry tracking', () => {
    it('should track cache hits and misses', () => {
      const store = useImageCacheStore.getState();
      let telemetry = store.getTelemetry();
      expect(telemetry.hits).toBe(0);
      expect(telemetry.misses).toBe(0);
      expect(telemetry.totalRequests).toBe(0);

      store.addToCache('test prompt', 'test-url');
      store.getFromCache('test prompt');
      telemetry = store.getTelemetry();
      expect(telemetry.hits).toBe(1);
      expect(telemetry.totalRequests).toBe(1);

      store.getFromCache('non-existent prompt');
      telemetry = store.getTelemetry();
      expect(telemetry.misses).toBe(1);
      expect(telemetry.totalRequests).toBe(2);
    });

    it('should track access count', () => {
      const store = useImageCacheStore.getState();
      store.addToCache('test prompt', 'test-url');
      store.getFromCache('test prompt');
      store.getFromCache('test prompt');
      store.getFromCache('test prompt');
      
      const entry = store.getCacheEntry('test prompt');
      expect(entry?.accessCount).toBe(4); // 1 from addToCache + 3 from getFromCache
    });

    it('should reset telemetry', () => {
      const store = useImageCacheStore.getState();
      store.addToCache('prompt1', 'url1');
      store.getFromCache('prompt1');
      store.getFromCache('non-existent');
      let telemetry = store.getTelemetry();
      expect(telemetry.totalRequests).toBeGreaterThan(0);

      store.resetTelemetry();
      telemetry = store.getTelemetry();
      expect(telemetry.hits).toBe(0);
      expect(telemetry.misses).toBe(0);
      expect(telemetry.totalRequests).toBe(0);
    });
  });

  describe('cache eviction', () => {
    it('should evict entries when cache size exceeds maximum', () => {
      const store = useImageCacheStore.getState();
      store.addToCache('prompt1', 'url1');
      store.addToCache('prompt2', 'url2');
      store.addToCache('prompt3', 'url3');
      expect(store.getCacheSize()).toBe(3);

      store.addToCache('prompt4', 'url4');
      expect(store.getCacheSize()).toBe(3);
      expect(store.getFromCache('prompt1')).toBeNull();
      expect(store.getFromCache('prompt4')).toBe('url4');
    });

    it('should evict stale entries based on TTL', () => {
      jest.useFakeTimers();
      const store = useImageCacheStore.getState();
      
      store.addToCache('test prompt', 'test-url');
      expect(store.getFromCache('test prompt')).toBe('test-url');
      
      // Advance time beyond the TTL
      jest.advanceTimersByTime(15000); // 15 seconds
      
      const result = store.getFromCache('test prompt');
      expect(result).toBeNull();
      expect(store.getCacheSize()).toBe(0);
    });

    it('should manually evict stale entries', () => {
      jest.useFakeTimers();
      const store = useImageCacheStore.getState();
      
      store.addToCache('fresh prompt', 'fresh-url');
      store.addToCache('stale prompt', 'stale-url');
      
      // Advance time to make one entry stale
      jest.advanceTimersByTime(15000);
      
      // Manually evict stale entries
      store.evictStaleEntries();
      
      // This is tricky because the 'fresh' one is now stale too. Let's adjust.
      useImageCacheStore.getState().clearCache();

      store.addToCache('fresh prompt', 'fresh-url');
      jest.advanceTimersByTime(5000);
      store.addToCache('stale prompt', 'stale-url');
      jest.advanceTimersByTime(11000); // stale prompt is now 11s old, fresh is 16s old

      // Re-run with better time control
      store.clearCache();
      store.addToCache('stale prompt', 'stale-url');
      jest.advanceTimersByTime(15000); // Make it stale
      store.addToCache('fresh prompt', 'fresh-url'); // Add a fresh one

      expect(store.getCacheSize()).toBe(2);
      store.evictStaleEntries();
      expect(store.getCacheSize()).toBe(1);
      expect(store.getFromCache('fresh prompt')).toBe('fresh-url');
      expect(store.getFromCache('stale prompt')).toBeNull();
    });
  });

  describe('cache clearing', () => {
    it('should clear all cache and telemetry', () => {
      const store = useImageCacheStore.getState();
      store.addToCache('prompt1', 'url1');
      store.addToCache('prompt2', 'url2');
      store.getFromCache('prompt1');
      store.getFromCache('non-existent');
      
      expect(store.getCacheSize()).toBe(2);
      expect(store.getTelemetry().totalRequests).toBeGreaterThan(0);
      
      store.clearCache();
      
      expect(store.getCacheSize()).toBe(0);
      expect(store.getTelemetry().totalRequests).toBe(0);
    });
  });
});