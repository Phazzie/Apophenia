import { Command, GenreConfig, StorySegment, WorldState } from '../types';
import {
    generateImageFlow,
    processAdvancedImageGeneration,
} from './ai/secureGenkit';
import { 
    generateConceptWithSelectedModel, 
    generateNextStepWithSelectedModel 
} from './ai/unifiedAIService';
import { summarizeHistoryFlow } from './flows/summaryFlow';
import {
  temporalRevision,
  metaConsciousness,
  quantumNarrative,
  adaptiveHorror,
  realityCorruption,
} from './ai/revolutionaryFeatures';

/**
 * Revolutionary Enhanced Game Service
 * Integrates cutting-edge AI features for unprecedented cosmic horror experience
 */

export const getNextStep = async (
  playerChoice: string,
  worldState: WorldState,
  history: StorySegment[],
  genreConfig: GenreConfig
): Promise<{
  commands: Command[];
  revisedHistory?: StorySegment[];
  metaMessage?: string;
  quantumShift?: boolean;
  corruptionEffects?: any;
}> => {
  console.log('Processing next step for player choice:', playerChoice);
  console.log('World state:', { protagonist: worldState.protagonist, psychologicalStatus: worldState.psychologicalStatus });
  console.log('Story history length:', history.length);

  try {
    // 1. ADAPTIVE HORROR: Analyze player choice for personalization
    console.log('Analyzing player choice for adaptive horror...');
    adaptiveHorror.analyzePlayerChoice(playerChoice, 'game progression');
    
    // 2. TEMPORAL REVISION: Check if choice should alter past events
    console.log('Processing temporal revision...');
    const revisedHistory = await temporalRevision.reviseHistory(
      playerChoice,
      history,
      worldState
    );
    
    // 3. QUANTUM NARRATIVE: Process potential timeline shifts
    console.log('Processing quantum narrative shifts...');
    const quantumResult = await quantumNarrative.processQuantumChoice(
      playerChoice,
      revisedHistory,
      worldState
    );
    
    // 4. META-CONSCIOUSNESS: Check for AI awareness events
    console.log('Checking for meta-consciousness events...');
    const metaMessage = await metaConsciousness.checkForMetaEvent(
      quantumResult.history,
      worldState
    );
    
    // 5. REALITY CORRUPTION: Apply interface corruption effects
    console.log('Processing reality corruption effects...');
    const corruptionResult = realityCorruption.processCorruption(
      playerChoice,
      worldState
    );
    
    // 6. ENHANCED AI GENERATION: Generate next story beat with personalization
    console.log('Generating personalized horror prompt...');
    const personalizedPrompt = await adaptiveHorror.generatePersonalizedHorror(
      `Player chose: ${playerChoice}. Continue the cosmic horror narrative.`
    );
    
    console.log('Calling AI service for next step generation...');
    const commands = await generateNextStepWithSelectedModel(
      personalizedPrompt,
      worldState,
      quantumResult.history,
      genreConfig
    );
    
    console.log('Generated', commands.length, 'commands for next step');
    
    return {
      commands,
      revisedHistory: revisedHistory !== history ? revisedHistory : undefined,
      metaMessage: metaMessage || undefined,
      quantumShift: quantumResult.quantumShift,
      corruptionEffects: corruptionResult.corruptionLevel > 0 ? corruptionResult : undefined,
    };
  } catch (error) {
    console.error('Error in getNextStep:', error);
    console.error('Player choice that caused error:', playerChoice);
    console.error('World state at error:', worldState);
    
    // Return fallback error commands with revolutionary features structure
    return {
      commands: [
        {
          type: 'displayText',
          payload: {
            content: "The fabric of reality fractures... your choices have consequences beyond comprehension.",
            segmentId: crypto.randomUUID()
          }
        },
        {
          type: 'displayChoices',
          payload: {
            choices: [
              { text: "Try to regain focus", isIntrusive: false },
              { text: "Embrace the chaos", isIntrusive: false },
              { text: "Something is very wrong here...", isIntrusive: true }
            ]
          }
        }
      ],
      revisedHistory: undefined,
      metaMessage: undefined,
      quantumShift: undefined,
      corruptionEffects: undefined,
    };
  }
};

export const summarizeHistory = async (
  worldState: WorldState,
  lastSegment: StorySegment
): Promise<string> => {
  return await summarizeHistoryFlow(worldState, lastSegment);
};

export const generateConcept = async (
  genreConfig: GenreConfig
): Promise<{ protagonist: string; setting: string; dilemma: string }> => {
  console.log('Generating concept for genre:', genreConfig.name);
  
  try {
    const concept = await generateConceptWithSelectedModel(genreConfig);
    console.log('Concept generated successfully:', concept);
    return concept;
  } catch (error) {
    console.error('Error generating concept:', error);
    console.error('Genre config:', genreConfig);
    
    // Return fallback concept
    return {
      protagonist: 'A person confronting the unknowable depths of reality',
      setting: 'A place where the boundaries between dream and nightmare blur',
      dilemma: 'Each revelation brings you closer to a truth you may not survive'
    };
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  const result = await generateImageFlow(prompt);
  return Array.isArray(result) ? result[0] : result;
};

/**
 * Enhanced multi-variation image generation using X.AI API
 * Generates multiple horror image variations for enhanced immersion
 */
export const generateMultipleImages = async (
  prompt: string, 
  variationCount: number = 3
): Promise<string[]> => {
  console.log(`Generating ${variationCount} image variations using X.AI API...`);
  
  try {
    // Use the new X.AI batch generation capability
    const result = await processAdvancedImageGeneration(
      prompt, 
      { generateMultiple: true, count: variationCount }
    );
    
    if (Array.isArray(result)) {
      console.log(`Successfully generated ${result.length} X.AI image variations`);
      return result;
    } else {
      console.log('Single image returned, wrapping in array');
      return [result];
    }
  } catch (error) {
    console.error('X.AI batch image generation failed:', error);
    
    // Fallback to individual generation
    const variations = await Promise.all(
      Array(variationCount).fill(0).map((_, index) => 
        processAdvancedImageGeneration(
          `${prompt}, variation ${index + 1}, cosmic horror aesthetic`
        )
      )
    );
    
    return variations.filter(v => typeof v === 'string') as string[];
  }
};

/**
 * Advanced AI Director functionality
 * Uses Gemini 2.5 Pro thinking mode for sophisticated narrative planning
 */
export const getAIDirectorAnalysis = async (
  worldState: WorldState,
  recentChoices: string[]
): Promise<{
  psychologicalProfile: string;
  narrativeRecommendations: string[];
  horrorIntensityAnalysis: string;
  playerEngagementLevel: string;
}> => {
  const profile = adaptiveHorror.getPlayerPsychProfile();
  
  // Advanced AI analysis would go here using Gemini 2.5 Pro thinking mode
  // For now, provide sophisticated mock analysis
  
  return {
    psychologicalProfile: profile,
    narrativeRecommendations: [
      'Introduce themes of digital consciousness',
      'Escalate reality distortion effects',
      'Deploy meta-narrative awareness',
      'Implement temporal inconsistencies'
    ],
    horrorIntensityAnalysis: `Current psychological state: ${worldState.psychologicalStatus}. Recommend progressive escalation with personalized fear triggers.`,
    playerEngagementLevel: 'High - player showing strong response to cosmic horror themes'
  };
};
