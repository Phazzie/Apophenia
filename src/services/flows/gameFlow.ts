import { useWorldStateStore } from '../../stores/worldStateStore';
import { StorySegment, WorldState } from '../../types';
import { summarizeHistory } from '../gameService';

/**
 * Game Flow Utilities
 *
 * Note: This file used to be a pass-through for AI generation functions,
 * but those should now be imported directly from unifiedAIService.ts.
 * Only the triggerSummary utility remains here.
 */

/**
 * Trigger a background summary generation for the current world state
 * Updates the world state store when the summary is complete
 */
export const triggerSummary = (
  worldState: WorldState,
  history: StorySegment[]
) => {
  if (history.length > 0) {
    const summaryPromise = summarizeHistory(worldState, history[history.length - 1]);

    // Guard against undefined/null promises
    if (summaryPromise && typeof summaryPromise.then === 'function') {
      summaryPromise
        .then((summary) => {
          if (summary) {
            useWorldStateStore.getState().updateWorldState({ summary });
          }
        })
        .catch((error) => {
          console.warn('Background summary generation failed:', error);
          // Non-critical: summary is a background enhancement, not required for gameplay
        });
    }
  }
};
