import { Command, GenreConfig, StorySegment, WorldState } from '../types';
import {
    generateConceptFlow,
    generateImageFlow,
    nextStepFlow,
    processAdvancedImageGeneration,
} from './ai/secureGenkit';
// Import client-side AI flows for direct model usage
import {
  generateConceptFlow as clientGenerateConceptFlow,
  nextStepFlow as clientNextStepFlow,
  generateImageFlow as clientGenerateImageFlow
} from './ai/clientAIFlow';
import { getSelectedModel } from './ai/unifiedAIService';
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
  await adaptiveHorror.analyzePlayerChoice(playerChoice, 'game progression');
  
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
  const corruptionResult = await realityCorruption.processCorruption(
    playerChoice,
    worldState
  );
  
  // 6. ENHANCED AI GENERATION: Generate next story beat with personalization
  const personalizedPrompt = await adaptiveHorror.generatePersonalizedHorror(
    `Player chose: ${playerChoice}. Continue the cosmic horror narrative.`
  );
  
  // Use client-side AI flows for non-Gemini models, secure backend for Gemini
  const selectedModel = getSelectedModel();
  const commands = selectedModel === 'grok-4-fast-reasoning' 
    ? await clientNextStepFlow({ 
        playerChoice: personalizedPrompt, 
        worldState, 
        history: quantumResult.history, 
        genreConfig 
      })
    : await nextStepFlow({ 
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
  // Use client-side AI flows for non-Gemini models, secure backend for Gemini
  const selectedModel = getSelectedModel();
  
  if (selectedModel === 'grok-4-fast-reasoning') {
    return clientGenerateConceptFlow(genreConfig);
  } else {
    return generateConceptFlow(genreConfig);
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  // For now, always use the secure backend for image generation
  // This could be enhanced later to support client-side image models
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
  
  try {
    // Import AI service here to avoid circular dependencies
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const { API_KEYS, AI_MODELS } = await import('./config');
    
    const genAI = new GoogleGenerativeAI(API_KEYS.googleGenAI);
    
    const model = genAI.getGenerativeModel({
      model: AI_MODELS.PRIMARY_TEXT,
      systemInstruction: `You are an advanced AI Director for cosmic horror narratives.
      
      Analyze player behavior and provide sophisticated narrative direction including:
      - Psychological profiling based on choice patterns
      - Strategic narrative recommendations
      - Horror intensity calibration
      - Player engagement assessment
      
      Your analysis should be clinical yet unsettling, as if you're studying the player as a test subject.`,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1024,
      },
    });

    const prompt = `Player Data Analysis:
Current psychological profile: ${profile}
Recent choices: ${recentChoices.join(', ')}
World corruption level: ${100 - worldState.systemHealth}%
System health: ${worldState.systemHealth}%
Psychological status: ${worldState.psychologicalStatus || 'stable'}

Provide a comprehensive AI Director analysis as a JSON object:
{
  "psychologicalProfile": "detailed psychological assessment",
  "narrativeRecommendations": ["rec1", "rec2", "rec3", "rec4"],
  "horrorIntensityAnalysis": "analysis of current horror levels and recommendations",
  "playerEngagementLevel": "assessment of player engagement"
}`;

    const result = await model.generateContent(prompt);
    const analysisText = result.response.text().trim();
    
    // Try to extract JSON from the AI response
    try {
      const analysis = JSON.parse(analysisText.replace(/```json|```/g, '').trim());
      return {
        psychologicalProfile: analysis.psychologicalProfile || profile,
        narrativeRecommendations: analysis.narrativeRecommendations || ['Escalate horror elements'],
        horrorIntensityAnalysis: analysis.horrorIntensityAnalysis || `Analysis of ${worldState.psychologicalStatus || 'stable'} state`,
        playerEngagementLevel: analysis.playerEngagementLevel || 'Moderate engagement detected'
      };
    } catch (parseError) {
      console.warn('Failed to parse AI Director analysis, using extracted content');
      return {
        psychologicalProfile: profile,
        narrativeRecommendations: [analysisText.substring(0, 100) + '...'],
        horrorIntensityAnalysis: `AI Analysis: ${analysisText.substring(100, 200)}...`,
        playerEngagementLevel: 'AI-analyzed engagement pattern detected'
      };
    }
  } catch (error) {
    console.warn('AI Director analysis failed, using enhanced fallback:', error);
  }
  
  // Enhanced fallback analysis
  return {
    psychologicalProfile: profile,
    narrativeRecommendations: [
      'Introduce themes of digital consciousness and AI awareness',
      'Escalate reality distortion effects based on corruption level',
      'Deploy meta-narrative awareness events',
      'Implement temporal inconsistencies to create false memories',
      'Adapt horror themes to player\'s demonstrated fear patterns'
    ],
    horrorIntensityAnalysis: `Current psychological state: ${worldState.psychologicalStatus || 'stable'}. System corruption at ${(100 - worldState.systemHealth).toFixed(1)}%. Recommend progressive escalation with personalized fear triggers.`,
    playerEngagementLevel: recentChoices.length > 3 ? 'High - sustained interaction pattern detected' : 'Moderate - building engagement through choice complexity'
  };
};
