import React, { useEffect, useState } from 'react';
import { useGameStateStore } from '../stores/gameStateStore';
import { GameState } from '../types';
import { generateConcept } from '../services/gameService';
import { useWorldStateStore } from '../stores/worldStateStore';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { cosmicHorrorGenre as genreConfig } from '../config/gameConfig';

const StartScreen: React.FC = () => {
  const { setGameState, reset: resetGameState } = useGameStateStore();
  const { worldState, reset: resetWorldState } = useWorldStateStore();
  const { storyHistory, addStorySegment, reset: resetStoryHistory } = useStoryHistoryStore();
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    // Saved game exists if we have history and a protagonist
    setHasSavedGame(storyHistory.length > 0 && !!worldState.protagonist);
  }, [storyHistory, worldState.protagonist]);

  const handleNewGame = async () => {
    if (isStarting) return; // Guard against double-clicks
    setIsStarting(true);

    // Clear all previous game data from stores
    resetGameState();
    resetWorldState();
    resetStoryHistory();

    setGameState(GameState.GENERATING_CONCEPT);

    const concept = await generateConcept(genreConfig);
    const settingText =
      concept.setting && concept.setting.trim().length > 0
        ? concept.setting
        : 'The world is a bleak and unforgiving place.';

    useWorldStateStore.getState().updateWorldState({ ...concept, setting: settingText });

    addStorySegment({
      id: `seg-0`,
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
      <h1>Cosmic Narrative</h1>
      <p>An AI-driven story experience.</p>
      <button onClick={handleNewGame} disabled={isStarting}>
        {isStarting ? 'Starting...' : 'New Game'}
      </button>
      {hasSavedGame && <button onClick={handleContinue}>Continue</button>}
    </div>
  );
};

export default StartScreen;
