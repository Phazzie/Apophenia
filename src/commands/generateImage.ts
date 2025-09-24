import { generateImage } from '../services/gameService';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { Command } from '../types';
import { CommandExecutor } from './command.types';
import { imageGenerationService } from '../services/ai/imageGeneration';

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

    // Generate the image asynchronously using new multi-variation service
    try {
      // Generate multiple variations and select the best one
      const result = await imageGenerationService.generateImageVariations(prompt, 3);
      
      let imageUrl: string;
      if (result.variations.length > 0) {
        // Use the first variation from the generated set
        imageUrl = result.variations[0].url;
        console.log(`Generated ${result.variations.length} image variations, selected: ${result.variations[0].quality}`);
      } else {
        // Fallback to original service
        imageUrl = await generateImage(prompt);
      }

      // Refresh segment data to ensure we have the latest state.
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
      
      // Set error state with thematic fallback
      const fallbackUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWExYTFlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiNlOTQ1NjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5UaGUgd2hpc3BlcnMgZnJvbSBiZXlvbmQgZ3JvdyBmYWludC4uLjwvdGV4dD48L3N2Zz4=';
      
      updateSegmentById(segmentId, {
        images: {
          ...currentSegment.images,
          main: fallbackUrl,
          mainStatus: 'loaded',
        },
      });
    }
  },
};
