/**
 * UNIT TESTS - Update World State Executor
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateWorldStateExecutor } from '../../../src/core/commands/updateWorldState';
import { Command } from '../../../src/core/types/seams';
import { useWorldStateStore } from '../../../src/core/state/worldStateStore';

describe('UpdateWorldStateExecutor', () => {
  let executor: UpdateWorldStateExecutor;

  beforeEach(() => {
    executor = new UpdateWorldStateExecutor();
    useWorldStateStore.getState().reset();
  });

  describe('canExecute', () => {
    it('should return true for updateWorldState commands', () => {
      const command: Command = {
        type: 'updateWorldState',
        payload: { protagonist: 'Test' },
      };
      expect(executor.canExecute(command)).toBe(true);
    });

    it('should return false for other command types', () => {
      const command: Command = {
        type: 'createSegment',
        payload: { id: 'test' },
      };
      expect(executor.canExecute(command)).toBe(false);
    });
  });

  describe('validate', () => {
    it('should validate valid world state update', () => {
      const command: Command = {
        type: 'updateWorldState',
        payload: {
          protagonist: 'Alice',
          setting: 'Dark Forest',
          horrorIntensity: 5,
        },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid systemHealth values', () => {
      const command: Command = {
        type: 'updateWorldState',
        payload: { systemHealth: 150 },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(false);
    });

    it('should reject negative horrorIntensity', () => {
      const command: Command = {
        type: 'updateWorldState',
        payload: { horrorIntensity: -1 },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid corruption level', () => {
      const command: Command = {
        type: 'updateWorldState',
        payload: { corruptionLevel: 200 },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(false);
    });
  });

  describe('execute', () => {
    it('should update world state fields', async () => {
      const command: Command = {
        type: 'updateWorldState',
        payload: {
          protagonist: 'Detective Smith',
          setting: 'Abandoned Hospital',
          dilemma: 'Find the missing patient',
          horrorIntensity: 3,
        },
      };

      const result = await executor.execute(command);

      expect(result.success).toBe(true);
      expect(result.metadata?.updatedFields).toEqual([
        'protagonist',
        'setting',
        'dilemma',
        'horrorIntensity',
      ]);

      const worldState = useWorldStateStore.getState().worldState;
      expect(worldState.protagonist).toBe('Detective Smith');
      expect(worldState.setting).toBe('Abandoned Hospital');
      expect(worldState.horrorIntensity).toBe(3);
    });

    it('should update partial world state', async () => {
      const command: Command = {
        type: 'updateWorldState',
        payload: { horrorIntensity: 7 },
      };

      const result = await executor.execute(command);

      expect(result.success).toBe(true);
      const worldState = useWorldStateStore.getState().worldState;
      expect(worldState.horrorIntensity).toBe(7);
    });
  });

  describe('validateUpdate', () => {
    it('should validate numeric ranges', () => {
      expect(executor.validateUpdate({ systemHealth: 50 })).toBe(true);
      expect(executor.validateUpdate({ systemHealth: 0 })).toBe(true);
      expect(executor.validateUpdate({ systemHealth: 100 })).toBe(true);
      expect(executor.validateUpdate({ systemHealth: -1 })).toBe(false);
      expect(executor.validateUpdate({ systemHealth: 101 })).toBe(false);
    });

    it('should validate horror intensity', () => {
      expect(executor.validateUpdate({ horrorIntensity: 5 })).toBe(true);
      expect(executor.validateUpdate({ horrorIntensity: 0 })).toBe(true);
      expect(executor.validateUpdate({ horrorIntensity: 10 })).toBe(true);
      expect(executor.validateUpdate({ horrorIntensity: 11 })).toBe(false);
    });

    it('should validate string fields', () => {
      expect(executor.validateUpdate({ protagonist: 'Test' })).toBe(true);
      expect(executor.validateUpdate({ setting: '' })).toBe(true);
      expect(executor.validateUpdate({ protagonist: 123 as any })).toBe(false);
    });
  });
});
