import { useImageCacheStore } from '../imageCacheStore';

// The config is now globally mocked, so we don't need a local mock here.

describe('ImageCacheStore', () => {
  // Suppress console logs for cleaner test output
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    (console.log as jest.Mock).mockRestore();
  });

  beforeEach(() => {
    // Reset timers and clear the cache before each test
    jest.useRealTimers();
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
      let telemetry = store.getTelemetry();
      expect(telemetry.hits).toBe(0);
      expect(telemetry.misses).toBe(0);
      
      store.addToCache('test prompt', 'test-url');
      store.getFromCache('test prompt'); // hit
      store.getFromCache('non-existent prompt'); // miss

      telemetry = store.getTelemetry();
      expect(telemetry.hits).toBe(1);
      expect(telemetry.misses).toBe(1);
      expect(telemetry.totalRequests).toBe(2);
    });

    it('should reset telemetry', () => {
        const store = useImageCacheStore.getState();
        store.addToCache('prompt1', 'url1');
        store.getFromCache('prompt1');

        store.resetTelemetry();
        const telemetry = store.getTelemetry();
        expect(telemetry.hits).toBe(0);
        expect(telemetry.misses).toBe(0);
        expect(telemetry.totalRequests).toBe(0);
      });
  });

  describe('cache eviction', () => {
    it('should evict the least recently used entry when cache size exceeds maximum', () => {
      const store = useImageCacheStore.getState();
      
      // Fill the cache (size 3)
      store.addToCache('prompt1', 'url1');
      store.addToCache('prompt2', 'url2');
      store.addToCache('prompt3', 'url3');
      
      // Access prompt1 to make it NOT the least recently used
      store.getFromCache('prompt1');

      // Add one more item to trigger eviction
      store.addToCache('prompt4', 'url4');

      // prompt2 should be evicted as it was the least recently used
      expect(store.getCacheSize()).toBe(3);
      expect(store.getFromCache('prompt1')).toBe('url1');
      expect(store.getFromCache('prompt2')).toBeNull();
      expect(store.getFromCache('prompt3')).toBe('url3');
      expect(store.getFromCache('prompt4')).toBe('url4');
    });

    it('should evict stale entries based on TTL when accessed', () => {
        jest.useFakeTimers();
        const store = useImageCacheStore.getState();

        store.addToCache('stale-prompt', 'stale-url');

        // Advance time beyond the 10-second TTL
        jest.advanceTimersByTime(11000);

        // Accessing the stale entry should return null and evict it
        expect(store.getFromCache('stale-prompt')).toBeNull();
        expect(store.getCacheSize()).toBe(0);
      });

      it('should manually evict stale entries', () => {
        jest.useFakeTimers();
        const store = useImageCacheStore.getState();

        // Add an entry that will become stale
        store.addToCache('stale-prompt', 'stale-url');

        // Advance time so the first entry is old, but not stale yet
        jest.advanceTimersByTime(5000);

        // Add a fresh entry
        store.addToCache('fresh-prompt', 'fresh-url');

        // Advance time again, so only the first entry becomes stale
        jest.advanceTimersByTime(6000);

        // Manually evict
        store.evictStaleEntries();

        expect(store.getCacheSize()).toBe(1);
        expect(store.getFromCache('fresh-prompt')).toBe('fresh-url');
        expect(store.getFromCache('stale-prompt')).toBeNull();
      });

      it('should evict least accessed entry when timestamps are equal', () => {
        const store = useImageCacheStore.getState();

        // Fill the cache (size 3)
        store.addToCache('prompt1', 'url1');
        store.addToCache('prompt2', 'url2');
        store.addToCache('prompt3', 'url3');

        // Access prompts 1 and 3 to increase their access count
        store.getFromCache('prompt1');
        store.getFromCache('prompt1');
        store.getFromCache('prompt3');

        // Add a new item to trigger eviction. All items have the same `lastAccessed` time at this point
        // so the eviction should be based on accessCount.
        store.addToCache('prompt4', 'url4');

        // prompt2 should be evicted as it has the lowest access count (1)
        expect(store.getCacheSize()).toBe(3);
        expect(store.getFromCache('prompt1')).not.toBeNull();
        expect(store.getFromCache('prompt2')).toBeNull();
        expect(store.getFromCache('prompt3')).not.toBeNull();
        expect(store.getFromCache('prompt4')).not.toBeNull();
      });
  });

  describe('cache clearing', () => {
    it('should clear all cache and telemetry', () => {
        const store = useImageCacheStore.getState();
        store.addToCache('prompt1', 'url1');
        store.getFromCache('prompt1');

        store.clearCache();

        expect(store.getCacheSize()).toBe(0);
        const telemetry = store.getTelemetry();
        expect(telemetry.hits).toBe(0);
        expect(telemetry.misses).toBe(0);
        expect(telemetry.totalRequests).toBe(0);
      });
  });
});