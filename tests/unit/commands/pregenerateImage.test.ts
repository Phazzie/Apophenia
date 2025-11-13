/**
 * UNIT TESTS - Pregenerate Image Executor
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PregenerateImageExecutor } from '../../../src/core/commands/pregenerateImage';
import { Command } from '../../../src/core/types/seams';

describe('PregenerateImageExecutor', () => {
  let executor: PregenerateImageExecutor;

  beforeEach(() => {
    executor = new PregenerateImageExecutor();
  });

  afterEach(() => {
    // Clear cache after each test
    PregenerateImageExecutor.clearCache();
  });

  describe('canExecute', () => {
    it('should return true for pregenerateImage commands', () => {
      const command: Command = {
        type: 'pregenerateImage',
        payload: { prompt: 'A dark forest at night' },
      };
      expect(executor.canExecute(command)).toBe(true);
    });

    it('should return false for other command types', () => {
      const command: Command = {
        type: 'generateImage',
        payload: { prompt: 'test', segmentId: 'test' },
      };
      expect(executor.canExecute(command)).toBe(false);
    });
  });

  describe('validate', () => {
    it('should validate valid command', () => {
      const command: Command = {
        type: 'pregenerateImage',
        payload: { prompt: 'A dark forest at night' },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject command with missing prompt', () => {
      const command = {
        type: 'pregenerateImage',
        payload: { prompt: '' },
      } as Command;
      const result = executor.validate(command);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject command with non-string prompt', () => {
      const command = {
        type: 'pregenerateImage',
        payload: { prompt: 123 },
      } as Command;
      const result = executor.validate(command);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Prompt must be a string');
    });

    it('should reject command with empty prompt', () => {
      const command: Command = {
        type: 'pregenerateImage',
        payload: { prompt: '   ' },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Prompt cannot be empty');
    });

    it('should reject wrong command type', () => {
      const command: Command = {
        type: 'generateImage',
        payload: { prompt: 'test', segmentId: 'test' },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Wrong command type');
    });
  });

  describe('execute', () => {
    it('should successfully queue image pregeneration', async () => {
      const command: Command = {
        type: 'pregenerateImage',
        payload: { prompt: 'A haunted mansion in fog' },
      };

      const result = await executor.execute(command);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.metadata?.prompt).toBe('A haunted mansion in fog');
      expect(result.metadata?.queued).toBe(true);
      expect(result.metadata?.cached).toBe(false);
    });

    it('should return cached result for duplicate prompt', async () => {
      const command: Command = {
        type: 'pregenerateImage',
        payload: { prompt: 'Test prompt' },
      };

      // First execution - should queue
      const result1 = await executor.execute(command);
      expect(result1.metadata?.cached).toBe(false);

      // Note: In the current implementation, images aren't actually cached
      // because the generateAndCache is a placeholder. This test verifies
      // the code path exists but won't show cached=true until Agent 7
      // implements the actual image pipeline.
    });

    it('should fail for invalid command', async () => {
      const command: Command = {
        type: 'pregenerateImage',
        payload: { prompt: '' },
      };

      const result = await executor.execute(command);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should not execute if command type is wrong', async () => {
      const command: Command = {
        type: 'generateImage',
        payload: { prompt: 'test', segmentId: 'test' },
      };

      const result = await executor.execute(command);

      expect(result.success).toBe(false);
    });
  });

  describe('cache management', () => {
    it('should clear cache', () => {
      // Clear cache should not throw
      expect(() => PregenerateImageExecutor.clearCache()).not.toThrow();
    });

    it('should return null for uncached prompt', () => {
      const cachedImage = PregenerateImageExecutor.getCachedImage('non-existent prompt');
      expect(cachedImage).toBeNull();
    });
  });
});
