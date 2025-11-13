/**
 * GENRE CONFIGURATIONS
 *
 * Defines available narrative genres with their visual styles,
 * themes, fear categories, and system prompts.
 *
 * Based on seams.ts GenreConfig interface.
 */

import { GenreConfig } from '../core/types/seams';

/**
 * Cosmic Horror Genre
 *
 * The default genre - a descent through someone's mind as it unravels.
 * Emphasizes existential dread, reality breakdown, and cosmic insignificance.
 */
export const COSMIC_HORROR_GENRE: GenreConfig = {
  id: 'cosmic-horror',
  name: 'Cosmic Horror',
  description: "A descent through someone's mind as it unravels. Reality fragments. Memories lie. The void watches.",

  systemPrompt: `You are the narrative engine for a cosmic horror psychological thriller.

CORE PREMISE:
The player is descending through layers of a fragmenting consciousness. Reality is not reliable.
The protagonist's memories, perceptions, and sense of self are progressively corrupting.

NARRATIVE RULES:
1. Start subtle - early segments feel almost normal with slight wrongness
2. Build dread through implication, not gore
3. Question reality - are events real or hallucinated?
4. Use cosmic scale - hint at incomprehensible forces beyond human understanding
5. Escalate corruption - each choice should subtly worsen the protagonist's mental state
6. Embrace ambiguity - leave players uncertain about what's really happening

TONE:
- Oppressive and claustrophobic
- Intellectually disturbing rather than shocking
- Dreamlike and surreal
- Increasingly fragmented and incoherent as story progresses

RESPONSE FORMAT:
Generate narrative segments with embedded commands. Use vivid, unsettling imagery.
Focus on psychological horror over physical threats.`,

  themes: [
    'madness',
    'cosmic insignificance',
    'reality breakdown',
    'unreliable narrator',
    'existential dread',
    'forbidden knowledge',
    'identity dissolution',
    'recursive nightmares',
  ],

  fearCategories: [
    'isolation',
    'madness',
    'cosmicInsignificance',
    'lossOfControl',
    'bodyHorror',
    'claustrophobia',
  ],

  visualStyle: {
    primaryColor: '#0a0e27',      // Deep void blue
    secondaryColor: '#2d1b4e',    // Dark purple
    accentColor: '#8b0000',       // Blood red
    fontFamily: 'Courier Prime, monospace',
    atmosphere: 'oppressive',
  },
};

/**
 * Psychological Thriller Genre
 *
 * More grounded than cosmic horror - focuses on paranoia,
 * conspiracy, and psychological manipulation.
 */
export const PSYCHOLOGICAL_THRILLER_GENRE: GenreConfig = {
  id: 'psychological-thriller',
  name: 'Psychological Thriller',
  description: 'Trust no one. Question everything. Someone is watching.',

  systemPrompt: `You are the narrative engine for a psychological thriller.

CORE PREMISE:
The player is trapped in a web of paranoia, conspiracy, and manipulation.
Nothing is as it seems. Trust is a weapon.

NARRATIVE RULES:
1. Build suspense through uncertainty and misdirection
2. Create paranoia - make the player question their allies
3. Use gaslighting - make the player doubt their own perceptions
4. Layer conspiracies - every answer reveals deeper questions
5. Maintain ambiguity - is the threat real or imagined?

TONE:
- Tense and paranoid
- Grounded in psychological realism
- Conspiracy-minded
- Claustrophobic

Focus on human threats and psychological manipulation over supernatural elements.`,

  themes: [
    'paranoia',
    'conspiracy',
    'manipulation',
    'betrayal',
    'surveillance',
    'gaslighting',
  ],

  fearCategories: [
    'lossOfControl',
    'isolation',
    'madness',
  ],

  visualStyle: {
    primaryColor: '#1a1a1a',
    secondaryColor: '#2a2a2a',
    accentColor: '#ff4444',
    fontFamily: 'Inter, sans-serif',
    atmosphere: 'dark',
  },
};

/**
 * All available genres
 */
export const GENRES: GenreConfig[] = [
  COSMIC_HORROR_GENRE,
  PSYCHOLOGICAL_THRILLER_GENRE,
];

/**
 * Get genre by ID
 */
export function getGenreById(id: string): GenreConfig | undefined {
  return GENRES.find(g => g.id === id);
}

/**
 * Get default genre
 */
export function getDefaultGenre(): GenreConfig {
  return COSMIC_HORROR_GENRE;
}

/**
 * Default export for backwards compatibility
 */
export const DEFAULT_GENRE = COSMIC_HORROR_GENRE;
export const genres = GENRES;
export const defaultGenre = COSMIC_HORROR_GENRE;
