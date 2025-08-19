import React from 'react';
import { useGameStateStore } from '../stores/gameStateStore';
import { GameState } from '../types';

const EndScreen: React.FC = () => {
  const setGameState = useGameStateStore((state) => state.setGameState);

  const handleRestart = () => {
    // Here you would also clear all the other stores (worldState, storyHistory, etc.)
    // For simplicity, we'll just reset the game state.
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
