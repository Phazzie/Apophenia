import { WorldState, AIDirectorAnalysisPayload } from '../../types';
import { generateWithSelectedModel } from './unifiedAIService';
import { adaptiveHorror } from './engines';
import { AI_DIRECTOR_SYSTEM, buildDirectorAnalysisRequest } from './promptTemplates';
import { buildAIContext } from '../../utils/typeConverters';

export const generateDirectorAnalysis = async (
  worldState: WorldState,
  recentChoices: string[]
): Promise<AIDirectorAnalysisPayload> => {
  const profile = adaptiveHorror.getPlayerPsychProfile();

  // Use centralized prompt templates for director analysis
  const { systemInstruction, prompt } = buildDirectorAnalysisRequest(
    worldState,
    recentChoices,
    profile
  );

  try {
    const response = await generateWithSelectedModel({
      prompt: systemInstruction + '\n\n' + prompt,
      context: buildAIContext({
        worldState,
        storyHistory: [],
      }),
    });

    // Assuming the AI returns a single 'displayText' command with the JSON string
    if (response.commands[0]?.type === 'displayText') {
      const analysisString = response.commands[0].payload.content;
      const analysis: AIDirectorAnalysisPayload = JSON.parse(analysisString);
      return analysis;
    }
    throw new Error('Invalid response format from AI director analysis');
  } catch (error) {
    console.error('Error generating AI director analysis:', error);
    // Return a fallback analysis in case of an error
    return {
      psychologicalProfile: 'Unable to determine psychological profile due to system instability. The subject shows signs of stress.',
      narrativeRecommendations: [
        'Introduce a simple, unsettling event.',
        'Focus on atmospheric horror rather than direct threats.',
        'Provide a moment of false calm.',
      ],
      horrorIntensityAnalysis: 'Intensity is currently unpredictable. Recommend caution.',
      playerEngagementLevel: 'Unknown',
    };
  }
};