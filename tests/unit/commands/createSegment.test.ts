/**
 * UNIT TESTS - Create Segment Executor
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateSegmentExecutor } from '../../../src/core/commands/createSegment';
import { Command } from '../../../src/core/types/seams';
import { useHistoryStore } from '../../../src/core/state/historyStore';

describe('CreateSegmentExecutor', () => {
  let executor: CreateSegmentExecutor;

  beforeEach(() => {
    executor = new CreateSegmentExecutor();
    // Reset history store
    useHistoryStore.getState().reset();
  });

  describe('canExecute', () => {
    it('should return true for createSegment commands', () => {
      const command: Command = {
        type: 'createSegment',
        payload: { id: 'test-segment' },
      };
      expect(executor.canExecute(command)).toBe(true);
    });

    it('should return false for other command types', () => {
      const command: Command = {
        type: 'displayText',
        payload: { content: 'test', segmentId: 'test' },
      };
      expect(executor.canExecute(command)).toBe(false);
    });
  });

  describe('validate', () => {
    it('should validate valid command', () => {
      const command: Command = {
        type: 'createSegment',
        payload: { id: 'test-segment' },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject command with missing id', () => {
      const command: Command = {
        type: 'createSegment',
        payload: { id: '' },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject command with non-string id', () => {
      const command: any = {
        type: 'createSegment',
        payload: { id: 123 },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Segment ID must be a string');
    });

    it('should reject wrong command type', () => {
      const command: Command = {
        type: 'displayText',
        payload: { content: 'test', segmentId: 'test' },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Wrong command type');
    });
  });

  describe('execute', () => {
    it('should create a new segment', async () => {
      const command: Command = {
        type: 'createSegment',
        payload: { id: 'test-segment-1' },
      };

      const result = await executor.execute(command);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.metadata?.segmentId).toBe('test-segment-1');

      // Verify segment was added to store
      const segments = useHistoryStore.getState().segments;
      expect(segments.length).toBe(1);
      expect(segments[0].id).toBe('test-segment-1');
      expect(segments[0].text).toBe('');
    });

    it('should create multiple segments', async () => {
      const command1: Command = {
        type: 'createSegment',
        payload: { id: 'segment-1' },
      };
      const command2: Command = {
        type: 'createSegment',
        payload: { id: 'segment-2' },
      };

      await executor.execute(command1);
      await executor.execute(command2);

      const segments = useHistoryStore.getState().segments;
      expect(segments.length).toBe(2);
      expect(segments[0].id).toBe('segment-1');
      expect(segments[1].id).toBe('segment-2');
    });

    it('should fail for invalid command', async () => {
      const command: Command = {
        type: 'createSegment',
        payload: { id: '' },
      };

      const result = await executor.execute(command);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should not create segment if command type is wrong', async () => {
      const command: Command = {
        type: 'displayText',
        payload: { content: 'test', segmentId: 'test' },
      };

      const result = await executor.execute(command);

      expect(result.success).toBe(false);
      expect(useHistoryStore.getState().segments.length).toBe(0);
    });
  });
});
