import { create } from 'zustand';
import { GameState } from '../types';

interface GameStateStore {
  gameState: GameState;
  setGameState: (gameState: GameState) => void;
}

export const useGameStateStore = create<GameStateStore>((set) => ({
  gameState: GameState.MENU,
  setGameState: (gameState) => set({ gameState }),
}));
