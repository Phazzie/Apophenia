import { create } from 'zustand';

export interface CachedImage {
  url: string;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface ImageCacheStore {
  imageCache: Record<string, CachedImage>;
  addToCache: (prompt: string, url: string) => void;
  getFromCache: (prompt: string) => string | null;
  evictStaleEntries: () => void;
  getCacheSize: () => number;
  clearCache: () => void;
}

// Cache configuration
const MAX_CACHE_SIZE = 50; // Maximum number of cached images
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes TTL

export const useImageCacheStore = create<ImageCacheStore>((set, get) => ({
  imageCache: {},
  
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
        
        console.log(`Image cache evicted ${entries.length - MAX_CACHE_SIZE} entries`);
        return { imageCache: evictedCache };
      }
      
      return { imageCache: newCache };
    }),
    
  getFromCache: (prompt) => {
    const state = get();
    const entry = state.imageCache[prompt];
    
    if (!entry) return null;
    
    const now = Date.now();
    
    // Check if entry has expired
    if (now - entry.timestamp > CACHE_TTL) {
      // Remove expired entry
      set((state) => {
        const { [prompt]: _, ...rest } = state.imageCache;
        return { imageCache: rest };
      });
      return null;
    }
    
    // Update access info
    set((state) => ({
      imageCache: {
        ...state.imageCache,
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
      Object.entries(state.imageCache).forEach(([prompt, entry]) => {
        if (now - entry.timestamp <= CACHE_TTL) {
          freshCache[prompt] = entry;
        } else {
          evictedCount++;
        }
      });
      
      if (evictedCount > 0) {
        console.log(`Image cache evicted ${evictedCount} stale entries`);
      }
      
      return { imageCache: freshCache };
    }),
    
  getCacheSize: () => Object.keys(get().imageCache).length,
  
  clearCache: () => set({ imageCache: {} }),
}));
