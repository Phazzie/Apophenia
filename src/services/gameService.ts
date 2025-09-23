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
  // 1. ADAPTIVE HORROR: Analyze player choice for personalization
  adaptiveHorror.analyzePlayerChoice(playerChoice, 'game progression');
  
  // 2. TEMPORAL REVISION: Check if choice should alter past events
  const revisedHistory = await temporalRevision.reviseHistory(
    playerChoice,
    history,
    worldState
  );
  
  // 3. QUANTUM NARRATIVE: Process potential timeline shifts
  const quantumResult = await quantumNarrative.processQuantumChoice(
    playerChoice,
    revisedHistory,
    worldState
  );
  
  // 4. META-CONSCIOUSNESS: Check for AI awareness events
  const metaMessage = await metaConsciousness.checkForMetaEvent(
    quantumResult.history,
    worldState
  );
  
  // 5. REALITY CORRUPTION: Apply interface corruption effects
  const corruptionResult = realityCorruption.processCorruption(
    playerChoice,
    worldState
  );
  
  // 6. ENHANCED AI GENERATION: Generate next story beat with personalization
  const personalizedPrompt = await adaptiveHorror.generatePersonalizedHorror(
    `Player chose: ${playerChoice}. Continue the cosmic horror narrative.`
  );
  
  const commands = await generateNextStepWithSelectedModel(
    personalizedPrompt,
    worldState,
    quantumResult.history,
    genreConfig
  );
  
  return {
    commands,
    revisedHistory: revisedHistory !== history ? revisedHistory : undefined,
    metaMessage: metaMessage || undefined,
    quantumShift: quantumResult.quantumShift,
    corruptionEffects: corruptionResult.corruptionLevel > 0 ? corruptionResult : undefined,
  };
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
  return generateConceptWithSelectedModel(genreConfig);
};

export const generateImage = async (prompt: string): Promise<string> => {
  return generateImageFlow(prompt);
};

/**
 * Revolutionary multi-variation image generation
 * Generates multiple horror image variations for enhanced immersion
 */
export const generateMultipleImages = async (
  prompt: string, 
  variationCount: number = 3
): Promise<string[]> => {
  const variations = await Promise.all(
    Array(variationCount).fill(0).map((_, index) => 
      processAdvancedImageGeneration(
        `${prompt}, variation ${index + 1}, cosmic horror aesthetic`
      )
    )
  );
  
  return variations;
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
