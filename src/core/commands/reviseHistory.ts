/**
 * REVISE HISTORY EXECUTOR
 *
 * Revises past story segments (Temporal Revision Engine).
 * Creates "false memory" effects by changing historical text.
 */

import { BaseCommandExecutor } from './base/CommandExecutor';
import { Command, ExecutionResult, ValidationResult } from '../types/seams';
import { useHistoryStore } from '../state/historyStore';

/**
 * Executor for reviseHistory commands
 *
 * Updates a past segment with new text, preserving the original.
 * This creates the effect of "reality changing" or "false memories".
 */
export class ReviseHistoryExecutor extends BaseCommandExecutor {
  canExecute(command: Command): boolean {
    return command.type === 'reviseHistory';
  }

  validate(command: Command): ValidationResult {
    if (command.type !== 'reviseHistory') {
      return { valid: false, errors: ['Wrong command type'] };
    }

    if (!command.payload.segmentId) {
      return { valid: false, errors: ['Missing segmentId'] };
    }

    if (!command.payload.newText) {
      return { valid: false, errors: ['Missing newText'] };
    }

    if (typeof command.payload.segmentId !== 'string') {
      return { valid: false, errors: ['segmentId must be a string'] };
    }

    if (typeof command.payload.newText !== 'string') {
      return { valid: false, errors: ['newText must be a string'] };
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
    if (command.type !== 'reviseHistory') {
      return { success: false, command, error: 'Invalid command type' };
    }

    try {
      const { segmentId, newText } = command.payload;

      // Get original text before revision
      const segments = useHistoryStore.getState().segments;
      const segment = segments.find(s => s.id === segmentId);
      const originalText = segment?.text || '';

      // Revise the segment
      useHistoryStore.getState().reviseSegment(segmentId, newText);

      return {
        success: true,
        command,
        metadata: {
          segmentId,
          originalLength: originalText.length,
          newLength: newText.length,
          revised: true,
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
