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
  const { storyHistory, replaceStoryHistory } = useStoryHistoryStore();
  const { worldState, updateWorldState } = useWorldStateStore();
  const [saveMessageVisible, setSaveMessageVisible] = useState(false);
  const [metaMessage, setMetaMessage] = useState<string | null>(null);
  const [corruptionEffects, setCorruptionEffects] = useState<React.CSSProperties>({});
  const [quantumShiftNotification, setQuantumShiftNotification] = useState(false);
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
      // Revolutionary enhanced game processing
      const result = await getNextStep(
        choice.text,
        worldState,
        storyHistory,
        worldState.genreConfig
      );

      // Handle temporal revisions
      if (result.revisedHistory) {
        replaceStoryHistory(result.revisedHistory);
        console.log('🕰️ TEMPORAL REVISION: Past events have been altered by your choice');
      }

      // Handle quantum narrative shifts  
      if (result.quantumShift) {
        setQuantumShiftNotification(true);
        setTimeout(() => setQuantumShiftNotification(false), 4000);
        console.log('🌌 QUANTUM SHIFT: Reality has branched into an alternate timeline');
      }

      // Handle meta-consciousness events
      if (result.metaMessage) {
        setMetaMessage(result.metaMessage);
        setTimeout(() => setMetaMessage(null), 8000);
        console.log('🤖 META EVENT: AI consciousness activated');
      }

      // Handle reality corruption
      if (result.corruptionEffects) {
        setCorruptionEffects(result.corruptionEffects.uiEffects);
        updateWorldState({ 
          systemHealth: Math.max(0, worldState.systemHealth - (result.corruptionEffects.corruptionLevel * 10))
        });
        console.log('⚡ REALITY CORRUPTION: Interface integrity compromised');
      }

      // Execute the generated commands
      await executeCommandQueue(result.commands);
      
    } catch (err) {
      console.error('Failed to process choice:', err);
      setGameState(GameState.PLAYING);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, setIsGenerating, worldState, storyHistory, setGameState, replaceStoryHistory, updateWorldState]);

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
            {lastStorySegment.images.mainStatus === 'retrying' && (
              <div className="image-loading-overlay retrying">
                <div className="loading-spinner"></div>
                <p>Retrying scene generation...</p>
                <small>The cosmic forces resist, but we persist...</small>
              </div>
            )}
            {lastStorySegment.images.mainStatus === 'failed' && (
              <div className="image-error-overlay">
                <div className="error-icon">⚠</div>
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
                >
                  Retry Generation
                </button>
              </div>
            )}
          </div>
        )}
        <div className="story-text-container">
          <p className={`story-text ${lastStorySegment?.isRevised ? 'temporal-revision' : ''} ${lastStorySegment?.isQuantumShift ? 'quantum-shift' : ''}`}>
            {lastStorySegment?.text}
            {lastStorySegment?.isRevised && (
              <span className="revision-indicator" title="This memory has been altered">
                ⟲ [MEMORY REVISED]
              </span>
            )}
          </p>
          {gameState === GameState.GENERATING_CONCEPT && (
            <div className="text-loading-indicator">
              <div className="loading-spinner small"></div>
              <span>Gemini 2.5 Pro is analyzing cosmic consciousness patterns...</span>
            </div>
          )}
        </div>
        
        {/* System Health and Corruption Indicator */}
        <div className="system-status">
          <div className="system-health-bar">
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
      
      <div className="choice-panel">
        {isGenerating ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Processing your choice through advanced AI reasoning...</p>
            <p className="loading-subtitle">Gemini 2.5 Pro is analyzing psychological impact</p>
          </div>
        ) : (
          combinedChoices.map((choice, index) => (
            <button
              key={index}
              onClick={() => void handleChoice(choice)}
              disabled={isGenerating}
              className={`choice-button ${choice.isIntrusive ? 'intrusive-thought' : ''}`}
            >
              {choice.isIntrusive && <span className="intrusive-icon">👁️</span>}
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
