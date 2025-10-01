import { useWorldStateStore } from '../../stores/worldStateStore';
import { StorySegment, WorldState } from '../../types';
import { summarizeHistory } from '../gameService';

// This file is now a pass-through to the real AI flows in genkit.ts.
// The mock logic has been removed.

export {
    generateConceptFlow, generateImageFlow, nextStepFlow
} from '../ai/genkit';

export const triggerSummary = async (
  worldState: WorldState,
  history: StorySegment[]
) => {
  if (history.length > 0) {
    const summary = await summarizeHistory(worldState, history[history.length - 1]);
    if (summary) {
      useWorldStateStore.getState().updateWorldState({ summary });
    }
  }
};
