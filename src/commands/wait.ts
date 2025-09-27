/**
 * @file wait.ts
 * @description Command executor for introducing a delay in the command queue execution.
 */

import { CommandExecutor } from './command.types';
import { GameCommand } from '../types';

/**
 * The command executor for the `wait` command.
 * This executor is used to pause the execution of the command queue for a specified
 * duration in milliseconds. It is useful for creating dramatic pauses, timing events,
 * or improving the pacing of the narrative delivery.
 */
export const waitExecutor: CommandExecutor = {
  command: 'wait',
  /**
   * Executes the wait command.
   * Pauses execution for the duration specified in the command's payload.
   *
   * @param {GameCommand} command - The command object, expected to be of type 'wait'.
   * @returns {Promise<void>} A promise that resolves after the specified duration has passed.
   */
  execute: async (command: GameCommand) => {
    if (command.type !== 'wait') {
      return;
    }
    return new Promise((resolve) => setTimeout(resolve, command.payload.duration));
  },
};
