import { WorldState, StorySegment } from '../../types';
import { apiClient } from '../secureApiClient';

export const summarizeHistoryFlow = async (
  worldState: WorldState,
  lastSegment: StorySegment
): Promise<string> => {
  try {
    console.log('Using secure backend for history summarization...');
    const response = await apiClient.summarizeHistory(worldState, lastSegment);
    return response.summary;
  } catch (error) {
    console.warn('Backend API unavailable, using fallback summarization:', error);
    
    // Fallback to constructed summary
    return `The protagonist finds themselves in ${worldState.setting}, grappling with ${worldState.dilemma}. Their psychological state has shifted to ${worldState.psychologicalStatus}. Most recently: ${lastSegment.text}`;
  }
};
