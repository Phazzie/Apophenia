/**
 * Client-Side AI Flow Manager
 * Uses the unified AI service to generate content directly on the client
 * Falls back to secure backend API if needed
 */

import { Command, GameCommand, GenreConfig, StorySegment, WorldState } from '../../types';
import { 
  generateConceptWithSelectedModel, 
  generateNextStepWithSelectedModel, 
  getSelectedModel 
} from './unifiedAIService';
import { apiClient } from '../secureApiClient';

// Fallback content for when AI generation fails
const getFallbackConcept = (genreConfig: GenreConfig) => ({
  protagonist: "A researcher investigating anomalous phenomena",
  setting: "An abandoned facility where reality seems unstable",
  dilemma: "Strange forces are affecting the fabric of existence itself"
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
        { text: "Continue investigating the anomalies", isIntrusive: false },
        { text: "Attempt to retreat to safety", isIntrusive: false },
        { text: "Embrace the unknown forces", isIntrusive: true }
      ]
    }
  }
];

/**
 * Enhanced concept generation using selected AI model
 */
export const generateConceptFlow = async (genreConfig: GenreConfig) => {
  try {
    const selectedModel = getSelectedModel();
    console.log(`Generating concept using ${selectedModel}...`);
    
    const concept = await generateConceptWithSelectedModel(genreConfig);
    console.log('Concept generated successfully:', concept);
    
    return concept;
  } catch (error) {
    console.warn('AI concept generation failed, trying backend fallback:', error);
    
    try {
      // Fallback to secure backend API
      const concept = await apiClient.generateConcept(genreConfig);
      return concept;
    } catch (backendError) {
      console.error('Both AI and backend concept generation failed:', backendError);
      return getFallbackConcept(genreConfig);
    }
  }
};

/**
 * Enhanced next step generation using selected AI model
 */
export const nextStepFlow = async (input: {
  playerChoice: string;
  worldState: WorldState;
  history: StorySegment[];
  genreConfig: GenreConfig;
}): Promise<Command[]> => {
  try {
    const selectedModel = getSelectedModel();
    console.log(`Generating next step using ${selectedModel}...`);
    
    const commands = await generateNextStepWithSelectedModel(
      input.playerChoice,
      input.worldState,
      input.history,
      input.genreConfig
    );
    
    console.log('Next step generated successfully:', commands.length, 'commands');
    
    // Convert GameCommands to Commands if needed
    return commands.map(cmd => ({
      type: cmd.type,
      payload: cmd.payload
    })) as Command[];
    
  } catch (error) {
    console.warn('AI next step generation failed, trying backend fallback:', error);
    
    try {
      // Fallback to secure backend API
      const result = await apiClient.getNextStep(
        input.playerChoice,
        input.worldState,
        input.history,
        input.genreConfig
      );
      return result.commands || getFallbackCommands();
    } catch (backendError) {
      console.error('Both AI and backend next step generation failed:', backendError);
      return getFallbackCommands();
    }
  }
};

/**
 * Image generation flow - currently delegates to backend
 */
export const generateImageFlow = async (prompt: string): Promise<string> => {
  try {
    console.log('Generating image via backend API...');
    const result = await apiClient.generateImage(prompt);
    return result.imageUrl || result;
  } catch (error) {
    console.warn('Image generation failed, using fallback:', error);
    // Return enhanced Unsplash fallback
    const keywords = prompt
      .toLowerCase()
      .split(' ')
      .filter(word => word.length > 3)
      .slice(0, 3)
      .join(',');
    
    return `https://source.unsplash.com/1920x1080/?dark,horror,surreal,abstract,${keywords}`;
  }
};

/**
 * Advanced image processing for cosmic horror themes
 */
export const processAdvancedImageGeneration = async (prompt: string): Promise<string> => {
  // For now, delegate to regular image generation
  // This can be enhanced later with specific AI image models
  return generateImageFlow(prompt);
};