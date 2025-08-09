import { CommandExecutor } from './command.types';
import { useWorldStateStore } from '../stores/worldStateStore';

export const updateWorldStateExecutor: CommandExecutor = {
  command: 'updateWorldState',
  execute: async (command) => {
    useWorldStateStore.getState().updateWorldState(command.payload);
  },
};
