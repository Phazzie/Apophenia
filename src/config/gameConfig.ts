import { GenreConfig } from '../types';

export const cosmicHorrorGenre: GenreConfig = {
  id: 'cosmic-horror',
  name: 'Cosmic Horror',
  description: 'A story about the terrifying and unknowable entities that exist beyond human comprehension.',
  systemPrompt: 'You are a master of cosmic horror, weaving tales of dread and insignificance in the Lovecraftian tradition.',
  themes: ['cosmic', 'lovecraftian', 'existential', 'atmospheric', 'psychological'],
  fearCategories: ['cosmic', 'existential', 'madness', 'unknowable', 'insignificance'],
  visualStyle: {
    primaryColor: '#0d1117',
    secondaryColor: '#c9d1d9',
    accentColor: '#58a6ff',
    fontFamily: '"Courier New", Courier, monospace',
    atmosphere: 'oppressive',
  },
};
