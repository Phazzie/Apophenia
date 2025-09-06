import React, { useEffect, useState } from 'react';
import { useGameStateStore } from '../stores/gameStateStore';
import { GameState, GenreConfig } from '../types';
import { generateConcept } from '../services/gameService';
import { useWorldStateStore } from '../stores/worldStateStore';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { GameStateManager } from '../services/gameStateManager';

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
  const { setGameState, reset: resetGameState } = useGameStateStore();
  const { worldState, reset: resetWorldState } = useWorldStateStore();
  const { storyHistory, addStorySegment, reset: resetStoryHistory } = useStoryHistoryStore();
  const [hasSavedGame, setHasSavedGame] = useState(false);

  useEffect(() => {
    // Check for a saved game. If story has more than the initial empty state, a game exists.
    // We also check for a protagonist, as another indicator.
    setHasSavedGame(storyHistory.length > 0 && Boolean(worldState.protagonist));
  }, [storyHistory, worldState.protagonist]);

  const handleNewGame = async () => {
    // Clear all previous game data from stores using unified reset
    GameStateManager.resetAllStores();

    setGameState(GameState.GENERATING_CONCEPT);

    const concept = await generateConcept(genreConfig);
    useWorldStateStore.getState().updateWorldState(concept); // Update world state directly

    addStorySegment({
      id: crypto.randomUUID(),
      text: concept.setting || 'The world is a bleak and unforgiving place.',
      images: {},
    });

    setGameState(GameState.PLAYING);
  };

  const handleContinue = () => {
    // The stores are already rehydrated by the persist middleware.
    // We just need to navigate to the game screen.
    setGameState(GameState.PLAYING);
  };

  return (
    <div className="start-screen">
      <h1>Cosmic Narrative</h1>
      <p>An AI-driven story experience.</p>
      <button onClick={handleNewGame}>New Game</button>
      {hasSavedGame && <button onClick={handleContinue}>Continue</button>}
    </div>
  );
};

export default StartScreen;
