import { useCallback, useEffect, useRef } from 'react';
import { executeCommandQueue } from '../services/commandExecutor';
import { triggerSummary } from '../services/flows/gameFlow';
import { getNextStep } from '../services/gameService';
import { useGameStateStore } from '../core/state/gameStateStore';
import { useHistoryStore } from '../core/state/historyStore';
import { useWorldStateStore } from '../core/state/worldStateStore';
import { GameState } from '../core/types/seams';
import { Choice, GameStepResult } from '../types';

export const useGameLoop = (
  handleGameEffects: (result: Partial<GameStepResult>) => void,
) => {
  const { isGenerating, setGenerating, setGameState } = useGameStateStore();
  const { segments } = useHistoryStore();
  const { worldState } = useWorldStateStore();
  const autoStartedRef = useRef(false);

  const handleChoice = useCallback(
    async (choice: Choice) => {
      // Prevent duplicate actions while generating
      if (isGenerating) return;
      setGenerating(true);

      try {
        // Process the player choice through the game flow
        // This now handles everything internally: AI generation, command execution, and state updates
        await getNextStep(choice);
      } catch (err) {
        console.error('Failed to process choice:', err);
        setGameState(GameState.DESCENDING);
      } finally {
        setGenerating(false);
      }
    },
    [
      isGenerating,
      setGenerating,
      setGameState,
    ],
  );

  // Effect to fetch the first step if history is minimal
  useEffect(() => {
    if (
      !autoStartedRef.current &&
      segments.length === 1 &&
      segments[0].text === worldState.setting
    ) {
      autoStartedRef.current = true;
      void handleChoice({ id: 'auto-start', text: 'Begin the story', isIntrusive: false });
    }
  }, [segments, worldState.setting, handleChoice]);

  return { handleChoice };
};