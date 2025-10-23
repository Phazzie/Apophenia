import React, { useEffect, useState } from 'react';
import { useGameStateStore } from './stores/gameStateStore';
import { useWorldStateStore } from './stores/worldStateStore';
import { useUserStore } from './stores/userStore';
import { GameState } from './types';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import EndScreen from './components/EndScreen';
import LoginScreen from './components/LoginScreen';
import CompactModelSelector from './components/CompactModelSelector';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { GameErrorBoundary } from './components/ErrorBoundary';
import { GameStateManager } from './services/gameStateManager';
import ThematicLoading from './components/ThematicLoading';
import { devMode } from './utils/devMode';

const App: React.FC = () => {
  const { gameState } = useGameStateStore();
  const { worldState } = useWorldStateStore();
  const { session, loading: userLoading } = useUserStore();
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Initialize game services on app start
  useEffect(() => {
    GameStateManager.initialize();
    
    // Initialize dev mode
    devMode.log('App', 'Apophenia initialized');
    
    return () => {
      GameStateManager.cleanup();
    };
  }, []);

  // Keyboard shortcut to toggle analytics (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAnalytics(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
        return <div>Unknown game state: {gameState}</div>;
    }
  };

  if (userLoading) {
    return (
      <div id="app-container" className="loading-container">
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

  // Analytics Dashboard overlay
  if (showAnalytics) {
    return (
      <GameErrorBoundary>
        <div id="app-container">
          <AnalyticsDashboard />
          <div style={{ 
            position: 'fixed', 
            bottom: '20px', 
            right: '20px',
            background: 'rgba(139, 92, 246, 0.9)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            fontFamily: 'Courier New, monospace',
            fontSize: '14px',
            zIndex: 1000
          }}>
            Press Ctrl+Shift+A to return to game
          </div>
        </div>
      </GameErrorBoundary>
    );
  }

  return (
    <GameErrorBoundary>
      <div id="app-container" style={worldState.uiDistortion}>
        {renderGameState()}
        <CompactModelSelector />
      </div>
    </GameErrorBoundary>
  );
};

export default App;
