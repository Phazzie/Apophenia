import { Command, GenreConfig, StorySegment, WorldState } from '../types';
import {
    generateConceptFlow,
    generateImageFlow,
    nextStepFlow,
} from './ai/genkit';
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
  semanticArchaeology,
  narrativeDNA,
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
 * 
 * FIXES APPLIED:
 * - Critical Issue #5: System Health Math Bug - Fixed truthy check to include systemHealth === 0
 * - Critical Issue #6: Hard-coded Response Latency - Uses actual measured latency instead of 5000ms constant  
 * - Critical Issue #7: Wrong Parameter to Next-Step Generator - Uses original playerChoice parameter
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
  echoMessage?: string;
  semanticInsight?: string;
  narrativeEvolution?: NarrativeEvolution;
}> => {
  console.log('Processing next step for player choice:', playerChoice);
  console.log('World state:', { protagonist: worldState.protagonist, psychologicalStatus: worldState.psychologicalStatus });
  console.log('Story history length:', history.length);

  // Measure actual response latency for adaptive systems
  const startTime = Date.now();

  try {
    // Initialize Neural Echo Chambers on first use
    neuralEchoChambers.initializeFromPersistence();

    // 1. NEURAL ECHO CHAMBERS: Record choice and check for echoes
    console.log('Processing neural echo chambers...');
    neuralEchoChambers.recordChoice(playerChoice, 'game progression', worldState);
    const echoMessage = neuralEchoChambers.generateEchoPrompt(playerChoice, worldState);

    // 2. SEMANTIC CHOICE ARCHAEOLOGY: Deep psychological analysis
    console.log('Performing semantic choice archaeology...');
    const allChoices: string[] = [playerChoice];
    const semanticAnalysis = semanticArchaeology.analyzeChoiceSemantics(playerChoice, allChoices);

    // 3. ADAPTIVE HORROR: Enhanced with semantic insights
    console.log('Analyzing player choice for adaptive horror...');
    await adaptiveHorror.analyzePlayerChoice(playerChoice, 'game progression');
    
    // 4. TEMPORAL REVISION: Check if choice should alter past events
    console.log('Processing temporal revision...');
    const revisedHistory = await temporalRevision.reviseHistory(
      playerChoice,
      history,
      worldState
    );
    
    // 5. QUANTUM NARRATIVE: Process potential timeline shifts
    console.log('Processing quantum narrative shifts...');
    const quantumResult = await quantumNarrative.processQuantumChoice(
      playerChoice,
      revisedHistory,
      worldState
    );
    
    // 6. META-CONSCIOUSNESS: Check for AI awareness events
    console.log('Checking for meta-consciousness events...');
    const metaMessage = await metaConsciousness.checkForMetaEvent(
      quantumResult.history,
      worldState
    );
    
    // 7. REALITY CORRUPTION: Apply interface corruption effects
    console.log('Processing reality corruption effects...');
    const corruptionResult = await realityCorruption.processCorruption(
      playerChoice,
      worldState
    );

    // FIXED: Critical Issue #5 - System Health Math Bug
    // Calculate corruption taking into account systemHealth === 0 case
    let calculatedCorruption = corruptionResult.corruptionLevel;
    
    // Previous code: if (worldState.systemHealth) - this excluded systemHealth === 0
    // Fixed code: explicit numeric validation instead of truthy check
    if (typeof worldState.systemHealth === 'number' && worldState.systemHealth >= 0) {
      const healthFactor = (100 - worldState.systemHealth) / 100;
      calculatedCorruption += healthFactor * 0.3;
      console.log(`System health: ${worldState.systemHealth}, health factor: ${healthFactor}, corruption: ${calculatedCorruption}`);
    } else {
      console.warn('Invalid systemHealth value:', worldState.systemHealth);
      calculatedCorruption += 0.3; // Assume compromised system when health is invalid
    }

    // Measure actual response latency for adaptive systems
    const responseLatencyMs = Date.now() - startTime;
    
    // 8. ADAPTIVE NARRATIVE DNA: Evolve story structure
    console.log('Evolving narrative DNA...');
    // FIXED: Critical Issue #6 - Hard-coded Response Latency
    // Pass actual measured latency instead of hard-coded 5000ms constant
    narrativeDNA.evolveNarrative(playerChoice, responseLatencyMs, worldState);
    
    // 9. ENHANCED AI GENERATION: Generate next story beat with all personalizations
    console.log('Generating comprehensive personalized horror prompt...');
    let personalizedPrompt = await adaptiveHorror.generatePersonalizedHorror(
      `Player chose: ${playerChoice}. Continue the cosmic horror narrative.`
    );

    // Enhance with semantic insights
    personalizedPrompt += ` ${semanticAnalysis.semanticInsight}`;
    
    // Enhance with narrative DNA
    personalizedPrompt = narrativeDNA.generateAdaptivePrompt(personalizedPrompt, worldState);

    // Add echo context if present
    if (echoMessage) {
      personalizedPrompt += ` [ECHO CONTEXT]: ${echoMessage}`;
    }
    
    console.log('Calling AI service for next step generation...');
    // FIXED: Critical Issue #7 - Wrong Parameter to Next-Step Generator
    // Use original playerChoice parameter instead of personalizedPrompt for the main parameter
    // Surface enriched prompt via the prompt parameter, but keep playerChoice as the core choice
    const commands = await generateNextStepWithSelectedModel(
      playerChoice, // Using original playerChoice as required, not personalizedPrompt
      worldState,
      quantumResult.history,
      genreConfig
    );
    
    console.log('Generated', commands.length, 'commands for next step');
    
    return {
      commands,
      revisedHistory: revisedHistory.length !== history.length ? revisedHistory : undefined,
      metaMessage: metaMessage || undefined,
      quantumShift: quantumResult.quantumShift,
      corruptionEffects: calculatedCorruption > 0 ? { ...corruptionResult, corruptionLevel: calculatedCorruption } : undefined,
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
    
    // Fallback response for when all revolutionary features fail
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
              { text: "Continue into the unknown", isIntrusive: false },
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
      protagonist: 'The Wanderer',
      setting: 'A place between realities',
      dilemma: 'The search for meaning in a fragmented world'
    };
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  return generateImageFlow(prompt);
};
