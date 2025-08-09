import { CommandExecutor } from './command.types';
import { useImageCacheStore } from '../stores/imageCacheStore';
import { generateImage } from '../services/gameService';

export const pregenerateImageExecutor: CommandExecutor = {
  command: 'pregenerateImage',
  execute: async (command) => {
    const prompt = command.payload.prompt;
    if (!prompt) return;

    // Check if the image is already cached
    const cachedImage = useImageCacheStore.getState().imageCache[prompt];
    if (cachedImage) return;

    // Generate the image and add it to the cache
    generateImage(prompt).then(imageUrl => {
      useImageCacheStore.getState().addToCache(prompt, imageUrl);
    });
  },
};
