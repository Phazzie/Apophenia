import { Command, GenreConfig, StorySegment, WorldState } from '../../types';
import { apiClient } from '../secureApiClient';

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
        { text: "Continue investigating the anomalies", isIntrusive: false },
        { text: "Attempt to retreat to safety", isIntrusive: false },
        { text: "Embrace the unknown forces", isIntrusive: true }
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
  try {
    console.log('Generating image using secure backend API...');
    const response = await apiClient.generateImage(prompt);
    return response.fallbackUrl || generateUnsplashFallback(prompt);
  } catch (error) {
    console.warn('Backend API unavailable, using Unsplash fallback:', error);
    return generateUnsplashFallback(prompt);
  }
};

export const processAdvancedImageGeneration = async (prompt: string): Promise<string> => {
  console.log('Advanced AI image generation requested for prompt:', prompt);
  
  try {
    console.log('Attempting secure backend image generation...');
    const response = await apiClient.generateImage(prompt);
    
    if (response.fallbackUrl) {
      console.log('Using curated horror imagery from backend');
      return response.fallbackUrl;
    }
  } catch (error) {
    console.warn('Backend image generation failed:', error);
  }
  
  console.log('Using enhanced Unsplash integration');
  return generateUnsplashFallback(prompt);
};

// Enhanced Unsplash fallback with horror-specific keywords
function generateUnsplashFallback(prompt: string): string {
  const horrorKeywords = [
    'dark', 'horror', 'nightmare', 'cosmic', 'surreal', 'atmospheric', 
    'eerie', 'ominous', 'mysterious', 'otherworldly', 'abstract', 'shadows'
  ];
  
  // Extract meaningful words from prompt
  const promptWords = prompt.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 2);
  
  // Select random horror keywords
  const selectedKeywords = [];
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * horrorKeywords.length);
    selectedKeywords.push(horrorKeywords[randomIndex]);
  }
  
  // Combine with prompt words
  const allKeywords = [...selectedKeywords, ...promptWords];
  const keywordString = allKeywords.join(',');
  
  console.log('Using enhanced Unsplash fallback with keywords:', keywordString);
  
  return `https://source.unsplash.com/1920x1080/?${encodeURIComponent(keywordString)}`;
}