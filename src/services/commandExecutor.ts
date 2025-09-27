/**
 * @file commandExecutor.ts
 * @description This service is responsible for processing a queue of game commands,
 * routing each command to its appropriate executor.
 */

import { commandExecutors } from '../commands';
import { ExecutionContext } from '../commands/command.types';
import { GameCommand } from '../types';

/**
 * @constant {string[]} NON_BLOCKING_COMMANDS
 * @description A list of command types that should be executed asynchronously
 * without blocking the main command queue execution. These are typically
 * long-running tasks like AI generation that can happen in the background.
 */
const NON_BLOCKING_COMMANDS = [
  'generateImage',
  'pregenerateImage',
  'generateAmbiance',
];

/**
 * Executes a queue of game commands sequentially.
 * It iterates through an array of `GameCommand` objects, finds the corresponding
 * executor for each command, and runs it. It distinguishes between blocking and
 * non-blocking commands to allow long-running tasks (like image generation) to
 * execute in the background without halting the main narrative flow.
 *
 * @param {GameCommand[]} commands - An array of game commands to be executed.
 * @returns {Promise<void>} A promise that resolves when all blocking commands in the queue have been executed.
 */
export const executeCommandQueue = async (commands: GameCommand[]) => {
  const context: ExecutionContext = {};
  console.log('Executing command queue with', commands.length, 'commands');

  for (const command of commands) {
    console.log('Executing command:', command.type, command.payload);
    const executor = commandExecutors[command.type];
    if (executor) {
      try {
        if (NON_BLOCKING_COMMANDS.includes(command.type)) {
          console.log('Running non-blocking command:', command.type);
          executor.execute(command, context);
        } else {
          console.log('Running blocking command:', command.type);
          await executor.execute(command, context);
        }
        console.log('Command executed successfully:', command.type);
      } catch (error) {
        console.error(`Error executing command ${command.type}:`, error);
        console.error('Command payload:', command.payload);
        console.error('Execution context:', context);
        // Continue with other commands rather than failing the entire queue
      }
    } else {
      console.warn(`No executor found for command type: ${command.type}`);
      console.warn('Available executors:', Object.keys(commandExecutors));
    }
  }
  
  console.log('Command queue execution completed');
};
