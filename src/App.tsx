import React from 'react';
import { useGameStateStore } from './stores/gameStateStore';
import { useWorldStateStore } from './stores/worldStateStore';
import { GameState } from './types';
// Mock components for now
const StartScreen = () => <div>Start Screen</div>;
const GameScreen = () => <div>Game Screen</div>;
const EndScreen = () => <div>End Screen</div>;

const App: React.FC = () => {
  const { gameState } = useGameStateStore();
  const { worldState } = useWorldStateStore();

  const renderGameState = () => {
    switch (gameState) {
      case GameState.MENU:
        return <StartScreen />;
      case GameState.GENERATING_CONCEPT:
      case GameState.LOADING:
      case GameState.PLAYING:
        return <GameScreen />;
      case GameState.ENDED:
        return <EndScreen />;
      default:
        return <div>Unknown game state</div>;
    }
  };

  return (
    <div id="app-container" style={worldState.uiDistortion}>
      {renderGameState()}
    </div>
  );
};

export default App;
