/**
 * WAIT EXECUTOR
 *
 * Delays execution for dramatic effect.
 * Useful for pacing narrative reveals.
 */

import { BaseCommandExecutor } from './base/CommandExecutor';
import { Command, ExecutionResult, ValidationResult } from '../types/seams';

/**
 * Executor for wait commands
 *
 * Introduces a delay in command execution for pacing.
 * Duration is specified in milliseconds.
 */
export class WaitExecutor extends BaseCommandExecutor {
  canExecute(command: Command): boolean {
    return command.type === 'wait';
  }

  validate(command: Command): ValidationResult {
    if (command.type !== 'wait') {
      return { valid: false, errors: ['Wrong command type'] };
    }

    if (command.payload.duration === undefined) {
      return { valid: false, errors: ['Missing duration'] };
    }

    if (typeof command.payload.duration !== 'number') {
      return { valid: false, errors: ['Duration must be a number'] };
    }

    if (command.payload.duration < 0) {
      return { valid: false, errors: ['Duration must be non-negative'] };
    }

    if (command.payload.duration > 10000) {
      return { valid: false, errors: ['Duration too long (max 10 seconds)'] };
    }

    return { valid: true, errors: [] };
  }

  protected async executeInternal(command: Command): Promise<ExecutionResult> {
    if (command.type !== 'wait') {
      return { success: false, command, error: 'Invalid command type' };
    }

    try {
      const startTime = Date.now();

      // Wait for the specified duration
      await new Promise((resolve) => setTimeout(resolve, command.payload.duration));

      const actualDuration = Date.now() - startTime;

      return {
        success: true,
        command,
        metadata: {
          requestedDuration: command.payload.duration,
          actualDuration,
        },
      };
    } catch (error) {
      return {
        success: false,
        command,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
