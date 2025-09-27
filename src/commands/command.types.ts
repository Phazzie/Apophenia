/**
 * @file command.types.ts
 * @description Defines the core types and interfaces for the command execution system.
 * This includes the structure for command executors and the context they operate within.
 */

import { GameCommand } from '../types';

/**
 * @interface ExecutionContext
 * @description Represents the context in which a command is executed.
 * This is currently a placeholder and can be expanded to provide commands
 * with access to services, state stores, or other necessary resources.
 */
export interface ExecutionContext {
  // This can be expanded with any context the commands might need
  // For example, access to other stores or services
}

/**
 * @interface CommandExecutor
 * @description Defines the structure for a command executor object.
 * Each executor is responsible for handling a specific type of command.
 * @property {string} command - The type of the command that this executor handles (e.g., 'displayText', 'generateImage').
 * @property {(command: GameCommand, context?: ExecutionContext) => Promise<void>} execute - The function that performs the command's action.
 */
export interface CommandExecutor {
  command: string;
  execute: (command: GameCommand, context?: ExecutionContext) => Promise<void>;
}
