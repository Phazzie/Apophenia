/**
 * UNIT TESTS - Command Queue
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CommandQueueImpl } from '../../../src/core/commands/CommandQueue';
import { Command } from '../../../src/core/types/seams';
import { useHistoryStore } from '../../../src/core/state/historyStore';
import { useGameStateStore } from '../../../src/core/state/gameStateStore';

describe('CommandQueue', () => {
  let queue: CommandQueueImpl;

  beforeEach(() => {
    queue = new CommandQueueImpl();
    useHistoryStore.getState().reset();
    useGameStateStore.getState().reset();
  });

  describe('enqueue', () => {
    it('should enqueue commands', () => {
      const commands: Command[] = [
        { type: 'createSegment', payload: { id: 'segment-1' } },
        { type: 'createSegment', payload: { id: 'segment-2' } },
      ];

      queue.enqueue(commands);
      expect(queue.size()).toBe(2);
    });

    it('should append to existing queue', () => {
      queue.enqueue([{ type: 'createSegment', payload: { id: 'segment-1' } }]);
      expect(queue.size()).toBe(1);

      queue.enqueue([{ type: 'createSegment', payload: { id: 'segment-2' } }]);
      expect(queue.size()).toBe(2);
    });
  });

  describe('executeNext', () => {
    it('should execute next command', async () => {
      const command: Command = {
        type: 'createSegment',
        payload: { id: 'test-segment' },
      };

      queue.enqueue([command]);
      const result = await queue.executeNext();

      expect(result.success).toBe(true);
      expect(result.command).toEqual(command);
      expect(queue.size()).toBe(0);
    });

    it('should throw error if queue is empty', async () => {
      await expect(queue.executeNext()).rejects.toThrow('Queue is empty');
    });

    it('should handle executor errors gracefully', async () => {
      const command: Command = {
        type: 'displayText',
        payload: { content: '', segmentId: 'test' }, // Invalid command
      };

      queue.enqueue([command]);
      const result = await queue.executeNext();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle unknown command types', async () => {
      // Type assertion for intentionally invalid command
      // This is testing error handling for malformed commands
      const command = {
        type: 'unknownCommand',
        payload: {},
      } as Command;

      queue.enqueue([command]);
      const result = await queue.executeNext();

      expect(result.success).toBe(false);
      expect(result.error).toContain('No executor found');
    });
  });

  describe('executeSequential', () => {
    it('should execute all commands in order', async () => {
      const commands: Command[] = [
        { type: 'createSegment', payload: { id: 'segment-1' } },
        {
          type: 'displayText',
          payload: { content: 'Text 1', segmentId: 'segment-1' },
        },
        { type: 'createSegment', payload: { id: 'segment-2' } },
        {
          type: 'displayText',
          payload: { content: 'Text 2', segmentId: 'segment-2' },
        },
      ];

      queue.enqueue(commands);
      const results = await queue.executeSequential();

      expect(results.length).toBe(4);
      expect(results.every((r) => r.success)).toBe(true);
      expect(queue.size()).toBe(0);

      // Verify segments were created in order
      const segments = useHistoryStore.getState().segments;
      expect(segments.length).toBe(2);
      expect(segments[0].id).toBe('segment-1');
      expect(segments[0].text).toBe('Text 1');
      expect(segments[1].id).toBe('segment-2');
      expect(segments[1].text).toBe('Text 2');
    });

    it('should continue execution even if a command fails', async () => {
      const commands: Command[] = [
        { type: 'createSegment', payload: { id: 'segment-1' } },
        { type: 'displayText', payload: { content: '', segmentId: 'test' } }, // Invalid
        { type: 'createSegment', payload: { id: 'segment-2' } },
      ];

      queue.enqueue(commands);
      const results = await queue.executeSequential();

      expect(results.length).toBe(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false); // Failed command
      expect(results[2].success).toBe(true); // Should still execute

      // Verify segments were created
      const segments = useHistoryStore.getState().segments;
      expect(segments.length).toBe(2);
    });

    it('should throw if already executing', async () => {
      const commands: Command[] = [
        { type: 'wait', payload: { duration: 100 } },
      ];

      queue.enqueue(commands);

      // Start execution (don't await)
      const promise1 = queue.executeSequential();

      // Try to execute again
      await expect(queue.executeSequential()).rejects.toThrow(
        'Queue is already executing'
      );

      // Wait for first execution to complete
      await promise1;
    });
  });

  describe('executeAll', () => {
    it('should execute all commands in parallel', async () => {
      const commands: Command[] = [
        { type: 'createSegment', payload: { id: 'segment-1' } },
        { type: 'createSegment', payload: { id: 'segment-2' } },
        { type: 'createSegment', payload: { id: 'segment-3' } },
      ];

      queue.enqueue(commands);
      const results = await queue.executeAll();

      expect(results.length).toBe(3);
      expect(results.every((r) => r.success)).toBe(true);
      expect(queue.size()).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear the queue', () => {
      const commands: Command[] = [
        { type: 'createSegment', payload: { id: 'segment-1' } },
        { type: 'createSegment', payload: { id: 'segment-2' } },
      ];

      queue.enqueue(commands);
      expect(queue.size()).toBe(2);

      queue.clear();
      expect(queue.size()).toBe(0);
    });
  });

  describe('size', () => {
    it('should return correct queue size', () => {
      expect(queue.size()).toBe(0);

      queue.enqueue([{ type: 'createSegment', payload: { id: 'test' } }]);
      expect(queue.size()).toBe(1);

      queue.enqueue([{ type: 'createSegment', payload: { id: 'test2' } }]);
      expect(queue.size()).toBe(2);
    });
  });

  describe('integration test', () => {
    it('should execute a complete command sequence', async () => {
      const commands: Command[] = [
        // Create segment
        { type: 'createSegment', payload: { id: 'intro-1' } },

        // Display text
        {
          type: 'displayText',
          payload: {
            content: 'You wake up in a dark room...',
            segmentId: 'intro-1',
          },
        },

        // Display choices
        {
          type: 'displayChoices',
          payload: {
            choices: [
              { id: 'choice-1', text: 'Look around' },
              { id: 'choice-2', text: 'Call out' },
            ],
          },
        },

        // Wait
        { type: 'wait', payload: { duration: 10 } },

        // Update world state
        {
          type: 'updateWorldState',
          payload: {
            horrorIntensity: 2,
            setting: 'Dark Room',
          },
        },
      ];

      queue.enqueue(commands);
      const results = await queue.executeSequential();

      expect(results.length).toBe(5);
      expect(results.every((r) => r.success)).toBe(true);

      // Verify all effects were applied
      const segments = useHistoryStore.getState().segments;
      expect(segments.length).toBe(1);
      expect(segments[0].text).toBe('You wake up in a dark room...');

      const choices = useGameStateStore.getState().choices;
      expect(choices.length).toBe(2);
    });
  });
});
