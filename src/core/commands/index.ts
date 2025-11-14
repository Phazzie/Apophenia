/**
 * COMMAND SYSTEM - Public API
 *
 * Exports all command executors and the command queue.
 * This is the main entry point for the command system.
 */

// Base executor
export { BaseCommandExecutor } from './base/CommandExecutor';

// Command executors
export { CreateSegmentExecutor } from './createSegment';
export { DisplayTextExecutor } from './displayText';
export { DisplayChoicesExecutor } from './displayChoices';
export { GenerateImageExecutor } from './generateImage';
export { UpdateWorldStateExecutor } from './updateWorldState';
export { WaitExecutor } from './wait';
export { ApplyCorruptionExecutor } from './applyCorruption';
export { BrowserEffectCommandExecutor } from './browserEffect';
export { ReviseHistoryExecutor } from './reviseHistory';
export { QuantumShiftExecutor } from './quantumShift';

// Command queue
export { CommandQueueImpl, createCommandQueue } from './CommandQueue';

// Re-export types from seams
export type {
  Command,
  CommandExecutor,
  CommandQueue,
  ExecutionResult,
  ValidationResult,
  BrowserEffect,
} from '../types/seams';

// Executor registry for convenient access
import { CreateSegmentExecutor } from './createSegment';
import { DisplayTextExecutor } from './displayText';
import { DisplayChoicesExecutor } from './displayChoices';
import { GenerateImageExecutor } from './generateImage';
import { UpdateWorldStateExecutor } from './updateWorldState';
import { WaitExecutor } from './wait';
import { ApplyCorruptionExecutor } from './applyCorruption';
import { BrowserEffectCommandExecutor } from './browserEffect';
import { ReviseHistoryExecutor } from './reviseHistory';
import { QuantumShiftExecutor } from './quantumShift';
import { CommandExecutor } from '../types/seams';

export const commandExecutors: Record<string, CommandExecutor> = {
  createSegment: new CreateSegmentExecutor(),
  displayText: new DisplayTextExecutor(),
  displayChoices: new DisplayChoicesExecutor(),
  generateImage: new GenerateImageExecutor(),
  updateWorldState: new UpdateWorldStateExecutor(),
  wait: new WaitExecutor(),
  applyCorruption: new ApplyCorruptionExecutor(),
  browserEffect: new BrowserEffectCommandExecutor(),
  reviseHistory: new ReviseHistoryExecutor(),
  quantumShift: new QuantumShiftExecutor(),
};

// Execution context type for command execution
export interface ExecutionContext {
  [key: string]: unknown;
}
