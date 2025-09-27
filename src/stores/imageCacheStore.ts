/**
 * @file imageCacheStore.ts
 * @description Zustand store for managing an in-memory cache of generated image URLs.
 * This cache helps to avoid re-generating images for the same prompt, improving performance
 * and reducing API costs. It uses a combination of Time-to-Live (TTL) and a
 * Least Recently Used (LRU) / Least Frequently Used (LFU) eviction strategy.
 */

import { create } from 'zustand';

/**
 * @interface CachedImage
 * @description Defines the structure for a single cached image entry.
 * @property {string} url - The URL of the cached image.
 * @property {number} timestamp - The Unix timestamp when the image was added to the cache.
 * @property {number} accessCount - How many times the image has been retrieved from the cache.
 * @property {number} lastAccessed - The Unix timestamp of the last time the image was accessed.
 */
interface CachedImage {
  url: string;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

/**
 * @interface ImageCacheStore
 * @description Defines the structure of the image cache store, including its state and actions.
 */
interface ImageCacheStore {
  /** A record where keys are image prompts and values are CachedImage objects. */
  imageCache: Record<string, CachedImage>;
  /** The Time-to-Live for cache entries in milliseconds. */
  ttl: number;
  /** Adds a new image URL to the cache for a given prompt. */
  addToCache: (prompt: string, url: string) => void;
  /** Retrieves an image URL from the cache. Returns null if not found or expired. */
  getFromCache: (prompt: string) => string | null;
  /** Manually triggers the eviction of all expired (stale) entries. */
  evictStaleEntries: () => void;
  /** Returns the current number of items in the cache. */
  getCacheSize: () => number;
  /** Clears the entire image cache. */
  clearCache: () => void;
}

/** The maximum number of images to store in the cache. */
const MAX_CACHE_SIZE = 50;
/** The default Time-to-Live for a cache entry (30 minutes). */
const CACHE_TTL = 1000 * 60 * 30;

/**
 * @hook useImageCacheStore
 * @description A Zustand hook for accessing the image cache store.
 * This store is not persisted to local storage as it's intended to be a session-level cache.
 */
export const useImageCacheStore = create<ImageCacheStore>((set, get) => ({
  imageCache: {},
  ttl: CACHE_TTL,
  
  addToCache: (prompt, url) =>
    set((state) => {
      const now = Date.now();
      
      const newEntry: CachedImage = {
        url,
        timestamp: now,
        accessCount: 1,
        lastAccessed: now,
      };
      
      const newCache = { ...state.imageCache, [prompt]: newEntry };
      const entries = Object.entries(newCache);
      
      // If the cache exceeds its maximum size, evict the least valuable entry.
      if (entries.length > MAX_CACHE_SIZE) {
        // Eviction strategy: Sort by least recently used, then by least frequently used.
        const sorted = entries.sort(([, a], [, b]) => {
          if (a.lastAccessed !== b.lastAccessed) {
            return a.lastAccessed - b.lastAccessed; // Evict least recently used first.
          }
          return a.accessCount - b.accessCount; // Then evict least frequently used.
        });
        
        // Remove the first entry (the least valuable one)
        const [evictedKey] = sorted[0];
        delete newCache[evictedKey];
        
        console.log(`Image cache full. Evicted entry for prompt: "${evictedKey}"`);
        return { imageCache: newCache };
      }
      
      return { imageCache: newCache };
    }),
    
  getFromCache: (prompt) => {
    const state = get();
    const entry = state.imageCache[prompt];
    
    if (!entry) return null;
    
    const now = Date.now();
    
    // Check if the entry has expired based on its TTL.
    if (now - entry.timestamp > state.ttl) {
      // If expired, remove it from the cache lazily.
      set((currentState) => {
        const { [prompt]: removed, ...rest } = currentState.imageCache;
        return { imageCache: rest };
      });
      console.log(`Image cache entry for "${prompt}" expired and was removed.`);
      return null;
    }
    
    // If accessed, update its access count and last accessed timestamp.
    set((currentState) => ({
      imageCache: {
        ...currentState.imageCache,
        [prompt]: {
          ...entry,
          accessCount: entry.accessCount + 1,
          lastAccessed: now,
        },
      },
    }));
    
    return entry.url;
  },
  
  evictStaleEntries: () =>
    set((state) => {
      const now = Date.now();
      const freshCache: Record<string, CachedImage> = {};
      let evictedCount = 0;

      // Iterate over the cache and keep only the entries that have not expired.
      Object.entries(state.imageCache).forEach(([prompt, entry]) => {
        if (now - entry.timestamp <= state.ttl) {
          freshCache[prompt] = entry;
        } else {
          evictedCount++;
        }
      });
      
      if (evictedCount > 0) {
        console.log(`Image cache maintenance evicted ${evictedCount} stale entries.`);
      }
      
      return { imageCache: freshCache };
    }),
    
  getCacheSize: () => Object.keys(get().imageCache).length,
  
  clearCache: () => set({ imageCache: {} }),
}));
