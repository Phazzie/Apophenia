import { create } from 'zustand';
import { GameState } from '../types';

interface GameStateStore {
  gameState: GameState;
  choices: Choice[];
  intrusiveThought?: Choice;
  setGameState: (gameState: GameState) => void;
  setChoices: (choices: Choice[], intrusiveThought?: Choice) => void;
}

export const useGameStateStore = create<GameStateStore>((set) => ({
  gameState: GameState.MENU,
  choices: [],
  intrusiveThought: undefined,
  setGameState: (gameState) => set({ gameState }),
  setChoices: (choices, intrusiveThought) =>
    set({
      choices,
      intrusiveThought,
      gameState: GameState.PLAYING, // Setting choices implies we are in the PLAYING state
    }),
}));
