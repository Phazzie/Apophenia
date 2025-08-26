import { GenreConfig } from '../types';

export const cosmicHorrorGenre: GenreConfig = {
  id: 'cosmic-horror',
  name: 'Cosmic Horror',
  description: 'A story about the terrifying and unknowable entities that exist beyond human comprehension.',
  style: 'Lovecraftian, atmospheric, psychological',
  theme: {
    '--background-color': '#0d1117',
    '--text-color': '#c9d1d9',
    '--accent-color': '#58a6ff',
    '--font-family': '"Courier New", Courier, monospace',
  },
  startScreenImagePrompt: 'A lone lighthouse against a stormy, cosmic sky, with swirling nebulae instead of clouds.',
  conceptPrompt: 'Generate a cosmic horror story concept.',
  aiSystemInstruction: 'You are a master of cosmic horror, weaving tales of dread and insignificance.',
};
