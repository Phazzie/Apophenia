import { CommandExecutor } from './command.types';
import { useGameStateStore } from '../stores/gameStateStore';
import { executeCommandQueue } from '../services/commandExecutor';

export const displayChoicesExecutor: CommandExecutor = {
  command: 'displayChoices',
  execute: async (command) => {
    // Set the choices in the game state store for the UI to render
    const { setChoices, setGameState } = useGameStateStore.getState();
    setChoices(command.payload.choices, command.payload.intrusiveThought);
    setGameState(GameState.PLAYING);

    // If there's a predicted image, trigger the pregeneration command
    if (command.payload.predictedImagePrompt) {
      // This is a non-blocking call
      executeCommandQueue([
        {
          type: 'pregenerateImage',
          payload: { prompt: command.payload.predictedImagePrompt },
        },
      ]);
    }
  },
};
