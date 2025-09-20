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
} from '@/lib/types';
import { AI_MODELS } from '@/lib/config/aiConfig';

// This is the critical change: get the API key from server-side environment variables
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Placeholder for image client - will be properly implemented with correct package
const imageClient = {
  generateImage: async (request: any) => {
    // Mock implementation for now - will be replaced with real ImageGenerationClient
    return [{
      generatedImages: [{
        bytesBase64Encoded: 'mockBase64Data'
      }]
    }];
  }
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

async function runAIFlowWithFallback(
  systemInstruction: string,
  prompt: string,
  useCase: 'concept' | 'story' | 'summary' = 'story'
): Promise<GameCommand[]> {
  const config = useCase === 'concept' ? AI_MODELS.CONCEPT_GENERATION :
                 useCase === 'summary' ? AI_MODELS.SUMMARIZATION :
                 AI_MODELS.STORY_PROGRESSION;

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
    
    const enhancedFallbacks = {
      protagonist: json.protagonist || 'An AI researcher who realizes their consciousness has been digitized and transferred into a cosmic simulation of reality',
      setting: json.setting || 'A space station orbiting a black hole where time distorts and deleted memories take physical form in the corridors',
      dilemma: json.dilemma || 'You must choose between maintaining human identity or accessing cosmic truth that will shatter your understanding of existence',
    };
    
    return enhancedFallbacks;
  } catch (error) {
    console.error('Enhanced concept generation failed:', error);
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

export const processAdvancedImageGeneration = async (
  prompt: string, 
  generateMultiple: boolean = false
): Promise<string> => {
  console.log(`Advanced AI image generation requested for prompt: "${prompt}"`);
  
  const horrorEnhancedPrompt = `${prompt}. Photorealistic cosmic horror style, atmospheric nightmare lighting, surreal otherworldly aesthetics, lovecraftian eldritch elements, psychological horror atmosphere, high contrast cinematic composition, digital consciousness themes, reality distortion effects`;
  
  if (generateMultiple) {
    return await generateMultipleImageVariations(horrorEnhancedPrompt);
  }
  
  try {
    if (process.env.NANO_BANANA_API_KEY) {
      console.log('Attempting Nano Banana image generation...');
      const nanoBananaUrl = await generateWithNanoBanana(horrorEnhancedPrompt);
      if (nanoBananaUrl) {
        console.log('Nano Banana image generation successful');
        return nanoBananaUrl;
      }
    }
    
    if (process.env.IMAGEN_API_KEY || process.env.GOOGLE_API_KEY) {
      console.log('Using Google Imagen for image generation...');
      const imagenUrl = await generateWithImagen(horrorEnhancedPrompt);
      if (imagenUrl) {
        console.log('Google Imagen generation successful');
        return imagenUrl;
      }
    }
    
    console.log('AI services unavailable, using enhanced Unsplash integration');
    return generateUnsplashFallback(prompt);
    
  } catch (error) {
    console.warn('All image generation methods failed, using Unsplash fallback:', error);
    return generateUnsplashFallback(prompt);
  }
};

async function generateMultipleImageVariations(basePrompt: string): Promise<string> {
  const variations = [
    `${basePrompt}, close-up perspective, intimate horror`,
    `${basePrompt}, wide-angle view, environmental terror`, 
    `${basePrompt}, dramatic lighting, shadow play emphasis`,
  ];

  try {
    console.log('Generating multiple image variations in parallel...');
    
    const imagePromises = variations.map(prompt => 
      generateSingleVariation(prompt)
    );
    
    const results = await Promise.all(imagePromises);
    
    const successfulResult = results.find(result => result && !result.includes('unsplash'));
    return successfulResult || results[0] || generateUnsplashFallback(basePrompt);
    
  } catch (error) {
    console.warn('Parallel image generation failed:', error);
    return generateUnsplashFallback(basePrompt);
  }
}

async function generateSingleVariation(prompt: string): Promise<string> {
  try {
    if (process.env.NANO_BANANA_API_KEY) {
      const result = await generateWithNanoBanana(prompt);
      if (result) return result;
    }
    
    if (process.env.IMAGEN_API_KEY || process.env.GOOGLE_API_KEY) {
      const result = await generateWithImagen(prompt);
      if (result) return result;
    }
    
    return generateUnsplashFallback(prompt);
  } catch (error) {
    return generateUnsplashFallback(prompt);
  }
}

async function generateWithNanoBanana(prompt: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.nanobana.com/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NANO_BANANA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        style: 'cosmic_horror',
        aspect_ratio: '16:9',
        quality: 'high',
        safety_filter: 'permissive'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.images?.[0]?.url || null;
    }
    return null;
  } catch (error) {
    console.warn('Nano Banana generation failed:', error);
    return null;
  }
}

async function generateWithImagen(prompt: string): Promise<string | null> {
  try {
    const request = {
      model: AI_MODELS.FALLBACK_IMAGE,
      prompt: prompt,
      sampleCount: 1,
      aspectRatio: 'ASPECT_RATIO_16_9',
      safetyFilterLevel: 'BLOCK_SOME',
    };

    const response = await imageClient.generateImage(request);
    
    if (response && response[0]?.generatedImages?.[0]) {
      const base64Data = response[0].generatedImages[0].bytesBase64Encoded;
      return `data:image/png;base64,${base64Data}`;
    }
    
    return null;
  } catch (error) {
    console.warn('Google Imagen generation failed:', error);
    return null;
  }
}

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
