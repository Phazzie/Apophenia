import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cosmicHorrorGenre } from '../config/gameConfig';
import { GenreConfig, WorldState } from '../types';

interface WorldStateStore {
  worldState: WorldState;
  updateWorldState: (updates: Partial<WorldState>) => void;
  setWorldState: (worldState: WorldState) => void;
  setGenreConfig: (genreConfig: GenreConfig) => void;
  reset: () => void;
}

const initialState: WorldState = {
  protagonist: '',
  setting: '',
  dilemma: '',
  summary: '',
  psychologicalStatus: 'stable',
  systemHealth: 100,
  horrorIntensity: 0,
  corruptionLevel: 0,
  genreConfig: cosmicHorrorGenre, // Default genre
};

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
      name: 'cosmic-narrative-worldstate', // unique name for localStorage
    }
  )
);
