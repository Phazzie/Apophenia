import React, { useEffect } from 'react';
import { useGameStateStore } from './stores/gameStateStore';
import { useWorldStateStore } from './stores/worldStateStore';
import { GameState } from './types';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import EndScreen from './components/EndScreen';
import CompactModelSelector from './components/CompactModelSelector';
import CompactTestAPI from './components/CompactTestAPI';
import { GameErrorBoundary } from './components/ErrorBoundary';
import { GameStateManager } from './services/gameStateManager';

const App: React.FC = () => {
  const { gameState } = useGameStateStore();
  const { worldState } = useWorldStateStore();

  // Initialize game services on app start
  useEffect(() => {
    GameStateManager.initialize();
    
    // Cleanup on unmount
    return () => {
      GameStateManager.cleanup();
    };
  }, []);

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
    <GameErrorBoundary>
      <div id="app-container" style={worldState.uiDistortion}>
        {renderGameState()}
        <CompactModelSelector />
        <CompactTestAPI />
      </div>
    </GameErrorBoundary>
  );
};

export default App;
