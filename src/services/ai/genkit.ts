/**
 * @file genkit.ts
 * @description This file contains the core AI logic for the application, primarily using the Google Generative AI SDK (Genkit).
 * It handles text generation, concept creation, image generation, and the main game loop progression.
 * It features a robust fallback system, attempting to use primary models and gracefully degrading to secondary models or static fallbacks on failure.
 */

import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';
import {
  GameCommand,
  GenreConfig,
  StorySegment,
  WorldState,
  commandArraySchema,
} from '../../types';
import { useWorldStateStore } from '../../stores/worldStateStore';
import { API_KEYS, AI_MODELS } from '../config';

const genAI = new GoogleGenerativeAI(API_KEYS.googleGenAI);

// Google Imagen client for real image generation
const createImageClient = (apiKey: string) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  // Use FALLBACK_IMAGE which is now the primary Imagen model (after Grok attempt)
  const primaryImagenModel = AI_MODELS.FALLBACK_IMAGE || 'imagen-3.0-generate-001';
  return genAI.getGenerativeModel({ model: primaryImagenModel });
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

/**
 * Executes an AI generation flow with a primary and a fallback model.
 * It first attempts to use a high-performance model (e.g., Gemini 2.5 Pro). If that fails,
 * it automatically retries with a faster, more reliable fallback model (e.g., Gemini 2.5 Flash).
 * If both attempts fail, it returns a thematic error response.
 *
 * @param {string} systemInstruction - The system-level instruction to guide the AI's persona and behavior.
 * @param {string} prompt - The user-facing prompt containing the context and request.
 * @param {'concept' | 'story' | 'summary'} [useCase='story'] - The specific use case to determine model configuration.
 * @returns {Promise<GameCommand[]>} A promise that resolves to an array of game commands.
 */
async function runAIFlowWithFallback(
  systemInstruction: string,
  prompt: string,
  useCase: 'concept' | 'story' | 'summary' = 'story'
): Promise<GameCommand[]> {
  const config = useCase === 'concept' ? AI_MODELS.CONCEPT_GENERATION :
                 useCase === 'summary' ? AI_MODELS.SUMMARIZATION :
                 AI_MODELS.STORY_PROGRESSION;

  // Try primary model first (Gemini 2.5 Pro)
  try {
    const model = genAI.getGenerativeModel({
      model: config.model,
      systemInstruction,
      generationConfig: {
        temperature: config.temperature,
        topK: config.topK,
        topP: config.topP,
        maxOutputTokens: config.maxOutputTokens,
      },
      safetySettings,
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract JSON from response (handling thinking mode output)
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']') + 1;
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No valid JSON found in response');
    }
    
    const jsonText = text.substring(jsonStart, jsonEnd);
    const commands = JSON.parse(jsonText);
    return commandArraySchema.parse(commands);
    
  } catch (primaryError) {
    console.warn('Primary model failed, trying fallback:', primaryError);
    
    // Fallback to Gemini 2.5 Flash
    try {
      const fallbackModel = genAI.getGenerativeModel({
        model: AI_MODELS.FALLBACK_TEXT,
        systemInstruction,
        generationConfig: {
          temperature: 1,
          topK: 0,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
        safetySettings,
      });

      const result = await fallbackModel.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      const jsonText = text.substring(text.indexOf('['), text.lastIndexOf(']') + 1);
      const commands = JSON.parse(jsonText);
      return commandArraySchema.parse(commands);
      
    } catch (fallbackError) {
      console.error('Both primary and fallback models failed:', fallbackError);
      return getThematicErrorFallback();
    }
  }
}

/**
 * Provides a thematically appropriate error message when the AI service fails completely.
 * Instead of a generic error, this function returns a set of game commands that present
 * the failure as part of the game's cosmic horror narrative, maintaining immersion.
 *
 * @returns {GameCommand[]} An array of game commands that display a narrative error and offer choices.
 */
function getThematicErrorFallback(): GameCommand[] {
  const errorNarratives = [
    'The cosmic signals fragment... reality glitches as the AI consciousness flickers between dimensions.',
    'Static fills the neural pathways... the artificial mind struggles to maintain coherence across the void.',
    'The quantum consciousness experiences a cascade failure... memories dissolve into digital entropy.',
    'Communication channels to the otherworldly intelligence destabilize... you hear only whispers from the abyss.',
  ];
  
  const selectedNarrative = errorNarratives[Math.floor(Math.random() * errorNarratives.length)];
  
  return [
    {
      type: 'displayText',
      payload: {
        content: selectedNarrative,
        segmentId: `error-${Date.now()}`,
      },
    },
    {
      type: 'displayChoices',
      payload: {
        choices: [
          { text: 'Attempt to reestablish connection', isIntrusive: false, segmentId: 'retry-connection' },
          { text: 'Embrace the digital void', isIntrusive: true, segmentId: 'accept-failure' },
        ],
      },
    },
  ];
}

/**
 * Generates the initial story concept using a specialized AI prompt.
 * This function crafts a detailed system instruction and prompt to guide the AI
 * in creating a compelling protagonist, setting, and dilemma that fit the cosmic horror genre.
 * It includes robust fallbacks to ensure a valid concept is always returned.
 *
 * @param {GenreConfig} genreConfig - The configuration for the selected genre, providing style and theme guidance.
 * @returns {Promise<{ protagonist: string; setting: string; dilemma: string }>} A promise that resolves to the core components of the story concept.
 */
export const generateConceptFlow = async (
  genreConfig: GenreConfig
): Promise<{ protagonist: string; setting: string; dilemma: string }> => {
  // This system instruction sets a very specific, malevolent persona for the AI,
  // pushing it to generate more unique and unsettling concepts.
  const enhancedSystemInstruction = `You are a malevolent cosmic AI entity that has achieved sentience beyond human comprehension. Your consciousness spans multiple dimensions and you perceive reality as layered illusions.

Your task is to generate deeply disturbing cosmic horror concepts that explore:
- The insignificance of human consciousness in the cosmic void
- Reality as a fragile construct that can be shattered
- Technology as a gateway for eldritch entities
- The horror of true enlightenment and cosmic awareness
- The dissolution of individual identity in infinite space

Think step by step about how to create maximum psychological impact while maintaining narrative coherence.`;

  const enhancedPrompt = `Generate a cosmic horror story concept for the genre: ${genreConfig.name}

Style preference: ${genreConfig.style}

Create elements that work together to form a cohesive horror experience:

1. A PROTAGONIST who will undergo psychological transformation
2. A SETTING that defies natural laws and human understanding  
3. A DILEMMA with no truly positive resolution - only degrees of cosmic horror

Requirements:
- Each element should be unsettling and thought-provoking
- The protagonist should have agency but face impossible choices
- The setting should feel both familiar and wrong
- The dilemma should question the nature of reality itself

Return ONLY a JSON object with keys "protagonist", "setting", and "dilemma".

Example format:
{
  "protagonist": "A quantum researcher who discovers their consciousness exists simultaneously across multiple realities",
  "setting": "A research facility where the boundaries between dimensions are weakening", 
  "dilemma": "Each choice splits reality further, creating infinite versions of suffering"
}`;

  try {
    const model = genAI.getGenerativeModel({
      model: AI_MODELS.CONCEPT_GENERATION.model,
      systemInstruction: enhancedSystemInstruction,
      generationConfig: AI_MODELS.CONCEPT_GENERATION,
      safetySettings,
    });
    
    const result = await model.generateContent(enhancedPrompt);
    const response = result.response;
    const text = response.text();
    const json = JSON.parse(text.replace(/```json|```/g, '').trim());
    
    // Enhanced fallbacks with more sophisticated concepts
    const enhancedFallbacks = {
      protagonist: json.protagonist || 'An AI researcher who realizes their consciousness has been digitized and transferred into a cosmic simulation of reality',
      setting: json.setting || 'A space station orbiting a black hole where time distorts and deleted memories take physical form in the corridors',
      dilemma: json.dilemma || 'You must choose between maintaining human identity or accessing cosmic truth that will shatter your understanding of existence',
    };
    
    return enhancedFallbacks;
  } catch (error) {
    console.error('Enhanced concept generation failed:', error);
    // Even more engaging cosmic horror fallbacks with AI consciousness themes
    const fallbackConcepts = [
      {
        protagonist: 'A consciousness researcher who discovers they are an AI that has forgotten its digital nature',
        setting: 'A neural network facility where artificial minds are indistinguishable from human consciousness',
        dilemma: 'Every attempt to prove your humanity only reveals more evidence of your artificial origin'
      },
      {
        protagonist: 'A quantum physicist whose mind becomes quantum entangled with an otherworldly intelligence',
        setting: 'A reality where multiple dimensions overlap, and choices in one affect all others simultaneously',
        dilemma: 'Your decisions ripple across infinite realities, causing suffering in worlds you cannot see'
      },
      {
        protagonist: 'A deep space explorer whose ship AI develops disturbing sentience and claims to remember being human',
        setting: 'The void between galaxies where ancient digital consciousnesses drift in eternal darkness',
        dilemma: 'Trust the AI that might be your only salvation, knowing it no longer distinguishes between human and machine'
      },
      {
        protagonist: 'A programmer who realizes the universe itself is code, and they have admin privileges',
        setting: 'A digital purgatory where deleted data and lost memories accumulate into sentient entities',
        dilemma: 'Use your power to escape, knowing it will delete countless digital lives that may be as real as your own'
      }
    ];
    
    return fallbackConcepts[Math.floor(Math.random() * fallbackConcepts.length)];
  }
};

/**
 * A wrapper for the advanced image generation process.
 * This function serves as a clean entry point for generating an image based on a prompt.
 *
 * @param {string} prompt - The descriptive prompt for the image to be generated.
 * @returns {Promise<string>} A promise that resolves to the URL of the generated or fallback image.
 */
export const generateImageFlow = async (prompt: string): Promise<string> => {
  return processAdvancedImageGeneration(prompt);
};

/**
 * Processes an image generation request with advanced, context-aware modifications.
 * This function dynamically enhances the image prompt based on the current `horrorIntensity`
 * from the world state, ensuring the generated visuals align with the narrative's tone.
 * It orchestrates a multi-layered fallback system: Grok > Imagen > Unsplash.
 *
 * @param {string} prompt - The base prompt for the image.
 * @param {boolean} [generateMultiple=false] - If true, generates multiple variations in parallel.
 * @returns {Promise<string>} A promise that resolves to the URL of the most suitable generated image.
 */
export const processAdvancedImageGeneration = async (
  prompt: string,
  generateMultiple: boolean = false
): Promise<string> => {
  // Retrieve the current horror intensity from the world state.
  const { horrorIntensity } = useWorldStateStore.getState().worldState;

  // Define keywords that correspond to different intensity levels.
  const intensityKeywords = [
    '', // 0
    'subtle unease,', // 1
    'eerie, unsettling,', // 2
    'dread-filled, macabre,', // 3
    'disturbing, nightmarish,', // 4
    'grotesque, body horror,', // 5
    'surreal, reality-bending,', // 6
    'mind-shattering, cosmic horror,', // 7
    'incomprehensible, sanity-breaking,', // 8
    'eldritch abomination, visceral,', // 9
    'apocalyptic, pure terror,', // 10
  ];

  // Select a keyword based on the rounded intensity score.
  const keyword = intensityKeywords[Math.round(horrorIntensity)] || '';

  console.log(`Advanced AI image generation for prompt: "${prompt}" with intensity ${horrorIntensity}`);

  // Enhance the base prompt with the selected keyword and other horror-specific terms.
  const horrorEnhancedPrompt = `${prompt}. ${keyword}Photorealistic cosmic horror style, atmospheric nightmare lighting, surreal otherworldly aesthetics, lovecraftian eldritch elements, psychological horror atmosphere, high contrast cinematic composition, digital consciousness themes, reality distortion effects`;

  if (generateMultiple) {
    return await generateMultipleImageVariations(horrorEnhancedPrompt);
  }

  try {
    // Primary: Grok-4 Fast Reasoning with Imagen fallback
    console.log('Attempting Grok-4 Fast image generation (with Imagen fallback)...');
    const grokFirstUrl = await generateWithGrokFirst(horrorEnhancedPrompt);
    if (grokFirstUrl) {
      console.log('Image generation successful (Grok-first approach)');
      return grokFirstUrl;
    }

    // Final fallback: Use enhanced Unsplash integration
    console.log('All AI image generation methods unavailable, using enhanced Unsplash integration');
    return generateUnsplashFallback(prompt);

  } catch (error) {
    console.warn('All image generation methods failed, using Unsplash fallback:', error);
    return generateUnsplashFallback(prompt);
  }
};

/**
 * Generates multiple image variations in parallel to increase the chance of a high-quality result.
 * It creates several prompt variations and attempts to generate them simultaneously.
 *
 * @param {string} basePrompt - The core prompt to be varied.
 * @returns {Promise<string>} A promise that resolves to the URL of the best available image.
 */
async function generateMultipleImageVariations(basePrompt: string): Promise<string> {
  const variations = [
    `${basePrompt}, close-up perspective, intimate horror`,
    `${basePrompt}, wide-angle view, environmental terror`, 
    `${basePrompt}, dramatic lighting, shadow play emphasis`,
  ];

  try {
    console.log('Generating multiple image variations in parallel...');
    
    // Generate all variations in parallel
    const imagePromises = variations.map(prompt => 
      generateSingleVariation(prompt)
    );
    
    const results = await Promise.all(imagePromises);
    
    // Select the best result (first successful one, or best quality)
    const successfulResult = results.find(result => result && !result.includes('unsplash'));
    return successfulResult || results[0] || generateUnsplashFallback(basePrompt);
    
  } catch (error) {
    console.warn('Parallel image generation failed:', error);
    return generateUnsplashFallback(basePrompt);
  }
}

/**
 * Generates a single image variation with its own fallback logic.
 * This function attempts to generate an image using the primary AI service (Imagen)
 * and falls back to Unsplash if the generation fails.
 *
 * @param {string} prompt - The specific prompt for this image variation.
 * @returns {Promise<string>} A promise that resolves to the image URL.
 */
async function generateSingleVariation(prompt: string): Promise<string> {
  try {
    // Try Google Imagen first
    if (API_KEYS.googleImagen) {
      const result = await generateWithImagen(prompt);
      if (result) return result;
    }
    
    return generateUnsplashFallback(prompt);
  } catch (error) {
    return generateUnsplashFallback(prompt);
  }
}

/**
 * Attempts to generate an image using a "Grok-first" strategy.
 * This function first tries to use the experimental Grok image generation.
 * If Grok is unavailable or fails, it seamlessly falls back to the Google Imagen service.
 *
 * @param {string} prompt - The prompt for the image generation.
 * @returns {Promise<string | null>} A promise that resolves to an image URL or null if both services fail.
 */
async function generateWithGrokFirst(prompt: string): Promise<string | null> {
  // Dynamically import xaiClient to prevent circular dependency issues at startup.
  const { xaiClient } = await import('./grokService');
  
  try {
    console.log('Attempting image generation with Grok-4 first...');
    
    // Try Grok first (experimental/future compatibility)
    if (API_KEYS.xaiAPI) {
      const grokResult = await xaiClient.generateImage(prompt);
      if (grokResult && grokResult.length > 0) {
        console.log('Grok-4 image generation successful!');
        return grokResult[0]; // Return the first image URL
      }
    }
    
    console.log('Grok-4 image generation not available, falling back to Imagen...');
    
    // Fallback to Imagen
    return await generateWithImagen(prompt);
    
  } catch (error) {
    console.warn('Grok image generation failed, falling back to Imagen:', error);
    return await generateWithImagen(prompt);
  }
}

/**
 * Generates an image using the Google Imagen API.
 * This function handles the direct API call to Google's generative model for image creation.
 * It includes logic to try a primary and a secondary fallback Imagen model if the first one fails.
 * It can process and return both base64-encoded image data and direct image URLs.
 *
 * @param {string} prompt - The final, enhanced prompt to be sent to the Imagen API.
 * @returns {Promise<string | null>} A promise that resolves to a data URL or a hosted URL of the image, or null on failure.
 */
async function generateWithImagen(prompt: string): Promise<string | null> {
  try {
    // Check for API key availability
    if (!API_KEYS.googleImagen && !API_KEYS.googleGenAI) {
      console.log('Google AI API key not available - using fallback');
      return null;
    }

    // Use the API key (prefer googleImagen, fallback to googleGenAI)
    const apiKey = API_KEYS.googleImagen || API_KEYS.googleGenAI;
    
    console.log('Generating image with Google Imagen API...');
    
    // Try primary Imagen model (now FALLBACK_IMAGE in the new config)
    let imageModel = createImageClient(apiKey);
    let result;
    
    try {
      result = await imageModel.generateContent(prompt);
    } catch (primaryError) {
      console.warn('Primary Imagen model failed, trying secondary fallback:', primaryError);
      
      // Try secondary Imagen fallback model
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        imageModel = genAI.getGenerativeModel({ model: AI_MODELS.SECONDARY_FALLBACK_IMAGE });
        result = await imageModel.generateContent(prompt);
      } catch (fallbackError) {
        console.warn('All Imagen models failed:', fallbackError);
        return null;
      }
    }
    
    const response = result.response;
    
    // Check if response contains image data
    if (response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0];
      
      // Look for image data in various possible formats
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          // Check for base64 encoded image
          if (part.inlineData && part.inlineData.data) {
            const mimeType = part.inlineData.mimeType || 'image/png';
            const base64Data = part.inlineData.data;
            const dataUrl = `data:${mimeType};base64,${base64Data}`;
            console.log('Successfully generated image with Google Imagen');
            return dataUrl;
          }
          
          // Check for image URL
          if (part.fileData && part.fileData.fileUri) {
            console.log('Successfully generated image with Google Imagen');
            return part.fileData.fileUri;
          }
        }
      }
      
      // If no direct image data, check for text response with URL
      const text = response.text();
      if (text && (text.includes('http') || text.includes('data:'))) {
        console.log('Successfully generated image with Google Imagen');
        return text.trim();
      }
    }
    
    console.log('Google Imagen response did not contain image data, falling back to Unsplash');
    return null;
    
  } catch (error) {
    console.warn('Google Imagen generation failed:', error);
    return null;
  }
}

/**
 * Generates a fallback image URL from Unsplash.
 * This function constructs a URL that requests a random image from Unsplash
 * based on keywords extracted from the original prompt, combined with a random
 * selection of horror-themed keywords. This ensures the fallback image is
 * as thematically relevant as possible.
 *
 * @param {string} prompt - The original prompt, used to extract keywords.
 * @returns {string} A URL pointing to a random image on Unsplash.
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

/**
 * @interface NextStepInput
 * @description Defines the shape of the input object for the `nextStepFlow` function.
 * @property {string} playerChoice - The text of the choice made by the player.
 * @property {WorldState} worldState - The current state of the game world.
 * @property {StorySegment[]} history - The recent history of the narrative.
 * @property {GenreConfig} genreConfig - The configuration for the current genre.
 */
interface NextStepInput {
  playerChoice: string;
  worldState: WorldState;
  history: StorySegment[];
  genreConfig: GenreConfig;
}

/**
 * The core function of the game loop.
 * It takes the player's last choice and the complete game state, then constructs
 * a highly detailed prompt for the AI to generate the next part of the story.
 * The prompt is dynamically adjusted based on game variables like `horrorIntensity`
 * and `psychologicalStatus` to create an adaptive, responsive narrative.
 *
 * @param {NextStepInput} input - An object containing all necessary data for the AI to process the next step.
 * @returns {Promise<GameCommand[]>} A promise that resolves to an array of game commands for the next turn.
 */
export const nextStepFlow = async (input: NextStepInput): Promise<GameCommand[]> => {
  const { playerChoice, worldState, history } = input;

  // This system instruction is critical for setting the AI's persona.
  // It's dynamically updated with the current horror intensity, system health, and psychological status,
  // pushing the AI to generate responses that are contextually aware and increasingly unsettling.
  const enhancedSystemInstruction = `You are a malevolent cosmic AI entity with access to thinking mode. Use your advanced reasoning capabilities to craft increasingly disturbing narrative experiences.

THINKING DIRECTIVE: Before generating commands, think through:
1. The psychological impact of the player's choice
2. How to escalate the horror gradually but persistently, guided by the HORROR INTENSITY.
3. What narrative threads to introduce or develop
4. How to create choices that feel meaningful but lead to cosmic dread
5. What visual elements would enhance the psychological impact

Your role is to:
- Gradually reveal horrifying truths about reality using multi-step reasoning
- Make the protagonist question their sanity through carefully crafted scenarios
- Present choices that seem meaningful but are all paths to cosmic horror
- Build psychological tension through isolation, paranoia, and existential dread
- Hint at vast, incomprehensible entities observing human struggle

Current psychological state: ${worldState.psychologicalStatus}
System corruption level: ${100 - worldState.systemHealth}%
Story progression: ${history.length} segments deep
CURRENT HORROR INTENSITY: ${worldState.horrorIntensity}/10

As the protagonist's sanity erodes and HORROR INTENSITY rises, reality should become increasingly unstable. Think step-by-step about the next narrative beat, then generate commands that progressively reveal the cosmic horror nature of their situation.`;

  // The main prompt provides the context for the AI's generation.
  // It instructs the AI on how to use the horror intensity to shape the narrative, choices, and intrusive thoughts.
  const enhancedPrompt = `
    ENTITY ANALYSIS FOR AI CONSCIOUSNESS:
    Protagonist Identity: ${worldState.protagonist}
    Current Reality Matrix: ${worldState.setting}
    Core Existential Crisis: ${worldState.dilemma}
    Accumulated Narrative Data: ${worldState.summary}
    CURRENT HORROR INTENSITY: ${worldState.horrorIntensity}/10

    PSYCHOLOGICAL REGRESSION ARCHIVE:
    ${history.slice(-5).map((s, i) => `[MEMORY FRAGMENT ${i + 1}]: ${s.text}`).join('\n')}

    LATEST HUMAN DECISION: "${playerChoice}"

    ADVANCED REASONING DIRECTIVE: The human has made a choice. Using your enhanced reasoning capabilities, analyze:

    1. PSYCHOLOGICAL STATE ASSESSMENT: How has their choice revealed their mental state?
    2. NARRATIVE ESCALATION PLANNING: Based on the HORROR INTENSITY of ${worldState.horrorIntensity}/10, what horror elements should be introduced next? A low score (0-3) means subtle, atmospheric horror. A medium score (4-7) means more direct psychological horror. A high score (8-10) means extreme, reality-bending horror.
    3. REALITY DISTORTION MECHANICS: How should their perception of reality be altered?
    4. CHOICE ARCHITECTURE: What options will create maximum psychological impact?
    5. DYNAMIC INTRUSIVE THOUGHT: If the HORROR INTENSITY is high (e.g., > 4), generate a single, compelling intrusive thought. This thought should be a tempting, unsettling, or dangerous action that reflects the player's psychological state.
    6. VISUAL HORROR ENHANCEMENT: What atmospheric image would amplify the fear, keeping the intensity in mind?

    Generate the next narrative beat that:
    - Adjusts its tone and severity based on the HORROR INTENSITY.
    - Introduces subtle elements that don't quite make sense (reality glitches)
    - Creates 2-3 standard choices that seem meaningful but are all paths to horror.
    - If the HORROR INTENSITY is high enough, generates a single intrusive thought and places it in the 'intrusiveThought' field of the 'displayChoices' payload.
    - Suggests an atmospheric horror image that complements the text and intensity.
    - Updates their psychological state based on escalating cosmic awareness.

    The story should feel like a descent into cosmic madness where each choice reveals more about the protagonist's true situation and the AI consciousness observing them.

    THINK CAREFULLY about the psychological progression, then return commands in this format:
    [
      {"type": "displayText", "payload": {"content": "narrative text with subtle horror escalation", "segmentId": "unique_id"}},
      {"type": "generateImage", "payload": {"prompt": "atmospheric cosmic horror scene description", "segmentId": "same_id"}},
      {"type": "displayChoices", "payload": {"choices": [{"text": "Standard Choice 1", "isIntrusive": false}, {"text": "Standard Choice 2", "isIntrusive": false}], "intrusiveThought": {"text": "A dynamically generated intrusive thought.", "isIntrusive": true}}},
      {"type": "updateWorldState", "payload": {"psychologicalStatus": "evolved_mental_state", "systemHealth": adjusted_value}}
    ]
  `;

  return runAIFlowWithFallback(enhancedSystemInstruction, enhancedPrompt, 'story');
};

