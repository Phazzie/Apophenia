/**
 * @file cacheMaintenanceService.ts
 * @description Provides a service for periodic cleanup and optimization of application caches, primarily the image cache.
 */

import { useImageCacheStore } from '../stores/imageCacheStore';

/**
 * A static class that handles periodic maintenance tasks for various application caches.
 * Its main responsibility is to evict stale entries to prevent the cache from growing indefinitely.
 */
export class CacheMaintenanceService {
  private static cleanupInterval: ReturnType<typeof setInterval> | null = null;
  
  /**
   * Starts the periodic cache maintenance process.
   * If maintenance is already running, this function does nothing.
   *
   * @param {number} [intervalMs=300000] - The interval in milliseconds at which to run the cleanup. Defaults to 5 minutes.
   */
  static startMaintenance(intervalMs: number = 5 * 60 * 1000) {
    if (this.cleanupInterval) {
      console.warn('Cache maintenance is already running.');
      return;
    }
    
    this.cleanupInterval = setInterval(() => {
      this.runMaintenance();
    }, intervalMs);
    
    console.log(`Cache maintenance service started. Running every ${intervalMs / 1000} seconds.`);
  }
  
  /**
   * Stops the periodic cache maintenance process.
   */
  static stopMaintenance() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('Cache maintenance service stopped.');
    }
  }
  
  /**
   * Immediately runs a single maintenance cycle.
   * This involves checking for and evicting stale entries from the image cache.
   */
  static runMaintenance() {
    try {
      const store = useImageCacheStore.getState();
      const beforeSize = store.getCacheSize();
      store.evictStaleEntries();
      const afterSize = store.getCacheSize();
      
      if (beforeSize > afterSize) {
        console.log(`Cache maintenance: Evicted ${beforeSize - afterSize} stale entries. Cache size: ${beforeSize} -> ${afterSize}`);
      }
    } catch (error) {
      console.error('Error during cache maintenance cycle:', error);
    }
  }
  
  /**
   * Retrieves statistics about the current state of the image cache.
   *
   * @returns {{ totalEntries: number; staleEntries: number; averageAccessCount: number; memoryEstimate: string; }} An object containing cache statistics.
   */
  static getCacheStats() {
    const { imageCache, ttl } = useImageCacheStore.getState();
    const now = Date.now();
    
    let totalEntries = 0;
    let staleEntries = 0;
    let totalAccessCount = 0;
    
    Object.values(imageCache).forEach((entry: any) => {
      totalEntries++;
      totalAccessCount += entry.accessCount;
      if (now - entry.timestamp > ttl) {
        staleEntries++;
      }
    });
    
    return {
      totalEntries,
      staleEntries,
      averageAccessCount: totalEntries > 0 ? totalAccessCount / totalEntries : 0,
      // This is a very rough estimate assuming ~0.1KB per cached item (URL string + metadata).
      // The actual image data is not stored in this cache, only the URL.
      memoryEstimate: `${(totalEntries * 0.1).toFixed(1)} KB`,
    };
  }
}