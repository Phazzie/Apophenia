import {
  generateConceptFlow,
  generateImageFlow,
  nextStepFlow,
} from './ai/genkit'; // Using the real Genkit flow
import { summarizeHistoryFlow } from './flows/summaryFlow';
import { GenreConfig, WorldState, StorySegment, GameCommand } from '../types';

/**
 * A higher-order function to wrap AI flow calls with consistent error handling.
 * @param flow The AI flow function to execute.
 * @param flowName The name of the flow for logging purposes.
 * @param fallback A function that returns a fallback value in case of an error.
 * @returns An async function that executes the flow with error handling.
 */
const withAIFlowHandling = <T extends any[], R>(
  flow: (...args: T) => Promise<R>,
  flowName: string,
  fallback: () => R
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await flow(...args);
    } catch (error) {
      console.error(`Error calling ${flowName}:`, error);
      return fallback();
    }
  };
};

// --- Fallback Value Generators ---

const getNextStepFallback = (): GameCommand[] => [
  {
    type: 'displayText',
    payload: { content: 'The connection wavers. The signal is lost in static. You are alone.' },
  },
  {
    type: 'displayChoices',
    payload: {
      choices: [
        { text: 'Try to reconnect', isIntrusive: false },
        { text: 'Wait', isIntrusive: false },
      ],
    },
  },
];

const generateConceptFallback = (): { protagonist: string; setting: string; dilemma: string } => ({
  protagonist: 'A jaded detective',
  setting: 'A rain-slicked city in the near future',
  dilemma: 'A case that defies logic',
});

const generateImageFallback = (): string => `https://picsum.photos/seed/${Math.random()}/1920/1080`;

// --- Service Functions ---

export const getNextStep = withAIFlowHandling(
  async (playerChoice: string, worldState: WorldState, history: StorySegment[], genreConfig: GenreConfig) =>
    nextStepFlow({ playerChoice, worldState, history, genreConfig }),
  'nextStepFlow',
  getNextStepFallback
);

export const summarizeHistory = async (
  worldState: WorldState,
  lastSegment: StorySegment
) => {
  // This flow is non-critical and doesn't have a fallback, so we call it directly.
  // A more robust implementation might also wrap this.
  return await summarizeHistoryFlow(worldState, lastSegment);
};

export const generateConcept = withAIFlowHandling(
  generateConceptFlow,
  'generateConceptFlow',
  generateConceptFallback
);

export const generateImage = withAIFlowHandling(
  generateImageFlow,
  'generateImageFlow',
  generateImageFallback
);
