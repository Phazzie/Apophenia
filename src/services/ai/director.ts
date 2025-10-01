import { WorldState, AIDirectorAnalysisPayload } from '../../types';
import { generateWithSelectedModel } from './unifiedAIService';
import { adaptiveHorror } from './engines';

const DIRECTOR_SYSTEM_PROMPT = `
You are an AI Director for an interactive cosmic horror game. Your role is to analyze the player's current state and recent choices to provide guidance for the narrative.
Analyze the provided world state and recent choices to generate a director analysis.

The user's psychological profile is a key input.
Based on this, provide:
1.  **psychologicalProfile**: A detailed description of the player's current psychological state based on their choices and the world state.
2.  **narrativeRecommendations**: A list of 3-5 concrete, actionable suggestions for the story to increase tension and horror.
3.  **horrorIntensityAnalysis**: An analysis of the current horror intensity and a recommendation for how to adjust it.
4.  **playerEngagementLevel**: An assessment of the player's engagement level (e.g., 'High', 'Medium', 'Low', 'Waning').

You must respond with a single JSON object that conforms to the AIDirectorAnalysisPayload type. Do not include any other text or formatting.
`;

export const generateDirectorAnalysis = async (
  worldState: WorldState,
  recentChoices: string[]
): Promise<AIDirectorAnalysisPayload> => {
  const profile = adaptiveHorror.getPlayerPsychProfile();

  const prompt = `
    World State:
    - Protagonist: ${worldState.protagonist}
    - Psychological Status: ${worldState.psychologicalStatus}
    - System Health: ${worldState.systemHealth}%
    - Horror Intensity: ${worldState.horrorIntensity}/10

    Recent Choices:
    ${recentChoices.map((c) => `- ${c}`).join('\n')}

    Player's Psych Profile: ${profile}

    Generate the director analysis as a JSON object.
  `;

  try {
    const response = await generateWithSelectedModel(
      prompt,
      worldState,
      [], // No history needed for this analysis
      worldState.genreConfig,
      DIRECTOR_SYSTEM_PROMPT
    );

    // Assuming the AI returns a single 'displayText' command with the JSON string
    const analysisString = response[0].payload.content;
    const analysis: AIDirectorAnalysisPayload = JSON.parse(analysisString);
    return analysis;
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