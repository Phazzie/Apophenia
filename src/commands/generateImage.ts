import { CommandExecutor } from './command.types';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { generateImage } from '../services/gameService';

export const generateImageExecutor: CommandExecutor = {
  command: 'generateImage',
  execute: async (command) => {
    const lastSegment = useStoryHistoryStore.getState().storyHistory.slice(-1)[0];

    // Set loading state immediately
    useStoryHistoryStore.getState().updateLastStorySegment({
      images: {
        ...lastSegment.images,
        mainStatus: 'loading',
      },
    });

    // Generate the image asynchronously
    generateImage(command.payload.styleModifier).then(imageUrl => {
      const currentLastSegment = useStoryHistoryStore.getState().storyHistory.slice(-1)[0];
      useStoryHistoryStore.getState().updateLastStorySegment({
        images: {
          ...currentLastSegment.images,
          main: imageUrl,
          mainStatus: 'loaded',
        },
      });
    });
  },
};
