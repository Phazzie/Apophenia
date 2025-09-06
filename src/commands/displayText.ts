import { CommandExecutor } from './command.types';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';

export const displayTextExecutor: CommandExecutor = {
  command: 'displayText',
  execute: async (command) => {
    const { storyHistory, addStorySegment, updateLastStorySegment } = useStoryHistoryStore.getState();
    
    if (storyHistory.length === 0) {
      // Create initial segment if none exists
      addStorySegment({
        id: `seg-${Date.now()}`,
        text: command.payload.content,
        images: {}
      });
    } else {
      const lastSegment = storyHistory[storyHistory.length - 1];
      updateLastStorySegment({
        text: lastSegment.text + command.payload.content,
      });
    }
  },
};
