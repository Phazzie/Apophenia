import { create } from 'zustand';
import { WorldState } from '../types';

interface WorldStateStore {
  worldState: WorldState;
  updateWorldState: (updates: Partial<WorldState>) => void;
  setWorldState: (worldState: WorldState) => void;
}

export const useWorldStateStore = create<WorldStateStore>((set) => ({
  worldState: {
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
  },
  setWorldState: (worldState) => set({ worldState }),
  updateWorldState: (updates) =>
    set((state) => ({
      worldState: { ...state.worldState, ...updates },
    })),
}));
