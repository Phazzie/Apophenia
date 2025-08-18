import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState } from '../types';

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
          gameState: GameState.PLAYING, // Setting choices implies we are in the PLAYING state
        }),
      reset: () => set(initialState),
    }),
    {
      name: 'cosmic-narrative-gamestate', // unique name for localStorage
    }
  )
);
