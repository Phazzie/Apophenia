'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { generateConcept } from '@/src/services/gameService';
import { GameStateManager } from '@/src/services/gameStateManager';
import { useGameStateStore } from '@/lib/stores/gameStateStore';
import { useStoryHistoryStore } from '@/lib/stores/storyHistoryStore';
import { useWorldStateStore } from '@/lib/stores/worldStateStore';
import { GameState, GenreConfig } from '@/lib/types';
import AuthButton from './AuthButton';
import { useI18n } from '@/lib/i18n/useI18n';

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
  const router = useRouter();
  const { data: session } = useSession();
  const t = useI18n();
  const { setGameState } = useGameStateStore();
  const { setWorldState } = useWorldStateStore.getState();
  const { replaceStoryHistory } = useStoryHistoryStore.getState();
  const [isStarting, setIsStarting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNewGame = async () => {
    if (isStarting) return;
    setIsStarting(true);
    GameStateManager.resetAllStores();
    setGameState(GameState.GENERATING_CONCEPT);

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

    setIsStarting(false);
    router.push('/play/new-game');
  };

  const handleLoadGame = async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/game/load');
      if (response.ok) {
        const savedGame = await response.json();
        useGameStateStore.setState(savedGame.gameState);
        useWorldStateStore.setState(savedGame.worldState);
        useStoryHistoryStore.setState(savedGame.storyHistory);
        router.push('/play/saved-game');
      } else {
        console.error('No saved game found.');
      }
    } catch (error) {
      console.error('Failed to load game:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="start-screen flex flex-col justify-center items-center min-h-screen text-center p-8 relative overflow-hidden">
      <div className="absolute top-4 right-4">
        <AuthButton />
      </div>
      <h1 className="font-nosifer text-7xl text-purple-500 mb-4 tracking-wider relative z-10" style={{ textShadow: 'var(--glow-purple)' }}>
        {t.startScreen.title}
      </h1>
      <p className="text-xl text-gray-300 mb-12 max-w-2xl leading-relaxed z-10" style={{ textShadow: 'var(--glow-text)' }}>
        {t.startScreen.subtitle}
      </p>
      <div className="z-10">
        <button
          onClick={handleNewGame}
          disabled={isStarting || isLoading}
          aria-label={t.startScreen.newGame}
          className="bg-gradient-to-r from-gray-800 to-gray-900 border-2 border-purple-500 text-white py-5 px-10 m-3 rounded-lg font-courier text-lg font-bold uppercase tracking-widest transition-all duration-300 ease-in-out min-w-[180px] relative overflow-hidden shadow-lg hover:shadow-purple-500/50 hover:border-green-400 hover:text-green-400 hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isStarting ? t.startScreen.starting : t.startScreen.newGame}
        </button>
        {session && (
          <button
            onClick={handleLoadGame}
            disabled={isLoading || isStarting}
            aria-label={t.startScreen.loadGame}
            className="bg-gradient-to-r from-gray-800 to-gray-900 border-2 border-purple-500 text-white py-5 px-10 m-3 rounded-lg font-courier text-lg font-bold uppercase tracking-widest transition-all duration-300 ease-in-out min-w-[180px] relative overflow-hidden shadow-lg hover:shadow-purple-500/50 hover:border-green-400 hover:text-green-400 hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t.startScreen.loading : t.startScreen.loadGame}
          </button>
        )}
      </div>
    </div>
  );
};

export default StartScreen;
