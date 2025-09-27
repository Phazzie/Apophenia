/**
 * @file summaryFlow.ts
 * @description This file defines the flow for summarizing the game's narrative history.
 * It primarily relies on a secure backend service to perform the summarization,
 * ensuring that the core AI logic remains off the client.
 */

import { WorldState, StorySegment } from '../../types';
import { apiClient } from '../secureApiClient';

/**
 * Summarizes the story history by sending the current world state and the last story segment
 * to a secure backend API. This approach keeps the main AI model and summarization logic
 * server-side, which is crucial for maintaining context in long-running games without
 * sending the entire story history over the network repeatedly.
 *
 * Provides a simple, structured fallback summary if the backend is unavailable.
 *
 * @param {WorldState} worldState - The current state of the game world.
 * @param {StorySegment} lastSegment - The most recent segment of the story.
 * @returns {Promise<string>} A promise that resolves to the AI-generated summary or a fallback string.
 */
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
