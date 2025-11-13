import { WorldState, AIDirectorAnalysisPayload } from '../../types';
import { generateWithSelectedModel } from './unifiedAIService';
import { AI_DIRECTOR_SYSTEM, buildDirectorAnalysisRequest } from './promptTemplates';
import { buildAIContext } from '../../utils/typeConverters';
import { usePlayerProfileStore } from '../../core/state/playerProfileStore';
import type { PlayerProfile } from '../../core/types/seams';

export const generateDirectorAnalysis = async (
  worldState: WorldState,
  recentChoices: string[]
): Promise<AIDirectorAnalysisPayload> => {
  // Get player profile from store and format as string
  const playerProfile = usePlayerProfileStore.getState().profile;
  const profile = formatPlayerProfileAsString(playerProfile);

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

/**
 * Format PlayerProfile as a human-readable string for AI director analysis
 */
function formatPlayerProfileAsString(profile: PlayerProfile): string {
  const { fearProfile, choicePatterns, engagementMetrics } = profile;

  // Format fear profile
  const fears = Object.entries(fearProfile)
    .filter(([_, score]) => score && score > 0.3) // Only significant fears
    .sort((a, b) => (b[1] || 0) - (a[1] || 0))
    .map(([fear, score]) => `${fear}: ${(score! * 100).toFixed(0)}%`);

  const fearText = fears.length > 0
    ? fears.join(', ')
    : 'No dominant fears identified yet';

  // Format choice patterns
  const patterns = Object.entries(choicePatterns)
    .map(([pattern, score]) => `${pattern}: ${(score * 100).toFixed(0)}%`)
    .join(', ');

  // Format engagement
  const engagement = `${engagementMetrics.totalChoices} choices made, avg response time: ${(engagementMetrics.averageResponseTime / 1000).toFixed(1)}s`;

  return `Fears: ${fearText}. Patterns: ${patterns}. Engagement: ${engagement}`;
}