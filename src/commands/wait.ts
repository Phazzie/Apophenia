import { CommandExecutor } from './command.types';

export const waitExecutor: CommandExecutor = {
  command: 'wait',
  execute: async (command) => {
    return new Promise(resolve => setTimeout(resolve, command.payload.duration));
  },
};
