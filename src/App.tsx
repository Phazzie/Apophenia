/**
 * @file App.tsx
 * @description The root component of the Apophenia application.
 * It acts as a controller that renders the appropriate screen (Start, Game, End)
 * based on the current `gameState` from the `useGameStateStore`. It also initializes
 * and cleans up global services.
 */

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

/**
 * The main application component.
 * It subscribes to the game state and renders the correct screen.
 * It also wraps the entire application in an error boundary to handle unexpected errors gracefully.
 * The UI distortion effects from the Reality Corruption Engine are applied at this top level.
 *
 * @returns {React.ReactElement} The root JSX element of the application.
 */
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

  /**
   * A helper function to render the correct game screen component based on the current game state.
   * This acts as a simple router for the application's main views.
   * @returns {React.ReactElement} The component for the current game state.
   */
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
