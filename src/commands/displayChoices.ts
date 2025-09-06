import { CommandExecutor } from './command.types';
import { useGameStateStore } from '../stores/gameStateStore';
import { executeCommandQueue } from '../services/commandExecutor';
import { GameState, DisplayChoicesCommand } from '../types';

export const displayChoicesExecutor: CommandExecutor = {
  command: 'displayChoices',
  execute: async (command) => {
    // Cast to DisplayChoicesCommand since this executor only handles that type
    const displayCommand = command as DisplayChoicesCommand;
    
    // Set the choices in the game state store for the UI to render
    const { setChoices, setGameState } = useGameStateStore.getState();
    setChoices(displayCommand.payload.choices, displayCommand.payload.intrusiveThought);
    setGameState(GameState.PLAYING);

    // If there's a predicted image, trigger the pregeneration command
    if (displayCommand.payload.predictedImagePrompt) {
      // This is a non-blocking call
      executeCommandQueue([
        {
          type: 'pregenerateImage',
          payload: { prompt: displayCommand.payload.predictedImagePrompt },
        },
      ]);
    }
  },
};
