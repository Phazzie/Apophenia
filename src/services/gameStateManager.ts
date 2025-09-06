import { useGameStateStore } from '../stores/gameStateStore';
import { useWorldStateStore } from '../stores/worldStateStore';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { useImageCacheStore } from '../stores/imageCacheStore';
import { CacheMaintenanceService } from './cacheMaintenanceService';

/**
 * Unified game state management service
 * Provides atomic operations across all stores to prevent partial state corruption
 */
export class GameStateManager {
  /**
   * Atomically reset all game stores to their initial state
   * This prevents corrupted game state from partial resets
   */
  static resetAllStores() {
    try {
      // Reset all stores in a single operation
      useGameStateStore.getState().reset();
      useWorldStateStore.getState().reset();
      useStoryHistoryStore.getState().reset();
      // Note: Image cache is not reset as it can be shared across games
      console.log('All game stores reset successfully');
    } catch (error) {
      console.error('Error resetting game stores:', error);
      throw new Error('Failed to reset game state. Please refresh the page.');
    }
  }

  /**
   * Clear image cache - useful for freeing memory or starting fresh
   */
  static clearImageCache() {
    try {
      // Clear the image cache using the store's clear method
      useImageCacheStore.getState().clearCache();
      console.log('Image cache cleared successfully');
    } catch (error) {
      console.error('Error clearing image cache:', error);
    }
  }

  /**
   * Complete reset including image cache
   */
  static resetEverything() {
    this.resetAllStores();
    this.clearImageCache();
  }

  /**
   * Initialize game services (call this when the app starts)
   */
  static initialize() {
    // Start cache maintenance
    CacheMaintenanceService.startMaintenance();
    console.log('Game state manager initialized');
  }

  /**
   * Cleanup game services (call this when the app is shutting down)
   */
  static cleanup() {
    CacheMaintenanceService.stopMaintenance();
    console.log('Game state manager cleaned up');
  }

  /**
   * Get current game state snapshot for debugging or save verification
   */
  static getStateSnapshot() {
    return {
      gameState: useGameStateStore.getState().gameState,
      worldState: useWorldStateStore.getState().worldState,
      storyHistoryLength: useStoryHistoryStore.getState().storyHistory.length,
      imageCacheSize: useImageCacheStore.getState().getCacheSize(),
      cacheStats: CacheMaintenanceService.getCacheStats(),
    };
  }
}