import React, { useCallback, useEffect, useRef, useState } from 'react';
import { executeCommandQueue } from '../services/commandExecutor';
import { triggerSummary } from '../services/flows/gameFlow';
import { getNextStep } from '../services/gameService';
import { GameStateManager } from '../services/gameStateManager';
import { useGameStateStore } from '../stores/gameStateStore';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { useWorldStateStore } from '../stores/worldStateStore';
import { Choice, GameState } from '../types';

const GameScreen: React.FC = () => {
  const { choices, intrusiveThought, gameState, setGameState, isGenerating, setIsGenerating } =
    useGameStateStore();
  const { storyHistory } = useStoryHistoryStore();
  const { worldState } = useWorldStateStore();
  const [saveMessageVisible, setSaveMessageVisible] = useState(false);
  const autoStartedRef = useRef(false);

  const lastStorySegment = storyHistory[storyHistory.length - 1];
  const combinedChoices = intrusiveThought
    ? [...choices, { ...intrusiveThought, isIntrusive: true }]
    : choices;

  const handleChoice = useCallback(async (choice: Choice) => {
    // Prevent duplicate actions while generating
    if (isGenerating) return;
    setIsGenerating(true);

    // Trigger the summary flow in the background
    triggerSummary(worldState, storyHistory);

    try {
      const commands = await getNextStep(
        choice.text,
        worldState,
        storyHistory,
        worldState.genreConfig
      );
      await executeCommandQueue(commands);
      // The displayChoices command will set the state back to PLAYING
    } catch (err) {
      console.error('Failed to process choice:', err);
      // Recover UI responsiveness if a command or flow fails
      setGameState(GameState.PLAYING);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, setIsGenerating, worldState, storyHistory, setGameState]);

  // Effect to fetch the first step if history is minimal
  useEffect(() => {
    if (
      !autoStartedRef.current &&
      storyHistory.length === 1 &&
      storyHistory[0].text === worldState.setting
    ) {
      autoStartedRef.current = true;
      void handleChoice({ text: 'Begin the story', isIntrusive: false });
    }
  }, [storyHistory, worldState.setting, handleChoice]);

  const handleSave = () => {
    // The saving is automatic via the persist middleware.
    // This button is just for user feedback.
    setSaveMessageVisible(true);
  };

  const handleNewGame = () => {
    GameStateManager.resetAllStores();
    // The reset will automatically set the gameState to MENU, triggering a re-render to the StartScreen
  };

  // Auto-hide the save message after a short delay
  useEffect(() => {
    if (!saveMessageVisible) return;
    const id = window.setTimeout(() => setSaveMessageVisible(false), 2000);
    return () => window.clearTimeout(id);
  }, [saveMessageVisible]);

  return (
    <div className="game-screen">
      <div className="story-panel">
        {lastStorySegment?.images?.main && (
          <div className="image-container">
            <img src={lastStorySegment.images.main} alt="Current Scene" className="main-image" />
            {lastStorySegment.images.mainStatus === 'loading' && (
              <div className="image-loading-overlay">
                <div className="loading-spinner"></div>
                <p>Generating scene...</p>
              </div>
            )}
          </div>
        )}
        <div className="story-text-container">
          <p className="story-text">{lastStorySegment?.text}</p>
          {gameState === GameState.GENERATING_CONCEPT && (
            <div className="text-loading-indicator">
              <div className="loading-spinner small"></div>
              <span>AI is crafting your story...</span>
            </div>
          )}
        </div>
      </div>
      <div className="choice-panel">
        {isGenerating ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Processing your choice...</p>
            <p className="loading-subtitle">The AI is weaving the next part of your story</p>
          </div>
        ) : (
          combinedChoices.map((choice, index) => (
            <button
              key={index}
              onClick={() => void handleChoice(choice)}
              disabled={isGenerating}
              className={choice.isIntrusive ? 'intrusive-thought' : undefined}
            >
              {choice.text}
            </button>
          ))
        )}
        <div className="game-actions">
          <button onClick={handleSave} disabled={isGenerating}>
            Save Game
          </button>
          <button onClick={handleNewGame} disabled={isGenerating}>
            New Game
          </button>
          {saveMessageVisible && <span className="save-message">Game Saved!</span>}
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
