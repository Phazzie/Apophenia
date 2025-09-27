/**
 * @file EndScreen.tsx
 * @description This component renders the game's end screen, displayed when a narrative concludes.
 * It provides the player with an option to restart the game.
 */

import React from 'react';
import { useGameStateStore } from '../stores/gameStateStore';
import { GameStateManager } from '../services/gameStateManager';
import { GameState } from '../types';

/**
 * The EndScreen component is displayed when the game reaches a conclusion.
 * It shows a final message and a "Play Again" button that resets the game state,
 * allowing the user to start a new narrative from the main menu.
 *
 * @returns {React.ReactElement} A React component representing the game's end screen.
 */
const EndScreen: React.FC = () => {
  const { setGameState } = useGameStateStore();

  /**
   * Handles the restart functionality.
   * It resets all game-related state stores to their initial values and
   * navigates the player back to the main menu.
   */
  const handleRestart = () => {
    // Reset all stores to their initial state using unified reset
    GameStateManager.resetAllStores();
    
    // Return to menu
    setGameState(GameState.MENU);
  };

  return (
    <div className="end-screen">
      <h1>The End</h1>
      <p>Your journey has concluded.</p>
      <button onClick={handleRestart}>Play Again</button>
    </div>
  );
};

export default EndScreen;
