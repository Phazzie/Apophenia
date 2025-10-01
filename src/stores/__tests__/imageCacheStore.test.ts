import { useImageCacheStore } from '../imageCacheStore';
import { act } from '@testing-library/react';

// Mock the config module to control cache settings
jest.mock('../../services/config', () => ({
  CACHE_CONFIG: {
    IMAGE_CACHE_TTL: 10000, // 10 seconds for testing
    IMAGE_CACHE_MAX_SIZE: 3, // Small size for testing
    ENABLE_CACHE_TELEMETRY: true,
  },
}));

describe('ImageCacheStore', () => {
  beforeEach(() => {
    // Reset store to initial state and use real timers before each test
    act(() => {
      useImageCacheStore.getState().clearCache();
    });
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
      
      act(() => {
        store.addToCache('test prompt', 'test-url');
        store.getFromCache('test prompt'); // hit
        store.getFromCache('non-existent prompt'); // miss
      });
      
      const telemetry = useImageCacheStore.getState().getTelemetry();
      expect(telemetry.hits).toBe(1);
      expect(telemetry.misses).toBe(1);
      expect(telemetry.totalRequests).toBe(2);
    });

    it('should track access count', () => {
      const store = useImageCacheStore.getState();
      
      act(() => {
        store.addToCache('test prompt', 'test-url');
        store.getFromCache('test prompt');
        store.getFromCache('test prompt');
        store.getFromCache('test prompt');
      });
      
      const finalState = useImageCacheStore.getState();
      expect(finalState.imageCache['test prompt'].accessCount).toBe(4);
    });

    it('should reset telemetry', () => {
      const store = useImageCacheStore.getState();
      
      act(() => {
        store.addToCache('prompt1', 'url1');
        store.getFromCache('prompt1');
      });
      
      expect(useImageCacheStore.getState().getTelemetry().totalRequests).toBeGreaterThan(0);
      
      act(() => {
        store.resetTelemetry();
      });

      const telemetry = useImageCacheStore.getState().getTelemetry();
      expect(telemetry).toEqual({ hits: 0, misses: 0, evictions: 0, totalRequests: 0 });
    });
  });

  describe('cache eviction', () => {
    it('should evict the least recently used entry when cache size exceeds maximum', () => {
      jest.useFakeTimers();
      const store = useImageCacheStore.getState();
      
      act(() => {
        store.addToCache('prompt1', 'url1'); // Should be evicted
        jest.advanceTimersByTime(100);
        store.addToCache('prompt2', 'url2');
        jest.advanceTimersByTime(100);
        store.addToCache('prompt3', 'url3');
      });
      
      expect(useImageCacheStore.getState().getCacheSize()).toBe(3);
      
      act(() => {
        store.addToCache('prompt4', 'url4'); // This triggers eviction
      });
      
      const finalState = useImageCacheStore.getState();
      expect(finalState.getCacheSize()).toBe(3);
      expect(finalState.getFromCache('prompt1')).toBeNull();
      expect(finalState.getFromCache('prompt2')).not.toBeNull();
    });

    it('should evict a stale entry when it is accessed via getFromCache', () => {
      jest.useFakeTimers();
      const store = useImageCacheStore.getState();
      
      act(() => {
        store.addToCache('test prompt', 'test-url');
      });
      
      expect(useImageCacheStore.getState().getFromCache('test prompt')).toBe('test-url');
      
      act(() => {
        jest.advanceTimersByTime(15000); // Advance time beyond 10s TTL
      });

      // Accessing the stale item should cause it to be evicted
      const result = useImageCacheStore.getState().getFromCache('test prompt');
      expect(result).toBeNull();
      
      expect(useImageCacheStore.getState().getCacheSize()).toBe(0);
    });

    it('should manually evict all stale entries', () => {
      jest.useFakeTimers();
      const store = useImageCacheStore.getState();

      act(() => {
        store.addToCache('stale-prompt', 'stale-url'); // Added at t=0
      });

      act(() => {
        jest.advanceTimersByTime(5000); // t=5000
        store.addToCache('fresh-prompt', 'fresh-url'); // Added at t=5000
      });
      
      act(() => {
        jest.advanceTimersByTime(6000); // t=11000. 'stale-prompt' is now 11s old. 'fresh-prompt' is 6s old.
      });

      act(() => {
        store.evictStaleEntries();
      });

      const finalState = useImageCacheStore.getState();
      expect(finalState.getCacheSize()).toBe(1);
      expect(finalState.getFromCache('stale-prompt')).toBeNull();
      expect(finalState.getFromCache('fresh-prompt')).toBe('fresh-url');
    });
  });

  describe('cache clearing', () => {
    it('should clear all cache and telemetry', () => {
      const store = useImageCacheStore.getState();
      
      act(() => {
        store.addToCache('prompt1', 'url1');
        store.getFromCache('prompt1');
      });
      
      expect(useImageCacheStore.getState().getCacheSize()).toBe(1);
      
      act(() => {
        store.clearCache();
      });
      
      const finalState = useImageCacheStore.getState();
      expect(finalState.getCacheSize()).toBe(0);
      expect(finalState.getTelemetry().totalRequests).toBe(0);
    });
  });
});