import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorldState } from '../types';

interface WorldStateStore {
  worldState: WorldState;
  updateWorldState: (updates: Partial<WorldState>) => void;
  setWorldState: (worldState: WorldState) => void;
  reset: () => void;
}

const initialState = {
  protagonist: '',
  setting: '',
  dilemma: '',
  summary: '',
  psychologicalStatus: 'Stable',
  systemHealth: 100,
  uiDistortion: {
    transform: 'none',
    filter: 'none',
    transition: 'all 1s ease-in-out',
  },
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
      reset: () => set({ worldState: initialState }),
    }),
    {
      name: 'cosmic-narrative-worldstate', // unique name for localStorage
    }
  )
);
