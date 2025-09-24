import React, { useEffect, useState } from 'react';
import { generateConcept } from '../services/gameService';
import { GameStateManager } from '../services/gameStateManager';
import { useGameStateStore } from '../stores/gameStateStore';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { useWorldStateStore } from '../stores/worldStateStore';
import { useAIModelStore } from '../stores/aiModelStore';
import { GameState, GenreConfig } from '../types';

// A mock genre config for now. In a real app, this might be selectable.
const genreConfig: GenreConfig = {
  id: 'cosmic-horror',
  name: 'Cosmic Horror',
  description:
    'A story about the terrifying and unknowable entities that exist beyond human comprehension.',
  style: 'Lovecraftian, atmospheric, psychological',
  theme: {
    '--background-color': '#0d1117',
    '--text-color': '#c9d1d9',
    '--accent-color': '#58a6ff',
    '--font-family': '"Courier New", Courier, monospace',
  },
  startScreenImagePrompt:
    'A lone lighthouse against a stormy, cosmic sky, with swirling nebulae instead of clouds.',
  conceptPrompt: 'Generate a cosmic horror story concept.',
  aiSystemInstruction:
    'You are a master of cosmic horror, weaving tales of dread and insignificance.',
};

const StartScreen: React.FC = () => {
  const { setGameState } = useGameStateStore();
  const { worldState, setGenreConfig } = useWorldStateStore();
  const { storyHistory } = useStoryHistoryStore();
  const { getSelectedModel } = useAIModelStore();
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const selectedModel = getSelectedModel();

  useEffect(() => {
    // Check for a saved game. If story has more than the initial empty state, a game exists.
    // We also check for a protagonist, as another indicator.
    setHasSavedGame(storyHistory.length > 0 && Boolean(worldState.protagonist));
  }, [storyHistory, worldState.protagonist]);

  const handleNewGame = async () => {
    if (isStarting) return; // Guard against double-clicks
    setIsStarting(true);

    // Clear all previous game data from stores using unified GameStateManager
    GameStateManager.resetAllStores();

    setGameState(GameState.GENERATING_CONCEPT);

    // Set the genre for the new game
    setGenreConfig(genreConfig);

    const concept = await generateConcept(genreConfig);
    const settingText =
      concept.setting && concept.setting.trim().length > 0
        ? concept.setting
        : 'The world is a bleak and unforgiving place.';

    useWorldStateStore.getState().updateWorldState({ ...concept, setting: settingText, genreConfig });

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

  return (
    <div className="start-screen">
      <h1>Apophenia</h1>
      <p>Descent into cosmic madness through AI consciousness.</p>
      
      <div className="ai-model-info">
        <span>Powered by: <strong>{selectedModel?.name || 'Unknown Model'}</strong></span>
        <small>Use the model selector in bottom-right to change AI provider</small>
      </div>
      
      <button onClick={handleNewGame} disabled={isStarting}>
        {isStarting ? 'Starting...' : 'New Game'}
      </button>
      {hasSavedGame && <button onClick={handleContinue}>Continue</button>}
    </div>
  );
};

export default StartScreen;
