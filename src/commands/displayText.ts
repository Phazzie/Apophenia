import { CommandExecutor } from './command.types';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { Command } from '../types';

export const displayTextExecutor: CommandExecutor = {
  command: 'displayText',
  execute: async (command: Command) => {
    if (command.type !== 'displayText') {
      return;
    }

    const { storyHistory, updateSegmentById } = useStoryHistoryStore.getState();
    const segment = storyHistory.find((s) => s.id === command.payload.segmentId);

    if (segment) {
      updateSegmentById(command.payload.segmentId, {
        text: segment.text + command.payload.content,
      });
    }
  },
};
