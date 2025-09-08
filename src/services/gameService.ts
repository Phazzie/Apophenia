import { Command, GenreConfig, StorySegment, WorldState } from '../types';
import {
    generateConceptFlow,
    generateImageFlow,
    nextStepFlow,
} from './ai/genkit';
import { summarizeHistoryFlow } from './flows/summaryFlow';

export const getNextStep = async (
  playerChoice: string,
  worldState: WorldState,
  history: StorySegment[],
  genreConfig: GenreConfig
): Promise<Command[]> => {
  return nextStepFlow({ playerChoice, worldState, history, genreConfig });
};

export const summarizeHistory = async (
  worldState: WorldState,
  lastSegment: StorySegment
): Promise<string> => {
  return await summarizeHistoryFlow(worldState, lastSegment);
};

export const generateConcept = async (
  genreConfig: GenreConfig
): Promise<{ protagonist: string; setting: string; dilemma: string }> => {
  return generateConceptFlow(genreConfig);
};

export const generateImage = async (prompt: string): Promise<string> => {
  return generateImageFlow(prompt);
};
