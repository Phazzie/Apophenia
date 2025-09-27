/**
 * @file generateImage.ts
 * @description Command executor for generating an image for a story segment using an AI service.
 */

import { generateImage } from '../services/gameService';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { GameCommand } from '../types';
import { CommandExecutor } from './command.types';
import { imageGenerationService } from '../services/ai/imageGeneration';

/**
 * The command executor for the `generateImage` command.
 * This executor handles the entire lifecycle of generating an image for a story segment:
 * 1. Sets a 'loading' status for the image in the UI.
 * 2. Calls the AI image generation service, which may produce multiple variations.
 * 3. Selects the best image and updates the story segment.
 * 4. Handles errors by displaying a thematic fallback image.
 */
export const generateImageExecutor: CommandExecutor = {
  command: 'generateImage',
  /**
   * Executes the generateImage command.
   * Asynchronously generates an image based on a prompt and associates it with a story segment.
   * Manages the loading and error states for the image display.
   *
   * @param {GameCommand} command - The command object, expected to be of type 'generateImage'.
   * @returns {Promise<void>} A promise that resolves when the image generation process is complete (or has failed).
   */
  execute: async (command: GameCommand) => {
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

    // Set loading state immediately for responsive UI feedback
    updateSegmentById(segmentId, {
      images: {
        ...segment.images,
        mainStatus: 'loading',
      },
    });

    try {
      // Generate multiple variations using the advanced service and select the best one
      const result = await imageGenerationService.generateImageVariations(prompt, 3);
      
      let imageUrl: string;
      if (result.variations.length > 0) {
        // Simple selection logic: use the first (potentially highest quality) variation
        imageUrl = result.variations[0].url;
        console.log(`Generated ${result.variations.length} image variations, selected: ${result.variations[0].quality}`);
      } else {
        // Fallback to the original single-image generation service if variations fail
        imageUrl = await generateImage(prompt);
      }

      // Re-fetch the segment state before updating to avoid overwriting other async changes
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
      // Re-fetch segment state before updating error status
      const currentSegment = useStoryHistoryStore
        .getState()
        .storyHistory.find((s) => s.id === segmentId);
      if (!currentSegment) return;
      
      // Set error state with a thematic fallback image to maintain immersion
      const fallbackUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWExYTFlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiNlOTQ1NjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5UaGUgd2hpc3BlcnMgZnJvbSBiZXlvbmQgZ3JvdyBmYWludC4uLjwvdGV4dD48L3N2Zz4=';
      
      updateSegmentById(segmentId, {
        images: {
          ...currentSegment.images,
          main: fallbackUrl,
          mainStatus: 'loaded', // 'loaded' signifies the process is complete, even if it failed
        },
      });
    }
  },
};
