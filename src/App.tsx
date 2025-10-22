import React, { useEffect } from 'react';
import { useGameStateStore } from './stores/gameStateStore';
import { useWorldStateStore } from './stores/worldStateStore';
import { useUserStore } from './stores/userStore';
import { GameState } from './types';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import EndScreen from './components/EndScreen';
import LoginScreen from './components/LoginScreen';
import CompactModelSelector from './components/CompactModelSelector';
import { GameErrorBoundary } from './components/ErrorBoundary';
import { GameStateManager } from './services/gameStateManager';
import ThematicLoading from './components/ThematicLoading';

const App: React.FC = () => {
  const { gameState } = useGameStateStore();
  const { worldState } = useWorldStateStore();
  const { session, loading: userLoading } = useUserStore();

  // Initialize game services on app start
  useEffect(() => {
    GameStateManager.initialize();
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
        return (
          <div role="alert" aria-live="assertive">
            Unknown game state: {gameState}
          </div>
        );
    }
  };

  if (userLoading) {
    return (
      <div id="app-container" className="loading-container" role="status" aria-live="polite">
        <ThematicLoading />
        <p>Connecting to the void...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <GameErrorBoundary>
        <div id="app-container">
          <LoginScreen />
        </div>
      </GameErrorBoundary>
    );
  }

  return (
    <GameErrorBoundary>
      <div id="app-container" style={worldState.uiDistortion}>
        <main id="main-content" role="main">
          {renderGameState()}
        </main>
        <aside aria-label="AI Model Selector">
          <CompactModelSelector />
        </aside>
      </div>
    </GameErrorBoundary>
  );
};

export default App;
