/**
 * APPLY CORRUPTION EXECUTOR
 *
 * Applies corruption effects to the world state and UI.
 * Part of the Reality Corruption Engine system.
 */

import { BaseCommandExecutor } from './base/CommandExecutor';
import { Command, ExecutionResult, ValidationResult } from '../types/seams';
import { useWorldStateStore } from '../state/worldStateStore';

/**
 * Executor for applyCorruption commands
 *
 * Increases corruption level and stores associated visual effects.
 * Corruption affects UI rendering and game state.
 */
export class ApplyCorruptionExecutor extends BaseCommandExecutor {
  canExecute(command: Command): boolean {
    return command.type === 'applyCorruption';
  }

  validate(command: Command): ValidationResult {
    if (command.type !== 'applyCorruption') {
      return { valid: false, errors: ['Wrong command type'] };
    }

    if (command.payload.level === undefined) {
      return { valid: false, errors: ['Missing corruption level'] };
    }

    if (typeof command.payload.level !== 'number') {
      return { valid: false, errors: ['Corruption level must be a number'] };
    }

    if (command.payload.level < 0 || command.payload.level > 100) {
      return { valid: false, errors: ['Corruption level must be between 0 and 100'] };
    }

    if (!Array.isArray(command.payload.effects)) {
      return { valid: false, errors: ['Effects must be an array'] };
    }

    return { valid: true, errors: [] };
  }

  protected async executeInternal(command: Command): Promise<ExecutionResult> {
    if (command.type !== 'applyCorruption') {
      return { success: false, command, error: 'Invalid command type' };
    }

    try {
      const { level, effects } = command.payload;

      // Update corruption level in world state
      useWorldStateStore.getState().setCorruption(level);

      // Also decrease system health proportionally
      const healthDecrease = Math.floor(level / 10);
      if (healthDecrease > 0) {
        useWorldStateStore.getState().decreaseHealth(healthDecrease);
      }

      return {
        success: true,
        command,
        metadata: {
          corruptionLevel: level,
          effectCount: effects.length,
          effects,
          healthDecrease,
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
