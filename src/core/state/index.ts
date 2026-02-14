/**
 * STATE MANAGEMENT - Public API
 *
 * Central export point for all state management modules.
 * Other parts of the application should import from this file.
 */

// #TODO BRIDGE_REPAIR: This file bridges new code to legacy stores.
// Currently it re-exports legacy stores that use wrong types (numeric GameState).
// We need to either update the stores or add an adapter layer here.
// See #TODO.md.

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
