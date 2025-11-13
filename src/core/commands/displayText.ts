/**
 * DISPLAY TEXT EXECUTOR
 *
 * Updates a story segment with narrative text.
 * Implements TextDisplayExecutor interface for optional effects.
 */

import { BaseCommandExecutor } from './base/CommandExecutor';
import { Command, ExecutionResult, ValidationResult, TextDisplayExecutor } from '../types/seams';
import { useHistoryStore } from '../state/historyStore';

/**
 * Executor for displayText commands
 *
 * Updates an existing segment with narrative content.
 * Can apply visual effects like typewriter, glitch, or fade.
 */
export class DisplayTextExecutor extends BaseCommandExecutor implements TextDisplayExecutor {
  /**
   * Check if this executor can handle the given command
   *
   * @param command - The command to check
   * @returns true if this executor can handle the command
   */
  canExecute(command: Command): boolean {
    return command.type === 'displayText';
  }

  /**
   * Validate the displayText command before execution
   *
   * Checks for:
   * - Required fields (content, segmentId)
   * - Type correctness (content must be string)
   * - Content length limits (max 10,000 characters)
   * - Segment existence
   *
   * @param command - The command to validate
   * @returns Validation result with any errors
   */
  validate(command: Command): ValidationResult {
    if (command.type !== 'displayText') {
      return { valid: false, errors: ['Wrong command type'] };
    }

    if (!command.payload.content) {
      return { valid: false, errors: ['Missing content'] };
    }

    if (!command.payload.segmentId) {
      return { valid: false, errors: ['Missing segmentId'] };
    }

    if (typeof command.payload.content !== 'string') {
      return { valid: false, errors: ['Content must be a string'] };
    }

    // Content length validation (max 10,000 characters)
    const MAX_CONTENT_LENGTH = 10000;
    if (command.payload.content.length > MAX_CONTENT_LENGTH) {
      return { valid: false, errors: [`Content exceeds maximum length of ${MAX_CONTENT_LENGTH} characters`] };
    }

    // Verify segment exists
    const segments = useHistoryStore.getState().segments;
    const segment = segments.find(s => s.id === command.payload.segmentId);
    if (!segment) {
      return { valid: false, errors: [`Segment not found: ${command.payload.segmentId}`] };
    }

    return { valid: true, errors: [] };
  }

  protected async executeInternal(command: Command): Promise<ExecutionResult> {
    if (command.type !== 'displayText') {
      return { success: false, command, error: 'Invalid command type' };
    }

    try {
      // Update segment with text
      useHistoryStore.getState().updateSegment(
        command.payload.segmentId,
        { text: command.payload.content }
      );

      return {
        success: true,
        command,
        metadata: {
          segmentId: command.payload.segmentId,
          textLength: command.payload.content.length,
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
   * Display text with a visual effect
   *
   * This method is for future UI integration.
   * Currently just delegates to normal display.
   */
  async displayWithEffect(
    text: string,
    effect: 'typewriter' | 'glitch' | 'fade'
  ): Promise<void> {
    // Future: implement visual effects
    // For now, this is a no-op as effects are handled by UI layer
    console.log(`Displaying text with ${effect} effect:`, text.substring(0, 50));
  }
}
