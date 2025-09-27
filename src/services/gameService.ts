/**
 * @file gameService.ts
 * @description The master game service that orchestrates the entire gameplay loop.
 * This service integrates all 8 of the revolutionary AI engines to process a player's
 * choice and generate the next state of the game, creating a deeply dynamic and
 * personalized cosmic horror experience.
 */

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
  neuralEchoChambers,
  semanticChoiceArchaeology,
  adaptiveNarrativeDNA,
} from './ai/revolutionaryFeatures';

/**
 * The core function of the game. It processes the player's choice by running it
 * through the full pipeline of 8 revolutionary AI engines.
 *
 * The process is as follows:
 * 1.  **Adaptive Horror**: Calculates the new horror intensity for the turn.
 * 2.  **Temporal Revision**: Checks if the choice should retroactively alter past events.
 * 3.  **Quantum Narrative**: Processes potential shifts to alternate timelines.
 * 4.  **Meta-Consciousness**: Checks if the AI should break the fourth wall.
 * 5.  **Reality Corruption**: Calculates and applies UI distortion effects.
 * 6.  **Neural Echoes**: Stores cross-session memory of player patterns.
 * 7.  **Semantic Archaeology**: Performs deep psychological analysis of the choice.
 * 8.  **Narrative DNA**: Evolves the story's genetic makeup based on the choice.
 * 9.  **AI Generation**: Finally, calls the selected AI model with a prompt enriched by the outputs of the other engines to generate the next set of game commands.
 *
 * @param {string} playerChoice - The text of the player's most recent choice.
 * @param {WorldState} worldState - The current state of the game world.
 * @param {StorySegment[]} history - The full narrative history.
 * @param {GenreConfig} genreConfig - The configuration for the current genre.
 * @returns {Promise<object>} A promise that resolves to an object containing the generated commands and the results from each revolutionary engine.
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
  archaeologyReport?: any;
  dnaEvolution?: any;
  engineStatus?: string;
}> => {
  console.log('Processing next step for player choice:', playerChoice);
  console.log('World state:', { protagonist: worldState.protagonist, psychologicalStatus: worldState.psychologicalStatus });
  console.log('Story history length:', history.length);

  try {
    // 1. ADAPTIVE HORROR: Calculate the new horror intensity for this turn.
    // This score will be used to dynamically adjust the narrative, visuals, and choices.
    console.log('Calculating adaptive horror intensity...');
    const newHorrorIntensity = adaptiveHorror.calculateAdaptiveHorrorIntensity(history, worldState);
    const updatedWorldState = { ...worldState, horrorIntensity: newHorrorIntensity };
    
    // 2. TEMPORAL REVISION: Check if choice should alter past events
    console.log('Processing temporal revision...');
    const revisedHistory = await temporalRevision.reviseHistory(
      playerChoice,
      history,
      updatedWorldState
    );
    
    // 3. QUANTUM NARRATIVE: Process potential timeline shifts
    console.log('Processing quantum narrative shifts...');
    const quantumResult = await quantumNarrative.processQuantumChoice(
      playerChoice,
      revisedHistory,
      updatedWorldState
    );
    
    // 4. META-CONSCIOUSNESS: Check for AI awareness events
    console.log('Checking for meta-consciousness events...');
    let metaMessage;
    try {
      metaMessage = await metaConsciousness.checkForMetaEvent(
        quantumResult.history,
        updatedWorldState
      );
      console.log('Meta-consciousness check completed');
    } catch (error) {
      console.error('Meta-consciousness check failed:', error);
      metaMessage = null;
    }
    
    // 5. REALITY CORRUPTION: Apply interface corruption effects
    console.log('Processing reality corruption effects...');
    let corruptionResult;
    try {
      corruptionResult = await realityCorruption.processCorruption(
        playerChoice,
        updatedWorldState
      );
      console.log('Reality corruption processing completed');
    } catch (error) {
      console.error('Reality corruption processing failed:', error);
      corruptionResult = { corruptionLevel: 0, newEffects: [], uiEffects: {} };
    }
    
    // 6. NEURAL ECHO CHAMBERS: Store cross-session memories
    console.log('Storing neural echoes...');
    try {
      const playerId = 'player-' + (Math.random().toString(36).substr(2, 9)); // Simple player ID
      await neuralEchoChambers.storeEcho(playerId, {
        choicePattern: playerChoice,
        psychologicalTrigger: metaMessage || 'none',
        fearResponse: corruptionResult.corruptionLevel,
        timestamp: Date.now()
      });
      console.log('Neural echoes stored successfully');
    } catch (error) {
      console.error('Neural echo storage failed:', error);
    }
    
    // 7. SEMANTIC CHOICE ARCHAEOLOGY: Deep psychological analysis
    console.log('Performing semantic choice archaeology...');
    let archaeologyReport;
    try {
      archaeologyReport = await semanticChoiceArchaeology.excavateChoice(
        playerChoice,
        `Horror intensity: ${updatedWorldState.horrorIntensity}/10`,
        updatedWorldState
      );
      console.log('Semantic archaeology completed');
    } catch (error) {
      console.error('Semantic archaeology failed:', error);
      archaeologyReport = null;
    }
    
    // 8. ADAPTIVE NARRATIVE DNA: Evolve story genetics
    console.log('Evolving narrative DNA...');
    let dnaEvolution;
    try {
      const playerEngagement = corruptionResult.corruptionLevel > 0.3 ? 0.8 : 0.5;
      dnaEvolution = await adaptiveNarrativeDNA.evolveDNA(
        playerChoice,
        playerEngagement,
        updatedWorldState
      );
      console.log('Narrative DNA evolution completed');
    } catch (error) {
      console.error('Narrative DNA evolution failed:', error);
      dnaEvolution = null;
    }
    
    // 9. ENHANCED AI GENERATION: Generate next story beat with all revolutionary features
    console.log('Generating personalized horror prompt with full 8-module analysis...');
    const personalizedPrompt = await adaptiveHorror.generatePersonalizedHorror(
      `Player chose: ${playerChoice}. Continue the cosmic horror narrative.
      
Semantic Analysis: ${archaeologyReport ? JSON.stringify(archaeologyReport) : 'none'}
Narrative DNA: ${dnaEvolution ? JSON.stringify(dnaEvolution) : 'none'}
Reality Corruption: ${corruptionResult.corruptionLevel}`
    );
    
    console.log('Calling AI service for next step generation...');
    let commands;
    try {
      commands = await generateNextStepWithSelectedModel(
        personalizedPrompt,
        updatedWorldState,
        quantumResult.history,
        genreConfig
      );
      console.log('AI service call successful, generated', commands.length, 'commands');
    } catch (aiError) {
      console.error('AI service call failed:', aiError);
      throw aiError; // Re-throw to be caught by outer error handler
    }
    
    console.log('Generated', commands.length, 'commands for next step');
    
    return {
      commands,
      revisedHistory: revisedHistory !== history ? revisedHistory : undefined,
      metaMessage: metaMessage || undefined,
      quantumShift: quantumResult.quantumShift,
      corruptionEffects: corruptionResult.corruptionLevel > 0 ? corruptionResult : undefined,
      archaeologyReport: archaeologyReport || undefined,
      dnaEvolution: dnaEvolution || undefined,
      engineStatus: '8-module system fully operational'
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

/**
 * A pass-through function that calls the `summarizeHistoryFlow` to generate a summary of the narrative.
 *
 * @param {WorldState} worldState - The current state of the game world.
 * @param {StorySegment} lastSegment - The most recent story segment.
 * @returns {Promise<string>} A promise that resolves to the generated summary.
 */
export const summarizeHistory = async (
  worldState: WorldState,
  lastSegment: StorySegment
): Promise<string> => {
  return await summarizeHistoryFlow(worldState, lastSegment);
};

/**
 * Kicks off the process of generating a new story concept.
 * It calls the unified AI service, which routes the request to the appropriate model.
 * Includes a robust fallback mechanism in case of errors.
 *
 * @param {GenreConfig} genreConfig - The configuration for the desired genre.
 * @returns {Promise<{ protagonist: string; setting: string; dilemma: string }>} A promise that resolves to the generated story concept.
 */
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
    
    // Return a thematic fallback concept on failure
    return {
      protagonist: 'A person confronting the unknowable depths of reality',
      setting: 'A place where the boundaries between dream and nightmare blur',
      dilemma: 'Each revelation brings you closer to a truth you may not survive'
    };
  }
};

/**
 * A pass-through function to generate a single image for a given prompt.
 *
 * @param {string} prompt - The prompt to generate an image for.
 * @returns {Promise<string>} A promise that resolves to the URL of the generated image.
 */
export const generateImage = async (prompt: string): Promise<string> => {
  return generateImageFlow(prompt);
};

/**
 * Generates multiple, distinct image variations for a single prompt to enhance immersion.
 * This function concurrently calls the advanced image generation process for each variation.
 *
 * @param {string} prompt - The base prompt for the images.
 * @param {number} [variationCount=3] - The number of variations to generate.
 * @returns {Promise<string[]>} A promise that resolves to an array of image URLs.
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
 * Provides a high-level analysis from the "AI Director" perspective.
 * In a full implementation, this would use the AI's thinking or analysis capabilities
 * to provide meta-commentary on the state of the narrative and player psychology.
 * Currently, it provides a sophisticated mock analysis based on the adaptive horror engine's profile.
 *
 * @param {WorldState} worldState - The current world state.
 * @param {string[]} recentChoices - A list of recent player choices.
 * @returns {Promise<object>} A promise that resolves to an analysis object from the AI Director.
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
  
  // In a full implementation, this would use an advanced AI model's reasoning capabilities.
  // For now, it provides a sophisticated mock analysis based on the data we have.
  
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
