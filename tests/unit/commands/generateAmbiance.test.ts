/**
 * UNIT TESTS - Generate Ambiance Executor
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GenerateAmbianceExecutor } from '../../../src/core/commands/generateAmbiance';
import { Command } from '../../../src/core/types/seams';

describe('GenerateAmbianceExecutor', () => {
  let executor: GenerateAmbianceExecutor;

  beforeEach(() => {
    executor = new GenerateAmbianceExecutor();
  });

  afterEach(() => {
    // Stop all ambiance after each test
    GenerateAmbianceExecutor.stopAll();
  });

  describe('canExecute', () => {
    it('should return true for generateAmbiance commands', () => {
      const command: Command = {
        type: 'generateAmbiance',
        payload: { description: 'Distant whispers and creaking floorboards' },
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
        type: 'generateAmbiance',
        payload: { description: 'Low humming and static noise' },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject command with missing description', () => {
      const command = {
        type: 'generateAmbiance',
        payload: { description: '' },
      } as Command;
      const result = executor.validate(command);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject command with non-string description', () => {
      const command = {
        type: 'generateAmbiance',
        payload: { description: 123 },
      } as Command;
      const result = executor.validate(command);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Description must be a string');
    });

    it('should reject command with empty description', () => {
      const command: Command = {
        type: 'generateAmbiance',
        payload: { description: '   ' },
      };
      const result = executor.validate(command);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Description cannot be empty');
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
    it('should successfully start ambiance generation', async () => {
      const command: Command = {
        type: 'generateAmbiance',
        payload: { description: 'Wind howling through abandoned hallways' },
      };

      const result = await executor.execute(command);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.metadata?.description).toBe('Wind howling through abandoned hallways');
      expect(result.metadata?.action).toBe('started');
    });

    it('should update current ambiance state', async () => {
      const command: Command = {
        type: 'generateAmbiance',
        payload: { description: 'Heartbeat sound' },
      };

      await executor.execute(command);

      expect(GenerateAmbianceExecutor.getCurrentAmbiance()).toBe('Heartbeat sound');
      expect(GenerateAmbianceExecutor.isAmbiancePlaying()).toBe(true);
    });

    it('should stop previous ambiance when starting new one', async () => {
      const command1: Command = {
        type: 'generateAmbiance',
        payload: { description: 'First ambiance' },
      };
      const command2: Command = {
        type: 'generateAmbiance',
        payload: { description: 'Second ambiance' },
      };

      await executor.execute(command1);
      expect(GenerateAmbianceExecutor.getCurrentAmbiance()).toBe('First ambiance');

      await executor.execute(command2);
      expect(GenerateAmbianceExecutor.getCurrentAmbiance()).toBe('Second ambiance');
    });

    it('should fail for invalid command', async () => {
      const command: Command = {
        type: 'generateAmbiance',
        payload: { description: '' },
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

  describe('ambiance management', () => {
    it('should stop all ambiance', () => {
      GenerateAmbianceExecutor.stopAll();
      expect(GenerateAmbianceExecutor.getCurrentAmbiance()).toBeNull();
      expect(GenerateAmbianceExecutor.isAmbiancePlaying()).toBe(false);
    });

    it('should return null when no ambiance is playing', () => {
      expect(GenerateAmbianceExecutor.getCurrentAmbiance()).toBeNull();
      expect(GenerateAmbianceExecutor.isAmbiancePlaying()).toBe(false);
    });
  });
});
