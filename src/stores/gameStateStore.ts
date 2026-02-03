// #TODO DEPRECATED: Use src/core/state/gameStateStore.ts instead. See #TODO.md
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Choice, GameState } from '../types';

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
    (set) => ({
      ...initialState,
      setGameState: (gameState) => set({ gameState }),
      setChoices: (choices, intrusiveThought) => {
        const allChoices = [...choices];
        if (intrusiveThought) {
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
