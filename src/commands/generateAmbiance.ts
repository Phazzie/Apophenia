import { CommandExecutor } from './command.types';
import { Command } from '../types';

export const generateAmbianceExecutor: CommandExecutor = {
  command: 'generateAmbiance',
  execute: async (command: Command) => {
    if (command.type !== 'generateAmbiance') {
      return;
    }
    // In a real app, this would call an AI audio generation service
    console.log('Generating ambiance with description:', command.payload.description);
  },
};
