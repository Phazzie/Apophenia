import { WorldState, StorySegment } from '../../types';

export const summarizeHistoryFlow = async (
  worldState: WorldState,
  lastSegment: StorySegment
): Promise<string> => {
  // In a real app, this would send the history to the AI for summarization
  console.log('Summarizing history...');
  return `The protagonist is feeling ${worldState.psychologicalStatus}. The last thing that happened was: ${lastSegment.text}`;
};
