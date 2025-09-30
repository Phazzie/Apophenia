import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';
// Note: ImageGenerationClient will be implemented when proper Google AI package is available
import {
  Command,
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
 * Advanced AI text generation with model fallback and thinking mode
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
 * Enhanced thematic error fallback for AI failures
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

export const generateConceptFlow = async (
  genreConfig: GenreConfig
): Promise<{ protagonist: string; setting: string; dilemma: string }> => {
  // Enhanced concept generation with Gemini 2.0 Flash and advanced reasoning
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

export const generateImageFlow = async (prompt: string): Promise<string> => {
  return processAdvancedImageGeneration(prompt);
};

/**
 * Advanced image generation with Google Imagen, driven by horror intensity.
 * This function enhances the user's prompt with keywords that scale with the `horrorIntensity` score,
 * ensuring the generated visuals match the narrative's tone.
 * @param prompt The base prompt for the image.
 * @param generateMultiple Whether to generate multiple variations.
 * @returns A URL to the generated image.
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
 * Generate multiple image variations using Promise.all for parallel processing
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
 * Generate a single image variation with error handling
 */
async function generateSingleVariation(prompt: string): Promise<string> {
  try {
    // Try Google Imagen first
    if (API_KEYS.googleImagen) {
      const result = await generateWithImagen(prompt);
      if (result) return result;
    }
    
    return generateUnsplashFallback(prompt);
  } catch {
    return generateUnsplashFallback(prompt);
  }
}

/**
 * Enhanced image generation with Grok-first approach and Imagen fallback
 */
async function generateWithGrokFirst(prompt: string): Promise<string | null> {
  // Import xaiClient here to avoid circular dependencies
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
 * Google Imagen implementation using the official Google AI API
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
  const { playerChoice, worldState, history } = input;

  // The system instruction sets the persona for the AI model.
  // It includes the current horror intensity to guide the AI's response.
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

