/**
 * @file gameStateStore.ts
 * @description Zustand store for managing the core state of the game application itself.
 * This includes the current view (menu, playing, etc.), the choices available to the player,
 * and whether the AI is currently processing a request.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Choice, GameState } from '../types';

/**
 * @interface GameStateStore
 * @description Defines the structure of the game state store. This store manages the
 * overall state of the game application, such as whether the player is in the menu,
 * playing, or in a loading state. It also holds the current set of choices available to the player.
 */
interface GameStateStore {
  /** The current high-level state of the game (e.g., MENU, PLAYING). */
  gameState: GameState;
  /** An array of standard choices available to the player. */
  choices: Choice[];
  /** An optional intrusive thought, which is a special type of choice. */
  intrusiveThought?: Choice;
  /** A boolean flag indicating if the AI is currently generating the next story segment. */
  isGenerating: boolean;
  /** Action to set the current game state. */
  setGameState: (gameState: GameState) => void;
  /** Action to update the available choices for the player. */
  setChoices: (choices: Choice[], intrusiveThought?: Choice) => void;
  /** Action to set the AI generation status. */
  setIsGenerating: (isGenerating: boolean) => void;
  /** Action to reset the store to its initial state. */
  reset: () => void;
}

/**
 * @constant {object} initialState
 * @description The default initial state for the game state store.
 */
const initialState = {
  gameState: GameState.MENU,
  choices: [],
  intrusiveThought: undefined,
  isGenerating: false,
};

/**
 * @hook useGameStateStore
 * @description A Zustand hook for accessing the game state store.
 * This store is persisted to local storage, allowing the game's high-level state
 * to be saved and restored between sessions.
 */
export const useGameStateStore = create<GameStateStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setGameState: (gameState) => set({ gameState }),
      setChoices: (choices, intrusiveThought) => {
        // This action updates the state with the choices provided by the AI.
        // It keeps standard choices separate from the intrusive thought for special UI handling.
        set({
          choices,
          intrusiveThought,
        });
      },
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      reset: () => {
        set(initialState);
        // Explicitly remove the item from localStorage on reset to ensure a clean state.
        localStorage.removeItem('cosmic-narrative-gamestate');
      },
    }),
    {
      name: 'cosmic-narrative-gamestate', // unique name for localStorage key
    }
  )
);
