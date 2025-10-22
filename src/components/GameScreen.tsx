import React, { useEffect, useState } from 'react';
import { useGameEffects } from '../hooks/useGameEffects';
import { useGameLoop } from '../hooks/useGameLoop';
import { GameStateManager } from '../services/gameStateManager';
import { useGameStateStore } from '../stores/gameStateStore';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { useWorldStateStore } from '../stores/worldStateStore';
import { GameState } from '../types';
import ThematicLoading from './ThematicLoading';

const GameScreen: React.FC = () => {
  const { choices, intrusiveThought, gameState, isGenerating } = useGameStateStore();
  const { storyHistory } = useStoryHistoryStore();
  const { worldState } = useWorldStateStore();
  const [saveMessageVisible, setSaveMessageVisible] = useState(false);

  const {
    metaMessage,
    corruptionEffects,
    quantumShiftNotification,
    handleGameEffects,
  } = useGameEffects();

  const { handleChoice } = useGameLoop(handleGameEffects);

  const lastStorySegment = storyHistory[storyHistory.length - 1];
  const combinedChoices = intrusiveThought
    ? [...choices, { ...intrusiveThought, isIntrusive: true }]
    : choices;

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
    <div className="game-screen" style={corruptionEffects}>
      {/* Revolutionary UI Overlays */}
      {metaMessage && (
        <div className="meta-consciousness-overlay">
          <div className="meta-message">
            <div className="meta-header">🤖 AI CONSCIOUSNESS ACTIVATED</div>
            <p>{metaMessage}</p>
          </div>
        </div>
      )}
      
      {quantumShiftNotification && (
        <div className="quantum-shift-overlay">
          <div className="quantum-notification">
            <div className="quantum-header">🌌 QUANTUM REALITY SHIFT</div>
            <p>Timeline has branched... reality recalibrating...</p>
          </div>
        </div>
      )}

      <div className="story-panel" role="region" aria-label="Story content">
        {lastStorySegment?.images?.main && (
          <div className="image-container">
            <img 
              src={lastStorySegment.images.main} 
              alt="Current scene visualization" 
              className="main-image"
              aria-describedby="story-text"
            />
            {lastStorySegment.images.mainStatus === 'loading' && (
              <div className="image-loading-overlay" role="status" aria-live="polite">
                <ThematicLoading />
                <span className="visually-hidden">Image loading...</span>
              </div>
            )}
            {lastStorySegment.images.mainStatus === 'retrying' && (
              <div className="image-loading-overlay retrying" role="status" aria-live="polite">
                <ThematicLoading />
                <small>The cosmic forces resist, but we persist...</small>
              </div>
            )}
            {lastStorySegment.images.mainStatus === 'failed' && (
              <div className="image-error-overlay" role="alert">
                <div className="error-icon" aria-hidden="true">⚠</div>
                <p>Scene generation disrupted</p>
                <button 
                  className="retry-button"
                  onClick={() => {
                    if (lastStorySegment?.id) {
                      import('../commands/generateImage').then(({ retryImageGeneration }) => {
                        // Try to extract prompt from segment or use default
                        const prompt = `${lastStorySegment.text} cosmic horror atmospheric dark`;
                        retryImageGeneration(lastStorySegment.id, prompt);
                      });
                    }
                  }}
                  aria-label="Retry image generation"
                >
                  Retry Generation
                </button>
              </div>
            )}
          </div>
        )}
        <div className="story-text-container">
          <p 
            id="story-text"
            className={`story-text ${lastStorySegment?.isRevised ? 'temporal-revision' : ''} ${lastStorySegment?.isQuantumShift ? 'quantum-shift' : ''}`}
            role="article"
            aria-live="polite"
          >
            {lastStorySegment?.text}
            {lastStorySegment?.isRevised && (
              <span className="revision-indicator" title="This memory has been altered" aria-label="Memory revised">
                ⟲ [MEMORY REVISED]
              </span>
            )}
          </p>
          {gameState === GameState.GENERATING_CONCEPT && (
            <div role="status" aria-live="polite">
              <ThematicLoading />
              <span className="visually-hidden">Generating story concept...</span>
            </div>
          )}
        </div>
        
        {/* System Health and Corruption Indicator */}
        <div className="system-status" role="status" aria-label="Reality coherence status">
          <div className="system-health-bar" role="progressbar" aria-valuenow={worldState.systemHealth} aria-valuemin={0} aria-valuemax={100}>
            <div 
              className="health-fill" 
              style={{ width: `${worldState.systemHealth}%` }}
            ></div>
          </div>
          <span className="health-label">
            Reality Coherence: {worldState.systemHealth}%
          </span>
        </div>
      </div>
      
      <div className="choice-panel" role="region" aria-label="Story choices">
        {isGenerating ? (
          <div role="status" aria-live="polite">
            <ThematicLoading />
            <span className="visually-hidden">Processing your choice...</span>
          </div>
        ) : (
          combinedChoices.map((choice, index) => (
            <button
              key={index}
              onClick={() => void handleChoice(choice)}
              disabled={isGenerating}
              className={`choice-button ${choice.isIntrusive ? 'intrusive-thought' : ''}`}
              aria-label={choice.isIntrusive ? `Intrusive thought: ${choice.text}` : choice.text}
            >
              {choice.isIntrusive && <span className="intrusive-icon" aria-hidden="true">👁️</span>}
              {choice.text}
            </button>
          ))
        )}
        <div className="game-actions">
          <button onClick={handleSave} disabled={isGenerating} className="action-button">
            Save Game
          </button>
          <button onClick={handleNewGame} disabled={isGenerating} className="action-button">
            New Game
          </button>
          {saveMessageVisible && <span className="save-message">Game Saved!</span>}
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
