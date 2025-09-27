/**
 * @file worldStateStore.ts
 * @description Zustand store for managing the "world state" of the narrative.
 * This store contains all the contextual information about the ongoing story,
 * including the protagonist, setting, key plot points, and dynamic variables
 * that change as the story progresses.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cosmicHorrorGenre } from '../config/gameConfig';
import { GenreConfig, WorldState } from '../types';

/**
 * @interface WorldStateStore
 * @description Defines the structure of the world state store, including its state and actions.
 */
interface WorldStateStore {
  /** The central object containing all world state data. */
  worldState: WorldState;
  /** Merges partial updates into the existing world state. */
  updateWorldState: (updates: Partial<WorldState>) => void;
  /** Completely replaces the world state with a new one. */
  setWorldState: (worldState: WorldState) => void;
  /** Specifically sets the genre configuration within the world state. */
  setGenreConfig: (genreConfig: GenreConfig) => void;
  /** Resets the world state to its initial default value. */
  reset: () => void;
}

/**
 * @constant {WorldState} initialState
 * @description The default initial state for the world state store,
 * configured for a new game with the default cosmic horror genre.
 */
const initialState: WorldState = {
  protagonist: '',
  setting: '',
  dilemma: '',
  summary: '',
  psychologicalStatus: 'Stable' as const,
  systemHealth: 100,
  horrorIntensity: 0,
  uiDistortion: {
    transform: 'none',
    filter: 'none',
    transition: 'all 1s ease-in-out',
  },
  genreConfig: cosmicHorrorGenre, // Default genre
};

/**
 * @hook useWorldStateStore
 * @description A Zustand hook for accessing the world state store.
 * The entire world state is persisted to local storage, which is crucial for
 * saving and continuing a game session.
 */
export const useWorldStateStore = create<WorldStateStore>()(
  persist(
    (set) => ({
      worldState: initialState,
      setWorldState: (worldState) => set({ worldState }),
      updateWorldState: (updates) =>
        set((state) => ({
          worldState: { ...state.worldState, ...updates },
        })),
      setGenreConfig: (genreConfig) =>
        set((state) => ({
          worldState: { ...state.worldState, genreConfig },
        })),
      reset: () => set({ worldState: initialState }),
    }),
    {
      name: 'cosmic-narrative-worldstate', // unique name for localStorage key
    }
  )
);
