
import { GenreConfig } from '../types';

export const DEFAULT_GENRE: GenreConfig = {
  id: 'cosmic_horror',
  name: 'Cosmic Horror',
  description: 'A genre that emphasizes the horror of the unknown and incomprehensible.',
  style: 'cosmic-horror',
  theme: {
    '--background-color': '#020210',
    '--text-color': '#E0E0E0',
    '--accent-color': '#6F00FF',
    '--font-family': '"Courier New", Courier, monospace',
  },
  startScreenImagePrompt: 'A lone astronaut drifting in the void, a giant, malevolent cosmic entity lurking in the background.',
  conceptPrompt: 'Generate a cosmic horror story concept.',
  aiSystemInstruction: 'You are an AI that generates cosmic horror stories.',
};
