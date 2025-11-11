/**
 * BASE COMMAND EXECUTOR
 *
 * Abstract base class for all command executors.
 * Provides type-safe command execution with validation and error handling.
 *
 * All executors must:
 * - Be async (for consistency)
 * - Validate before executing
 * - Return structured ExecutionResult
 * - Update stores via actions only (never mutate directly)
 */

import { CommandExecutor, Command, ExecutionResult, ValidationResult } from '../../types/seams';

/**
 * Abstract base class for command executors
 *
 * Implements the CommandExecutor interface and provides common validation logic.
 */
export abstract class BaseCommandExecutor implements CommandExecutor {
  /**
   * Execute the command
   *
   * This method validates the command first, then delegates to the
   * executeInternal method for actual execution.
   */
  async execute(command: Command): Promise<ExecutionResult> {
    // Check if this executor can handle the command
    if (!this.canExecute(command)) {
      return {
        success: false,
        command,
        error: `Executor ${this.constructor.name} cannot execute command type: ${command.type}`,
      };
    }

    // Validate the command
    const validation = this.validate(command);
    if (!validation.valid) {
      return {
        success: false,
        command,
        error: validation.errors.join(', '),
      };
    }

    // Execute the command
    try {
      return await this.executeInternal(command);
    } catch (error) {
      return {
        success: false,
        command,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check if this executor can handle the given command
   *
   * Subclasses should override this to check the command type.
   */
  abstract canExecute(command: Command): boolean;

  /**
   * Validate the command before execution
   *
   * Subclasses should override this to perform command-specific validation.
   */
  abstract validate(command: Command): ValidationResult;

  /**
   * Internal execution method
   *
   * Subclasses must implement this to perform the actual command execution.
   * This is called only after validation succeeds.
   */
  protected abstract executeInternal(command: Command): Promise<ExecutionResult>;
}
