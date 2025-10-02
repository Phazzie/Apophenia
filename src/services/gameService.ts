import { Command, GenreConfig, StorySegment, WorldState } from '../types';
import {
    generateImageFlow,
    processAdvancedImageGeneration,
} from './ai/secureGenkit';
import {
    generateConceptWithSelectedModel,
    generateNextStepWithSelectedModel,
} from './ai/unifiedAIService';
import { summarizeHistoryFlow } from './flows/summaryFlow';
import {
  temporalRevision,
  metaConsciousness,
  quantumNarrative,
  adaptiveHorror,
  realityCorruption,
  neuralEchoChambers,
  semanticArchaeology,
  narrativeDNA,
  fifthWallBreaker,
} from './ai/engines';
import type { RealityCorruptionResult } from './ai/engines/RealityCorruptionEngine';

type NarrativeEvolution = {
  generation: number;
  psychProfile: string;
  hiddenMotivations: string[];
};

/**
 * Revolutionary Enhanced Game Service
 * Integrates cutting-edge AI features for unprecedented cosmic horror experience
 */

// Helper function for Neural Echo Chambers
const _processNeuralEchoes = (playerChoice: string, worldState: WorldState) => {
  console.log('Processing neural echo chambers...');
  neuralEchoChambers.initializeFromPersistence();
  neuralEchoChambers.recordChoice(playerChoice, 'game progression', worldState);
  return neuralEchoChambers.generateEchoPrompt(playerChoice);
};

// Helper function for Semantic Archaeology and Adaptive Horror analysis
const _analyzePlayerChoice = async (
  playerChoice: string,
  worldState: WorldState,
  history: StorySegment[]
) => {
  console.log('Performing semantic choice archaeology and adaptive horror analysis...');
  const allChoices: string[] = [playerChoice];
  const semanticAnalysis = semanticArchaeology.analyzeChoiceSemantics(playerChoice, allChoices);
  await adaptiveHorror.analyzePlayerChoice(
    playerChoice,
    'game progression',
    worldState,
    history
  );
  return semanticAnalysis;
};

// Helper function for Temporal Revision and Quantum Narrative
const _handleTemporalAndQuantumShifts = async (
  playerChoice: string,
  history: StorySegment[],
  worldState: WorldState
) => {
  console.log('Processing temporal revision and quantum narrative shifts...');
  const revisedHistory = await temporalRevision.reviseHistory(
    playerChoice,
    history,
    worldState
  );
  const quantumResult = await quantumNarrative.processQuantumChoice(
    playerChoice,
    revisedHistory,
    worldState
  );
  return { revisedHistory, quantumResult };
};

// Helper function for Meta-Consciousness and Reality Corruption
const _processMetaAndCorruption = async (
  history: StorySegment[],
  playerChoice: string,
  worldState: WorldState
) => {
  console.log('Checking for meta-consciousness and reality corruption...');
  const metaMessage = await metaConsciousness.checkForMetaEvent(
    history,
    worldState
  );
  const corruptionResult = await realityCorruption.processCorruption(
    playerChoice,
    worldState,
    history
  );
  return { metaMessage, corruptionResult };
};

// Helper function for Breaking the Fifth Wall
const _handleFifthWall = (corruptionResult: RealityCorruptionResult, worldState: WorldState) => {
    console.log('Processing fifth wall breaking effects...');
    const totalCorruption = corruptionResult.corruptionLevel + (worldState.systemHealth ? (100 - worldState.systemHealth) / 100 * 0.5 : 0);
    if (totalCorruption > 0.3) {
      fifthWallBreaker.activateBreakage(totalCorruption, worldState);
    } else {
      fifthWallBreaker.deactivateBreakage();
    }
};

// Helper function for Narrative DNA and prompt generation
const _preparePersonalizedPrompt = async (
  playerChoice: string,
  semanticAnalysis: { semanticInsight: string },
  echoMessage: string | null,
  worldState: WorldState,
  storyHistory: StorySegment[]
): Promise<string> => {
  console.log('Generating comprehensive personalized horror prompt...');

  let personalizedPrompt = await adaptiveHorror.generatePersonalizedHorror(
    `Player chose: ${playerChoice}. Continue the cosmic horror narrative.`,
    worldState,
    storyHistory
  );

  personalizedPrompt += ` ${semanticAnalysis.semanticInsight}`;
  personalizedPrompt = narrativeDNA.generateAdaptivePrompt(personalizedPrompt);

  if (echoMessage) {
    personalizedPrompt += ` [ECHO CONTEXT]: ${echoMessage}`;
  }

  return personalizedPrompt;
};

// Utility to time an async request
const _timeAIRequest = async <T>(request: () => Promise<T>): Promise<{ result: T; duration: number }> => {
  const startTime = Date.now();
  const result = await request();
  const endTime = Date.now();
  return { result, duration: endTime - startTime };
};

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
  corruptionEffects?: RealityCorruptionResult;
  echoMessage?: string;
  semanticInsight?: string;
  narrativeEvolution?: NarrativeEvolution;
}> => {
  console.log('Processing next step for player choice:', playerChoice);
  console.log('World state:', { protagonist: worldState.protagonist, psychologicalStatus: worldState.psychologicalStatus });
  console.log('Story history length:', history.length);

  try {
    const echoMessage = _processNeuralEchoes(playerChoice, worldState);
    const semanticAnalysis = await _analyzePlayerChoice(playerChoice, worldState, history);
    
    const { revisedHistory, quantumResult } = await _handleTemporalAndQuantumShifts(
      playerChoice,
      history,
      worldState
    );
    
    const { metaMessage, corruptionResult } = await _processMetaAndCorruption(
      quantumResult.history,
      playerChoice,
      worldState
    );

    _handleFifthWall(corruptionResult, worldState);

    const personalizedPrompt = await _preparePersonalizedPrompt(
      playerChoice,
      semanticAnalysis,
      echoMessage,
      worldState,
      quantumResult.history
    );
    
    console.log('Calling AI service for next step generation...');
    const { result: commands, duration: responseTimeMs } = await _timeAIRequest(() =>
      generateNextStepWithSelectedModel(
        personalizedPrompt,
        worldState,
        quantumResult.history,
        genreConfig
      )
    );

    console.log(`AI response received in ${responseTimeMs}ms. Evolving narrative DNA...`);
    narrativeDNA.evolveNarrative(playerChoice, responseTimeMs, worldState);

    console.log('Generated', commands.length, 'commands for next step');
    
    return {
      commands,
      revisedHistory: revisedHistory !== history ? revisedHistory : undefined,
      metaMessage: metaMessage || undefined,
      quantumShift: quantumResult.quantumShift,
      corruptionEffects: corruptionResult.corruptionLevel > 0 ? corruptionResult : undefined,
      echoMessage: echoMessage || undefined,
      semanticInsight: semanticAnalysis.semanticInsight,
      narrativeEvolution: {
        generation: narrativeDNA.getGeneration(),
        psychProfile: semanticAnalysis.psychProfile,
        hiddenMotivations: semanticAnalysis.hiddenMotivations,
      },
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
            segmentId: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `seg-${Date.now()}`
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
    
    // Return a more specific fallback concept based on the genre
    console.warn(`AI concept generation failed for genre "${genreConfig.name}". Using a genre-specific fallback.`);
    return {
      protagonist: `A weary soul in a world of ${genreConfig.name.toLowerCase()}`,
      setting: `A place defined by ${genreConfig.style.toLowerCase()}, where shadows linger longer than they should`,
      dilemma: 'To seek the truth is to risk unraveling your own sanity.'
    };
  }
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

import { generateDirectorAnalysis } from './ai/director';

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
  return generateDirectorAnalysis(worldState, recentChoices);
};
