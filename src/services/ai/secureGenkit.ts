/**
 * @file secureGenkit.ts
 * @description This service acts as a client to a secure backend API for all AI operations.
 * Instead of making direct calls to AI providers from the frontend (which would expose API keys),
 * this module forwards requests to a dedicated backend server. This is the recommended approach
 * for a production environment to ensure API keys remain confidential. It includes robust
 * fallback mechanisms to ensure the application remains functional even if the backend is unavailable.
 */

import { GameCommand, GenreConfig, StorySegment, WorldState } from '../../types';
import { apiClient } from '../secureApiClient';

/**
 * Provides a static, hardcoded story concept as a fallback.
 * This is used if the secure backend API is unreachable, ensuring the game can still start.
 *
 * @param {GenreConfig} genreConfig - The genre configuration (currently unused but kept for API consistency).
 * @returns {object} A fallback story concept object.
 */
const getFallbackConcept = (genreConfig: GenreConfig) => ({
  protagonist: "A researcher investigating anomalous phenomena",
  setting: "An abandoned facility where reality seems unstable",
  dilemma: "Strange forces are affecting the fabric of existence itself",
  atmosphericDetails: "Shadows move independently, and whispers echo from nowhere",
  imagePrompt: "Dark abandoned facility, cosmic horror atmosphere, reality distortion"
});

/**
 * Provides a static, hardcoded set of game commands as a fallback.
 * This is used if the secure backend fails to generate the next story step,
 * allowing the narrative to continue in a limited, predefined way.
 *
 * @returns {GameCommand[]} A fallback array of game commands.
 */
const getFallbackCommands = (): GameCommand[] => [
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
 * Securely generates a new story concept by calling the backend API.
 * If the backend is unavailable, it returns a static fallback concept.
 *
 * @param {GenreConfig} genreConfig - The configuration for the selected genre.
 * @returns {Promise<object>} A promise that resolves to the generated or fallback story concept.
 */
export const generateConceptFlow = async (genreConfig: GenreConfig) => {
  try {
    console.log('Generating concept using secure backend API...');
    const concept = await apiClient.generateConcept(genreConfig);
    return concept;
  } catch (error) {
    console.warn('Backend API unavailable, using fallback concept:', error);
    return getFallbackConcept(genreConfig);
  }
};

/**
 * Securely generates the next set of game commands by calling the backend API.
 * It sends the current game state and player choice to the backend for processing.
 * If the backend is unavailable, it returns a static set of fallback commands.
 *
 * @param {object} input - An object containing the full context for the next step.
 * @returns {Promise<GameCommand[]>} A promise that resolves to the generated or fallback commands.
 */
export const nextStepFlow = async (input: {
  playerChoice: string;
  worldState: WorldState;
  history: StorySegment[];
  genreConfig: GenreConfig;
}): Promise<GameCommand[]> => {
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

/**
 * Securely requests an image URL from the backend API.
 * The backend handles the actual image generation, keeping the AI provider details private.
 * If the backend fails, it falls back to generating an image URL from Unsplash.
 *
 * @param {string} prompt - The prompt for the image.
 * @returns {Promise<string>} A promise that resolves to the generated or fallback image URL.
 */
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

/**
 * A wrapper for securely requesting an image from the backend.
 * This function is part of the advanced image generation flow and prioritizes the secure backend.
 *
 * @param {string} prompt - The prompt for the image.
 * @returns {Promise<string>} A promise that resolves to the generated or fallback image URL.
 */
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

/**
 * Generates a fallback image URL from Unsplash with horror-specific keywords.
 * This function is used as the final fallback if all other image generation methods fail.
 *
 * @param {string} prompt - The original prompt, used to extract relevant keywords.
 * @returns {string} A URL for a random image from Unsplash.
 */
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