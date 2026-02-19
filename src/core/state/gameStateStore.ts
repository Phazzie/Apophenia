// #TODO MAINTAIN: This is the Source of Truth for state. Do not modify without updating Seams contracts.
/**
 * GAME STATE STORE
 *
 * Manages core game state: current phase, choices, intrusive thoughts, and generation status.
 * Implements GameStateStore interface from seams.ts.
 *
 * Features:
 * - Zustand store with localStorage persistence
 * - Synchronous actions only
 * - Atomic state updates
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameStateStore, GameState, Choice } from '../types/seams';

// Default initial state
const initialState = {
  gameState: GameState.MENU,
  choices: [] as Choice[],
  intrusiveThought: undefined as Choice | undefined,
  isGenerating: false,
};

/**
 * Game State Store
 *
 * Tracks the current game phase, available choices, and generation status.
 * Persists to localStorage for session continuity.
 */
export const useGameStateStore = create<GameStateStore>()(
  persist(
    (set) => ({
      // State
      ...initialState,

      // Actions
      setGameState: (state: GameState) =>
        set({ gameState: state }),

      setChoices: (choices: Choice[], intrusive?: Choice) =>
        set({
          choices,
          intrusiveThought: intrusive
        }),

      setGenerating: (generating: boolean) =>
        set({ isGenerating: generating }),

      reset: () =>
        set(initialState),
    }),
    {
      name: 'apophenia-game-state',
      version: 1,
      // Only persist game state, not choices (they're transient)
      partialize: (state) => ({
        gameState: state.gameState,
      }),
    }
  )
);
