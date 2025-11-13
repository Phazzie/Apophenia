/**
 * UNIT TESTS - Apply Corruption Executor
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ApplyCorruptionExecutor } from '../../../src/core/commands/applyCorruption';
import { Command } from '../../../src/core/types/seams';
import { useWorldStateStore } from '../../../src/core/state/worldStateStore';

describe('ApplyCorruptionExecutor', () => {
  let executor: ApplyCorruptionExecutor;

  beforeEach(() => {
    executor = new ApplyCorruptionExecutor();
    useWorldStateStore.getState().reset();
  });

  describe('canExecute', () => {
    it('should return true for applyCorruption commands', () => {
      const command: Command = {
        type: 'applyCorruption',
        payload: { level: 50, effects: [] },
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
    it('should validate valid corruption command', () => {
      const command: Command = {
        type: 'applyCorruption',
        payload: {
          level: 50,
          effects: ['glitch', 'distortion'],
        },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(true);
    });

    it('should reject negative corruption level', () => {
      const command: Command = {
        type: 'applyCorruption',
        payload: { level: -10, effects: [] },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(false);
    });

    it('should reject corruption level > 100', () => {
      const command: Command = {
        type: 'applyCorruption',
        payload: { level: 150, effects: [] },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(false);
    });

    it('should reject non-array effects', () => {
      const command: any = {
        type: 'applyCorruption',
        payload: { level: 50, effects: 'glitch' },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(false);
    });
  });

  describe('execute', () => {
    it('should apply corruption level', async () => {
      const command: Command = {
        type: 'applyCorruption',
        payload: {
          level: 60,
          effects: ['static', 'color-shift'],
        },
      };

      const result = await executor.execute(command);

      expect(result.success).toBe(true);
      expect(result.metadata?.corruptionLevel).toBe(60);
      expect(result.metadata?.effectCount).toBe(2);

      const worldState = useWorldStateStore.getState().worldState;
      expect(worldState.corruptionLevel).toBe(60);
    });

    it('should decrease system health proportionally', async () => {
      const command: Command = {
        type: 'applyCorruption',
        payload: { level: 50, effects: [] },
      };

      const initialHealth = useWorldStateStore.getState().worldState.systemHealth;
      await executor.execute(command);

      const newHealth = useWorldStateStore.getState().worldState.systemHealth;
      expect(newHealth).toBeLessThan(initialHealth);
      expect(newHealth).toBe(initialHealth - 5); // 50 / 10 = 5
    });

    it('should handle zero corruption', async () => {
      const command: Command = {
        type: 'applyCorruption',
        payload: { level: 0, effects: [] },
      };

      const result = await executor.execute(command);

      expect(result.success).toBe(true);
      const worldState = useWorldStateStore.getState().worldState;
      expect(worldState.corruptionLevel).toBe(0);
    });

    it('should handle maximum corruption', async () => {
      const command: Command = {
        type: 'applyCorruption',
        payload: { level: 100, effects: ['total-collapse'] },
      };

      const result = await executor.execute(command);

      expect(result.success).toBe(true);
      const worldState = useWorldStateStore.getState().worldState;
      expect(worldState.corruptionLevel).toBe(100);
    });
  });
});
