import { useCallback, useEffect, useRef } from 'react';
import { executeCommandQueue } from '../services/commandExecutor';
import { triggerSummary } from '../services/flows/gameFlow';
import { getNextStep } from '../services/gameService';
import { useGameStateStore } from '../stores/gameStateStore';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { useWorldStateStore } from '../stores/worldStateStore';
import { Choice, GameStepResult, GameState } from '../types';

export const useGameLoop = (
  handleGameEffects: (result: Partial<GameStepResult>) => void,
) => {
  const { isGenerating, setIsGenerating, setGameState } = useGameStateStore();
  const { storyHistory, replaceStoryHistory } = useStoryHistoryStore();
  const { worldState } = useWorldStateStore();
  const autoStartedRef = useRef(false);

  const handleChoice = useCallback(
    async (choice: Choice) => {
      // Prevent duplicate actions while generating
      if (isGenerating) return;
      setIsGenerating(true);

      try {
        // Process the player choice through the game flow
        // This now handles everything internally: AI generation, command execution, and state updates
        await getNextStep(choice);
      } catch (err) {
        console.error('Failed to process choice:', err);
        setGameState(GameState.PLAYING);
      } finally {
        setIsGenerating(false);
      }
    },
    [
      isGenerating,
      setIsGenerating,
      setGameState,
    ],
  );

  // Effect to fetch the first step if history is minimal
  useEffect(() => {
    if (
      !autoStartedRef.current &&
      storyHistory.length === 1 &&
      storyHistory[0].text === worldState.setting
    ) {
      autoStartedRef.current = true;
      void handleChoice({ id: 'auto-start', text: 'Begin the story', isIntrusive: false });
    }
  }, [storyHistory, worldState.setting, handleChoice]);

  return { handleChoice };
};