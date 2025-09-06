import { CommandExecutor } from './command.types';
import { useImageCacheStore } from '../stores/imageCacheStore';
import { generateImage } from '../services/gameService';
import { Command } from '../types';

export const pregenerateImageExecutor: CommandExecutor = {
  command: 'pregenerateImage',
  execute: async (command: Command) => {
    if (command.type !== 'pregenerateImage') {
      return;
    }

    const prompt = command.payload.prompt;
    if (!prompt) return;

    // Check if the image is already cached
    const cachedImage = useImageCacheStore.getState().getFromCache(prompt);
    if (cachedImage) return;

    // Generate the image and add it to the cache
    try {
      const imageUrl = await generateImage(prompt);
      useImageCacheStore.getState().addToCache(prompt, imageUrl);
    } catch (error) {
      console.error('Image pregeneration failed:', error);
      // We don't do much here, as this is a background task.
      // A more robust system might add a retry mechanism.
    }
  },
};
