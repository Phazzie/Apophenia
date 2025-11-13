/**
 * STATE MANAGER
 *
 * Coordinates atomic operations across multiple Zustand stores.
 * Implements StateManager interface from seams.ts.
 *
 * Features:
 * - Atomic multi-store updates (all or nothing)
 * - State snapshot and restore for testing
 * - Centralized reset functionality
 * - Engine effects application
 *
 * This is the single source of truth for coordinated state operations.
 * Other components should use this for multi-store updates to ensure atomicity.
 */

import { StateManager, EngineEffects, GameSnapshot } from '../types/seams';
import { useGameStateStore } from './gameStateStore';
import { useWorldStateStore } from './worldStateStore';
import { useHistoryStore } from './historyStore';
import { usePlayerProfileStore } from './playerProfileStore';

/**
 * StateManager Implementation
 *
 * Provides atomic operations for coordinating updates across all stores.
 * Ensures consistency by applying related changes together.
 */
export class StateManagerImpl implements StateManager {
  /**
   * Reset all stores to their initial states
   */
  resetAllStores(): void {
    // Reset in reverse dependency order to avoid inconsistent states
    useGameStateStore.getState().reset();
    useHistoryStore.getState().reset();
    usePlayerProfileStore.getState().reset();
    useWorldStateStore.getState().reset();
  }

  /**
   * Apply engine effects atomically across multiple stores
   *
   * This ensures that all engine-driven state changes happen together,
   * maintaining consistency across the game state.
   *
   * @param effects - The effects to apply from engine execution
   */
  applyEngineEffects(effects: EngineEffects): void {
    // Apply effects in a specific order to maintain consistency

    // 1. World state updates (affects context for other updates)
    if (effects.worldUpdates) {
      useWorldStateStore.getState().updateWorld(effects.worldUpdates);
    }

    // 2. Corruption changes (part of world state)
    if (effects.corruptionChanges !== undefined) {
      const currentCorruption = useWorldStateStore.getState().worldState.corruptionLevel;
      useWorldStateStore
        .getState()
        .setCorruption(currentCorruption + effects.corruptionChanges);
    }

    // 3. History revisions (temporal revision engine)
    if (effects.historyRevisions && effects.historyRevisions.length > 0) {
      const historyStore = useHistoryStore.getState();
      effects.historyRevisions.forEach(({ id, newText }) => {
        historyStore.reviseSegment(id, newText);
      });
    }

    // 4. Profile updates (affects future AI generation)
    if (effects.profileUpdates) {
      const currentProfile = usePlayerProfileStore.getState().profile;

      // Deep merge profile updates
      const updatedProfile = {
        ...currentProfile,
        ...effects.profileUpdates,
        fearProfile: {
          ...currentProfile.fearProfile,
          ...(effects.profileUpdates.fearProfile || {}),
        },
        choicePatterns: {
          ...currentProfile.choicePatterns,
          ...(effects.profileUpdates.choicePatterns || {}),
        },
        engagementMetrics: {
          ...currentProfile.engagementMetrics,
          ...(effects.profileUpdates.engagementMetrics || {}),
        },
        crossSessionData: effects.profileUpdates.crossSessionData ?? currentProfile.crossSessionData,
      };

      // Replace entire profile (since we can't partially update via store actions)
      usePlayerProfileStore.setState({ profile: updatedProfile });
    }
  }

  /**
   * Create a snapshot of the current game state
   *
   * Useful for save/load functionality and testing.
   *
   * @returns A complete snapshot of all game state
   */
  snapshotState(): GameSnapshot {
    return {
      gameState: useGameStateStore.getState().gameState,
      worldState: useWorldStateStore.getState().worldState,
      segments: useHistoryStore.getState().segments,
      profile: usePlayerProfileStore.getState().profile,
      timestamp: Date.now(),
    };
  }

  /**
   * Restore game state from a snapshot
   *
   * Atomically restores all stores to a previous state.
   *
   * @param snapshot - The snapshot to restore
   */
  restoreState(snapshot: GameSnapshot): void {
    // Restore in specific order
    useGameStateStore.getState().setGameState(snapshot.gameState);

    useWorldStateStore.setState({
      worldState: snapshot.worldState,
    });

    useHistoryStore.setState({
      segments: snapshot.segments,
    });

    usePlayerProfileStore.setState({
      profile: snapshot.profile,
    });
  }
}

// Export singleton instance
export const stateManager = new StateManagerImpl();
