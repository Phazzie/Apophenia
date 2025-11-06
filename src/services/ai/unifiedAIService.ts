/**
 * Unified AI Service with Model Selection
 *
 * Routes AI requests to the appropriate service (Grok or Gemini) based on user selection
 */

import { useAIModelStore } from '../../stores/aiModelStore';
import { xaiClient } from './grokService';
import { generateConceptFlow, nextStepFlow } from './genkit';
import { GameCommand, GenreConfig, WorldState, StorySegment } from '../../types';
import { AI_MODELS } from '../config';
import { extractJSONArray, extractJSONObject } from '../../utils/jsonExtractor';
import {
  COSMIC_HORROR_ENTITY_SYSTEM,
  buildGrokConceptPrompt,
  buildGrokNextStepPrompt,
} from './promptTemplates';

// Helper to get the full, current game state for fallback operations
function getFullGameState(playerChoice: string, worldState: WorldState, storyHistory: StorySegment[]) {
  return {
    playerChoice,
    worldState,
    history: storyHistory,
    genreConfig: worldState.genreConfig,
  };
}

/**
 * Unified text generation that routes to the selected AI model
 */
export async function generateWithSelectedModel(
  systemInstruction: string,
  prompt: string,
  worldState: WorldState,
  storyHistory: StorySegment[],
  useCase: 'concept' | 'story' | 'summary' = 'story'
): Promise<GameCommand[]> {
  const selectedModel = useAIModelStore.getState().getSelectedModel();
  const gameState = getFullGameState(prompt, worldState, storyHistory);

  if (!selectedModel) {
    console.warn('No AI model selected, falling back to Gemini');
    return generateWithGemini(gameState);
  }

  try {
    if (selectedModel.id === 'grok-4-fast') {
      console.log('Using X.AI/grok-4-fast for text generation');
      return await generateWithGrok(systemInstruction, prompt, gameState);
    } else {
      console.log('Using Gemini for text generation');
      return await generateWithGemini(gameState);
    }
  } catch (error) {
    console.error(`${selectedModel.name} failed, falling back to Gemini:`, error);
    return await generateWithGemini(gameState);
  }
}

/**
 * Generate with X.AI Grok-4 Fast
 */
async function generateWithGrok(
  systemInstruction: string,
  prompt: string,
  gameState: any, // Using 'any' to avoid circular dependency issues with full type import
  useCase: 'concept' | 'story' | 'summary' = 'story'
): Promise<GameCommand[]> {
  try {
    const config = getConfigForUseCase(useCase);
    
    console.log('Generating with X.AI grok-4-fast:', { useCase, config });
    const result = await xaiClient.generateText(systemInstruction, prompt, {
      temperature: config.temperature,
      maxTokens: config.maxOutputTokens,
      topP: config.topP,
      enableThinking: config.enableThinking,
    });

    const content = result.content;
    const commands = extractJSONArray(content, true); // Clean markdown and extract array

    if (!Array.isArray(commands)) {
      console.error('Invalid command format from X.AI:', commands);
      throw new Error('Invalid command format from X.AI');
    }

    console.log('X.AI generated', commands.length, 'commands');
    return commands;
  } catch (error) {
    console.warn('X.AI Grok generation failed, falling back to Gemini:', error);
    return generateWithGemini(gameState);
  }
}

/**
 * Generate with Gemini (fallback)
 */
async function generateWithGemini(gameState: {
  playerChoice: string;
  worldState: WorldState;
  history: StorySegment[];
  genreConfig: GenreConfig;
}): Promise<GameCommand[]> {
  console.log('Executing Gemini fallback...');
  return await nextStepFlow(gameState);
}

/**
 * Get configuration for use case
 */
function getConfigForUseCase(useCase: 'concept' | 'story' | 'summary') {
  switch (useCase) {
    case 'concept':
      return AI_MODELS.CONCEPT_GENERATION;
    case 'summary':
      return AI_MODELS.SUMMARIZATION;
    case 'story':
    default:
      return AI_MODELS.STORY_PROGRESSION;
  }
}

/**
 * Enhanced concept generation with selected model
 */
export async function generateConceptWithSelectedModel(
  genreConfig: GenreConfig
): Promise<{ protagonist: string; setting: string; dilemma: string }> {
  const selectedModel = useAIModelStore.getState().getSelectedModel();
  
  if (selectedModel?.id === 'grok-4-fast') {
    console.log('Generating concept with X.AI/grok-4-fast');
    return await generateConceptWithGrok(genreConfig);
  } else {
    console.log('Generating concept with Gemini');
    return await generateConceptFlow(genreConfig);
  }
}

/**
 * Concept generation with X.AI Grok-4
 */
async function generateConceptWithGrok(
  genreConfig: GenreConfig
): Promise<{ protagonist: string; setting: string; dilemma: string }> {
  // Use centralized prompt templates for Grok
  const systemInstruction = `${COSMIC_HORROR_ENTITY_SYSTEM}\n\nENHANCED REASONING DIRECTIVE: You are now powered by X.AI Grok-4 Fast Reasoning with 2 million token context...`;
  const prompt = buildGrokConceptPrompt(genreConfig.name, genreConfig.style);

  try {
    const result = await xaiClient.generateText(systemInstruction, prompt, {
      temperature: AI_MODELS.CONCEPT_GENERATION.temperature,
      maxTokens: 4096,
      topP: AI_MODELS.CONCEPT_GENERATION.topP,
      enableThinking: true,
    });

    const content = result.content;
    const json = extractJSONObject(content, true);

    return {
      protagonist: json.protagonist || 'A confused individual',
      setting: json.setting || 'A reality that cannot be trusted',
      dilemma: json.dilemma || 'Every choice leads to horror',
    };
  } catch (error) {
    console.warn('X.AI concept generation failed, falling back to Gemini:', error);
    return await generateConceptFlow(genreConfig);
  }
}

/**
 * Next step generation with selected model
 */
export async function generateNextStepWithSelectedModel(
  playerChoice: string,
  worldState: WorldState,
  storyHistory: StorySegment[],
  genreConfig: GenreConfig
): Promise<GameCommand[]> {
  const selectedModel = useAIModelStore.getState().getSelectedModel();
  const gameState = getFullGameState(playerChoice, worldState, storyHistory);

  if (selectedModel?.id === 'grok-4-fast') {
    console.log('Generating next step with X.AI/grok-4-fast');
    return await generateNextStepWithGrok(playerChoice, worldState, storyHistory, genreConfig);
  } else {
    console.log('Generating next step with Gemini');
    return await generateWithGemini(gameState);
  }
}

/**
 * Next step generation with X.AI Grok-4
 */
async function generateNextStepWithGrok(
  playerChoice: string,
  worldState: WorldState,
  storyHistory: StorySegment[],
  genreConfig: GenreConfig
): Promise<GameCommand[]> {
  // Use centralized prompt templates for Grok
  const systemInstruction = `${COSMIC_HORROR_ENTITY_SYSTEM}\n\nX.AI GROK-4 ENHANCED REASONING: You have 2 million token context...`;
  const prompt = buildGrokNextStepPrompt(worldState, storyHistory, playerChoice);

  const gameState = getFullGameState(playerChoice, worldState, storyHistory);

  return await generateWithGrok(systemInstruction, prompt, gameState, 'story');
}
