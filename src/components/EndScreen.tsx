import React from 'react';
import { useGameStateStore } from '../stores/gameStateStore';
import { useWorldStateStore } from '../stores/worldStateStore';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { GameStateManager } from '../services/gameStateManager';
import { GameState } from '../types';

const EndScreen: React.FC = () => {
  const { setGameState } = useGameStateStore();

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
