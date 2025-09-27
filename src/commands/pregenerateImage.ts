/**
 * @file pregenerateImage.ts
 * @description Command executor for opportunistically pre-generating and caching images
 * that the AI predicts will be needed in the near future.
 */

import { CommandExecutor } from './command.types';
import { useImageCacheStore } from '../stores/imageCacheStore';
import { generateImage } from '../services/gameService';
import { GameCommand } from '../types';

/**
 * The command executor for the `pregenerateImage` command.
 * This is a background task designed to improve performance by reducing perceived latency.
 * When the AI predicts a likely future scene, it issues this command to generate the
 * corresponding image ahead of time and store it in the cache.
 */
export const pregenerateImageExecutor: CommandExecutor = {
  command: 'pregenerateImage',
  /**
   * Executes the pregenerateImage command.
   * It checks if an image for the given prompt is already in the cache. If not,
   * it calls the image generation service and caches the result. This is a
   * non-blocking, "fire-and-forget" operation from the user's perspective.
   *
   * @param {GameCommand} command - The command object, expected to be of type 'pregenerateImage'.
   * @returns {Promise<void>} A promise that resolves when the pre-generation attempt is complete.
   */
  execute: async (command: GameCommand) => {
    if (command.type !== 'pregenerateImage') {
      return;
    }

    const prompt = command.payload.prompt;
    if (!prompt) return;

    // Avoid re-generating if the image is already in the cache
    const cachedImage = useImageCacheStore.getState().getFromCache(prompt);
    if (cachedImage) {
      console.log(`[Cache] Pregeneration skipped, image already cached for prompt: "${prompt}"`);
      return;
    }

    // Generate the image and add it to the cache for future use
    try {
      console.log(`[Pregen] Starting pre-generation for prompt: "${prompt}"`);
      const imageUrl = await generateImage(prompt);
      useImageCacheStore.getState().addToCache(prompt, imageUrl);
      console.log(`[Pregen] Successfully pre-generated and cached image for prompt: "${prompt}"`);
    } catch (error) {
      console.error(`[Pregen] Image pre-generation failed for prompt: "${prompt}"`, error);
      // This is a background task, so failure is not critical to the user's current flow.
      // A more robust system could implement a retry mechanism or flag the prompt as "failed".
    }
  },
};
