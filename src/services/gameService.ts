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
  semanticArchaeology,
  narrativeDNA,
  fifthWallBreaker,
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
  echoMessage?: string;
  semanticInsight?: string;
  narrativeEvolution?: any;
}> => {
  console.log('Processing next step for player choice:', playerChoice);
  console.log('World state:', { protagonist: worldState.protagonist, psychologicalStatus: worldState.psychologicalStatus });
  console.log('Story history length:', history.length);

  try {
    // Initialize Neural Echo Chambers on first use
    neuralEchoChambers.initializeFromPersistence();

    // 1. NEURAL ECHO CHAMBERS: Record choice and check for echoes
    console.log('Processing neural echo chambers...');
    neuralEchoChambers.recordChoice(playerChoice, 'game progression', worldState);
    const echoMessage = neuralEchoChambers.generateEchoPrompt(playerChoice, worldState);

    // 2. SEMANTIC CHOICE ARCHAEOLOGY: Deep psychological analysis
    console.log('Performing semantic choice archaeology...');
    const allChoices: string[] = []; // For now, just use empty array as choices aren't stored in history
    const semanticAnalysis = semanticArchaeology.analyzeChoiceSemantics(playerChoice, allChoices);

    // 3. ADAPTIVE HORROR: Enhanced with semantic insights
    console.log('Analyzing player choice for adaptive horror...');
    adaptiveHorror.analyzePlayerChoice(playerChoice, 'game progression');
    
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
    const corruptionResult = realityCorruption.processCorruption(
      playerChoice,
      worldState
    );

    // 8. BREAKING THE FIFTH WALL: Activate browser manipulation
    console.log('Processing fifth wall breaking effects...');
    const totalCorruption = corruptionResult.corruptionLevel + (worldState.systemHealth ? (100 - worldState.systemHealth) / 100 * 0.5 : 0);
    if (totalCorruption > 0.3) {
      fifthWallBreaker.activateBreakage(totalCorruption, worldState);
    }

    // 9. ADAPTIVE NARRATIVE DNA: Evolve story structure
    console.log('Evolving narrative DNA...');
    const responseStartTime = Date.now();
    narrativeDNA.evolveNarrative(playerChoice, responseStartTime, worldState);
    
    // 10. ENHANCED AI GENERATION: Generate next story beat with all personalizations
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
      echoMessage: echoMessage || undefined,
      semanticInsight: semanticAnalysis.semanticInsight,
      narrativeEvolution: {
        generation: (narrativeDNA as any).narrativeDNA?.generation || 1,
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
