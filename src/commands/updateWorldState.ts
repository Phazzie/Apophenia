/**
 * @file updateWorldState.ts
 * @description Command executor for updating the global world state of the narrative.
 */

import { CommandExecutor } from './command.types';
import { useWorldStateStore } from '../stores/worldStateStore';
import { GameCommand } from '../types';

/**
 * The command executor for the `updateWorldState` command.
 * This executor allows the AI to make direct modifications to the `worldStateStore`.
 * This is used for tracking changes in the narrative world, such as character relationships,
 * key items, environmental status, or any other dynamic element of the story.
 */
export const updateWorldStateExecutor: CommandExecutor = {
  command: 'updateWorldState',
  /**
   * Executes the updateWorldState command.
   * Merges the payload of the command into the current world state.
   *
   * @param {GameCommand} command - The command object, expected to be of type 'updateWorldState'.
   * @returns {Promise<void>} A promise that resolves when the world state has been updated.
   */
  execute: async (command: GameCommand) => {
    if (command.type !== 'updateWorldState') {
      return;
    }
    useWorldStateStore.getState().updateWorldState(command.payload);
  },
};
