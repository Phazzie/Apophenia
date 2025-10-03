import { Command, GenreConfig, StorySegment, WorldState } from '../types';
import { generateImageFlow } from './ai/genkit';
import { generateConcept, generateNextStep } from './ai/unifiedAIService';
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
import { generateDirectorAnalysis } from './ai/director';

/**
 * This service orchestrates the core game logic, including the revolutionary AI engines
 * and communication with the secure backend for narrative generation.
 */

// The following are helper functions that orchestrate the 8 revolutionary AI engines.
// This logic remains on the client-side as it directly interfaces with the game's state stores
// and produces immediate, stateful effects (e.g., memory revision, UI corruption).

const _processNeuralEchoes = (playerChoice: string, worldState: WorldState) => {
  neuralEchoChambers.initializeFromPersistence();
  neuralEchoChambers.recordChoice(playerChoice, 'game progression', worldState);
  return neuralEchoChambers.generateEchoPrompt(playerChoice);
};

const _analyzePlayerChoice = async (
  playerChoice: string,
  worldState: WorldState,
  history: StorySegment[]
) => {
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

const _handleTemporalAndQuantumShifts = async (
  playerChoice: string,
  history: StorySegment[],
  worldState: WorldState
) => {
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

const _processMetaAndCorruption = async (
  history: StorySegment[],
  playerChoice: string,
  worldState: WorldState
) => {
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

const _handleFifthWall = (corruptionResult: RealityCorruptionResult, worldState: WorldState) => {
    const totalCorruption = corruptionResult.corruptionLevel + (worldState.systemHealth ? (100 - worldState.systemHealth) / 100 * 0.5 : 0);
    if (totalCorruption > 0.3) {
      fifthWallBreaker.activateBreakage(totalCorruption, worldState);
    } else {
      fifthWallBreaker.deactivateBreakage();
    }
};

const _timeAIRequest = async <T>(request: () => Promise<T>): Promise<{ result: T; duration: number }> => {
  const startTime = Date.now();
  const result = await request();
  const endTime = Date.now();
  return { result, duration: endTime - startTime };
};

/**
 * Gets the next step in the story by orchestrating the client-side AI engines
 * and calling the secure backend for the core narrative generation.
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
  corruptionEffects?: RealityCorruptionResult;
}> => {
  console.log('Processing next step for player choice:', playerChoice);

  try {
    // Orchestrate the revolutionary engines on the client side
    _processNeuralEchoes(playerChoice, worldState);
    await _analyzePlayerChoice(playerChoice, worldState, history);
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

    // Call the secure backend for the main narrative commands.
    // The complex prompt engineering is now handled by the backend.
    console.log('Calling secure backend for next step generation...');
    const { result: commands, duration: responseTimeMs } = await _timeAIRequest(() =>
      generateNextStep(
        playerChoice,
        worldState,
        quantumResult.history,
        genreConfig
      )
    );

    narrativeDNA.evolveNarrative(playerChoice, responseTimeMs, worldState);
    console.log(`AI response received in ${responseTimeMs}ms. Generated ${commands.length} commands.`);

    return {
      commands,
      revisedHistory: revisedHistory !== history ? revisedHistory : undefined,
      metaMessage: metaMessage || undefined,
      quantumShift: quantumResult.quantumShift,
      corruptionEffects: corruptionResult.corruptionLevel > 0 ? corruptionResult : undefined,
    };
  } catch (error) {
    console.error('Error in getNextStep:', error);
    // Return a fallback command set to ensure the game can continue
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
            ]
          }
        }
      ],
    };
  }
};

/**
 * Calls the backend to summarize the story history.
 */
export const summarizeHistory = async (
  worldState: WorldState,
  lastSegment: StorySegment
): Promise<string> => {
  return await summarizeHistoryFlow(worldState, lastSegment);
};

/**
 * Calls the backend to generate a new story concept.
 */
export const generateConceptService = async (
  genreConfig: GenreConfig
): Promise<{ protagonist: string; setting: string; dilemma: string }> => {
  console.log('Generating concept for genre:', genreConfig.name);
  try {
    // The `generateConcept` function from the unified service now calls the backend.
    const concept = await generateConcept(genreConfig);
    console.log('Concept generated successfully:', concept);
    return concept;
  } catch (error) {
    console.error('Error generating concept:', error);
    return {
      protagonist: `A weary soul in a world of ${genreConfig.name.toLowerCase()}`,
      setting: `A place defined by ${genreConfig.style.toLowerCase()}`,
      dilemma: 'To seek the truth is to risk unraveling your own sanity.'
    };
  }
};

/**
 * Calls the backend to generate a single image.
 */
export const generateImage = async (prompt: string): Promise<string> => {
  return generateImageFlow(prompt);
};

/**
 * Generates multiple image variations by calling the backend service multiple times.
 */
export const generateMultipleImages = async (
  prompt: string,
  variationCount: number = 3
): Promise<string[]> => {
  const variations = await Promise.all(
    Array(variationCount).fill(0).map((_, index) =>
      generateImageFlow(
        `${prompt}, variation ${index + 1}, cosmic horror aesthetic`
      )
    )
  );
  return variations;
};

/**
 * Calls the backend to get an AI Director analysis.
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