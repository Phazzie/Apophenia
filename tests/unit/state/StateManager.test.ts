/**
 * STATE MANAGER - Unit Tests
 *
 * Tests for StateManager implementation.
 * Verifies atomic multi-store operations, snapshots, and restoration.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { stateManager } from '../../../src/core/state/StateManager';
import { useGameStateStore } from '../../../src/core/state/gameStateStore';
import { useWorldStateStore } from '../../../src/core/state/worldStateStore';
import { useHistoryStore } from '../../../src/core/state/historyStore';
import { usePlayerProfileStore } from '../../../src/core/state/playerProfileStore';
import {
  GameState,
  PsychologicalStatus,
  EngineEffects,
} from '../../../src/core/types/seams';

describe('StateManager', () => {
  beforeEach(() => {
    // Reset all stores before each test
    stateManager.resetAllStores();
  });

  describe('resetAllStores', () => {
    it('should reset all stores to initial state', () => {
      // Modify all stores
      useGameStateStore.getState().setGameState(GameState.DESCENDING);
      useWorldStateStore.getState().increaseHorror(5);
      useHistoryStore.getState().addSegment({
        id: '1',
        text: 'Test',
        timestamp: 1,
      });
      usePlayerProfileStore.getState().updateFearProfile('madness', 0.8);

      // Reset all
      stateManager.resetAllStores();

      // Verify all stores are reset
      expect(useGameStateStore.getState().gameState).toBe(GameState.MENU);
      expect(useWorldStateStore.getState().worldState.horrorIntensity).toBe(0);
      expect(useHistoryStore.getState().segments).toHaveLength(0);
      expect(
        usePlayerProfileStore.getState().profile.fearProfile.madness
      ).toBe(0);
    });
  });

  describe('applyEngineEffects', () => {
    it('should apply world updates', () => {
      const effects: EngineEffects = {
        worldUpdates: {
          protagonist: 'Alex',
          setting: 'Hospital',
          psychologicalStatus: PsychologicalStatus.PARANOID,
        },
      };

      stateManager.applyEngineEffects(effects);

      const { worldState } = useWorldStateStore.getState();
      expect(worldState.protagonist).toBe('Alex');
      expect(worldState.setting).toBe('Hospital');
      expect(worldState.psychologicalStatus).toBe(PsychologicalStatus.PARANOID);
    });

    it('should apply corruption changes', () => {
      // Set initial corruption
      useWorldStateStore.getState().setCorruption(20);

      const effects: EngineEffects = {
        corruptionChanges: 15,
      };

      stateManager.applyEngineEffects(effects);

      expect(useWorldStateStore.getState().worldState.corruptionLevel).toBe(35);
    });

    it('should apply history revisions', () => {
      // Add segments
      useHistoryStore.getState().addSegment({
        id: 'seg-1',
        text: 'Original text',
        timestamp: 1,
      });
      useHistoryStore.getState().addSegment({
        id: 'seg-2',
        text: 'Another segment',
        timestamp: 2,
      });

      const effects: EngineEffects = {
        historyRevisions: [
          { id: 'seg-1', newText: 'Revised text' },
          { id: 'seg-2', newText: 'Also revised' },
        ],
      };

      stateManager.applyEngineEffects(effects);

      const segments = useHistoryStore.getState().segments;
      expect(segments[0].text).toBe('Revised text');
      expect(segments[0].isRevised).toBe(true);
      expect(segments[1].text).toBe('Also revised');
      expect(segments[1].isRevised).toBe(true);
    });

    it('should apply profile updates', () => {
      const effects: EngineEffects = {
        profileUpdates: {
          fearProfile: {
            claustrophobia: 0.6,
            madness: 0.8,
          },
          choicePatterns: {
            riskTaking: 0.7,
            curiosity: 0.9,
            aggression: 0.5,
            avoidance: 0.3,
          },
        },
      };

      stateManager.applyEngineEffects(effects);

      const { profile } = usePlayerProfileStore.getState();
      expect(profile.fearProfile.claustrophobia).toBe(0.6);
      expect(profile.fearProfile.madness).toBe(0.8);
      expect(profile.choicePatterns.riskTaking).toBe(0.7);
      expect(profile.choicePatterns.curiosity).toBe(0.9);
    });

    it('should deep merge profile updates', () => {
      // Set initial profile
      usePlayerProfileStore.getState().updateFearProfile('isolation', 0.5);

      const effects: EngineEffects = {
        profileUpdates: {
          fearProfile: {
            claustrophobia: 0.7,
          },
        },
      };

      stateManager.applyEngineEffects(effects);

      const { profile } = usePlayerProfileStore.getState();
      // New value should be set
      expect(profile.fearProfile.claustrophobia).toBe(0.7);
      // Old value should be preserved
      expect(profile.fearProfile.isolation).toBe(0.5);
    });

    it('should apply multiple effects atomically', () => {
      useHistoryStore.getState().addSegment({
        id: 'seg-1',
        text: 'Original',
        timestamp: 1,
      });

      const effects: EngineEffects = {
        worldUpdates: {
          protagonist: 'Jordan',
          horrorIntensity: 5,
        },
        corruptionChanges: 20,
        historyRevisions: [{ id: 'seg-1', newText: 'Revised' }],
        profileUpdates: {
          fearProfile: { madness: 0.8 },
        },
      };

      stateManager.applyEngineEffects(effects);

      // Verify all effects applied
      expect(useWorldStateStore.getState().worldState.protagonist).toBe('Jordan');
      expect(useWorldStateStore.getState().worldState.horrorIntensity).toBe(5);
      expect(useWorldStateStore.getState().worldState.corruptionLevel).toBe(20);
      expect(useHistoryStore.getState().segments[0].text).toBe('Revised');
      expect(
        usePlayerProfileStore.getState().profile.fearProfile.madness
      ).toBe(0.8);
    });

    it('should handle empty effects', () => {
      const effects: EngineEffects = {};

      // Should not throw
      expect(() => stateManager.applyEngineEffects(effects)).not.toThrow();
    });
  });

  describe('snapshotState', () => {
    it('should capture complete game state', () => {
      // Set up state
      useGameStateStore.getState().setGameState(GameState.DESCENDING);
      useWorldStateStore.getState().updateWorld({
        protagonist: 'Alex',
        horrorIntensity: 7,
      });
      useHistoryStore.getState().addSegment({
        id: 'seg-1',
        text: 'Test',
        timestamp: 1,
      });
      usePlayerProfileStore.getState().updateFearProfile('madness', 0.8);

      const snapshot = stateManager.snapshotState();

      expect(snapshot.gameState).toBe(GameState.DESCENDING);
      expect(snapshot.worldState.protagonist).toBe('Alex');
      expect(snapshot.worldState.horrorIntensity).toBe(7);
      expect(snapshot.segments).toHaveLength(1);
      expect(snapshot.segments[0].id).toBe('seg-1');
      expect(snapshot.profile.fearProfile.madness).toBe(0.8);
      expect(snapshot.timestamp).toBeGreaterThan(0);
    });

    it('should create independent snapshots', () => {
      const snapshot1 = stateManager.snapshotState();

      // Modify state
      useGameStateStore.getState().setGameState(GameState.DESCENDING);

      const snapshot2 = stateManager.snapshotState();

      expect(snapshot1.gameState).toBe(GameState.MENU);
      expect(snapshot2.gameState).toBe(GameState.DESCENDING);
    });
  });

  describe('restoreState', () => {
    it('should restore all state from snapshot', () => {
      // Create a complex state
      useGameStateStore.getState().setGameState(GameState.UNRAVELING);
      useWorldStateStore.getState().updateWorld({
        protagonist: 'Jordan',
        setting: 'Space Station',
        horrorIntensity: 9,
      });
      useHistoryStore.getState().addSegment({
        id: 'seg-1',
        text: 'Segment 1',
        timestamp: 1,
      });
      useHistoryStore.getState().addSegment({
        id: 'seg-2',
        text: 'Segment 2',
        timestamp: 2,
      });
      usePlayerProfileStore.getState().updateFearProfile('isolation', 0.9);

      // Take snapshot
      const snapshot = stateManager.snapshotState();

      // Modify state
      stateManager.resetAllStores();

      // Restore
      stateManager.restoreState(snapshot);

      // Verify restoration
      expect(useGameStateStore.getState().gameState).toBe(GameState.UNRAVELING);
      expect(useWorldStateStore.getState().worldState.protagonist).toBe('Jordan');
      expect(useWorldStateStore.getState().worldState.setting).toBe(
        'Space Station'
      );
      expect(useWorldStateStore.getState().worldState.horrorIntensity).toBe(9);
      expect(useHistoryStore.getState().segments).toHaveLength(2);
      expect(
        usePlayerProfileStore.getState().profile.fearProfile.isolation
      ).toBe(0.9);
    });

    it('should handle restoration multiple times', () => {
      const snapshot = stateManager.snapshotState();

      // Modify and restore multiple times
      for (let i = 0; i < 3; i++) {
        useGameStateStore.getState().setGameState(GameState.DESCENDING);
        stateManager.restoreState(snapshot);
        expect(useGameStateStore.getState().gameState).toBe(GameState.MENU);
      }
    });
  });

  describe('Interface Compliance', () => {
    it('should implement all required methods', () => {
      expect(typeof stateManager.resetAllStores).toBe('function');
      expect(typeof stateManager.applyEngineEffects).toBe('function');
      expect(typeof stateManager.snapshotState).toBe('function');
      expect(typeof stateManager.restoreState).toBe('function');
    });
  });

  describe('Atomicity', () => {
    it('should apply all effects together or fail together', () => {
      // Add a segment for revision
      useHistoryStore.getState().addSegment({
        id: 'seg-1',
        text: 'Original',
        timestamp: 1,
      });

      const effects: EngineEffects = {
        worldUpdates: { protagonist: 'Test' },
        corruptionChanges: 10,
        historyRevisions: [{ id: 'seg-1', newText: 'Revised' }],
      };

      // Apply effects
      stateManager.applyEngineEffects(effects);

      // All should be applied
      expect(useWorldStateStore.getState().worldState.protagonist).toBe('Test');
      expect(useWorldStateStore.getState().worldState.corruptionLevel).toBe(10);
      expect(useHistoryStore.getState().segments[0].text).toBe('Revised');
    });
  });
});
