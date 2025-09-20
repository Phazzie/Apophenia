import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cosmicHorrorGenre } from '@/lib/config/gameConfig';
import { GenreConfig, WorldState } from '@/lib/types';

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
  psychologicalStatus: 'Stable' as const,
  systemHealth: 100,
  uiDistortion: {
    transform: 'none',
    filter: 'none',
    transition: 'all 1s ease-in-out',
  },
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
