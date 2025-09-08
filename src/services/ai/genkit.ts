import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';
import {
  Command,
  GameCommand,
  GenreConfig,
  StorySegment,
  WorldState,
  commandArraySchema,
} from '../../types';
import { API_KEYS } from '../config';

const genAI = new GoogleGenerativeAI(API_KEYS.googleGenAI);

const generationConfig = {
  temperature: 1,
  topK: 0,
  topP: 0.95,
  maxOutputTokens: 8192,
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

async function runAIFlow(
  systemInstruction: string,
  prompt: string
): Promise<GameCommand[]> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction,
  });

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const jsonText = text.substring(text.indexOf('[')!, text.lastIndexOf(']')! + 1);
    const commands = JSON.parse(jsonText);
    return commandArraySchema.parse(commands);
  } catch (error) {
    console.error('AI flow failed:', error);
    // Fallback for API call or parsing failure
    return [
      {
        type: 'displayText',
        payload: {
          content: 'A tear in the fabric of reality prevents you from proceeding. The connection is unstable.',
          segmentId: 'error-segment-api',
        },
      },
      {
        type: 'displayChoices',
        payload: {
          choices: [{ text: 'Try to force the way forward.', isIntrusive: false, segmentId: 'retry-last-action' }],
        },
      },
    ];
  }
}

export const generateConceptFlow = async (
  genreConfig: GenreConfig
): Promise<{ protagonist: string; setting: string; dilemma: string }> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `Generate a compelling protagonist, setting, and core dilemma for a story in the ${genreConfig.name} genre. The style should be ${genreConfig.style}. Return a JSON object with keys "protagonist", "setting", and "dilemma".`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const json = JSON.parse(text.replace(/```json|```/g, '').trim());
    return {
      protagonist: json.protagonist || 'A lost soul',
      setting: json.setting || 'A forgotten place',
      dilemma: json.dilemma || 'A choice with no right answer',
    };
  } catch (error) {
    console.error('Concept generation failed:', error);
    return {
      protagonist: 'A lost soul',
      setting: 'A forgotten place',
      dilemma: 'A choice with no right answer',
    };
  }
};

export const generateImageFlow = async (prompt: string): Promise<string> => {
  return processImageGeneration(prompt);
};

/**
 * Placeholder for a real AI image generation service.
 * Currently falls back to Unsplash.
 */
export const processImageGeneration = async (prompt: string): Promise<string> => {
  // In a real implementation, you would call your chosen image generation API here.
  // For now, we'll just log and use the Unsplash fallback.
  console.log(`Image generation requested for prompt: "${prompt}"`);
  
  try {
    // const response = await someImageGenerationApi(prompt, API_KEYS.imageApiKey);
    // return response.imageUrl;
    throw new Error("Image generation service not implemented.");
  } catch (error) {
    console.warn('Image generation failed, falling back to Unsplash.', error);
    const encodedPrompt = encodeURIComponent(prompt);
    const keywords = 'dark,horror,surreal,abstract';
    return `https://source.unsplash.com/1920x1080/?${keywords},${encodedPrompt}`;
  }
};

interface NextStepInput {
  playerChoice: string;
  worldState: WorldState;
  history: StorySegment[];
  genreConfig: GenreConfig;
}

export const nextStepFlow = async (input: NextStepInput): Promise<Command[]> => {
  const { playerChoice, worldState, history, genreConfig } = input;

  const systemInstruction = `${genreConfig.aiSystemInstruction}. The current psychological status is ${worldState.psychologicalStatus}. The system health is at ${worldState.systemHealth}%. Return a JSON array of commands.`;

  const prompt = `
    The current world state is:
    Protagonist: ${worldState.protagonist}
    Setting: ${worldState.setting}
    Dilemma: ${worldState.dilemma}
    Summary: ${worldState.summary}

    The story so far (last 3 segments):
    ${history.slice(-3).map((s) => s.text).join('\n---\n')}

    The player chose: "${playerChoice}"

    Generate the next set of commands to continue the story.
  `;

  return runAIFlow(systemInstruction, prompt);
};

