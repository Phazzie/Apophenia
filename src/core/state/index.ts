// #TODO MAINTAIN: This is the Source of Truth for state. Do not modify without updating Seams contracts.
/**
 * STATE MANAGEMENT - Public API
 *
 * Central export point for all state management modules.
 * Other parts of the application should import from this file.
 */

// Stores
export { useGameStateStore } from './gameStateStore';
export { useWorldStateStore } from './worldStateStore';
export { useHistoryStore } from './historyStore';
export { usePlayerProfileStore } from './playerProfileStore';
export { useImageCacheStore } from './imageCacheStore';
export { useAIModelStore, AVAILABLE_MODELS } from './aiModelStore';
export { useUserStore, initializeUserAuth } from './userStore';

// State Manager
export { StateManagerImpl, stateManager } from './StateManager';

// Re-export types for convenience
export type {
  GameStateStore,
  WorldStateStore,
  HistoryStore,
  PlayerProfileStore,
  StateManager,
  EngineEffects,
  GameSnapshot,
} from '../types/seams';
