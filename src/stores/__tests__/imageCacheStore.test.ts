import { useImageCacheStore } from '../imageCacheStore';

// Mock the config module to control cache settings
jest.mock('../../services/config', () => ({
  CACHE_CONFIG: {
    IMAGE_CACHE_TTL: 10000, // 10 seconds for testing
    IMAGE_CACHE_MAX_SIZE: 3, // Small size for testing
    ENABLE_CACHE_TELEMETRY: true,
  }
}));

describe('ImageCacheStore', () => {
  beforeEach(() => {
    // Clear the cache before each test
    useImageCacheStore.getState().clearCache();
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
      
      // Initial telemetry should be zero
      let telemetry = store.getTelemetry();
      expect(telemetry.hits).toBe(0);
      expect(telemetry.misses).toBe(0);
      expect(telemetry.totalRequests).toBe(0);
      
      // Add item to cache
      store.addToCache('test prompt', 'test-url');
      
      // Cache hit
      store.getFromCache('test prompt');
      telemetry = store.getTelemetry();
      expect(telemetry.hits).toBe(1);
      expect(telemetry.totalRequests).toBe(1);
      
      // Cache miss
      store.getFromCache('non-existent prompt');
      telemetry = store.getTelemetry();
      expect(telemetry.misses).toBe(1);
      expect(telemetry.totalRequests).toBe(2);
    });

    it('should track access count', () => {
      const store = useImageCacheStore.getState();
      
      store.addToCache('test prompt', 'test-url');
      
      // Access the same item multiple times
      store.getFromCache('test prompt');
      store.getFromCache('test prompt');
      store.getFromCache('test prompt');
      
      const cache = store.imageCache;
      expect(cache['test prompt'].accessCount).toBe(4); // 1 from addToCache + 3 from getFromCache
    });

    it('should reset telemetry', () => {
      const store = useImageCacheStore.getState();
      
      // Generate some activity
      store.addToCache('prompt1', 'url1');
      store.getFromCache('prompt1');
      store.getFromCache('non-existent');
      
      // Verify telemetry has data
      let telemetry = store.getTelemetry();
      expect(telemetry.totalRequests).toBeGreaterThan(0);
      
      // Reset and verify
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
      
      // Add items up to the max size (3)
      store.addToCache('prompt1', 'url1');
      store.addToCache('prompt2', 'url2');
      store.addToCache('prompt3', 'url3');
      
      expect(store.getCacheSize()).toBe(3);
      
      // Add one more to trigger eviction
      store.addToCache('prompt4', 'url4');
      
      expect(store.getCacheSize()).toBe(3); // Should still be 3
      
      // The least recently used item should have been evicted
      expect(store.getFromCache('prompt1')).toBeNull();
      expect(store.getFromCache('prompt4')).toBe('url4');
    });

    it('should evict stale entries based on TTL', (done) => {
      const store = useImageCacheStore.getState();
      
      store.addToCache('test prompt', 'test-url');
      expect(store.getFromCache('test prompt')).toBe('test-url');
      
      // Wait for TTL to expire (using setTimeout since we mocked TTL to 10 seconds)
      // For testing, we'll manually set timestamp to simulate expiration
      const cache = store.imageCache;
      cache['test prompt'].timestamp = Date.now() - 15000; // 15 seconds ago (> 10 second TTL)
      
      // Try to get from cache - should return null due to expiration
      const result = store.getFromCache('test prompt');
      expect(result).toBeNull();
      
      // Cache should be cleaned up
      expect(store.getCacheSize()).toBe(0);
      done();
    });

    it('should manually evict stale entries', () => {
      const store = useImageCacheStore.getState();
      
      // Add fresh entry
      store.addToCache('fresh prompt', 'fresh-url');
      
      // Add stale entry by manipulating timestamp
      store.addToCache('stale prompt', 'stale-url');
      const cache = store.imageCache;
      cache['stale prompt'].timestamp = Date.now() - 15000; // 15 seconds ago
      
      expect(store.getCacheSize()).toBe(2);
      
      // Manually evict stale entries
      store.evictStaleEntries();
      
      expect(store.getCacheSize()).toBe(1);
      expect(store.getFromCache('fresh prompt')).toBe('fresh-url');
      expect(store.getFromCache('stale prompt')).toBeNull();
    });
  });

  describe('cache clearing', () => {
    it('should clear all cache and telemetry', () => {
      const store = useImageCacheStore.getState();
      
      // Add some data
      store.addToCache('prompt1', 'url1');
      store.addToCache('prompt2', 'url2');
      store.getFromCache('prompt1');
      store.getFromCache('non-existent');
      
      expect(store.getCacheSize()).toBe(2);
      expect(store.getTelemetry().totalRequests).toBeGreaterThan(0);
      
      // Clear cache
      store.clearCache();
      
      expect(store.getCacheSize()).toBe(0);
      expect(store.getTelemetry().totalRequests).toBe(0);
    });
  });
});