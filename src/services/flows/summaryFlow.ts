import { WorldState, StorySegment } from '../../types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { API_KEYS } from '../config';

export const summarizeHistoryFlow = async (
  worldState: WorldState,
  lastSegment: StorySegment
): Promise<string> => {
  try {
    // Use real AI for history summarization if API key is available
    if (API_KEYS.googleGenAI) {
      const genAI = new GoogleGenerativeAI(API_KEYS.googleGenAI);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Summarize this cosmic horror story progress in 2-3 sentences:
      
Current protagonist state: ${worldState.protagonist}
Setting: ${worldState.setting}
Current dilemma: ${worldState.dilemma}
Psychological status: ${worldState.psychologicalStatus}
Last event: ${lastSegment.text}

Create a concise summary that captures the protagonist's current situation and mental state in the cosmic horror narrative.`;

      const result = await model.generateContent(prompt);
      const summary = result.response.text();
      
      console.log('AI-generated history summary:', summary);
      return summary;
    }
  } catch (error) {
    console.warn('AI summarization failed, using fallback:', error);
  }

  // Fallback to constructed summary
  console.log('Using fallback history summarization...');
  return `The protagonist finds themselves in ${worldState.setting}, grappling with ${worldState.dilemma}. Their psychological state has shifted to ${worldState.psychologicalStatus}. Most recently: ${lastSegment.text}`;
};
