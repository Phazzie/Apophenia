// #TODO MAINTAIN: This is the Source of Truth for state. Do not modify without updating Seams contracts.
/**
 * IMAGE CACHE STORE
 *
 * Manages image caching with LRU eviction, telemetry, and localStorage persistence.
 * Implements ImageCacheStore interface from seams.ts.
 *
 * Features:
 * - Zustand store with custom localStorage persistence
 * - LRU (Least Recently Used) eviction policy
 * - Cache telemetry for hits/misses/evictions
 * - TTL-based expiration
 * - Atomic updates (no race conditions)
 */

import { create } from 'zustand';
import { CACHE_CONFIG } from '../../services/config';

export interface CachedImage {
  url: string;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheTelemetry {
  hits: number;
  misses: number;
  evictions: number;
  totalRequests: number;
}

interface ImageCacheStore {
  imageCache: Record<string, CachedImage>;
  telemetry: CacheTelemetry;
  addToCache: (prompt: string, url: string) => void;
  getFromCache: (prompt: string) => string | null;
  evictStaleEntries: () => void;
  getCacheSize: () => number;
  clearCache: () => void;
  getTelemetry: () => CacheTelemetry;
  resetTelemetry: () => void;
  // For testing purposes
  getCacheEntry: (prompt: string) => CachedImage | undefined;
}

// Use configurable cache parameters
const MAX_CACHE_SIZE = CACHE_CONFIG.IMAGE_CACHE_MAX_SIZE;
const CACHE_TTL = CACHE_CONFIG.IMAGE_CACHE_TTL;
const STORAGE_KEY = 'apophenia-image-cache';
const TELEMETRY_KEY = 'apophenia-cache-telemetry';

/**
 * Load cache from localStorage
 */
function loadCacheFromStorage(): Record<string, CachedImage> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const cache = JSON.parse(stored) as Record<string, CachedImage>;
      console.log(`📦 Loaded ${Object.keys(cache).length} images from cache storage`);
      return cache;
    }
  } catch (error) {
    console.warn('Failed to load image cache from storage:', error);
  }
  return {};
}

/**
 * Load telemetry from localStorage
 */
function loadTelemetryFromStorage(): CacheTelemetry {
  try {
    const stored = localStorage.getItem(TELEMETRY_KEY);
    if (stored) {
      return JSON.parse(stored) as CacheTelemetry;
    }
  } catch (error) {
    console.warn('Failed to load cache telemetry from storage:', error);
  }
  return {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0,
  };
}

/**
 * Save cache to localStorage
 */
function saveCacheToStorage(cache: Record<string, CachedImage>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Failed to save image cache to storage:', error);
  }
}

/**
 * Save telemetry to localStorage
 */
function saveTelemetryToStorage(telemetry: CacheTelemetry): void {
  try {
    localStorage.setItem(TELEMETRY_KEY, JSON.stringify(telemetry));
  } catch (error) {
    console.warn('Failed to save cache telemetry to storage:', error);
  }
}

export const useImageCacheStore = create<ImageCacheStore>((set, get) => ({
  imageCache: loadCacheFromStorage(),
  telemetry: loadTelemetryFromStorage(),

  addToCache: (prompt, url) =>
    set((state) => {
      const now = Date.now();

      // Create new cache entry
      const newEntry: CachedImage = {
        url,
        timestamp: now,
        accessCount: 1,
        lastAccessed: now,
      };

      const newCache = { ...state.imageCache, [prompt]: newEntry };
      let newTelemetry = { ...state.telemetry };

      // Check if we need to evict entries
      const entries = Object.entries(newCache);

      if (entries.length > MAX_CACHE_SIZE) {
        // Sort by LRU (lastAccessed ascending) then by access count
        const sorted = entries.sort(([, a], [, b]) => {
          if (a.lastAccessed !== b.lastAccessed) {
            return a.lastAccessed - b.lastAccessed; // LRU first
          }
          return a.accessCount - b.accessCount; // Then least used
        });

        // Keep the most recent MAX_CACHE_SIZE entries (new entry is already included)
        const entriesToKeep = sorted.slice(-MAX_CACHE_SIZE);
        const evictedCache = Object.fromEntries(entriesToKeep);
        const evictedCount = entries.length - MAX_CACHE_SIZE;

        if (CACHE_CONFIG.ENABLE_CACHE_TELEMETRY) {
          newTelemetry.evictions += evictedCount;
          console.log(`Image cache evicted ${evictedCount} entries`);
        }

        // Save to localStorage (ATOMIC - single operation)
        saveCacheToStorage(evictedCache);
        saveTelemetryToStorage(newTelemetry);

        return { imageCache: evictedCache, telemetry: newTelemetry };
      }

      // Save to localStorage (ATOMIC - single operation)
      saveCacheToStorage(newCache);
      saveTelemetryToStorage(newTelemetry);

      return { imageCache: newCache, telemetry: newTelemetry };
    }),

  getFromCache: (prompt) => {
    const state = get();
    const entry = state.imageCache[prompt];
    const now = Date.now();

    // Check if entry doesn't exist or has expired
    if (!entry || now - entry.timestamp > CACHE_TTL) {
      // ATOMIC UPDATE: Single set() call for miss + optional cleanup
      set((state) => {
        const { [prompt]: removed, ...rest } = state.imageCache;
        const updatedCache = entry ? rest : state.imageCache; // Only remove if expired
        const newTelemetry = {
          ...state.telemetry,
          totalRequests: state.telemetry.totalRequests + 1,
          misses: state.telemetry.misses + (CACHE_CONFIG.ENABLE_CACHE_TELEMETRY ? 1 : 0),
        };

        // Save to localStorage
        if (entry) {
          saveCacheToStorage(updatedCache);
        }
        saveTelemetryToStorage(newTelemetry);

        return {
          imageCache: updatedCache,
          telemetry: newTelemetry,
        };
      });
      return null;
    }

    // ATOMIC UPDATE: Single set() call for hit + access update
    set((state) => {
      const newTelemetry = {
        ...state.telemetry,
        totalRequests: state.telemetry.totalRequests + 1,
        hits: state.telemetry.hits + (CACHE_CONFIG.ENABLE_CACHE_TELEMETRY ? 1 : 0),
      };

      const updatedCache = {
        ...state.imageCache,
        [prompt]: {
          ...entry,
          accessCount: entry.accessCount + 1,
          lastAccessed: now,
        },
      };

      // Save to localStorage
      saveCacheToStorage(updatedCache);
      saveTelemetryToStorage(newTelemetry);

      return {
        imageCache: updatedCache,
        telemetry: newTelemetry,
      };
    });

    return entry.url;
  },

  evictStaleEntries: () =>
    set((state) => {
      const now = Date.now();
      const freshCache: Record<string, CachedImage> = {};

      let evictedCount = 0;
      Object.entries(state.imageCache).forEach(([prompt, entry]) => {
        if (now - entry.timestamp <= CACHE_TTL) {
          freshCache[prompt] = entry;
        } else {
          evictedCount++;
        }
      });

      if (evictedCount > 0 && CACHE_CONFIG.ENABLE_CACHE_TELEMETRY) {
        console.log(`Image cache evicted ${evictedCount} stale entries`);
      }

      const newTelemetry = {
        ...state.telemetry,
        evictions: state.telemetry.evictions + evictedCount
      };

      // Save to localStorage
      saveCacheToStorage(freshCache);
      saveTelemetryToStorage(newTelemetry);

      return {
        imageCache: freshCache,
        telemetry: CACHE_CONFIG.ENABLE_CACHE_TELEMETRY ? newTelemetry : state.telemetry,
      };
    }),

  getCacheSize: () => Object.keys(get().imageCache).length,

  clearCache: () => {
    // Clear localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TELEMETRY_KEY);
    } catch (error) {
      console.warn('Failed to clear cache from storage:', error);
    }

    set({
      imageCache: {},
      telemetry: {
        hits: 0,
        misses: 0,
        evictions: 0,
        totalRequests: 0,
      }
    });
  },

  getTelemetry: () => get().telemetry,

  resetTelemetry: () => set((state) => ({
    ...state,
    telemetry: {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0,
    }
  })),

  getCacheEntry: (prompt: string) => get().imageCache[prompt],
}));
