/**
 * CREATE SEGMENT EXECUTOR
 *
 * Creates a new story segment in the history store.
 * This is typically the first command in a sequence.
 */

import { BaseCommandExecutor } from './base/CommandExecutor';
import { Command, ExecutionResult, ValidationResult, StorySegment } from '../types/seams';
import { useHistoryStore } from '../state/historyStore';

/**
 * Executor for createSegment commands
 *
 * Creates a new empty segment that will be populated by subsequent commands.
 */
export class CreateSegmentExecutor extends BaseCommandExecutor {
  canExecute(command: Command): boolean {
    return command.type === 'createSegment';
  }

  validate(command: Command): ValidationResult {
    if (command.type !== 'createSegment') {
      return { valid: false, errors: ['Wrong command type'] };
    }

    if (!command.payload.id) {
      return { valid: false, errors: ['Missing segment ID'] };
    }

    if (typeof command.payload.id !== 'string') {
      return { valid: false, errors: ['Segment ID must be a string'] };
    }

    return { valid: true, errors: [] };
  }

  protected async executeInternal(command: Command): Promise<ExecutionResult> {
    if (command.type !== 'createSegment') {
      return { success: false, command, error: 'Invalid command type' };
    }

    try {
      const segment: StorySegment = {
        id: command.payload.id,
        text: '',
        timestamp: Date.now(),
      };

      // Add segment to history store
      useHistoryStore.getState().addSegment(segment);

      return {
        success: true,
        command,
        metadata: { segmentId: segment.id },
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
