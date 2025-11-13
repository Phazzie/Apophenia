/**
 * QUANTUM SHIFT EXECUTOR
 *
 * Shifts between quantum timeline branches (Quantum Narrative Engine).
 * Creates the effect of reality "forking" or "merging".
 */

import { BaseCommandExecutor } from './base/CommandExecutor';
import { Command, ExecutionResult, ValidationResult } from '../types/seams';
import { useHistoryStore } from '../state/historyStore';

/**
 * Executor for quantumShift commands
 *
 * Marks the current moment as a quantum shift event.
 * The actual timeline management is handled by the Quantum Narrative Engine.
 * This executor just marks segments with metadata.
 */
export class QuantumShiftExecutor extends BaseCommandExecutor {
  canExecute(command: Command): boolean {
    return command.type === 'quantumShift';
  }

  validate(command: Command): ValidationResult {
    if (command.type !== 'quantumShift') {
      return { valid: false, errors: ['Wrong command type'] };
    }

    if (!command.payload.timeline) {
      return { valid: false, errors: ['Missing timeline identifier'] };
    }

    if (typeof command.payload.timeline !== 'string') {
      return { valid: false, errors: ['timeline must be a string'] };
    }

    return { valid: true, errors: [] };
  }

  protected async executeInternal(command: Command): Promise<ExecutionResult> {
    if (command.type !== 'quantumShift') {
      return { success: false, command, error: 'Invalid command type' };
    }

    try {
      const { timeline } = command.payload;

      // Get the most recent segment to mark it as a quantum shift point
      const segments = useHistoryStore.getState().segments;
      if (segments.length > 0) {
        const latestSegment = segments[segments.length - 1];
        useHistoryStore.getState().updateSegment(latestSegment.id, {
          isQuantumShift: true,
        });
      }

      return {
        success: true,
        command,
        metadata: {
          timeline,
          shiftTime: Date.now(),
          segmentCount: segments.length,
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
