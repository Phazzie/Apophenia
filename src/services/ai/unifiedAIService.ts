/**
 * Unified AI Service with Model Selection and Timeout Protection
 * 
 * Routes AI requests to the appropriate service (Grok or Gemini) based on user selection
 * Includes proper timeout handling and graceful fallbacks as required by service guidelines
 */

import { GenreConfig, WorldState, StorySegment } from '../../types';
import { generateConceptFlow, nextStepFlow } from './genkit';

/**
 * AI models configuration for fallback cascade
 */
export const AI_MODELS = {
  GROK_4: { id: 'grok-4-fast-reasoning', name: 'X.AI Grok-4' },
  GEMINI_PRO: { id: 'gemini-pro', name: 'Gemini Pro' },
  GEMINI_FLASH: { id: 'gemini-flash', name: 'Gemini Flash' },
};

/**
 * Timeout wrapper for AI generation calls with graceful fallback
 * Addresses Critical Issue #1 and #4: Missing AI Call Timeouts
 */
async function withTimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number = 6000,
  fallbackValue?: T
): Promise<T> {
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error(`AI call timeout after ${timeoutMs}ms`)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (error) {
    console.warn(`AI call failed or timed out: ${error}`);
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }
    throw error;
  }
}

/**
 * Mock AI model store for now - in real implementation this would come from a zustand store
 */
const mockModelStore = {
  getSelectedModel: () => ({ id: 'gemini-pro', name: 'Gemini Pro' }),
};

/**
 * Unified text generation that routes to the selected AI model with timeout protection
 * Addresses Critical Issue #1: Missing AI Call Timeouts
 */
export async function generateWithSelectedModel(
  systemInstruction: string,
  prompt: string,
  useCase: 'concept' | 'story' | 'summary' = 'story'
): Promise<any[]> {
  const selectedModel = mockModelStore.getSelectedModel();
  
  if (!selectedModel) {
    console.warn('No AI model selected, falling back to Gemini');
    return await withTimeout(
      generateWithGemini(systemInstruction, prompt, useCase),
      6000,
      [{ type: 'displayText', payload: { content: 'Fallback: Connection to AI service temporarily unavailable.' } }]
    );
  }

  try {
    // First attempt: Selected model with timeout
    if (selectedModel.id === 'grok-4-fast-reasoning') {
      console.log('Using X.AI/Grok-4 for text generation');
      return await withTimeout(
        generateWithGrok(systemInstruction, prompt, useCase),
        6000
      );
    } else {
      console.log('Using Gemini for text generation');
      return await withTimeout(
        generateWithGemini(systemInstruction, prompt, useCase),
        6000
      );
    }
  } catch (error) {
    console.error(`${selectedModel.name} failed, implementing fallback cascade:`, error);
    
    // Addresses Critical Issue #4: Missing Meta Message Timeout + Fallback
    // Implement Grok-4 → Gemini Pro → Gemini Flash fallback cascade
    try {
      console.log('Attempting Gemini Pro fallback...');
      return await withTimeout(
        generateWithGemini(systemInstruction, prompt, useCase),
        4000
      );
    } catch (fallbackError) {
      console.error('Gemini Pro fallback failed, trying Gemini Flash:', fallbackError);
      try {
        return await withTimeout(
          generateWithGeminiFlash(systemInstruction, prompt, useCase),
          3000
        );
      } catch (finalError) {
        console.error('All AI services failed:', finalError);
        return [{ 
          type: 'displayText', 
          payload: { 
            content: 'The cosmic horror infrastructure experiences a momentary disruption... reality flickers.' 
          } 
        }];
      }
    }
  }
}

/**
 * Generate with Gemini (primary fallback)
 */
async function generateWithGemini(
  systemInstruction: string,
  prompt: string,
  useCase: 'concept' | 'story' | 'summary'
): Promise<any[]> {
  // Mock implementation - in real code this would call the actual Gemini service
  return [{ 
    type: 'displayText', 
    payload: { 
      content: `[Gemini Response] ${systemInstruction} - ${prompt.substring(0, 100)}...` 
    } 
  }];
}

/**
 * Generate with Grok (when available)
 */
async function generateWithGrok(
  systemInstruction: string,
  prompt: string,
  useCase: 'concept' | 'story' | 'summary'
): Promise<any[]> {
  // Mock implementation - in real code this would call the actual Grok service
  return [{ 
    type: 'displayText', 
    payload: { 
      content: `[Grok-4 Response] ${systemInstruction} - ${prompt.substring(0, 100)}...` 
    } 
  }];
}

/**
 * Generate with Gemini Flash (final fallback)
 */
async function generateWithGeminiFlash(
  systemInstruction: string,
  prompt: string,
  useCase: 'concept' | 'story' | 'summary'
): Promise<any[]> {
  // Mock implementation - in real code this would call the actual Gemini Flash service
  return [{ 
    type: 'displayText', 
    payload: { 
      content: `[Gemini Flash Response] ${systemInstruction} - ${prompt.substring(0, 50)}...` 
    } 
  }];
}

/**
 * Enhanced concept generation with selected model
 */
export async function generateConceptWithSelectedModel(
  genreConfig: GenreConfig
): Promise<{ protagonist: string; setting: string; dilemma: string }> {
  const selectedModel = mockModelStore.getSelectedModel();
  
  if (selectedModel?.id === 'grok-4-fast-reasoning') {
    console.log('Generating concept with X.AI/Grok-4');
    return await withTimeout(
      generateConceptWithGrok(genreConfig),
      6000,
      {
        protagonist: 'The Digital Wanderer',
        setting: 'A fragmented reality',
        dilemma: 'Searching for authentic existence'
      }
    );
  } else {
    console.log('Generating concept with Gemini');
    return await withTimeout(
      generateConceptFlow(genreConfig),
      6000,
      {
        protagonist: 'The Seeker',
        setting: 'An uncertain world',
        dilemma: 'Confronting the unknown'
      }
    );
  }
}

/**
 * Generate concept with Grok
 */
async function generateConceptWithGrok(genreConfig: GenreConfig): Promise<{ protagonist: string; setting: string; dilemma: string }> {
  // Mock implementation
  return {
    protagonist: 'The AI-Enhanced Explorer',
    setting: 'A reality where AI and consciousness merge',
    dilemma: 'Determining what is real and what is digital'
  };
}

/**
 * Next step generation with selected model
 * Addresses Critical Issue #7: Wrong Parameter to Next-Step Generator
 */
export async function generateNextStepWithSelectedModel(
  playerChoice: string, // Using original playerChoice parameter as required
  worldState: WorldState,
  storyHistory: StorySegment[],
  genreConfig: GenreConfig
): Promise<any[]> {
  const selectedModel = mockModelStore.getSelectedModel();
  
  if (selectedModel?.id === 'grok-4-fast-reasoning') {
    console.log('Generating next step with X.AI/Grok-4');
    return await withTimeout(
      generateNextStepWithGrok(playerChoice, worldState, storyHistory, genreConfig),
      6000
    );
  } else {
    console.log('Generating next step with Gemini');
    return await withTimeout(
      nextStepFlow({
        playerChoice, // Using original playerChoice, not personalizedPrompt
        worldState,
        history: storyHistory,
        genreConfig
      }),
      6000
    );
  }
}

/**
 * Generate next step with Grok
 */
async function generateNextStepWithGrok(
  playerChoice: string,
  worldState: WorldState,
  storyHistory: StorySegment[],
  genreConfig: GenreConfig
): Promise<any[]> {
  // Mock implementation
  return [{ 
    type: 'displayText', 
    payload: { 
      content: `[Grok Next Step] Player chose: "${playerChoice}" in ${worldState.setting}` 
    } 
  }];
}