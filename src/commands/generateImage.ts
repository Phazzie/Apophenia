import { generateImage } from '../services/gameService';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { Command } from '../types';
import { CommandExecutor } from './command.types';

export const generateImageExecutor: CommandExecutor = {
  command: 'generateImage',
  execute: async (command: Command) => {
    if (command.type !== 'generateImage') {
      return;
    }

    const { storyHistory, updateSegmentById } = useStoryHistoryStore.getState();
    const { segmentId, prompt } = command.payload;

    const segment = storyHistory.find((s) => s.id === segmentId);
    if (!segment) {
      console.error(`generateImage: Segment with id ${segmentId} not found. Story history length: ${storyHistory.length}`);
      return;
    }

    // Set loading state immediately
    updateSegmentById(segmentId, {
      images: {
        ...segment.images,
        mainStatus: 'loading',
      },
    });

    // Generate the image asynchronously
    try {
      const imageUrl = await generateImage(prompt);
      // We need to get the segment again in case other image properties (e.g., insets) have changed.
      const currentSegment = useStoryHistoryStore
        .getState()
        .storyHistory.find((s) => s.id === segmentId);
      if (!currentSegment) return;

      updateSegmentById(segmentId, {
        images: {
          ...currentSegment.images,
          main: imageUrl,
          mainStatus: 'loaded',
        },
      });
    } catch (error) {
      console.error('Image generation failed:', error);
      const currentSegment = useStoryHistoryStore
        .getState()
        .storyHistory.find((s) => s.id === segmentId);
      if (!currentSegment) return;
      // Optionally, update segment with error state
      updateSegmentById(segmentId, {
        images: {
          ...currentSegment.images,
          mainStatus: 'loaded', // Reset from loading
        },
      });
    }
  },
};
