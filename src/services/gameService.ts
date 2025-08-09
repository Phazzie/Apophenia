import {
  generateConceptFlow,
  nextStepFlow,
  hauntingFlow,
  generateImageFlow,
} from './flows/gameFlow';
import { summarizeHistoryFlow } from './flows/summaryFlow';
import { GenreConfig, WorldState, StorySegment } from '../types';

export const getNextStep = async (
  playerChoice: string,
  worldState: WorldState,
  history: any[],
  genreConfig: GenreConfig
) => {
  return await nextStepFlow(playerChoice, worldState, history, genreConfig);
};

export const summarizeHistory = async (
  worldState: WorldState,
  lastSegment: StorySegment
) => {
  return await summarizeHistoryFlow(worldState, lastSegment);
};

export const generateConcept = async (genreConfig: GenreConfig) => {
  return await generateConceptFlow(genreConfig);
};

export const getHauntingWhisper = async () => {
  return await hauntingFlow();
};

export const generateImage = async (prompt: string) => {
  return await generateImageFlow(prompt);
};
