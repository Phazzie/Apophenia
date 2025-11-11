/**
 * DISPLAY CHOICES EXECUTOR
 *
 * Updates the game state with available choices for the player.
 * Handles both regular choices and intrusive thoughts.
 */

import { BaseCommandExecutor } from './base/CommandExecutor';
import { Command, ExecutionResult, ValidationResult, Choice } from '../types/seams';
import { useGameStateStore } from '../state/gameStateStore';

/**
 * Executor for displayChoices commands
 *
 * Sets the available choices in the game state store.
 * Optionally includes an intrusive thought (disturbing choice).
 */
export class DisplayChoicesExecutor extends BaseCommandExecutor {
  canExecute(command: Command): boolean {
    return command.type === 'displayChoices';
  }

  validate(command: Command): ValidationResult {
    if (command.type !== 'displayChoices') {
      return { valid: false, errors: ['Wrong command type'] };
    }

    if (!Array.isArray(command.payload.choices)) {
      return { valid: false, errors: ['Choices must be an array'] };
    }

    if (command.payload.choices.length === 0) {
      return { valid: false, errors: ['Must provide at least one choice'] };
    }

    // Validate each choice
    const errors: string[] = [];
    command.payload.choices.forEach((choice: Choice, index: number) => {
      if (!choice.id) {
        errors.push(`Choice ${index} missing ID`);
      }
      if (!choice.text) {
        errors.push(`Choice ${index} missing text`);
      }
    });

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // Validate intrusive thought if present
    if (command.payload.intrusiveThought) {
      const intrusive = command.payload.intrusiveThought;
      if (!intrusive.id || !intrusive.text) {
        return { valid: false, errors: ['Invalid intrusive thought structure'] };
      }
    }

    return { valid: true, errors: [] };
  }

  protected async executeInternal(command: Command): Promise<ExecutionResult> {
    if (command.type !== 'displayChoices') {
      return { success: false, command, error: 'Invalid command type' };
    }

    try {
      // Update game state with choices
      useGameStateStore.getState().setChoices(
        command.payload.choices,
        command.payload.intrusiveThought
      );

      return {
        success: true,
        command,
        metadata: {
          choiceCount: command.payload.choices.length,
          hasIntrusiveThought: !!command.payload.intrusiveThought,
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
