import { Command, GameCommand, GenreConfig, StorySegment, WorldState } from '../../types';
import { apiClient } from '../secureApiClient';

/**
 * Secure AI Integration for Apophenia
 * Uses backend API to keep Google AI keys secure
 * No API keys exposed to frontend
 */

// Fallback content for when backend is unavailable
const getFallbackConcept = (genreConfig: GenreConfig) => ({
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
  console.log('Generating concept using secure backend API...');
  
  try {
    const concept = await apiClient.generateConcept(genreConfig);
    
    // Validate the response has the expected structure
    if (concept && typeof concept === 'object' && concept.protagonist && concept.setting && concept.dilemma) {
      console.log('Successfully generated concept from backend API');
      return concept;
    } else {
      console.warn('Backend returned invalid concept format, using fallback');
      throw new Error('Invalid concept format from backend');
    }
    
  } catch (error) {
    console.warn('Backend API unavailable for concept generation, using fallback:', error);
    
    // Return contextually appropriate fallback based on genre
    const fallback = getFallbackConcept(genreConfig);
    console.log('Using genre-appropriate concept fallback');
    return fallback;
  }
};

export const nextStepFlow = async (input: {
  playerChoice: string;
  worldState: WorldState;
  history: StorySegment[];
  genreConfig: GenreConfig;
}): Promise<Command[]> => {
  console.log('Generating next step using secure backend API...');
  
  try {
    const { playerChoice, worldState, history, genreConfig } = input;
    
    const response = await apiClient.getNextStep(playerChoice, worldState, history, genreConfig);
    
    // Validate response structure
    if (response && response.commands && Array.isArray(response.commands) && response.commands.length > 0) {
      console.log(`Successfully generated ${response.commands.length} commands from backend API`);
      return response.commands;
    } else if (response && response.fallbackUrl) {
      // Handle case where backend provides fallback URL but no commands
      console.log('Backend provided fallback URL, generating appropriate commands');
      return getFallbackCommands();
    } else {
      console.warn('Backend returned invalid or empty response, using fallback commands');
      throw new Error('Invalid response format from backend');
    }
    
  } catch (error) {
    console.warn('Backend API unavailable for next step, using intelligent fallback:', error);
    
    // Use contextual fallback based on player choice and world state
    return getContextualFallbackCommands(input.playerChoice, input.worldState);
  }
};

/**
 * Generate contextual fallback commands based on player choice and world state
 */
function getContextualFallbackCommands(playerChoice: string, worldState: WorldState): Command[] {
  // Analyze choice for better fallback content
  const choice = playerChoice.toLowerCase();
  let contextualContent: string;
  
  if (choice.includes('investigate') || choice.includes('examine') || choice.includes('look')) {
    contextualContent = "Your investigation reveals disturbing patterns in the environment. Each detail you uncover seems to connect to something larger and more incomprehensible.";
  } else if (choice.includes('run') || choice.includes('escape') || choice.includes('retreat')) {
    contextualContent = "Your attempt to flee is hindered by the strange geometry of this place. The paths seem to shift when you're not looking directly at them.";
  } else if (choice.includes('attack') || choice.includes('fight') || choice.includes('confront')) {
    contextualContent = "Your aggressive action has unexpected consequences. The forces you're dealing with don't respond to violence in conventional ways.";
  } else {
    contextualContent = "The cosmic forces continue to manifest around you, bending reality in impossible ways. You sense that your choices will echo through dimensions you cannot comprehend.";
  }
  
  // Adjust content based on psychological status
  if (worldState.psychologicalStatus !== 'Stable') {
    contextualContent += ` Your ${worldState.psychologicalStatus.toLowerCase()} state makes everything seem more intense and meaningful.`;
  }
  
  return [
    {
      type: 'displayText' as const,
      payload: {
        content: contextualContent,
        segmentId: `contextual-fallback-${Date.now()}`
      }
    },
    {
      type: 'displayChoices' as const,
      payload: {
        choices: [
          { text: "Continue forward despite the uncertainty", isIntrusive: false },
          { text: "Try to understand what's happening", isIntrusive: false },
          { text: "Embrace the chaos completely", isIntrusive: true }
        ]
      }
    }
  ];
}

export const generateImageFlow = async (prompt: string): Promise<string> => {
  console.log('Generating image using secure backend API...');
  
  try {
    const response = await apiClient.generateImage(prompt);
    
    // Check for various response formats
    if (response) {
      if (response.imageUrl) {
        console.log('Successfully generated image from backend API');
        return response.imageUrl;
      } else if (response.fallbackUrl) {
        console.log('Backend provided fallback image URL');
        return response.fallbackUrl;
      } else if (typeof response === 'string' && response.startsWith('http')) {
        console.log('Backend returned direct image URL');
        return response;
      }
    }
    
    console.warn('Backend returned invalid image response format');
    throw new Error('Invalid image response format from backend');
    
  } catch (error) {
    console.warn('Backend API unavailable for image generation, using enhanced fallback:', error);
    
    // Check if error suggests backend is temporarily unavailable vs permanently broken
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('timeout') || errorMessage.includes('500')) {
      console.log('Backend appears temporarily unavailable, using curated fallback');
    }
    
    return generateUnsplashFallback(prompt);
  }
};

export const processAdvancedImageGeneration = async (prompt: string): Promise<string> => {
  console.log('Advanced AI image generation requested for prompt:', prompt);
  
  try {
    console.log('Attempting secure backend image generation...');
    const response = await apiClient.generateImage(prompt);
    
    if (response) {
      if (response.imageUrl) {
        console.log('Using advanced AI-generated imagery from backend');
        return response.imageUrl;
      } else if (response.fallbackUrl) {
        console.log('Using curated horror imagery from backend');
        return response.fallbackUrl;
      }
    }
    
    throw new Error('No valid image URL in backend response');
    
  } catch (error) {
    console.warn('Backend image generation failed:', error);
  }
  
  console.log('Using enhanced Unsplash integration with horror-specific curation');
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