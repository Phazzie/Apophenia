import React, { useEffect, useState } from 'react';
import { useGameStateStore } from '../stores/gameStateStore';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { useWorldStateStore } from '../stores/worldStateStore';
import { getNextStep } from '../services/gameService';
import { executeCommandQueue } from '../services/commandExecutor';
import { Choice, GameState, GenreConfig } from '../types';

const GameScreen: React.FC = () => {
  const { choices, intrusiveThought, gameState, setGameState } = useGameStateStore();
  const { storyHistory } = useStoryHistoryStore();
  const { worldState } = useWorldStateStore();
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessageVisible, setSaveMessageVisible] = useState(false);

  const lastStorySegment = storyHistory[storyHistory.length - 1];

  // Effect to fetch the first step if history is minimal
  useEffect(() => {
    if (storyHistory.length === 1 && storyHistory[0].text === worldState.setting) {
      handleChoice({ text: 'Begin the story', isIntrusive: false });
    }
  }, [storyHistory, worldState.setting]);

  const handleChoice = async (choice: Choice) => {
    setIsLoading(true);
    setGameState(GameState.LOADING);

    // A complete mock genre config for now
    const mockGenreConfig: GenreConfig = {
      id: 'cosmic-horror',
      name: 'Cosmic Horror',
      description: 'Stories of cosmic dread and the insignificance of humanity.',
      style: 'Lovecraftian, atmospheric, psychological',
      theme: {
        '--background-color': '#0d0d0f',
        '--text-color': '#c5c5c5',
        '--accent-color': '#6b0f1a',
        '--font-family': "'Courier New', Courier, monospace",
      },
      startScreenImagePrompt:
        'A vast, empty cosmos with a single, terrifying, unknowable entity lurking in the void.',
      conceptPrompt: 'Generate a cosmic horror story concept.',
      aiSystemInstruction:
        'You are a master of cosmic horror, in the style of H.P. Lovecraft.',
    };

    try {
      const commands = await getNextStep(
        choice.text,
        worldState,
        storyHistory,
        mockGenreConfig
      );
      await executeCommandQueue(commands);
      // The displayChoices command will set the state back to PLAYING
    } catch (err) {
      console.error('Failed to process choice:', err);
      // Recover UI responsiveness if a command or flow fails
      setGameState(GameState.PLAYING);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    // The saving is automatic via the persist middleware.
    // This button is just for user feedback.
    setSaveMessageVisible(true);
    setTimeout(() => {
      setSaveMessageVisible(false);
    }, 2000);
  };

  return (
    <div className="game-screen">
      <div className="story-panel">
        {lastStorySegment?.images?.main && (
          <img src={lastStorySegment.images.main} alt="Current Scene" className="main-image" />
        )}
        <p className="story-text">{lastStorySegment?.text}</p>
      </div>
      <div className="choice-panel">
        {isLoading || gameState === GameState.LOADING ? (
          <p>Loading...</p>
        ) : (
          <>
            {choices.map((choice, index) => (
              <button key={index} onClick={() => handleChoice(choice)} disabled={isLoading}>
                {choice.text}
              </button>
            ))}
            {intrusiveThought && (
              <button
                key="intrusive"
                onClick={() => handleChoice(intrusiveThought)}
                disabled={isLoading}
                className="intrusive-thought"
              >
                {intrusiveThought.text}
              </button>
            )}
          </>
        )}
        <div className="game-actions">
          <button onClick={handleSave} disabled={isLoading}>Save Game</button>
          {saveMessageVisible && <span className="save-message">Game Saved!</span>}
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
