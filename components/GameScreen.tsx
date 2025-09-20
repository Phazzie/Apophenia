'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { executeCommandQueue } from '@/src/services/commandExecutor';
import { triggerSummary } from '@/src/services/flows/gameFlow';
import { getNextStep } from '@/src/services/gameService';
import { GameStateManager } from '@/src/services/gameStateManager';
import { useGameStateStore } from '@/lib/stores/gameStateStore';
import { useStoryHistoryStore } from '@/lib/stores/storyHistoryStore';
import { useWorldStateStore } from '@/lib/stores/worldStateStore';
import { Choice, GameState } from '@/lib/types';
import { useI18n } from '@/lib/i18n/useI18n';

const GameScreen: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const t = useI18n();
  const { choices, intrusiveThought, gameState, setGameState, isGenerating, setIsGenerating } =
    useGameStateStore();
  const { storyHistory, replaceStoryHistory } = useStoryHistoryStore();
  const { worldState, updateWorldState } = useWorldStateStore();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [metaMessage, setMetaMessage] = useState<string | null>(null);
  const [corruptionEffects, setCorruptionEffects] = useState<any>({});
  const [quantumShiftNotification, setQuantumShiftNotification] = useState(false);
  const autoStartedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleChoice = useCallback(async (choice: Choice) => {
    if (isGenerating) return;
    setIsGenerating(true);
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    triggerSummary(worldState, storyHistory);
    try {
      const result = await getNextStep(choice.text, worldState, storyHistory, worldState.genreConfig, signal);
      if (result.revisedHistory) replaceStoryHistory(result.revisedHistory);
      if (result.quantumShift) {
        setQuantumShiftNotification(true);
        setTimeout(() => setQuantumShiftNotification(false), 4000);
      }
      if (result.metaMessage) {
        setMetaMessage(result.metaMessage);
        setTimeout(() => setMetaMessage(null), 8000);
      }
      if (result.corruptionEffects) {
        setCorruptionEffects(result.corruptionEffects.uiEffects);
        updateWorldState({ systemHealth: Math.max(0, worldState.systemHealth - (result.corruptionEffects.corruptionLevel * 10)) });
      }
      await executeCommandQueue(result.commands);
    } catch (err) {
      if ((err as Error).name === 'AbortError') console.log('Request cancelled by user.');
      else console.error('Failed to process choice:', err);
      setGameState(GameState.PLAYING);
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [isGenerating, setIsGenerating, worldState, storyHistory, setGameState, replaceStoryHistory, updateWorldState]);

  const handleCancel = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
  };

  useEffect(() => {
    if (!autoStartedRef.current && storyHistory.length === 1 && storyHistory[0].text === worldState.setting) {
      autoStartedRef.current = true;
      void handleChoice({ text: 'Begin the story', isIntrusive: false });
    }
  }, [storyHistory, worldState.setting, handleChoice]);

  useEffect(() => {
    if (worldState.systemHealth <= 0) router.push('/end/game-over');
  }, [worldState.systemHealth, router]);

  const handleSave = async () => {
    if (!session) {
      setSaveMessage(t.gameScreen.signInToSave);
      return;
    }
    setSaveMessage(t.gameScreen.saving);
    try {
      const response = await fetch('/api/game/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameState: useGameStateStore.getState(),
          worldState: useWorldStateStore.getState(),
          storyHistory: useStoryHistoryStore.getState(),
        }),
      });
      if (!response.ok) throw new Error('Failed to save game.');
      setSaveMessage(t.gameScreen.gameSaved);
    } catch (error) {
      setSaveMessage(t.gameScreen.errorSaving);
      console.error(error);
    }
  };

  const handleNewGame = () => {
    GameStateManager.resetAllStores();
    router.push('/');
  };

  useEffect(() => {
    if (!saveMessage) return;
    const id = window.setTimeout(() => setSaveMessage(null), 3000);
    return () => window.clearTimeout(id);
  }, [saveMessage]);

  const lastStorySegment = storyHistory[storyHistory.length - 1];
  const combinedChoices = intrusiveThought ? [...choices, { ...intrusiveThought, isIntrusive: true }] : choices;

  return (
    <div className="game-screen min-h-screen flex flex-col relative" style={corruptionEffects}>
      {metaMessage && (
        <div className="meta-consciousness-overlay" aria-live="assertive">
          <div className="meta-message">
            <div className="meta-header">{t.gameScreen.metaHeader}</div>
            <p>{metaMessage}</p>
          </div>
        </div>
      )}
      {quantumShiftNotification && (
        <div className="quantum-shift-overlay" aria-live="assertive">
          <div className="quantum-notification">
            <div className="quantum-header">{t.gameScreen.quantumHeader}</div>
            <p>{t.gameScreen.quantumMessage}</p>
          </div>
        </div>
      )}
      <div className="story-panel ...">
        {lastStorySegment?.images?.main && (
          <div className="image-container ...">
            <img src={lastStorySegment.images.main} alt="Current Scene" className="main-image ..." />
            {lastStorySegment.images.mainStatus === 'loading' && (
              <div className="image-loading-overlay ...">
                <div className="loading-spinner ..."></div>
                <p>{t.gameScreen.generatingScene}</p>
              </div>
            )}
          </div>
        )}
        <div className="story-text-container ...">
          <p className={`story-text ... ${lastStorySegment?.isRevised ? 'temporal-revision' : ''} ${lastStorySegment?.isQuantumShift ? 'quantum-shift' : ''}`} aria-live="polite">
            {lastStorySegment?.text}
            {lastStorySegment?.isRevised && <span className="revision-indicator" title="This memory has been altered">{t.gameScreen.memoryRevised}</span>}
          </p>
          {gameState === GameState.GENERATING_CONCEPT && (
            <div className="text-loading-indicator ...">
              <div className="loading-spinner small ..."></div>
              <span>{t.gameScreen.analyzingImpact}</span>
            </div>
          )}
        </div>
        <div className="system-status ...">
          <div className="system-health-bar ...">
            <div className="health-fill ..." style={{ width: `${worldState.systemHealth}%` }}></div>
          </div>
          <span className="health-label ...">{t.gameScreen.realityCoherence}: {worldState.systemHealth}%</span>
        </div>
      </div>
      <div className="choice-panel ...">
        {isGenerating ? (
          <div className="loading-container ...">
            <div className="loading-spinner ..."></div>
            <p>{t.gameScreen.processingChoice}</p>
            <p className="loading-subtitle ...">{t.gameScreen.analyzingImpact}</p>
            <button onClick={handleCancel} className="mt-4 ...">{t.gameScreen.cancel}</button>
          </div>
        ) : (
          combinedChoices.map((choice, index) => (
            <button key={index} onClick={() => void handleChoice(choice)} disabled={isGenerating} className={`choice-button ... ${choice.isIntrusive ? 'intrusive-thought' : ''}`} aria-label={`Choice: ${choice.text}`}>
              {choice.isIntrusive && <span className="intrusive-icon">👁️</span>}
              {choice.text}
            </button>
          ))
        )}
        <div className="game-actions ...">
          {session && <button onClick={handleSave} disabled={isGenerating} className="action-button ..." aria-label={t.gameScreen.saveGame}>{t.gameScreen.saveGame}</button>}
          <button onClick={handleNewGame} disabled={isGenerating} className="action-button ..." aria-label={t.gameScreen.newGame}>{t.gameScreen.newGame}</button>
          {saveMessage && <span className="save-message ..." aria-live="assertive">{saveMessage}</span>}
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
