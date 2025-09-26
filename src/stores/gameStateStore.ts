import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Choice, GameState } from '../types';
import { useWorldStateStore } from './worldStateStore';

interface GameStateStore {
  gameState: GameState;
  choices: Choice[];
  intrusiveThought?: Choice;
  isGenerating: boolean;
  setGameState: (gameState: GameState) => void;
  setChoices: (choices: Choice[], intrusiveThought?: Choice) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  reset: () => void;
}

const initialState = {
  gameState: GameState.MENU,
  choices: [],
  intrusiveThought: undefined,
  isGenerating: false,
};

export const useGameStateStore = create<GameStateStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setGameState: (gameState) => set({ gameState }),
      setChoices: (choices, intrusiveThought) => {
        const { horrorIntensity } = useWorldStateStore.getState().worldState;
        const allChoices = [...choices];
        if (intrusiveThought && horrorIntensity >= (intrusiveThought.requiredIntensity || 0)) {
          allChoices.push(intrusiveThought);
        }
        set({
          choices: allChoices,
          intrusiveThought, // Keep it separate for potential special UI handling
        });
      },
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      reset: () => {
        set(initialState);
        // Clear persisted state by resetting localStorage
        localStorage.removeItem('cosmic-narrative-gamestate');
      },
    }),
    {
      name: 'cosmic-narrative-gamestate', // unique name for localStorage
    }
  )
);
