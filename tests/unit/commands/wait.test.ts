/**
 * UNIT TESTS - Wait Executor
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WaitExecutor } from '../../../src/core/commands/wait';
import { Command } from '../../../src/core/types/seams';

describe('WaitExecutor', () => {
  let executor: WaitExecutor;

  beforeEach(() => {
    executor = new WaitExecutor();
  });

  describe('canExecute', () => {
    it('should return true for wait commands', () => {
      const command: Command = {
        type: 'wait',
        payload: { duration: 100 },
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
    it('should validate valid duration', () => {
      const command: Command = {
        type: 'wait',
        payload: { duration: 500 },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(true);
    });

    it('should reject negative duration', () => {
      const command: Command = {
        type: 'wait',
        payload: { duration: -100 },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(false);
    });

    it('should reject duration > 10 seconds', () => {
      const command: Command = {
        type: 'wait',
        payload: { duration: 11000 },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Duration too long (max 10 seconds)');
    });

    it('should reject non-numeric duration', () => {
      const command: any = {
        type: 'wait',
        payload: { duration: '100' },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(false);
    });

    it('should allow zero duration', () => {
      const command: Command = {
        type: 'wait',
        payload: { duration: 0 },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(true);
    });
  });

  describe('execute', () => {
    it('should wait for specified duration', async () => {
      const command: Command = {
        type: 'wait',
        payload: { duration: 50 },
      };

      const startTime = Date.now();
      const result = await executor.execute(command);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.metadata?.requestedDuration).toBe(50);
      expect(endTime - startTime).toBeGreaterThanOrEqual(40); // Allow some variance
    });

    it('should handle zero duration', async () => {
      const command: Command = {
        type: 'wait',
        payload: { duration: 0 },
      };

      const result = await executor.execute(command);

      expect(result.success).toBe(true);
      expect(result.metadata?.requestedDuration).toBe(0);
    });

    it('should report actual duration in metadata', async () => {
      const command: Command = {
        type: 'wait',
        payload: { duration: 100 },
      };

      const result = await executor.execute(command);

      expect(result.metadata?.actualDuration).toBeDefined();
      expect(result.metadata?.actualDuration).toBeGreaterThanOrEqual(90);
    });
  });
});
