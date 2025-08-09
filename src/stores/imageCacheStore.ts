import { create } from 'zustand';

interface ImageCacheStore {
  imageCache: Record<string, string>;
  addToCache: (prompt: string, url: string) => void;
}

export const useImageCacheStore = create<ImageCacheStore>((set) => ({
  imageCache: {},
  addToCache: (prompt, url) =>
    set((state) => ({
      imageCache: { ...state.imageCache, [prompt]: url },
    })),
}));
