/**
 * UPDATE WORLD STATE EXECUTOR
 *
 * Updates the world state with new values.
 * Implements WorldStateExecutor interface with validation.
 */

import { BaseCommandExecutor } from './base/CommandExecutor';
import { Command, ExecutionResult, ValidationResult, WorldState, WorldStateExecutor } from '../types/seams';
import { useWorldStateStore } from '../state/worldStateStore';

/**
 * Executor for updateWorldState commands
 *
 * Updates world state properties like protagonist, setting, horror intensity, etc.
 * Validates updates before applying to ensure data integrity.
 */
export class UpdateWorldStateExecutor extends BaseCommandExecutor implements WorldStateExecutor {
  canExecute(command: Command): boolean {
    return command.type === 'updateWorldState';
  }

  validate(command: Command): ValidationResult {
    if (command.type !== 'updateWorldState') {
      return { valid: false, errors: ['Wrong command type'] };
    }

    if (!command.payload || typeof command.payload !== 'object') {
      return { valid: false, errors: ['Invalid payload'] };
    }

    // Validate the update object
    if (!this.validateUpdate(command.payload)) {
      return { valid: false, errors: ['Invalid world state update'] };
    }

    return { valid: true, errors: [] };
  }

  protected async executeInternal(command: Command): Promise<ExecutionResult> {
    if (command.type !== 'updateWorldState') {
      return { success: false, command, error: 'Invalid command type' };
    }

    try {
      // Apply the update
      this.applyUpdate(command.payload);

      return {
        success: true,
        command,
        metadata: {
          updatedFields: Object.keys(command.payload),
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

  /**
   * Validate a world state update
   *
   * Checks that all values are of the correct type and within valid ranges.
   */
  validateUpdate(update: Partial<WorldState>): boolean {
    // Check numeric fields are in valid ranges
    if (update.systemHealth !== undefined) {
      if (typeof update.systemHealth !== 'number' || update.systemHealth < 0 || update.systemHealth > 100) {
        return false;
      }
    }

    if (update.horrorIntensity !== undefined) {
      if (typeof update.horrorIntensity !== 'number' || update.horrorIntensity < 0 || update.horrorIntensity > 10) {
        return false;
      }
    }

    if (update.corruptionLevel !== undefined) {
      if (typeof update.corruptionLevel !== 'number' || update.corruptionLevel < 0 || update.corruptionLevel > 100) {
        return false;
      }
    }

    // Check string fields are strings
    if (update.protagonist !== undefined && typeof update.protagonist !== 'string') {
      return false;
    }

    if (update.setting !== undefined && typeof update.setting !== 'string') {
      return false;
    }

    if (update.dilemma !== undefined && typeof update.dilemma !== 'string') {
      return false;
    }

    return true;
  }

  /**
   * Apply a world state update
   *
   * Updates the world state store with new values.
   */
  applyUpdate(update: Partial<WorldState>): void {
    useWorldStateStore.getState().updateWorld(update);
  }
}
