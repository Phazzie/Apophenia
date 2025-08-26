import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, Choice } from '../types';

interface GameStateStore {
  gameState: GameState;
  choices: Choice[];
  intrusiveThought?: Choice;
  setGameState: (gameState: GameState) => void;
  setChoices: (choices: Choice[], intrusiveThought?: Choice) => void;
  reset: () => void;
}

const initialState = {
  gameState: GameState.MENU,
  choices: [],
  intrusiveThought: undefined,
};

export const useGameStateStore = create<GameStateStore>()(
  persist(
    (set) => ({
      ...initialState,
      setGameState: (gameState) => set({ gameState }),
      setChoices: (choices, intrusiveThought) =>
        set({
          choices,
          intrusiveThought,
        }),
      reset: () => set(initialState),
    }),
    {
      name: 'cosmic-narrative-gamestate', // unique name for localStorage
    }
  )
);
