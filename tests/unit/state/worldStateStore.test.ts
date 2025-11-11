/**
 * WORLD STATE STORE - Unit Tests
 *
 * Tests for worldStateStore implementation.
 * Verifies world state updates, bounded value constraints, and reset functionality.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useWorldStateStore } from '../../../src/core/state/worldStateStore';
import { PsychologicalStatus } from '../../../src/core/types/seams';

describe('WorldStateStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useWorldStateStore.getState().reset();
  });

  describe('Initial State', () => {
    it('should have correct initial world state', () => {
      const { worldState } = useWorldStateStore.getState();

      expect(worldState.protagonist).toBe('');
      expect(worldState.setting).toBe('');
      expect(worldState.dilemma).toBe('');
      expect(worldState.psychologicalStatus).toBe(PsychologicalStatus.STABLE);
      expect(worldState.systemHealth).toBe(100);
      expect(worldState.horrorIntensity).toBe(0);
      expect(worldState.corruptionLevel).toBe(0);
      expect(worldState.genreConfig).toBeDefined();
    });
  });

  describe('updateWorld', () => {
    it('should update single properties', () => {
      const { updateWorld } = useWorldStateStore.getState();

      updateWorld({ protagonist: 'Alex' });
      expect(useWorldStateStore.getState().worldState.protagonist).toBe('Alex');

      updateWorld({ setting: 'Abandoned Hospital' });
      expect(useWorldStateStore.getState().worldState.setting).toBe(
        'Abandoned Hospital'
      );
    });

    it('should update multiple properties at once', () => {
      const { updateWorld } = useWorldStateStore.getState();

      updateWorld({
        protagonist: 'Jordan',
        setting: 'Deep Space Station',
        dilemma: 'Crew is missing',
      });

      const { worldState } = useWorldStateStore.getState();
      expect(worldState.protagonist).toBe('Jordan');
      expect(worldState.setting).toBe('Deep Space Station');
      expect(worldState.dilemma).toBe('Crew is missing');
    });

    it('should update psychological status', () => {
      const { updateWorld } = useWorldStateStore.getState();

      updateWorld({ psychologicalStatus: PsychologicalStatus.PARANOID });
      expect(useWorldStateStore.getState().worldState.psychologicalStatus).toBe(
        PsychologicalStatus.PARANOID
      );
    });

    it('should preserve unmodified properties', () => {
      const { updateWorld } = useWorldStateStore.getState();

      updateWorld({ protagonist: 'Alex' });
      updateWorld({ setting: 'Hospital' });

      const { worldState } = useWorldStateStore.getState();
      expect(worldState.protagonist).toBe('Alex');
      expect(worldState.setting).toBe('Hospital');
    });
  });

  describe('increaseHorror', () => {
    it('should increase horror intensity', () => {
      const { increaseHorror } = useWorldStateStore.getState();

      increaseHorror(2);
      expect(useWorldStateStore.getState().worldState.horrorIntensity).toBe(2);

      increaseHorror(3);
      expect(useWorldStateStore.getState().worldState.horrorIntensity).toBe(5);
    });

    it('should cap horror at 10', () => {
      const { increaseHorror } = useWorldStateStore.getState();

      increaseHorror(8);
      increaseHorror(5); // Would go to 13, but capped at 10
      expect(useWorldStateStore.getState().worldState.horrorIntensity).toBe(10);
    });

    it('should handle decimal values', () => {
      const { increaseHorror } = useWorldStateStore.getState();

      increaseHorror(1.5);
      expect(useWorldStateStore.getState().worldState.horrorIntensity).toBe(1.5);

      increaseHorror(0.3);
      expect(useWorldStateStore.getState().worldState.horrorIntensity).toBe(1.8);
    });
  });

  describe('decreaseHealth', () => {
    it('should decrease system health', () => {
      const { decreaseHealth } = useWorldStateStore.getState();

      decreaseHealth(20);
      expect(useWorldStateStore.getState().worldState.systemHealth).toBe(80);

      decreaseHealth(30);
      expect(useWorldStateStore.getState().worldState.systemHealth).toBe(50);
    });

    it('should floor health at 0', () => {
      const { decreaseHealth } = useWorldStateStore.getState();

      decreaseHealth(80);
      decreaseHealth(50); // Would go to -30, but floored at 0
      expect(useWorldStateStore.getState().worldState.systemHealth).toBe(0);
    });

    it('should handle decimal values', () => {
      const { decreaseHealth } = useWorldStateStore.getState();

      decreaseHealth(10.5);
      expect(useWorldStateStore.getState().worldState.systemHealth).toBe(89.5);
    });
  });

  describe('setCorruption', () => {
    it('should set corruption level', () => {
      const { setCorruption } = useWorldStateStore.getState();

      setCorruption(25);
      expect(useWorldStateStore.getState().worldState.corruptionLevel).toBe(25);

      setCorruption(75);
      expect(useWorldStateStore.getState().worldState.corruptionLevel).toBe(75);
    });

    it('should clamp corruption between 0 and 100', () => {
      const { setCorruption } = useWorldStateStore.getState();

      setCorruption(150);
      expect(useWorldStateStore.getState().worldState.corruptionLevel).toBe(100);

      setCorruption(-20);
      expect(useWorldStateStore.getState().worldState.corruptionLevel).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      const { updateWorld, increaseHorror, decreaseHealth, setCorruption, reset } =
        useWorldStateStore.getState();

      // Modify state
      updateWorld({
        protagonist: 'Alex',
        setting: 'Hospital',
        psychologicalStatus: PsychologicalStatus.SHATTERED,
      });
      increaseHorror(8);
      decreaseHealth(60);
      setCorruption(75);

      // Reset
      reset();

      const { worldState } = useWorldStateStore.getState();
      expect(worldState.protagonist).toBe('');
      expect(worldState.setting).toBe('');
      expect(worldState.psychologicalStatus).toBe(PsychologicalStatus.STABLE);
      expect(worldState.systemHealth).toBe(100);
      expect(worldState.horrorIntensity).toBe(0);
      expect(worldState.corruptionLevel).toBe(0);
    });
  });

  describe('Interface Compliance', () => {
    it('should implement all required methods', () => {
      const store = useWorldStateStore.getState();

      expect(typeof store.updateWorld).toBe('function');
      expect(typeof store.increaseHorror).toBe('function');
      expect(typeof store.decreaseHealth).toBe('function');
      expect(typeof store.setCorruption).toBe('function');
      expect(typeof store.reset).toBe('function');
    });

    it('should have worldState property', () => {
      const store = useWorldStateStore.getState();
      expect('worldState' in store).toBe(true);
      expect(typeof store.worldState).toBe('object');
    });
  });
});
