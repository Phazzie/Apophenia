/**
 * UNIT TESTS - Display Text Executor
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DisplayTextExecutor } from '../../../src/core/commands/displayText';
import { Command, StorySegment } from '../../../src/core/types/seams';
import { useHistoryStore } from '../../../src/core/state/historyStore';

describe('DisplayTextExecutor', () => {
  let executor: DisplayTextExecutor;

  beforeEach(() => {
    executor = new DisplayTextExecutor();
    useHistoryStore.getState().reset();
  });

  describe('canExecute', () => {
    it('should return true for displayText commands', () => {
      const command: Command = {
        type: 'displayText',
        payload: { content: 'Test text', segmentId: 'test' },
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
    it('should validate valid command', () => {
      // Create segment first (required for validation)
      const segment: StorySegment = {
        id: 'test-segment',
        text: '',
        timestamp: Date.now(),
      };
      useHistoryStore.getState().addSegment(segment);

      const command: Command = {
        type: 'displayText',
        payload: { content: 'Test text', segmentId: 'test-segment' },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject command with missing content', () => {
      const command: Command = {
        type: 'displayText',
        payload: { content: '', segmentId: 'test' },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing content');
    });

    it('should reject command with missing segmentId', () => {
      const command: Command = {
        type: 'displayText',
        payload: { content: 'Test', segmentId: '' },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing segmentId');
    });

    it('should reject command with non-string content', () => {
      const command: any = {
        type: 'displayText',
        payload: { content: 123, segmentId: 'test' },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Content must be a string');
    });

    it('should reject command when segment does not exist', () => {
      const command: Command = {
        type: 'displayText',
        payload: { content: 'Test text', segmentId: 'non-existent-segment' },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Segment not found: non-existent-segment');
    });
  });

  describe('execute', () => {
    it('should update segment with text', async () => {
      // Create a segment first
      const segment: StorySegment = {
        id: 'test-segment',
        text: '',
        timestamp: Date.now(),
      };
      useHistoryStore.getState().addSegment(segment);

      // Display text
      const command: Command = {
        type: 'displayText',
        payload: {
          content: 'This is a test narrative.',
          segmentId: 'test-segment',
        },
      };

      const result = await executor.execute(command);

      expect(result.success).toBe(true);
      expect(result.metadata?.segmentId).toBe('test-segment');
      expect(result.metadata?.textLength).toBe(25);

      // Verify text was updated
      const segments = useHistoryStore.getState().segments;
      expect(segments[0].text).toBe('This is a test narrative.');
    });

    it('should handle long text content', async () => {
      const segment: StorySegment = {
        id: 'test-segment',
        text: '',
        timestamp: Date.now(),
      };
      useHistoryStore.getState().addSegment(segment);

      const longText = 'A'.repeat(5000);
      const command: Command = {
        type: 'displayText',
        payload: {
          content: longText,
          segmentId: 'test-segment',
        },
      };

      const result = await executor.execute(command);

      expect(result.success).toBe(true);
      expect(result.metadata?.textLength).toBe(5000);
    });

    it('should fail for invalid command', async () => {
      const command: Command = {
        type: 'displayText',
        payload: { content: '', segmentId: 'test' },
      };

      const result = await executor.execute(command);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('displayWithEffect', () => {
    it('should not throw for any effect type', async () => {
      await expect(
        executor.displayWithEffect('Test', 'typewriter')
      ).resolves.not.toThrow();
      await expect(
        executor.displayWithEffect('Test', 'glitch')
      ).resolves.not.toThrow();
      await expect(
        executor.displayWithEffect('Test', 'fade')
      ).resolves.not.toThrow();
    });
  });
});
