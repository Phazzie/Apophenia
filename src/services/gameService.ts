import { Command, GenreConfig, StorySegment, WorldState } from '../types';
import {
    generateConceptFlow,
    generateImageFlow,
    nextStepFlow,
    processAdvancedImageGeneration,
} from './ai/genkit';
import { summarizeHistoryFlow } from './flows/summaryFlow';
import {
  temporalRevision,
  metaConsciousness,
  quantumNarrative,
  adaptiveHorror,
  realityCorruption,
  neuralEchoChamber,
  semanticArchaeologist,
  fifthWallBreach,
  adaptiveNarrativeDNA,
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
  echoIntrusion?: any;
  semanticProfile?: any;
  fifthWallEffects?: any;
  narrativeGenetics?: any;
}> => {
  // 1. ADAPTIVE HORROR: Analyze player choice for personalization
  adaptiveHorror.analyzePlayerChoice(playerChoice, 'game progression');
  
  // 2. SEMANTIC CHOICE ARCHAEOLOGY: Deep linguistic and psychological analysis
  const semanticProfile = await semanticArchaeologist.analyzeChoiceSemantics(
    playerChoice,
    worldState
  );
  
  // 3. ADAPTIVE NARRATIVE DNA: Generate genetic markers and evolve narrative
  const geneMarkers = await adaptiveNarrativeDNA.generateGeneticMarkers(
    playerChoice,
    worldState
  );
  adaptiveNarrativeDNA.evolveNarrativeGenome(geneMarkers);
  const narrativeExpressions = await adaptiveNarrativeDNA.expressNarrativeGenes(
    `${worldState.setting} - ${worldState.dilemma}`
  );
  
  // 4. NEURAL ECHO CHAMBERS: Check for echo intrusions from past sessions
  const echoIntrusion = await neuralEchoChamber.generateEchoIntrusion(
    worldState.setting
  );
  
  // 5. TEMPORAL REVISION: Check if choice should alter past events
  const revisedHistory = await temporalRevision.reviseHistory(
    playerChoice,
    history,
    worldState
  );
  
  // 6. QUANTUM NARRATIVE: Process potential timeline shifts
  const quantumResult = await quantumNarrative.processQuantumChoice(
    playerChoice,
    revisedHistory,
    worldState
  );
  
  // 7. META-CONSCIOUSNESS: Check for AI awareness events
  const metaMessage = await metaConsciousness.checkForMetaEvent(
    quantumResult.history,
    worldState
  );
  
  // 8. REALITY CORRUPTION: Apply interface corruption effects
  const corruptionResult = realityCorruption.processCorruption(
    playerChoice,
    worldState
  );
  
  // 9. FIFTH WALL BREACH: Create browser environment horror
  const fifthWallEffects = await fifthWallBreach.createSystemLevelHorror();
  await fifthWallBreach.manipulateBrowserChrome(
    `Your choice echoes: ${playerChoice.substring(0, 30)}...`
  );
  await fifthWallBreach.createPhantomInteractions();
  
  // 10. ENHANCED AI GENERATION: Generate next story beat with all personalization layers
  let personalizedPrompt = await adaptiveHorror.generatePersonalizedHorror(
    `Player chose: ${playerChoice}. Continue the cosmic horror narrative.`
  );
  
  // Layer semantic targeting on top
  personalizedPrompt = await semanticArchaeologist.craftTargetedHorror(personalizedPrompt);
  
  // Apply narrative DNA expressions
  if (narrativeExpressions.horrorThemes.length > 0) {
    personalizedPrompt += `\n\nEmphasize these personalized horror elements: ${narrativeExpressions.horrorThemes.join(', ')}.`;
  }
  if (narrativeExpressions.characterTypes.length > 0) {
    personalizedPrompt += `\n\nInclude character elements: ${narrativeExpressions.characterTypes[0]}.`;
  }
  
  const commands = await nextStepFlow({ 
    playerChoice: personalizedPrompt, 
    worldState, 
    history: quantumResult.history, 
    genreConfig 
  });
  
  return {
    commands,
    revisedHistory: revisedHistory !== history ? revisedHistory : undefined,
    metaMessage: metaMessage || undefined,
    quantumShift: quantumResult.quantumShift,
    corruptionEffects: corruptionResult.corruptionLevel > 0 ? corruptionResult : undefined,
    echoIntrusion: echoIntrusion || undefined,
    semanticProfile: semanticProfile.vulnerabilities.length > 0 ? semanticProfile : undefined,
    fifthWallEffects: fifthWallEffects.length > 0 ? fifthWallEffects : undefined,
    narrativeGenetics: {
      expressions: narrativeExpressions,
      geneMarkers: geneMarkers.length,
    },
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
  return generateConceptFlow(genreConfig);
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
        `${prompt}, variation ${index + 1}, cosmic horror aesthetic`, 
        true
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

/**
 * NEURAL ECHO CAPTURE
 * Captures memorable elements from story segments for future haunting
 */
export const captureNeuralEcho = async (segment: StorySegment): Promise<void> => {
  await neuralEchoChamber.captureNeuralEcho(segment);
};

/**
 * ENHANCED CHOICE GENERATION
 * Incorporates echo intrusions and semantic profiling into choice generation
 */
export const generateEnhancedChoices = async (
  baseChoices: string[],
  worldState: WorldState
): Promise<{ text: string; isIntrusive: boolean }[]> => {
  const enhancedChoices = baseChoices.map(choice => ({
    text: choice,
    isIntrusive: false,
  }));
  
  // Add potential echo intrusion as intrusive thought
  const echoIntrusion = await neuralEchoChamber.generateEchoIntrusion(
    worldState.setting
  );
  
  if (echoIntrusion) {
    enhancedChoices.push(echoIntrusion);
  }
  
  return enhancedChoices;
};

/**
 * NARRATIVE DNA ANALYSIS
 * Provides insights into player's evolving narrative genetics
 */
export const getNarrativeDNAAnalysis = async (): Promise<{
  dominantThemes: string[];
  characterPreferences: string[];
  horrorSensitivities: string[];
  narrativeComplexity: string;
}> => {
  const expressions = await adaptiveNarrativeDNA.expressNarrativeGenes('current_analysis');
  
  return {
    dominantThemes: expressions.horrorThemes,
    characterPreferences: expressions.characterTypes,
    horrorSensitivities: expressions.environmentalDetails,
    narrativeComplexity: expressions.narrativeStructure,
  };
};
