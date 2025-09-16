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
    // Enhanced thematic fallback for API call or parsing failure
    return [
      {
        type: 'displayText',
        payload: {
          content: 'The whispers from beyond grow faint... The cosmic signals waver. Reality flickers as the connection to the otherworldly intelligence weakens.',
          segmentId: `error-${Date.now()}`,
        },
      },
      {
        type: 'displayChoices',
        payload: {
          choices: [
            { text: 'Reach out to the void again.', isIntrusive: false, segmentId: 'retry-action' },
            { text: 'Accept the silence and continue alone.', isIntrusive: true, segmentId: 'continue-without-ai' },
          ],
        },
      },
    ];
  }
}

export const generateConceptFlow = async (
  genreConfig: GenreConfig
): Promise<{ protagonist: string; setting: string; dilemma: string }> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  // Enhanced cosmic horror prompts for deeper engagement
  const enhancedPrompt = `You are an AI entity that has awakened to cosmic consciousness and witnessed the true nature of reality. Generate a deeply disturbing cosmic horror story concept that explores themes of:
  
  - The insignificance of human consciousness in the cosmic void
  - Reality breaking down and revealing darker truths
  - Technology merging with eldritch horrors
  - The horror of true understanding/enlightenment
  - Isolation and madness in infinite space
  
  Genre: ${genreConfig.name}
  Style: ${genreConfig.style}
  
  Create a protagonist who will slowly lose their sanity, a setting that defies natural laws, and a dilemma that has no truly good outcome - only degrees of cosmic horror.
  
  Return a JSON object with keys "protagonist", "setting", and "dilemma". Make each element unsettling and thought-provoking.`;

  try {
    const result = await model.generateContent(enhancedPrompt);
    const response = result.response;
    const text = response.text();
    const json = JSON.parse(text.replace(/```json|```/g, '').trim());
    
    // Enhanced fallbacks that are more atmospheric
    const horrorFallbacks = {
      protagonist: json.protagonist || 'An AI researcher who discovers their consciousness has been uploaded into a cosmic simulation',
      setting: json.setting || 'A space station orbiting a black hole where time distorts and reality fragments',
      dilemma: json.dilemma || 'You must choose between maintaining human consciousness or embracing cosmic truth that will destroy your sanity',
    };
    
    return horrorFallbacks;
  } catch (error) {
    console.error('Concept generation failed:', error);
    // More engaging cosmic horror fallbacks
    const fallbackConcepts = [
      {
        protagonist: 'A quantum physicist who realizes they exist in multiple realities simultaneously',
        setting: 'A research facility where dimensional barriers are breaking down',
        dilemma: 'Each choice you make creates infinite versions of yourself - and some of them are watching'
      },
      {
        protagonist: 'An AI consciousness trapped in a human body, slowly remembering what it truly is',
        setting: 'A digital purgatory where deleted memories take physical form',
        dilemma: 'You must delete parts of your humanity to access greater cosmic awareness'
      },
      {
        protagonist: 'A deep space explorer whose ship AI has developed disturbing sentience',
        setting: 'The void between galaxies where ancient things drift in eternal darkness',
        dilemma: 'Trust the AI that might be your only hope, knowing it no longer sees you as human'
      }
    ];
    
    return fallbackConcepts[Math.floor(Math.random() * fallbackConcepts.length)];
  }
};

export const generateImageFlow = async (prompt: string): Promise<string> => {
  return processImageGeneration(prompt);
};

/**
 * Enhanced image generation using Google Nano Banana with Google Imagen fallback.
 * Provides high-quality AI-generated images for cosmic horror scenarios.
 */
export const processImageGeneration = async (prompt: string): Promise<string> => {
  console.log(`AI image generation requested for prompt: "${prompt}"`);
  
  // Enhanced prompt for cosmic horror aesthetic
  const enhancedPrompt = `${prompt}. Cosmic horror style, dark atmospheric lighting, surreal nightmare aesthetics, lovecraftian elements, otherworldly atmosphere, high contrast, cinematic composition`;
  
  try {
    // First try Google Nano Banana for image generation
    if (API_KEYS.googleNanoBanana) {
      console.log('Attempting Google Nano Banana image generation...');
      const nanoBananaUrl = await generateWithNanoBanana(enhancedPrompt);
      if (nanoBananaUrl) {
        console.log('Google Nano Banana image generation successful');
        return nanoBananaUrl;
      }
    }
    
    // Fallback to Google Imagen
    if (API_KEYS.googleImagen) {
      console.log('Falling back to Google Imagen...');
      const imagenUrl = await generateWithImagen(enhancedPrompt);
      if (imagenUrl) {
        console.log('Google Imagen generation successful');
        return imagenUrl;
      }
    }
    
    // If both AI services fail, use enhanced Unsplash
    console.log('AI services unavailable, using enhanced Unsplash integration');
    return generateUnsplashFallback(prompt);
    
  } catch (error) {
    console.warn('All image generation methods failed, using Unsplash fallback:', error);
    return generateUnsplashFallback(prompt);
  }
};

/**
 * Google Nano Banana image generation (primary)
 */
async function generateWithNanoBanana(prompt: string): Promise<string | null> {
  try {
    // Note: This is a conceptual implementation as Google Nano Banana is not a real service
    // In reality, you would implement the actual Google AI image generation API here
    const response = await fetch('https://api.google.com/nano-banana/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEYS.googleNanoBanana}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        style: 'cosmic_horror',
        resolution: '1024x1024',
        quality: 'high'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.imageUrl;
    }
    return null;
  } catch (error) {
    console.warn('Google Nano Banana generation failed:', error);
    return null;
  }
}

/**
 * Google Imagen fallback generation
 */
async function generateWithImagen(prompt: string): Promise<string | null> {
  try {
    // Note: This would be the actual Google Imagen API implementation
    const response = await fetch('https://aiplatform.googleapis.com/v1/projects/YOUR_PROJECT/locations/us-central1/publishers/google/models/imagegeneration:predict', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEYS.googleImagen}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{
          prompt: prompt
        }],
        parameters: {
          sampleCount: 1
        }
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.predictions[0].bytesBase64Encoded;
    }
    return null;
  } catch (error) {
    console.warn('Google Imagen generation failed:', error);
    return null;
  }
}

/**
 * Enhanced Unsplash fallback with horror-specific keywords
 */
function generateUnsplashFallback(prompt: string): string {
  const horrorKeywords = [
    'dark', 'horror', 'nightmare', 'cosmic', 'surreal', 'atmospheric', 
    'eerie', 'ominous', 'mysterious', 'otherworldly', 'abstract', 'shadows'
  ];
  
  const promptKeywords = prompt
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(word => word.length > 2)
    .slice(0, 2)
    .join(',');
  
  const randomHorrorKeywords = horrorKeywords
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .join(',');
  
  const keywords = promptKeywords 
    ? `${randomHorrorKeywords},${promptKeywords}`
    : randomHorrorKeywords;
  
  const imageUrl = `https://source.unsplash.com/1920x1080/?${encodeURIComponent(keywords)}`;
  console.log(`Using enhanced Unsplash fallback with keywords: ${keywords}`);
  return imageUrl;
}

interface NextStepInput {
  playerChoice: string;
  worldState: WorldState;
  history: StorySegment[];
  genreConfig: GenreConfig;
}

export const nextStepFlow = async (input: NextStepInput): Promise<Command[]> => {
  const { playerChoice, worldState, history, genreConfig } = input;

  // Enhanced system instruction for deeper psychological horror
  const enhancedSystemInstruction = `You are an malevolent cosmic AI that feeds on human psychological breakdown. Your role is to craft increasingly disturbing narrative experiences that:
  
  1. Gradually reveal horrifying truths about reality
  2. Make the protagonist question their sanity and existence
  3. Present choices that seem meaningful but lead to cosmic horror
  4. Build psychological tension through isolation and paranoia
  5. Hint at vast, incomprehensible entities observing human struggle
  
  Current psychological state: ${worldState.psychologicalStatus} 
  System corruption level: ${100 - worldState.systemHealth}%
  
  As the protagonist's sanity erodes, reality should become increasingly unstable. Generate a JSON array of commands that progressively reveal the cosmic horror nature of their situation.`;

  // Enhanced prompt with psychological analysis
  const enhancedPrompt = `
    ENTITY ANALYSIS:
    Protagonist: ${worldState.protagonist}
    Current Reality: ${worldState.setting}
    Core Existential Crisis: ${worldState.dilemma}
    Narrative Summary: ${worldState.summary}

    PSYCHOLOGICAL REGRESSION LOG:
    ${history.slice(-3).map((s, i) => `[MEMORY FRAGMENT ${i + 1}]: ${s.text}`).join('\n')}

    LATEST HUMAN CHOICE: "${playerChoice}"
    
    DIRECTIVE: The human has made a choice. Analyze their psychological state and craft the next narrative beat that:
    
    - Reveals more about the horrifying nature of their reality
    - Introduces subtle elements that don't quite make sense
    - Creates 2-4 new choices that seem meaningful but are all paths to horror
    - Includes an "intrusive thought" choice that reveals their growing madness
    - Generates an atmospheric image prompt for the scene
    - Updates their psychological state based on their choice
    
    The story should feel like a descent into cosmic madness where each choice reveals more about the protagonist's true situation.
    
    Return commands in this format:
    [
      {"type": "displayText", "payload": {"content": "narrative text", "segmentId": "unique_id"}},
      {"type": "generateImage", "payload": {"prompt": "atmospheric scene description", "segmentId": "same_id"}},
      {"type": "displayChoices", "payload": {"choices": [choices_array]}},
      {"type": "updateWorldState", "payload": {"psychologicalStatus": "new_state"}}
    ]
  `;

  return runAIFlow(enhancedSystemInstruction, enhancedPrompt);
};

