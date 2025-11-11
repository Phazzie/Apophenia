/**
 * Mock Engine Contexts for Testing
 * Provides pre-configured contexts for engine testing
 */

import {
  EngineContext,
  EngineOutput,
  FlowContext,
  AIContext,
  Choice,
  EngineEffects,
} from '../../src/core/types/seams';
import {
  mockWorldState,
  mockPlayerProfile,
  mockStorySegment,
  mockGenreConfig,
} from './mockStores';

// Mock Choice
export const mockChoice: Choice = {
  id: 'choice-1',
  text: 'Investigate the strange sound',
  consequence: 'You move closer to the source of the noise',
  psychologicalWeight: 0.7,
};

// Mock Engine Context
export function buildMockEngineContext(overrides?: Partial<EngineContext>): EngineContext {
  return {
    worldState: mockWorldState,
    recentHistory: [mockStorySegment],
    playerProfile: mockPlayerProfile,
    currentChoice: mockChoice,
    ...overrides,
  };
}

// Mock Engine Output
export function buildMockEngineOutput(overrides?: Partial<EngineOutput>): EngineOutput {
  return {
    engineName: 'TestEngine',
    instructions: ['Test instruction'],
    effects: {
      worldUpdates: {},
      corruptionChanges: 0,
    },
    metadata: {
      testData: true,
    },
    ...overrides,
  };
}

// Mock Flow Context
export function buildMockFlowContext(overrides?: Partial<FlowContext>): FlowContext {
  return {
    worldState: mockWorldState,
    recentHistory: [mockStorySegment],
    playerProfile: mockPlayerProfile,
    currentChoice: mockChoice,
    ...overrides,
  };
}

// Mock AI Context
export function buildMockAIContext(overrides?: Partial<AIContext>): AIContext {
  return {
    worldState: mockWorldState,
    recentHistory: [mockStorySegment],
    playerProfile: mockPlayerProfile,
    genrePrompts: ['Emphasize cosmic horror', 'Create unsettling atmosphere'],
    engineInstructions: ['Test engine instruction'],
    ...overrides,
  };
}

// Mock Engine Effects
export function buildMockEngineEffects(overrides?: Partial<EngineEffects>): EngineEffects {
  return {
    worldUpdates: {},
    historyRevisions: [],
    profileUpdates: {},
    corruptionChanges: 0,
    ...overrides,
  };
}

// Context Builder Helpers
export const ContextBuilder = {
  // Build context with high horror intensity
  withHighHorror(): EngineContext {
    return buildMockEngineContext({
      worldState: {
        ...mockWorldState,
        horrorIntensity: 8,
      },
    });
  },

  // Build context with low system health
  withLowHealth(): EngineContext {
    return buildMockEngineContext({
      worldState: {
        ...mockWorldState,
        systemHealth: 20,
      },
    });
  },

  // Build context with high corruption
  withHighCorruption(): EngineContext {
    return buildMockEngineContext({
      worldState: {
        ...mockWorldState,
        corruptionLevel: 80,
      },
    });
  },

  // Build context with extensive history
  withExtensiveHistory(): EngineContext {
    const segments = Array.from({ length: 10 }, (_, i) => ({
      ...mockStorySegment,
      id: `segment-${i}`,
      text: `Story segment ${i}`,
    }));

    return buildMockEngineContext({
      recentHistory: segments,
    });
  },

  // Build context with intrusive choice
  withIntrusiveChoice(): EngineContext {
    return buildMockEngineContext({
      currentChoice: {
        id: 'intrusive-1',
        text: 'Give in to the darkness',
        isIntrusive: true,
        psychologicalWeight: 1.0,
      },
    });
  },
};
