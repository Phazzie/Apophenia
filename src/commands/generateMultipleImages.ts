import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { Command } from '../types';
import { CommandExecutor } from './command.types';
import { imageGenerationService } from '../services/ai/imageGeneration';

export const generateMultipleImagesExecutor: CommandExecutor = {
  command: 'generateMultipleImages',
  execute: async (command: Command) => {
    if (command.type !== 'generateMultipleImages') {
      return;
    }

    const { storyHistory, updateSegmentById } = useStoryHistoryStore.getState();
    const { segmentId, prompt, count = 3 } = command.payload;

    const segment = storyHistory.find((s) => s.id === segmentId);
    if (!segment) {
      console.error(`generateMultipleImages: Segment with id ${segmentId} not found. Story history length: ${storyHistory.length}`);
      return;
    }

    // Set loading state immediately
    updateSegmentById(segmentId, {
      images: {
        ...segment.images,
        mainStatus: 'loading',
        variations: [], // Clear previous variations
        selectedVariationIndex: 0,
      },
    });

    console.log(`Generating ${count} image variations for prompt: "${prompt}"`);

    try {
      // Generate multiple image variations using the enhanced service
      const result = await imageGenerationService.generateImageVariations(prompt, count);
      
      // Get the current segment state again in case other properties have changed
      const currentSegment = useStoryHistoryStore
        .getState()
        .storyHistory.find((s) => s.id === segmentId);
      if (!currentSegment) return;

      if (result.variations.length > 0) {
        console.log(`Generated ${result.variations.length} image variations successfully`);
        console.log(`Quality breakdown:`, result.variations.reduce((acc, v) => {
          acc[v.quality] = (acc[v.quality] || 0) + 1;
          return acc;
        }, {} as Record<string, number>));

        updateSegmentById(segmentId, {
          images: {
            ...currentSegment.images,
            main: result.variations[0].url, // Set the first variation as main
            mainStatus: 'loaded',
            variations: result.variations,
            selectedVariationIndex: 0,
          },
        });
      } else {
        console.error('No image variations generated');
        throw new Error('No image variations generated');
      }

    } catch (error) {
      console.error('Multiple image generation failed:', error);
      
      const currentSegment = useStoryHistoryStore
        .getState()
        .storyHistory.find((s) => s.id === segmentId);
      if (!currentSegment) return;
      
      // Set error state with thematic fallback
      const fallbackUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWExYTFlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiNlOTQ1NjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5UaGUgdmlzaW9ucyBlbHVkZSBjYXB0dXJlLi4uPC90ZXh0Pjwvc3ZnPg==';
      
      updateSegmentById(segmentId, {
        images: {
          ...currentSegment.images,
          main: fallbackUrl,
          mainStatus: 'loaded',
          variations: [{
            url: fallbackUrl,
            prompt: prompt,
            quality: 'unsplash'
          }],
          selectedVariationIndex: 0,
        },
      });
    }
  },
};