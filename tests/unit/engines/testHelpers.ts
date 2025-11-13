/**
 * TEST HELPERS FOR ENGINES
 *
 * Utilities for creating mock contexts and testing engines
 */

import type { EngineContext, WorldState, PlayerProfile, StorySegment, GenreConfig, PsychologicalStatus } from '../../../src/core/types/seams';

/**
 * Create a mock genre config
 */
export function createMockGenreConfig(): GenreConfig {
  return {
    id: 'cosmic-horror',
    name: 'Cosmic Horror',
    description: 'Lovecraftian dread and cosmic insignificance',
    systemPrompt: 'You are a cosmic horror narrator',
    themes: ['cosmic dread', 'madness', 'unknowable'],
    fearCategories: ['cosmicInsignificance', 'madness'],
    visualStyle: {
      primaryColor: '#1a0033',
      secondaryColor: '#330066',
      accentColor: '#6600cc',
      fontFamily: 'monospace',
      atmosphere: 'dark'
    }
  };
}

/**
 * Create a mock world state
 */
export function createMockWorldState(overrides?: Partial<WorldState>): WorldState {
  return {
    protagonist: 'Test Protagonist',
    setting: 'A dark room',
    dilemma: 'Escape the darkness',
    psychologicalStatus: 'stable' as PsychologicalStatus,
    systemHealth: 100,
    horrorIntensity: 0,
    corruptionLevel: 0,
    genreConfig: createMockGenreConfig(),
    summary: 'The story begins',
    ...overrides
  };
}

/**
 * Create a mock player profile
 */
export function createMockPlayerProfile(overrides?: Partial<PlayerProfile>): PlayerProfile {
  return {
    fearProfile: {
      claustrophobia: 0,
      isolation: 0,
      bodyHorror: 0,
      cosmicInsignificance: 0,
      lossOfControl: 0,
      madness: 0
    },
    choicePatterns: {
      riskTaking: 0.5,
      curiosity: 0.5,
      aggression: 0.5,
      avoidance: 0.5
    },
    engagementMetrics: {
      totalChoices: 0,
      averageResponseTime: 1000,
      sessionDuration: 0
    },
    ...overrides
  };
}

/**
 * Create a mock story segment
 */
export function createMockStorySegment(id: string, text: string, overrides?: Partial<StorySegment>): StorySegment {
  return {
    id,
    text,
    timestamp: Date.now(),
    ...overrides
  };
}

/**
 * Create a mock engine context
 */
export function createMockEngineContext(overrides?: Partial<EngineContext>): EngineContext {
  return {
    worldState: createMockWorldState(),
    recentHistory: [],
    playerProfile: createMockPlayerProfile(),
    ...overrides
  };
}

/**
 * Create a high-horror context for testing extreme conditions
 */
export function createHighHorrorContext(): EngineContext {
  return createMockEngineContext({
    worldState: createMockWorldState({
      horrorIntensity: 9,
      corruptionLevel: 80,
      systemHealth: 20,
      psychologicalStatus: 'shattered' as PsychologicalStatus
    }),
    playerProfile: createMockPlayerProfile({
      engagementMetrics: {
        totalChoices: 20,
        averageResponseTime: 1500,
        sessionDuration: 60000
      },
      fearProfile: {
        claustrophobia: 0.8,
        isolation: 0.7,
        bodyHorror: 0.6,
        cosmicInsignificance: 0.9,
        lossOfControl: 0.8,
        madness: 0.9
      }
    }),
    recentHistory: [
      createMockStorySegment('1', 'The room is closing in.'),
      createMockStorySegment('2', 'You cannot escape.'),
      createMockStorySegment('3', 'Reality is breaking down.')
    ]
  });
}

/**
 * Create a low-horror context for testing early game
 */
export function createLowHorrorContext(): EngineContext {
  return createMockEngineContext({
    worldState: createMockWorldState({
      horrorIntensity: 2,
      corruptionLevel: 5,
      systemHealth: 95,
      psychologicalStatus: 'stable' as PsychologicalStatus
    }),
    playerProfile: createMockPlayerProfile({
      engagementMetrics: {
        totalChoices: 2,
        averageResponseTime: 2000,
        sessionDuration: 5000
      }
    }),
    recentHistory: [
      createMockStorySegment('1', 'You enter a strange place.')
    ]
  });
}
