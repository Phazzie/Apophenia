import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { Command } from '../types';
import { CommandExecutor } from './command.types';

export const createSegmentExecutor: CommandExecutor = {
  command: 'createSegment',
  execute: async (command: Command) => {
    if (command.type !== 'createSegment') {
      return;
    }

    const { addStorySegment } = useStoryHistoryStore.getState();
    addStorySegment({
      id: command.payload.id,
      text: '',
      images: {},
    });
  },
};