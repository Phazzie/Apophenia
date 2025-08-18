import React, { useEffect, useState } from 'react';
import { useGameStateStore } from '../stores/gameStateStore';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { useWorldStateStore } from '../stores/worldStateStore';
import { getNextStep } from '../services/gameService';
import { executeCommandQueue } from '../services/commandExecutor';
import { Choice, GameState } from '../types';

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

    // Mock genreConfig for now
    const mockGenreConfig = { name: 'Cosmic Horror', style: 'Lovecraftian' };

    const commands = await getNextStep(
      choice.text,
      worldState,
      storyHistory,
      mockGenreConfig as any
    );

    await executeCommandQueue(commands);
    setIsLoading(false);
    // The displayChoices command will set the state back to PLAYING
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
