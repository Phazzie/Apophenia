import { CommandExecutor } from './command.types';
import { useWorldStateStore } from '../stores/worldStateStore';
import { Command } from '../types';

export const updateWorldStateExecutor: CommandExecutor = {
  command: 'updateWorldState',
  execute: async (command: Command) => {
    if (command.type !== 'updateWorldState') {
      return;
    }
    useWorldStateStore.getState().updateWorldState(command.payload);
  },
};
