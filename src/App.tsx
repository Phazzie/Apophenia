/**
 * APP COMPONENT - Main Application Entry Point
 *
 * Implements the seams-based architecture state machine:
 * MENU → GENERATING → DESCENDING → UNRAVELING → COLLAPSED
 *
 * Responsibilities:
 * - Render correct screen based on game state
 * - Wire UI components to seams-based stores
 * - Handle game initialization and choice processing via gameService
 * - Apply corruption effects via ThemeProvider
 */

import React, { useEffect, useCallback } from 'react';
import { ThemeProvider } from './ui/theme/ThemeProvider';
import { StartScreen, DescentScreen, UnravelingScreen } from './ui';
import { LoadingIndicator } from './ui/components/LoadingIndicator';
import {
  useGameStateStore,
  useWorldStateStore,
  useHistoryStore,
} from './core/state';
// #TODO APP_STATE: Mismatch - App uses string GameState from seams.ts, but store provides numeric GameState
import { GameState, GenreConfig, AIProvider, Choice } from './core/types/seams';
import {
  initializeGame,
  startGameGeneration,
  processPlayerChoice,
  saveGame,
  resetGame,
} from './services/gameService';
import { GENRES } from './config/genres';
import { getConfig } from './config/defaults';

/**
 * Get available AI providers based on config
 */
function getAvailableProviders(): AIProvider[] {
  const config = getConfig();
  const hasGrokKey = !!import.meta.env.VITE_XAI_API_KEY;

  const providers: AIProvider[] = [];

  // Always include mock for testing
  providers.push(AIProvider.MOCK);

  // Add Grok if API key is present
  if (hasGrokKey) {
    providers.unshift(AIProvider.GROK); // Put at front as preferred
  }

  return providers;
}

/**
 * Main App Component
 */
export function App() {
  // #TODO AUTH: Add optional auth check here using VITE_ENABLE_AUTH
  // See #TODO.md for reliability plan.

  // Subscribe to stores
  const gameState = useGameStateStore(s => s.gameState);
  const choices = useGameStateStore(s => s.choices);
  const intrusiveThought = useGameStateStore(s => s.intrusiveThought);
  const isGenerating = useGameStateStore(s => s.isGenerating);

  const worldState = useWorldStateStore(s => s.worldState);

  // Get current segment (latest) using store method instead of array index
  const currentSegment = useHistoryStore(s => {
    const recent = s.getRecent(1);
    return recent.length > 0 ? recent[0] : undefined;
  });

  /**
   * Handle start game from menu
   */
  const handleStartGame = useCallback(async (
    genre: GenreConfig,
    provider: AIProvider
  ) => {
    console.log('🎮 Starting game...', { genre: genre.id, provider });

    try {
      // Initialize game
      await initializeGame(genre, provider);

      // Start generation
      await startGameGeneration();
    } catch (error) {
      console.error('❌ Failed to start game:', error);
      // Return to menu on error
      await resetGame();
    }
  }, []);

  /**
   * Handle player choice
   */
  const handleChoice = useCallback(async (choice: Choice) => {
    console.log('🎯 Player chose:', choice.text);
    await processPlayerChoice(choice);
  }, []);

  /**
   * Handle save
   */
  const handleSave = useCallback(() => {
    saveGame();
  }, []);

  /**
   * Handle reset
   */
  const handleReset = useCallback(async () => {
    if (confirm('Reset game and return to menu?')) {
      await resetGame();
    }
  }, []);

  /**
   * Auto-save on state changes
   */
  useEffect(() => {
    // Debounced auto-save
    const timer = setTimeout(() => {
      if (gameState !== GameState.MENU) {
        saveGame();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameState, worldState, currentSegment]);

  /**
   * Render appropriate screen based on game state
   */
  const renderScreen = () => {
    switch (gameState) {
      case GameState.MENU:
        return (
          <StartScreen
            onStartGame={handleStartGame}
            availableGenres={GENRES}
            availableProviders={getAvailableProviders()}
          />
        );

      case GameState.GENERATING:
        return (
          <div className="generating-screen screen-container">
            <LoadingIndicator />
            <p style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.8 }}>
              Generating your nightmare...
            </p>
          </div>
        );

      case GameState.DESCENDING:
        // Need current segment to render
        if (!currentSegment) {
          return (
            <div className="loading-screen screen-container">
              <LoadingIndicator />
              <p style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.8 }}>
                Loading descent...
              </p>
            </div>
          );
        }

        return (
          <DescentScreen
            worldState={worldState}
            currentSegment={currentSegment}
            choices={choices}
            intrusiveThought={intrusiveThought}
            isGenerating={isGenerating}
            onChoice={handleChoice}
            onSave={handleSave}
            onReset={handleReset}
          />
        );

      case GameState.UNRAVELING:
        // Need current segment to render
        if (!currentSegment) {
          return (
            <div className="loading-screen screen-container">
              <LoadingIndicator />
              <p style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.8 }}>
                Reality unraveling...
              </p>
            </div>
          );
        }

        return (
          <UnravelingScreen
            worldState={worldState}
            finalSegment={currentSegment}
            onRestart={handleReset}
          />
        );

      case GameState.COLLAPSED:
        return (
          <div className="collapsed-screen screen-container">
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
              gap: '2rem',
              textAlign: 'center',
            }}>
              <h1 style={{
                fontSize: '4rem',
                opacity: 0.2,
                fontFamily: 'Courier Prime, monospace',
              }}>
                VOID
              </h1>
              <p style={{ opacity: 0.6 }}>
                The narrative has collapsed.
              </p>
              <button
                onClick={handleReset}
                style={{
                  padding: '1rem 2rem',
                  background: 'rgba(139, 0, 0, 0.3)',
                  border: '1px solid #8b0000',
                  color: '#fff',
                  cursor: 'pointer',
                  fontFamily: 'Courier Prime, monospace',
                }}
              >
                Begin Again
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="error-screen screen-container">
            <p>Unknown game state: {gameState}</p>
            <button onClick={handleReset}>Reset</button>
          </div>
        );
    }
  };

  return (
    <ThemeProvider initialCorruption={worldState.corruptionLevel}>
      <div id="app-container">
        {renderScreen()}
      </div>
    </ThemeProvider>
  );
}

export default App;
