import { Command, GenreConfig, StorySegment, WorldState } from '../../types';
import { apiClient } from '../secureApiClient';
import { imageFallbackService } from './imageFallbackService';

/**
 * Secure AI Integration for Apophenia
 * Uses backend API to keep Google AI keys secure
 * No API keys exposed to frontend
 */

// Fallback content for when backend is unavailable
const getFallbackConcept = () => ({
  protagonist: "A researcher investigating anomalous phenomena",
  setting: "An abandoned facility where reality seems unstable",
  dilemma: "Strange forces are affecting the fabric of existence itself",
  atmosphericDetails: "Shadows move independently, and whispers echo from nowhere",
  imagePrompt: "Dark abandoned facility, cosmic horror atmosphere, reality distortion"
});

const getFallbackCommands = (): Command[] => [
  {
    type: 'displayText' as const,
    payload: {
      content: "The cosmic forces continue to manifest around you, bending reality in impossible ways. You sense that your choices will echo through dimensions you cannot comprehend.",
      segmentId: `fallback-${Date.now()}`
    }
  },
  {
    type: 'displayChoices' as const,
    payload: {
      choices: [
        { id: 'choice-1', text: "Continue investigating the anomalies", isIntrusive: false },
        { id: 'choice-2', text: "Attempt to retreat to safety", isIntrusive: false },
        { id: 'choice-3', text: "Embrace the unknown forces", isIntrusive: true }
      ]
    }
  }
];

export const generateConceptFlow = async (genreConfig: GenreConfig) => {
  try {
    console.log('Generating concept using secure backend API...');
    const concept = await apiClient.generateConcept(genreConfig);
    return concept;
  } catch (error) {
    console.warn('Backend API unavailable, using fallback concept:', error);
    return getFallbackConcept();
  }
};

export const nextStepFlow = async (input: {
  playerChoice: string;
  worldState: WorldState;
  history: StorySegment[];
  genreConfig: GenreConfig;
}): Promise<Command[]> => {
  try {
    console.log('Generating next step using secure backend API...');
    const { playerChoice, worldState, history, genreConfig } = input;
    
    const response = await apiClient.getNextStep(playerChoice, worldState, history, genreConfig);
    return response.commands || getFallbackCommands();
  } catch (error) {
    console.warn('Backend API unavailable, using fallback commands:', error);
    return getFallbackCommands();
  }
};

export const generateImageFlow = async (prompt: string): Promise<string> => {
  console.log('Generating image using secure backend API...');

  // Use the unified fallback service with strategy pattern
  const result = await imageFallbackService.generateImage({
    prompt,
    useHorrorIntensity: true,
  });

  return result.url;
};

export const processAdvancedImageGeneration = async (prompt: string): Promise<string> => {
  console.log('Advanced AI image generation requested for prompt:', prompt);

  // Use the unified fallback service with full fallback chain
  const result = await imageFallbackService.generateImage({
    prompt,
    useHorrorIntensity: true,
  });

  return result.url;
};