import React from 'react';
import { useGameStateStore } from '../stores/gameStateStore';
import { useWorldStateStore } from '../stores/worldStateStore';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { GameState } from '../types';

const EndScreen: React.FC = () => {
  const resetGameState = useGameStateStore((state) => state.reset);
  const resetWorldState = useWorldStateStore((state) => state.reset);
  const resetStoryHistory = useStoryHistoryStore((state) => state.reset);

  const handleRestart = () => {
    // Reset all stores to their initial state
    resetGameState();
    resetWorldState();
    resetStoryHistory();
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
