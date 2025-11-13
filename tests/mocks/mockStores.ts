/**
 * Mock Zustand Stores for Testing
 * Provides isolated store instances that don't persist to localStorage
 */

import { create } from 'zustand';
import {
  GameState,
  PsychologicalStatus,
  Choice,
  StorySegment,
  WorldState,
  PlayerProfile,
  GenreConfig,
  VisualStyle,
  GameStateStore,
  WorldStateStore,
  HistoryStore,
  PlayerProfileStore,
} from '../../src/core/types/seams';

// Mock Genre Config
export const mockGenreConfig: GenreConfig = {
  id: 'cosmic-horror',
  name: 'Cosmic Horror',
  description: 'Incomprehensible terrors from beyond reality',
  systemPrompt: 'You are a cosmic horror narrator',
  themes: ['madness', 'unknown', 'insignificance'],
  fearCategories: ['cosmicInsignificance', 'madness', 'lossOfControl'],
  visualStyle: {
    primaryColor: '#0a0a1a',
    secondaryColor: '#1a1a3a',
    accentColor: '#8b0000',
    fontFamily: 'monospace',
    atmosphere: 'dark',
  } as VisualStyle,
};

// Mock World State
export const mockWorldState: WorldState = {
  protagonist: 'Test Protagonist',
  setting: 'Test Setting',
  dilemma: 'Test Dilemma',
  psychologicalStatus: PsychologicalStatus.STABLE,
  systemHealth: 100,
  horrorIntensity: 1,
  corruptionLevel: 0,
  genreConfig: mockGenreConfig,
  summary: 'Test Summary',
};

// Mock Player Profile
export const mockPlayerProfile: PlayerProfile = {
  fearProfile: {
    claustrophobia: 0.5,
    isolation: 0.3,
    bodyHorror: 0.2,
    cosmicInsignificance: 0.7,
    lossOfControl: 0.4,
    madness: 0.6,
  },
  choicePatterns: {
    riskTaking: 0.5,
    curiosity: 0.7,
    aggression: 0.3,
    avoidance: 0.4,
  },
  engagementMetrics: {
    totalChoices: 10,
    averageResponseTime: 5000,
    sessionDuration: 300000,
  },
};

// Mock Story Segment
export const mockStorySegment: StorySegment = {
  id: 'segment-1',
  text: 'You find yourself in a dark corridor.',
  timestamp: Date.now(),
  images: {
    main: 'https://example.com/image.jpg',
    mainStatus: 'loaded',
  },
};

// Mock Game State Store
export function createMockGameStateStore(initialState?: Partial<GameStateStore>) {
  return create<GameStateStore>()((set) => ({
    gameState: GameState.MENU,
    choices: [],
    intrusiveThought: undefined,
    isGenerating: false,
    setGameState: (gameState) => set({ gameState }),
    setChoices: (choices, intrusiveThought) => set({ choices, intrusiveThought }),
    setGenerating: (isGenerating) => set({ isGenerating }),
    reset: () =>
      set({
        gameState: GameState.MENU,
        choices: [],
        intrusiveThought: undefined,
        isGenerating: false,
      }),
    ...initialState,
  }));
}

// Mock World State Store
export function createMockWorldStateStore(initialState?: Partial<WorldStateStore>) {
  return create<WorldStateStore>()((set) => ({
    worldState: mockWorldState,
    updateWorld: (partial) =>
      set((state) => ({
        worldState: { ...state.worldState, ...partial },
      })),
    // Backwards compatibility alias for updateWorld
    updateWorldState: (partial) =>
      set((state) => ({
        worldState: { ...state.worldState, ...partial },
      })),
    increaseHorror: (amount) =>
      set((state) => ({
        worldState: {
          ...state.worldState,
          horrorIntensity: Math.min(10, state.worldState.horrorIntensity + amount),
        },
      })),
    decreaseHealth: (amount) =>
      set((state) => ({
        worldState: {
          ...state.worldState,
          systemHealth: Math.max(0, state.worldState.systemHealth - amount),
        },
      })),
    setCorruption: (level) =>
      set((state) => ({
        worldState: { ...state.worldState, corruptionLevel: level },
      })),
    reset: () => set({ worldState: mockWorldState }),
    ...initialState,
  }));
}

// Mock History Store
export function createMockHistoryStore(initialState?: Partial<HistoryStore>) {
  return create<HistoryStore>()((set, get) => ({
    segments: [],
    addSegment: (segment) =>
      set((state) => ({
        segments: [...state.segments, segment],
      })),
    updateSegment: (id, updates) =>
      set((state) => ({
        segments: state.segments.map((seg) => (seg.id === id ? { ...seg, ...updates } : seg)),
      })),
    reviseSegment: (id, newText) =>
      set((state) => ({
        segments: state.segments.map((seg) =>
          seg.id === id
            ? {
                ...seg,
                text: newText,
                isRevised: true,
                originalText: seg.originalText || seg.text,
              }
            : seg
        ),
      })),
    getRecent: (count) => get().segments.slice(-count),
    reset: () => set({ segments: [] }),
    ...initialState,
  }));
}

// Mock Player Profile Store
export function createMockPlayerProfileStore(initialState?: Partial<PlayerProfileStore>) {
  return create<PlayerProfileStore>()((set, get) => ({
    profile: mockPlayerProfile,
    updateFearProfile: (fear, intensity) =>
      set((state) => ({
        profile: {
          ...state.profile,
          fearProfile: {
            ...state.profile.fearProfile,
            [fear]: intensity,
          },
        },
      })),
    recordChoice: (choice, responseTime) =>
      set((state) => ({
        profile: {
          ...state.profile,
          engagementMetrics: {
            ...state.profile.engagementMetrics,
            totalChoices: state.profile.engagementMetrics.totalChoices + 1,
            averageResponseTime:
              (state.profile.engagementMetrics.averageResponseTime *
                state.profile.engagementMetrics.totalChoices +
                responseTime) /
              (state.profile.engagementMetrics.totalChoices + 1),
          },
        },
      })),
    analyzePatterns: () => get().profile.choicePatterns,
    reset: () => set({ profile: mockPlayerProfile }),
    ...initialState,
  }));
}
