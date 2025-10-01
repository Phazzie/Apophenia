import { GenreConfig } from '../types';

export const genres: GenreConfig[] = [
  {
    id: 'cosmic-horror',
    name: 'Cosmic Horror',
    description: 'Face terrifying entities beyond human comprehension.',
    style: 'Lovecraftian, atmospheric, psychological',
    theme: {
      '--background-color': '#0d1117',
      '--text-color': '#c9d1d9',
      '--accent-color': '#58a6ff',
      '--font-family': '"Courier New", Courier, monospace',
    },
    startScreenImagePrompt:
      'A lone lighthouse against a stormy, cosmic sky, with swirling nebulae instead of clouds.',
    conceptPrompt: 'Generate a cosmic horror story concept.',
    aiSystemInstruction:
      'You are a master of cosmic horror, weaving tales of dread and insignificance.',
  },
  {
    id: 'cyberpunk-noir',
    name: 'Cyberpunk Noir',
    description: 'Navigate a rain-slicked, neon-drenched city of corporate intrigue.',
    style: 'Gritty, futuristic, detective',
    theme: {
        '--background-color': '#1a1a1a',
        '--text-color': '#00ffde',
        '--accent-color': '#ff00ff',
        '--font-family': '"Orbitron", sans-serif',
    },
    startScreenImagePrompt:
        'A lone detective in a trench coat stands on a skyscraper balcony, overlooking a futuristic city with flying vehicles and holographic ads, digital rain falling.',
    conceptPrompt: 'Generate a cyberpunk noir detective story concept.',
    aiSystemInstruction:
        'You are a hard-boiled detective in a dystopian future. Your voice is cynical, sharp, and weary. Weave a tale of conspiracy and betrayal.',
  },
  {
    id: 'gothic-romance',
    name: 'Gothic Romance',
    description: 'Explore a decaying mansion full of dark secrets and forbidden love.',
    style: 'Melodramatic, mysterious, passionate',
    theme: {
        '--background-color': '#2b2b2b',
        '--text-color': '#e0e0e0',
        '--accent-color': '#c70039',
        '--font-family': '"Crimson Text", serif',
    },
    startScreenImagePrompt:
        'A pale woman in a flowing gown stands before a crumbling, ivy-covered manor under a full moon, a single lit window in the highest tower.',
    conceptPrompt: 'Generate a gothic romance story concept.',
    aiSystemInstruction:
        'You are a writer of gothic romance. Weave a story of passion, mystery, and sorrow, set in a remote, decaying estate with a dark history.',
  },
];

export const defaultGenre = genres[0];