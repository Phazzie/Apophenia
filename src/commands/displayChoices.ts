import { CommandExecutor } from './command.types';
import { useGameStateStore } from '../stores/gameStateStore';
import { GameState } from '../types';
import { executeCommandQueue } from '../services/commandExecutor';

export const displayChoicesExecutor: CommandExecutor = {
  command: 'displayChoices',
  execute: async (command) => {
    // In a real app, this would update the UI with choices.
    // For now, it will just log the choices.
    console.log('Displaying choices:', command.payload.choices);

    if (command.payload.predictedImagePrompt) {
      executeCommandQueue([
        {
          type: 'pregenerateImage',
          payload: { prompt: command.payload.predictedImagePrompt },
        },
      ]);
    }

    useGameStateStore.getState().setGameState(GameState.PLAYING);
  },
};
