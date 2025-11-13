/**
 * WORLD STATE STORE
 *
 * Manages the game world state: protagonist, setting, dilemma, psychological status,
 * horror metrics, and corruption levels.
 * Implements WorldStateStore interface from seams.ts.
 *
 * Features:
 * - Zustand store with localStorage persistence
 * - Synchronous actions only
 * - Bounded value updates (health, horror, corruption)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorldStateStore, WorldState, PsychologicalStatus, GenreConfig } from '../types/seams';

// Default genre config for initial state
const defaultGenreConfig: GenreConfig = {
  id: 'cosmic-horror',
  name: 'Cosmic Horror',
  description: 'Existential dread and incomprehensible entities',
  systemPrompt: '',
  themes: [],
  fearCategories: [],
  visualStyle: {
    primaryColor: '#1a0b2e',
    secondaryColor: '#4a1942',
    accentColor: '#b91372',
    fontFamily: 'monospace',
    atmosphere: 'oppressive',
  },
};

// Default initial world state
const initialWorldState: WorldState = {
  protagonist: '',
  setting: '',
  dilemma: '',
  psychologicalStatus: PsychologicalStatus.STABLE,
  systemHealth: 100,
  horrorIntensity: 0,
  corruptionLevel: 0,
  genreConfig: defaultGenreConfig,
  summary: undefined,
};

/**
 * World State Store
 *
 * Tracks all world-level state including protagonist details, environment,
 * psychological status, and corruption metrics.
 * Persists to localStorage for session continuity.
 */
export const useWorldStateStore = create<WorldStateStore>()(
  persist(
    (set, get) => ({
      // State
      worldState: initialWorldState,

      // Actions
      updateWorld: (partial: Partial<WorldState>) =>
        set((state) => ({
          worldState: {
            ...state.worldState,
            ...partial,
          },
        })),

      // Backwards compatibility alias for updateWorld
      updateWorldState: (partial: Partial<WorldState>) =>
        set((state) => ({
          worldState: {
            ...state.worldState,
            ...partial,
          },
        })),

      increaseHorror: (amount: number) =>
        set((state) => ({
          worldState: {
            ...state.worldState,
            horrorIntensity: Math.min(10, state.worldState.horrorIntensity + amount),
          },
        })),

      decreaseHealth: (amount: number) =>
        set((state) => ({
          worldState: {
            ...state.worldState,
            systemHealth: Math.max(0, state.worldState.systemHealth - amount),
          },
        })),

      setCorruption: (level: number) =>
        set((state) => ({
          worldState: {
            ...state.worldState,
            corruptionLevel: Math.min(100, Math.max(0, level)),
          },
        })),

      reset: () =>
        set({ worldState: initialWorldState }),
    }),
    {
      name: 'apophenia-world-state',
      version: 1,
    }
  )
);
