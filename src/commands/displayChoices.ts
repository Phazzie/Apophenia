/**
 * @file displayChoices.ts
 * @description Command executor for displaying player choices, including standard options and intrusive thoughts.
 */

import { CommandExecutor } from './command.types';
import { useGameStateStore } from '../stores/gameStateStore';
import { executeCommandQueue } from '../services/commandExecutor';
import { GameCommand, GameState } from '../types';

/**
 * The command executor for the `displayChoices` command.
 * This executor updates the game state with the new choices that should be presented
 * to the player. It also handles triggering a non-blocking `pregenerateImage` command
 * if the AI has predicted a likely next scene that requires an image.
 */
export const displayChoicesExecutor: CommandExecutor = {
  command: 'displayChoices',
  /**
   * Executes the displayChoices command.
   * Updates the UI with a new set of choices and an optional intrusive thought.
   * It also opportunistically starts pre-generating an image for the next turn.
   *
   * @param {GameCommand} command - The command object, expected to be of type 'displayChoices'.
   * @returns {Promise<void>} A promise that resolves when the choices have been set.
   */
  execute: async (command: GameCommand) => {
    if (command.type !== 'displayChoices') {
      return;
    }

    // Set the choices in the game state store for the UI to render
    const { setChoices, setGameState } = useGameStateStore.getState();
    setChoices(command.payload.choices, command.payload.intrusiveThought);
    setGameState(GameState.PLAYING);

    // If there's a predicted image, trigger the pregeneration command
    if (command.payload.predictedImagePrompt) {
      // This is a non-blocking call to not slow down the user's turn
      void executeCommandQueue([
        {
          type: 'pregenerateImage',
          payload: { prompt: command.payload.predictedImagePrompt },
        },
      ]);
    }
  },
};
