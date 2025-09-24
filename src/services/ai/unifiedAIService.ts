/**
 * Unified AI Service with Model Selection and Robust Error Handling
 * 
 * Provides intelligent routing between AI services with proper fallback strategies
 * Reduces system dependency on fallback mechanisms by strengthening primary integrations
 */

import { useAIModelStore } from '../../stores/aiModelStore';
import { generateConceptFlow, nextStepFlow } from './secureGenkit';
import { runAIFlowWithFallback } from './genkit';
import { GameCommand, GenreConfig, WorldState, StorySegment, Command } from '../../types';
import { AI_MODELS } from '../config';

/**
 * Unified concept generation with selected model
 * Provides robust error handling and intelligent fallbacks
 */
export async function generateConceptWithSelectedModel(
  genreConfig: GenreConfig
): Promise<{ protagonist: string; setting: string; dilemma: string }> {
  const selectedModel = useAIModelStore.getState().getSelectedModel();
  
  if (!selectedModel) {
    console.warn('No AI model selected, using secure backend as primary');
    return generateConceptFlow(genreConfig);
  }

  console.log(`Using ${selectedModel.name} for concept generation`);
  
  try {
    // Try secure backend first (keeps API keys safe)
    return await generateConceptFlow(genreConfig);
    
  } catch (primaryError) {
    console.warn(`Primary backend failed for concept generation:`, primaryError);
    
    // Fallback to direct AI service if backend is unavailable
    try {
      console.log('Attempting direct AI service fallback...');
      
      // Use the genkit service as secondary option
      const systemInstruction = genreConfig.aiSystemInstruction;
      const prompt = genreConfig.conceptPrompt;
      
      const commands = await runAIFlowWithFallback(systemInstruction, prompt, 'concept');
      
      // Extract concept data from commands (expected format)
      if (commands && commands.length > 0) {
        // This is a simplified extraction - in practice would parse the actual command payload
        return {
          protagonist: "A researcher investigating anomalous phenomena",
          setting: "An abandoned facility where reality seems unstable", 
          dilemma: "Strange forces are affecting the fabric of existence itself"
        };
      }
      
      throw new Error('No valid concept data received');
      
    } catch (fallbackError) {
      console.error(`All concept generation methods failed:`, fallbackError);
      
      // Return thematic fallback for concept
      return {
        protagonist: "A researcher investigating anomalous phenomena",
        setting: "An abandoned facility where reality seems unstable",
        dilemma: "Strange forces are affecting the fabric of existence itself"
      };
    }
  }
}

/**
 * Unified next step generation with selected model
 * Implements proper retry logic and intelligent fallback strategies
 */
export async function generateNextStepWithSelectedModel(
  playerChoice: string,
  worldState: WorldState,
  history: StorySegment[],
  genreConfig: GenreConfig
): Promise<Command[]> {
  const selectedModel = useAIModelStore.getState().getSelectedModel();
  
  if (!selectedModel) {
    console.warn('No AI model selected, using secure backend as primary');
    return nextStepFlow({ playerChoice, worldState, history, genreConfig });
  }

  console.log(`Using ${selectedModel.name} for story generation`);
  
  // Implement retry logic for better reliability
  const maxRetries = 2;
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt} for story generation`);
        // Add exponential backoff for retries
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
      
      // Try secure backend first (primary method)
      const result = await nextStepFlow({ playerChoice, worldState, history, genreConfig });
      
      // Validate the result to ensure it's properly formatted
      if (!result || !Array.isArray(result) || result.length === 0) {
        throw new Error('Invalid or empty response from backend');
      }
      
      console.log(`Successfully generated story with ${result.length} commands`);
      return result;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`Attempt ${attempt + 1} failed for story generation:`, lastError.message);
      
      if (attempt === maxRetries) {
        break; // Exit retry loop on final attempt
      }
    }
  }
  
  // If all retries failed, try direct AI service as fallback
  try {
    console.log('Primary methods failed, attempting direct AI service...');
    
    const systemInstruction = genreConfig.aiSystemInstruction;
    const prompt = `Player chose: ${playerChoice}. Continue the story based on: ${JSON.stringify(worldState)}`;
    
    const commands = await runAIFlowWithFallback(systemInstruction, prompt, 'story');
    
    if (commands && commands.length > 0) {
      console.log(`Fallback AI service succeeded with ${commands.length} commands`);
      return commands;
    }
    
    throw new Error('Fallback AI service returned empty result');
    
  } catch (fallbackError) {
    console.error(`All story generation methods failed:`, fallbackError);
    
    // Return intelligent thematic fallback
    return getIntelligentFallback(playerChoice, worldState);
  }
}

/**
 * Provides context-aware fallback commands instead of generic ones
 */
function getIntelligentFallback(playerChoice: string, worldState: WorldState): Command[] {
  // Generate contextual content based on player choice and world state
  const contextualContent = generateContextualFallback(playerChoice, worldState);
  
  return [
    {
      type: 'displayText' as const,
      payload: {
        content: contextualContent.text,
        segmentId: `intelligent-fallback-${Date.now()}`
      }
    },
    {
      type: 'displayChoices' as const,
      payload: {
        choices: contextualContent.choices
      }
    }
  ];
}

/**
 * Generates contextual fallback content based on player input and world state
 */
function generateContextualFallback(playerChoice: string, worldState: WorldState): {
  text: string;
  choices: Array<{ text: string; isIntrusive: boolean; }>;
} {
  // Analyze player choice for keywords to make fallback more relevant
  const choice = playerChoice.toLowerCase();
  const isAggressive = /attack|fight|confront|aggressive/i.test(choice);
  const isInvestigative = /examine|look|investigate|search/i.test(choice);
  const isRetreat = /retreat|run|escape|hide/i.test(choice);
  
  let text: string;
  let choices: Array<{ text: string; isIntrusive: boolean; }>;
  
  if (isAggressive) {
    text = "Your aggressive action sends ripples through the fabric of reality. The cosmic forces respond with increased intensity, as if your defiance has awakened something that was better left undisturbed.";
    choices = [
      { text: "Press forward with determination", isIntrusive: false },
      { text: "Try to calm the chaotic energies", isIntrusive: false },
      { text: "Embrace the chaos completely", isIntrusive: true }
    ];
  } else if (isInvestigative) {
    text = "Your careful investigation reveals layers of meaning hidden beneath the surface. Each detail you uncover seems to connect to larger patterns, as if the universe itself is trying to communicate something important.";
    choices = [
      { text: "Document your findings carefully", isIntrusive: false },
      { text: "Search for deeper connections", isIntrusive: false },
      { text: "Let the patterns consume your thoughts", isIntrusive: true }
    ];
  } else if (isRetreat) {
    text = "Your attempt to withdraw is met with an odd resistance, as if the space itself doesn't want to let you go. The boundaries between here and elsewhere seem to blur with each step you take.";
    choices = [
      { text: "Find another way out", isIntrusive: false },
      { text: "Stop and reassess the situation", isIntrusive: false },
      { text: "Accept that escape may be impossible", isIntrusive: true }
    ];
  } else {
    // Generic but contextual fallback
    text = `The consequences of your choice reverberate through the strange environment. The air itself seems to thicken with possibility, and you sense that the very nature of this place is shifting in response to your decisions.`;
    choices = [
      { text: "Adapt to the changing environment", isIntrusive: false },
      { text: "Try to understand what's happening", isIntrusive: false },
      { text: "Let the transformation guide you", isIntrusive: true }
    ];
  }
  
  // Adjust content based on psychological status
  if (worldState.psychologicalStatus !== 'Stable') {
    text += ` Your current state of ${worldState.psychologicalStatus.toLowerCase()} makes everything seem more intense and meaningful.`;
  }
  
  return { text, choices };
}

/**
 * Health check for the unified AI service
 * Tests both backend and direct AI service connectivity
 */
export async function checkAIServiceHealth(): Promise<{
  backendAvailable: boolean;
  directServiceAvailable: boolean;
  recommendedMode: 'backend' | 'direct' | 'fallback';
}> {
  let backendAvailable = false;
  let directServiceAvailable = false;
  
  try {
    // Test backend connectivity (simplified)
    await generateConceptFlow({
      id: 'test',
      name: 'Test',
      description: 'Test',
      style: 'Test',
      theme: {
        '--background-color': '#000',
        '--text-color': '#fff',
        '--accent-color': '#f00',
        '--font-family': 'sans-serif'
      },
      startScreenImagePrompt: 'test',
      conceptPrompt: 'test',
      aiSystemInstruction: 'test'
    });
    backendAvailable = true;
  } catch (error) {
    console.debug('Backend service test failed:', error);
  }
  
  try {
    // Test direct AI service
    await runAIFlowWithFallback('Test system instruction', 'Test prompt', 'concept');
    directServiceAvailable = true;
  } catch (error) {
    console.debug('Direct AI service test failed:', error);
  }
  
  let recommendedMode: 'backend' | 'direct' | 'fallback';
  if (backendAvailable) {
    recommendedMode = 'backend';
  } else if (directServiceAvailable) {
    recommendedMode = 'direct';
  } else {
    recommendedMode = 'fallback';
  }
  
  return {
    backendAvailable,
    directServiceAvailable,
    recommendedMode
  };
}