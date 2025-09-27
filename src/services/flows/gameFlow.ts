/**
 * @file gameFlow.ts
 * @description This file serves as a primary orchestrator for the main game flows.
 * It re-exports core AI-driven flow functions from the `genkit` service and provides
 * functionality for triggering background tasks, such as summarizing the story history.
 */

import { useWorldStateStore } from '../../stores/worldStateStore';
import { StorySegment, WorldState } from '../../types';
import { summarizeHistory } from '../gameService';

// Re-exporting the core AI flows to provide a clean, centralized access point.
export {
    generateConceptFlow, generateImageFlow, nextStepFlow
} from '../ai/genkit';

/**
 * Triggers a background process to summarize the story history.
 * This is a non-blocking operation that calls the `summarizeHistory` service
 * and updates the `worldStateStore` with the new summary upon completion.
 * It's designed to keep the world state's summary fresh without blocking the main game thread.
 *
 * @param {WorldState} worldState - The current state of the game world.
 * @param {StorySegment[]} history - The full story history to be summarized.
 */
export const triggerSummary = (
  worldState: WorldState,
  history: StorySegment[]
) => {
  if (history.length > 0) {
    summarizeHistory(worldState, history[history.length - 1]).then(
      (summary) => {
        if (summary) {
          useWorldStateStore.getState().updateWorldState({ summary });
        }
      }
    );
  }
};
