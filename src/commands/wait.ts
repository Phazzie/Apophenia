import { CommandExecutor } from './command.types';
import { Command } from '../types';

export const waitExecutor: CommandExecutor = {
  command: 'wait',
  execute: async (command: Command) => {
    if (command.type !== 'wait') {
      return;
    }
    return new Promise((resolve) => setTimeout(resolve, command.payload.duration));
  },
};
