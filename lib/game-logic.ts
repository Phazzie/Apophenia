import { Command, GenreConfig, StorySegment, WorldState } from '@/lib/types';
import {
    generateConceptFlow,
    generateImageFlow,
    nextStepFlow,
    processAdvancedImageGeneration,
} from '@/lib/ai/genkit';
import { summarizeHistoryFlow } from '@/src/services/flows/summaryFlow'; // Will move this later
import {
  temporalRevision,
  metaConsciousness,
  quantumNarrative,
  adaptiveHorror,
  realityCorruption,
} from '@/lib/ai/revolutionaryFeatures';

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
  adaptiveHorror.analyzePlayerChoice(playerChoice, 'game progression');
  
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
  
  const metaMessage = await metaConsciousness.checkForMetaEvent(
    quantumResult.history,
    worldState
  );
  
  const corruptionResult = realityCorruption.processCorruption(
    playerChoice,
    worldState
  );
  
  const personalizedPrompt = await adaptiveHorror.generatePersonalizedHorror(
    `Player chose: ${playerChoice}. Continue the cosmic horror narrative.`
  );
  
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
