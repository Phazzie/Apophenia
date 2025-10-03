import React, { useEffect, useState } from 'react';
import { generateConceptService } from '../services/gameService';
import { GameStateManager } from '../services/gameStateManager';
import { useGameStateStore } from '../stores/gameStateStore';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { useWorldStateStore } from '../stores/worldStateStore';
import { GameState, GenreConfig, StorySegment, WorldState } from '../types';
import { genres, defaultGenre } from '../config/genres';
import GlitchedText from './GlitchedText';
import CompactTestAPI from './CompactTestAPI';

const StartScreen: React.FC = () => {
  const { setGameState } = useGameStateStore();
  const { worldState, setGenreConfig } = useWorldStateStore();
  const { storyHistory } = useStoryHistoryStore();
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<GenreConfig>(defaultGenre);

  useEffect(() => {
    // Check for a saved game.
    setHasSavedGame(storyHistory.length > 0 && Boolean(worldState.protagonist));
  }, [storyHistory, worldState.protagonist]);

  const handleNewGame = async () => {
    if (isStarting) return; // Guard against double-clicks
    setIsStarting(true);

    GameStateManager.resetAllStores();
    setGameState(GameState.GENERATING_CONCEPT);
    setGenreConfig(selectedGenre);

    // Call the refactored service to generate the concept via the backend.
    const concept = await generateConceptService(selectedGenre);
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
    setGameState(GameState.PLAYING);
  };

  const handleLoadDemo = async () => {
    if (isStarting) return;
    setIsStarting(true);

    try {
      const response = await fetch('/demo.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const demoData = await response.json();

      GameStateManager.resetAllStores();

      const { worldState: demoWorldState, storyHistory: demoStoryHistory } = demoData as {
        worldState: WorldState;
        storyHistory: StorySegment[];
      };

      useWorldStateStore.getState().setWorldState(demoWorldState);
      useStoryHistoryStore.getState().replaceStoryHistory(demoStoryHistory);

      if (demoWorldState.genreConfig) {
        Object.entries(demoWorldState.genreConfig.theme).forEach(([key, value]) => {
          document.documentElement.style.setProperty(key, value as string);
        });
      }

      setGameState(GameState.PLAYING);
    } catch (error) {
      console.error('Failed to load demo:', error);
    } finally {
      setIsStarting(false);
    }
  };


  return (
    <div className="start-screen">
      <GlitchedText text="Apophenia" />
      <p>Descent into cosmic madness through AI consciousness.</p>

      <div className="ai-model-info">
        <span>Powered by a decentralized AI consciousness.</span>
        <small>The backend orchestrates multiple AI providers for this experience.</small>
      </div>

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