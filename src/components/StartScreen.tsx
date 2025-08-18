import React from 'react';
import { useGameStateStore } from '../stores/gameStateStore';
import { GameState } from '../types';
import { generateConcept } from '../services/gameService';
import { useWorldStateStore } from '../stores/worldStateStore';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';

// A mock genre config for now. In a real app, this might be selectable.
const genreConfig = {
  id: 'cosmic-horror',
  name: 'Cosmic Horror',
  description: 'A story about the terrifying and unknowable entities that exist beyond human comprehension.',
  style: 'Lovecraftian, atmospheric, psychological',
  theme: {
    '--background-color': '#0d1117',
    '--text-color': '#c9d1d9',
    '--accent-color': '#58a6ff',
    '--font-family': '"Courier New", Courier, monospace',
  },
  startScreenImagePrompt: 'A lone lighthouse against a stormy, cosmic sky, with swirling nebulae instead of clouds.',
  conceptPrompt: 'Generate a cosmic horror story concept.',
  aiSystemInstruction: 'You are a master of cosmic horror, weaving tales of dread and insignificance.',
};

const StartScreen: React.FC = () => {
  const setGameState = useGameStateStore((state) => state.setGameState);
  const updateWorldState = useWorldStateStore((state) => state.updateWorldState);
  const addStorySegment = useStoryHistoryStore((state) => state.addStorySegment);

  const handleStartGame = async () => {
    setGameState(GameState.GENERATING_CONCEPT);

    // 1. Generate the initial concept
    const concept = await generateConcept(genreConfig);
    updateWorldState(concept);

    // 2. Add the first story segment
    addStorySegment({
      id: `seg-0`,
      text: concept.setting || 'The world is a bleak and unforgiving place.',
      images: {},
    });

    // 3. Get the first set of choices
    // In a real flow, we'd probably have an "intro" flow.
    // For now, we'll just kick off the first "next step" with a generic prompt.
    setGameState(GameState.LOADING);
    // This part would be handled by the game loop, triggered by a choice.
    // For the very first step, we might need a dedicated "startGame" flow.
    // For now, we'll transition to playing and let the GameScreen handle the first step.
    setGameState(GameState.PLAYING);
  };

  return (
    <div className="start-screen">
      <h1>Cosmic Narrative</h1>
      <p>An AI-driven story experience.</p>
      <button onClick={handleStartGame}>Begin</button>
    </div>
  );
};

export default StartScreen;
