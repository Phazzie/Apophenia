/**
 * @file gameStateManager.ts
 * @description Provides a centralized, static service for managing the overall game state.
 * This manager ensures that operations across multiple state stores (like resetting the game)
 * are performed atomically, preventing inconsistent or corrupted states.
 */

import { useGameStateStore } from '../stores/gameStateStore';
import { useImageCacheStore } from '../stores/imageCacheStore';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { useWorldStateStore } from '../stores/worldStateStore';
import { CacheMaintenanceService } from './cacheMaintenanceService';

/**
 * A static class that provides unified management for the game's various state stores.
 * It offers atomic operations to ensure state consistency, especially during complex
 * actions like starting a new game or resetting progress.
 */
export class GameStateManager {
  /**
   * Atomically resets all core game stores to their initial state.
   * This is the standard procedure for starting a new game, ensuring no data from
   * a previous session carries over. The image cache is intentionally not cleared
   * as it can be reused across different game sessions.
   * @throws {Error} If any of the store reset operations fail.
   */
  static resetAllStores() {
    try {
      // By calling reset on each store, we leverage the logic defined within each store's slice.
      useGameStateStore.getState().reset();
      useWorldStateStore.getState().reset();
      useStoryHistoryStore.getState().reset();
      console.log('All core game stores have been reset successfully.');
    } catch (error) {
      console.error('A critical error occurred while resetting game stores:', error);
      // Re-throwing allows higher-level error boundaries to catch this and display a user-friendly message.
      throw new Error('Failed to reset game state. Please refresh the page.');
    }
  }

  /**
   * Clears all entries from the image cache.
   * This is useful for memory management or for debugging image generation issues.
   */
  static clearImageCache() {
    try {
      useImageCacheStore.getState().clearCache();
      console.log('Image cache has been cleared successfully.');
    } catch (error) {
      console.error('Error while clearing the image cache:', error);
    }
  }

  /**
   * Performs a complete and total reset of the application state,
   * including all game stores and the image cache.
   */
  static resetEverything() {
    this.resetAllStores();
    this.clearImageCache();
  }

  /**
   * Initializes essential background services required for the game to function correctly.
   * This should be called once when the application starts up.
   */
  static initialize() {
    CacheMaintenanceService.startMaintenance();
    console.log('Game State Manager and its services have been initialized.');
  }

  /**
   * Cleans up any running services or intervals managed by this class.
   * This is important for preventing memory leaks in environments that support hot-reloading.
   */
  static cleanup() {
    CacheMaintenanceService.stopMaintenance();
    console.log('Game State Manager and its services have been cleaned up.');
  }

  /**
   * Gathers and returns a snapshot of the current state from all major stores.
   * This is a powerful debugging tool for inspecting the complete state of the game at any moment.
   *
   * @returns {object} An object containing key state information from various stores.
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