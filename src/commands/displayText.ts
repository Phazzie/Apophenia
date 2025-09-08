import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { Command } from '../types';
import { CommandExecutor } from './command.types';

export const displayTextExecutor: CommandExecutor = {
  command: 'displayText',
  execute: async (command: Command) => {
    if (command.type !== 'displayText') {
      return;
    }

    const { storyHistory, updateSegmentById } = useStoryHistoryStore.getState();
    const segment = storyHistory.find((s: any) => s.id === command.payload.segmentId);

    if (segment) {
      updateSegmentById(command.payload.segmentId, {
        text: segment.text + command.payload.content,
      });
    } else {
      console.error(`displayText: Segment with id ${command.payload.segmentId} not found. Story history length: ${storyHistory.length}`);
      // Could optionally create a segment here, but for now we'll log the error
    }
  },
};
