/**
 * DEPRECATED: This file is no longer used in the Grok-only deployment.
 * Retained for reference only. See INTEGRATION_PLAN.md for current architecture.
 *
 * All Gemini functionality has been removed in favor of Grok-4-fast-reasoning.
 */

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
import { useWorldStateStore } from '../../core/state/worldStateStore';
import { AI_MODELS } from '../config';
import { extractJSONArray, extractJSONObject } from '../../utils/jsonExtractor';
import { imageGenerationOrchestrator } from './imageGeneration/index';
import {
  COSMIC_HORROR_ENTITY_SYSTEM,
  buildCosmicHorrorSystemWithThinking,
  buildConceptGenerationPrompt,
  buildNextStepPrompt,
} from './promptTemplates';

// Note: Google Generative AI client disabled - using X.AI/Grok via backend API instead
const googleApiKey = '';
// Only initialize if API key is provided (currently disabled in favor of X.AI/Grok)
const genAI = googleApiKey ? new GoogleGenerativeAI(googleApiKey) : null;

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
  // Google AI is disabled - return thematic error fallback
  if (!genAI) {
    console.warn('Google AI is disabled. Using X.AI/Grok instead.');
    return getThematicErrorFallback();
  }

  const config = useCase === 'concept' ? AI_MODELS.CONCEPT_GENERATION :
                 useCase === 'summary' ? AI_MODELS.SUMMARIZATION :
                 AI_MODELS.STORY_PROGRESSION;

  // Try primary model first (DEPRECATED - Gemini removed)
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
    const commands = extractJSONArray(text, false); // Don't clean markdown, just extract array
    return commandArraySchema.parse(commands);
    
  } catch (primaryError) {
    console.warn('Primary model failed, trying fallback:', primaryError);
    
    // Fallback (DEPRECATED - Gemini removed, using PRIMARY_TEXT as fallback)
    try {
      const fallbackModel = genAI.getGenerativeModel({
        model: AI_MODELS.PRIMARY_TEXT,
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
      const commands = extractJSONArray(text, false);
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
          { id: 'retry-connection', text: 'Attempt to reestablish connection', isIntrusive: false, segmentId: 'retry-connection' },
          { id: 'accept-failure', text: 'Embrace the digital void', isIntrusive: true, segmentId: 'accept-failure' },
        ],
      },
    },
  ];
}

export const generateConceptFlow = async (
  genreConfig: GenreConfig
): Promise<{ protagonist: string; setting: string; dilemma: string }> => {
  // Google AI is disabled - use fallback concepts
  if (!genAI) {
    console.warn('Google AI is disabled. Using fallback concept generation.');
    // Return first fallback concept immediately
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

  // Enhanced concept generation using centralized prompt templates
  const systemInstruction = COSMIC_HORROR_ENTITY_SYSTEM;
  const prompt = buildConceptGenerationPrompt(genreConfig.name, genreConfig.themes.join(', '));

  try {
    const model = genAI.getGenerativeModel({
      model: AI_MODELS.CONCEPT_GENERATION.model,
      systemInstruction,
      generationConfig: AI_MODELS.CONCEPT_GENERATION,
      safetySettings,
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const json = extractJSONObject<{ protagonist?: string; setting?: string; dilemma?: string }>(text, true);

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
 * Advanced image generation using the unified orchestrator with strategy pattern
 * @param prompt The base prompt for the image
 * @param generateMultiple Whether to generate multiple variations
 * @returns A URL to the generated image
 */
export const processAdvancedImageGeneration = async (
  prompt: string,
  generateMultiple: boolean = false
): Promise<string> => {
  console.log(`Advanced AI image generation for prompt: "${prompt}"`);

  if (generateMultiple) {
    const result = await imageGenerationOrchestrator.generateImageVariations({
      prompt,
      useHorrorIntensity: true,
      variationCount: 3,
    });

    // Return the selected variation (or first one)
    const selectedVariation = result.variations[result.selectedIndex];
    return selectedVariation.url;
  }

  // Single image generation with full fallback chain
  const result = await imageGenerationOrchestrator.generateImage({
    prompt,
    useHorrorIntensity: true,
  });

  return result.url;
}

interface NextStepInput {
  playerChoice: string;
  worldState: WorldState;
  history: StorySegment[];
  genreConfig: GenreConfig;
}

export const nextStepFlow = async (input: NextStepInput): Promise<Command[]> => {
  const { playerChoice, worldState, history } = input;

  // Use centralized prompt templates for consistent narrative generation
  const systemInstruction = buildCosmicHorrorSystemWithThinking(worldState.horrorIntensity);
  const prompt = buildNextStepPrompt(worldState, history, playerChoice);

  return runAIFlowWithFallback(systemInstruction, prompt, 'story');
};

