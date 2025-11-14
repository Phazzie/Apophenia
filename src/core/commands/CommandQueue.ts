/**
 * COMMAND QUEUE
 *
 * Manages sequential execution of commands.
 * Implements CommandQueue interface from seams.ts.
 *
 * Features:
 * - Sequential execution (one command at a time)
 * - Error recovery (failed commands don't break queue)
 * - Executor registry and routing
 * - Comprehensive logging
 */

import { CommandQueue, Command, ExecutionResult, CommandExecutor } from '../types/seams';
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

/**
 * Command Queue Implementation
 *
 * Maintains a queue of commands and executes them sequentially.
 * Automatically routes commands to the correct executor.
 */
export class CommandQueueImpl implements CommandQueue {
  private queue: Command[] = [];
  private executors: Map<string, CommandExecutor> = new Map();
  private isExecuting: boolean = false;

  constructor() {
    this.registerDefaultExecutors();
  }

  /**
   * Register all default command executors
   */
  private registerDefaultExecutors(): void {
    this.registerExecutor('createSegment', new CreateSegmentExecutor());
    this.registerExecutor('displayText', new DisplayTextExecutor());
    this.registerExecutor('displayChoices', new DisplayChoicesExecutor());
    this.registerExecutor('generateImage', new GenerateImageExecutor());
    this.registerExecutor('updateWorldState', new UpdateWorldStateExecutor());
    this.registerExecutor('wait', new WaitExecutor());
    this.registerExecutor('applyCorruption', new ApplyCorruptionExecutor());
    this.registerExecutor('browserEffect', new BrowserEffectCommandExecutor());
    this.registerExecutor('reviseHistory', new ReviseHistoryExecutor());
    this.registerExecutor('quantumShift', new QuantumShiftExecutor());
  }

  /**
   * Register a command executor
   *
   * @param commandType - The command type this executor handles
   * @param executor - The executor instance
   */
  registerExecutor(commandType: string, executor: CommandExecutor): void {
    this.executors.set(commandType, executor);
  }

  /**
   * Get the appropriate executor for a command
   *
   * @param commandType - The command type
   * @returns The executor, or null if not found
   */
  private getExecutor(commandType: string): CommandExecutor | null {
    return this.executors.get(commandType) || null;
  }

  /**
   * Add commands to the queue
   *
   * @param commands - Array of commands to enqueue
   */
  enqueue(commands: Command[]): void {
    this.queue.push(...commands);
  }

  /**
   * Execute the next command in the queue
   *
   * @returns Execution result, or null if queue is empty
   */
  async executeNext(): Promise<ExecutionResult> {
    if (this.queue.length === 0) {
      throw new Error('Queue is empty');
    }

    const command = this.queue.shift()!;
    const executor = this.getExecutor(command.type);

    if (!executor) {
      return {
        success: false,
        command,
        error: `No executor found for command type: ${command.type}`,
      };
    }

    try {
      const result = await executor.execute(command);

      // Log result
      if (!result.success) {
        console.error(`Command failed: ${command.type}`, result.error);
      } else {
        console.log(`Command executed: ${command.type}`, result.metadata);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        command,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Execute all commands in the queue (parallel)
   *
   * Note: This executes all commands in parallel, which may not preserve order.
   * Use executeSequential() for ordered execution.
   *
   * @returns Array of execution results
   */
  async executeAll(): Promise<ExecutionResult[]> {
    const commands = [...this.queue];
    this.queue = [];

    const promises = commands.map((command) => {
      const executor = this.getExecutor(command.type);
      if (!executor) {
        return Promise.resolve({
          success: false,
          command,
          error: `No executor found for command type: ${command.type}`,
        } as ExecutionResult);
      }
      return executor.execute(command);
    });

    return Promise.all(promises);
  }

  /**
   * Execute all commands sequentially
   *
   * Commands are executed one at a time, in order.
   * Failed commands don't stop execution (but are logged).
   *
   * @returns Array of execution results
   */
  async executeSequential(): Promise<ExecutionResult[]> {
    if (this.isExecuting) {
      throw new Error('Queue is already executing');
    }

    this.isExecuting = true;
    const results: ExecutionResult[] = [];

    try {
      while (this.queue.length > 0) {
        const result = await this.executeNext();
        results.push(result);

        // Continue even if command failed
        if (!result.success) {
          console.error('Command failed but continuing:', result.error);
        }
      }

      return results;
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Clear the queue
   *
   * Removes all pending commands.
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Get the current queue size
   *
   * @returns Number of pending commands
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Check if queue is currently executing
   *
   * @returns true if executing
   */
  isRunning(): boolean {
    return this.isExecuting;
  }

  /**
   * Get a copy of the current queue
   *
   * @returns Array of pending commands
   */
  getQueue(): Command[] {
    return [...this.queue];
  }
}

/**
 * Create a new command queue instance
 *
 * @returns A new CommandQueue
 */
export function createCommandQueue(): CommandQueue {
  return new CommandQueueImpl();
}
