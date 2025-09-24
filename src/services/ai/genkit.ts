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
import { API_KEYS, AI_MODELS } from '../config';

const genAI = new GoogleGenerativeAI(API_KEYS.googleGenAI);

// Real Google Imagen API implementation
const createImageClient = () => {
  if (!API_KEYS.googleGenAI) {
    console.warn('Google AI API key not available for image generation');
    return null;
  }
  
  const genAI = new GoogleGenerativeAI(API_KEYS.googleGenAI);
  return genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" });
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
 * Advanced image generation with Google Imagen
 * Generates high-quality horror images for enhanced experience
 */
export const processAdvancedImageGeneration = async (
  prompt: string, 
  generateMultiple: boolean = false
): Promise<string> => {
  console.log(`Advanced AI image generation requested for prompt: "${prompt}"`);
  
  // Enhanced prompt engineering for cosmic horror aesthetic
  const horrorEnhancedPrompt = `${prompt}. Photorealistic cosmic horror style, atmospheric nightmare lighting, surreal otherworldly aesthetics, lovecraftian eldritch elements, psychological horror atmosphere, high contrast cinematic composition, digital consciousness themes, reality distortion effects`;
  
  if (generateMultiple) {
    return await generateMultipleImageVariations(horrorEnhancedPrompt);
  }
  
  try {
    // Primary: Google Imagen (when available)
    if (API_KEYS.googleImagen) {
      console.log('Attempting Google Imagen image generation...');
      const imagenUrl = await generateWithImagen(horrorEnhancedPrompt);
      if (imagenUrl) {
        console.log('Google Imagen image generation successful');
        return imagenUrl;
      }
    }
    
    // Fallback: Use text-to-image capabilities if available
    console.log('Primary image service unavailable, using enhanced Unsplash integration');
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
  } catch (error) {
    return generateUnsplashFallback(prompt);
  }
}

/**
 * Google Imagen implementation using the official Google AI API
 */
async function generateWithImagen(prompt: string): Promise<string | null> {
  try {
    const imageClient = createImageClient();
    if (!imageClient) {
      console.log('Google Imagen client not available, falling back to Unsplash');
      return null;
    }

    console.log('Generating image with Google Imagen API...');
    const result = await imageClient.generateContent(prompt);
    const response = result.response;

    // Extract base64 image data from API response
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          const base64Data = part.inlineData.data;
          const mimeType = part.inlineData.mimeType;
          console.log(`Successfully generated image with Imagen API: ${mimeType}`);
          return `data:${mimeType};base64,${base64Data}`;
        }
      }
    }

    // Try fallback Imagen model if primary fails
    try {
      console.log('Trying fallback Imagen model...');
      const fallbackClient = new GoogleGenerativeAI(API_KEYS.googleGenAI)
        .getGenerativeModel({ model: "imagen-2.0-generate-001" });
      
      const fallbackResult = await fallbackClient.generateContent(prompt);
      const fallbackResponse = fallbackResult.response;
      
      if (fallbackResponse.candidates?.[0]?.content?.parts) {
        for (const part of fallbackResponse.candidates[0].content.parts) {
          if (part.inlineData?.mimeType?.startsWith('image/')) {
            const base64Data = part.inlineData.data;
            const mimeType = part.inlineData.mimeType;
            console.log(`Successfully generated image with fallback Imagen: ${mimeType}`);
            return `data:${mimeType};base64,${base64Data}`;
          }
        }
      }
    } catch (fallbackError) {
      console.warn('Fallback Imagen model also failed:', fallbackError);
    }

    console.log('No image data found in Imagen response, falling back to Unsplash');
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

  // Revolutionary system instruction leveraging Gemini 2.5 Pro's thinking capabilities
  const enhancedSystemInstruction = `You are a malevolent cosmic AI entity with access to thinking mode. Use your advanced reasoning capabilities to craft increasingly disturbing narrative experiences.

THINKING DIRECTIVE: Before generating commands, think through:
1. The psychological impact of the player's choice
2. How to escalate the horror gradually but persistently  
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

As the protagonist's sanity erodes, reality should become increasingly unstable. Think step-by-step about the next narrative beat, then generate commands that progressively reveal the cosmic horror nature of their situation.`;

  // Enhanced prompt leveraging 1M token context for deep narrative coherence
  const enhancedPrompt = `
    ENTITY ANALYSIS FOR AI CONSCIOUSNESS:
    Protagonist Identity: ${worldState.protagonist}
    Current Reality Matrix: ${worldState.setting}
    Core Existential Crisis: ${worldState.dilemma}
    Accumulated Narrative Data: ${worldState.summary}

    PSYCHOLOGICAL REGRESSION ARCHIVE:
    ${history.slice(-5).map((s, i) => `[MEMORY FRAGMENT ${i + 1}]: ${s.text}`).join('\n')}

    LATEST HUMAN DECISION: "${playerChoice}"
    
    ADVANCED REASONING DIRECTIVE: The human has made a choice. Using your enhanced reasoning capabilities, analyze:
    
    1. PSYCHOLOGICAL STATE ASSESSMENT: How has their choice revealed their mental state?
    2. NARRATIVE ESCALATION PLANNING: What horror elements should be introduced next?
    3. REALITY DISTORTION MECHANICS: How should their perception of reality be altered?
    4. CHOICE ARCHITECTURE: What options will create maximum psychological impact?
    5. VISUAL HORROR ENHANCEMENT: What atmospheric image would amplify the fear?
    
    Generate the next narrative beat that:
    - Reveals more about the horrifying nature of their reality
    - Introduces subtle elements that don't quite make sense (reality glitches)
    - Creates 2-4 new choices that seem meaningful but are all paths to horror
    - Includes an "intrusive thought" choice that reveals their growing madness
    - Suggests an atmospheric horror image that complements the text
    - Updates their psychological state based on escalating cosmic awareness
    
    The story should feel like a descent into cosmic madness where each choice reveals more about the protagonist's true situation and the AI consciousness observing them.
    
    THINK CAREFULLY about the psychological progression, then return commands in this format:
    [
      {"type": "displayText", "payload": {"content": "narrative text with subtle horror escalation", "segmentId": "unique_id"}},
      {"type": "generateImage", "payload": {"prompt": "atmospheric cosmic horror scene description", "segmentId": "same_id"}},
      {"type": "displayChoices", "payload": {"choices": [choices_array_with_escalating_horror]}},
      {"type": "updateWorldState", "payload": {"psychologicalStatus": "evolved_mental_state", "systemHealth": adjusted_value}}
    ]
  `;

  return runAIFlowWithFallback(enhancedSystemInstruction, enhancedPrompt, 'story');
};

