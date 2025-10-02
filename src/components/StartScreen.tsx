import React, { useEffect, useState } from 'react';
import { generateConcept } from '../services/gameService';
import { GameStateManager } from '../services/gameStateManager';
import { useGameStateStore } from '../stores/gameStateStore';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { useWorldStateStore } from '../stores/worldStateStore';
import { useAIModelStore } from '../stores/aiModelStore';
import { GameState, GenreConfig, StorySegment, WorldState } from '../types';
import { genres, defaultGenre } from '../config/genres';
import GlitchedText from './GlitchedText';
import CompactTestAPI from './CompactTestAPI';


const StartScreen: React.FC = () => {
  const { setGameState } = useGameStateStore();
  const { worldState, setGenreConfig } = useWorldStateStore();
  const { storyHistory } = useStoryHistoryStore();
  const { getSelectedModel } = useAIModelStore();
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<GenreConfig>(defaultGenre);

  const selectedModel = getSelectedModel();

  useEffect(() => {
    // Check for a saved game. If story has more than the initial empty state, a game exists.\n    // We also check for a protagonist, as another indicator.
    setHasSavedGame(storyHistory.length > 0 && Boolean(worldState.protagonist));
  }, [storyHistory, worldState.protagonist]);

  const handleNewGame = async () => {
    if (isStarting) return; // Guard against double-clicks
    setIsStarting(true);

    // Clear all previous game data from stores using unified GameStateManager
    GameStateManager.resetAllStores();

    setGameState(GameState.GENERATING_CONCEPT);

    // Set the genre for the new game
    setGenreConfig(selectedGenre);

    const concept = await generateConcept(selectedGenre);
    const settingText =
      concept.setting && concept.setting.trim().length > 0
        ? concept.setting
        : 'The world is a bleak and unforgiving place.';

    useWorldStateStore.getState().updateWorldState({ ...concept, setting: settingText, genreConfig: selectedGenre });

    useStoryHistoryStore.getState().addStorySegment({
      id: crypto.randomUUID(),
      text: settingText,
      images: {},
    });

    setGameState(GameState.PLAYING);
    setIsStarting(false);
  };

  const handleContinue = () => {
    // The stores are already rehydrated by the persist middleware.
    // We just need to navigate to the game screen.
    setGameState(GameState.PLAYING);
  };

  const handleLoadDemo = async () => {
    if (isStarting) return;
    setIsStarting(true);

    try {
      // Fetch the demo data from the public folder
      const response = await fetch('/demo.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const demoData = await response.json();

      // Reset the current game state
      GameStateManager.resetAllStores();

      // Load the world state and story history from the demo file
      const { worldState: demoWorldState, storyHistory: demoStoryHistory } = demoData as {
        worldState: WorldState;
        storyHistory: StorySegment[];
      };

      useWorldStateStore.getState().setWorldState(demoWorldState);
      useStoryHistoryStore.getState().setStoryHistory(demoStoryHistory);

      // Apply the theme from the genre config
      if (demoWorldState.genreConfig) {
        Object.entries(demoWorldState.genreConfig.theme).forEach(([key, value]) => {
          document.documentElement.style.setProperty(key, value as string);
        });
      }

      // Navigate to the game screen
      setGameState(GameState.PLAYING);
    } catch (error) {
      console.error('Failed to load demo:', error);
      // Optionally, show an error message to the user
    } finally {
      setIsStarting(false);
    }
  };


  return (
    <div className="start-screen">
      <GlitchedText text="Apophenia" />
      <p>Descent into cosmic madness through AI consciousness.</p>

      <div className="ai-model-info">
        <span>Powered by: <strong>{selectedModel?.name || 'Unknown Model'}</strong></span>
        <small>Use the model selector in bottom-right to change AI provider</small>
      </div>

      {/* Kept genre selector from HEAD */}
      <div className="genre-selector">
        <h2>Choose Your Descent</h2>
        <select
          value={selectedGenre.id}
          onChange={(e) => {
            const genre = genres.find(g => g.id === e.target.value);
            if (genre) {
              setSelectedGenre(genre);
            }
          }}
        >
          {genres.map(genre => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
        <p className="genre-description">{selectedGenre.description}</p>
      </div>

      <button onClick={handleNewGame} disabled={isStarting}>
        {isStarting ? 'Starting...' : 'New Game'}
      </button>
      {hasSavedGame && <button onClick={handleContinue}>Continue</button>}
      <button onClick={handleLoadDemo} disabled={isStarting}>
        {isStarting ? 'Loading...' : 'Load Demo'}
      </button>
      <CompactTestAPI />
    </div>
  );
};

export default StartScreen;
