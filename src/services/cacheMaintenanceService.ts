import { useImageCacheStore } from '../stores/imageCacheStore';

/**
 * Cache maintenance service
 * Handles periodic cleanup and optimization of various caches
 */
export class CacheMaintenanceService {
  private static cleanupInterval: NodeJS.Timeout | null = null;
  
  /**
   * Start periodic cache maintenance
   * @param intervalMs How often to run cleanup (default: 5 minutes)
   */
  static startMaintenance(intervalMs: number = 5 * 60 * 1000) {
    if (this.cleanupInterval) {
      console.warn('Cache maintenance already running');
      return;
    }
    
    this.cleanupInterval = setInterval(() => {
      this.runMaintenance();
    }, intervalMs);
    
    console.log('Cache maintenance started');
  }
  
  /**
   * Stop periodic cache maintenance
   */
  static stopMaintenance() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('Cache maintenance stopped');
    }
  }
  
  /**
   * Run a single maintenance cycle
   */
  static runMaintenance() {
    try {
      const beforeSize = useImageCacheStore.getState().getCacheSize();
      useImageCacheStore.getState().evictStaleEntries();
      const afterSize = useImageCacheStore.getState().getCacheSize();
      
      if (beforeSize !== afterSize) {
        console.log(`Cache maintenance: ${beforeSize} -> ${afterSize} entries`);
      }
    } catch (error) {
      console.error('Error during cache maintenance:', error);
    }
  }
  
  /**
   * Get cache statistics
   */
  static getCacheStats() {
    const imageCache = useImageCacheStore.getState().imageCache;
    const now = Date.now();
    
    let totalEntries = 0;
    let staleEntries = 0;
    let totalAccessCount = 0;
    
    Object.values(imageCache).forEach((entry: any) => {
      totalEntries++;
      totalAccessCount += entry.accessCount;
      if (now - entry.timestamp > 30 * 60 * 1000) { // 30 minutes TTL
        staleEntries++;
      }
    });
    
    return {
      totalEntries,
      staleEntries,
      averageAccessCount: totalEntries > 0 ? totalAccessCount / totalEntries : 0,
      memoryEstimate: `${(totalEntries * 0.1).toFixed(1)}MB`, // Rough estimate
    };
  }
}