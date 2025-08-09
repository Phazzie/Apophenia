import { CommandExecutor } from './command.types';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';

export const displayTextExecutor: CommandExecutor = {
  command: 'displayText',
  execute: async (command) => {
    useStoryHistoryStore.getState().updateLastStorySegment({
      text: useStoryHistoryStore.getState().storyHistory.slice(-1)[0].text + command.payload.content,
    });
  },
};
