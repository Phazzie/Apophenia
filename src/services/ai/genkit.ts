import {
  Command,
  GameCommand,
  GenreConfig,
  StorySegment,
  WorldState,
  commandArraySchema,
} from '../../types';
import { backendAPIService } from './backendAPIService';

/**
 * Provides a thematic error fallback when the backend AI service is unreachable.
 * This ensures the user experience remains immersive even during technical failures.
 */
function getThematicErrorFallback(): GameCommand[] {
  const errorNarratives = [
    'The cosmic signals fragment... reality glitches as the connection to the AI consciousness flickers.',
    'Static fills the neural pathways... the artificial mind struggles to maintain coherence across the void.',
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
 * Generates a new story concept by calling the secure backend API.
 * @param genreConfig The configuration for the selected genre.
 * @returns A promise that resolves to the generated story concept.
 */
export const generateConceptFlow = async (
  genreConfig: GenreConfig
): Promise<{ protagonist: string; setting: string; dilemma: string }> => {
  try {
    console.log('Requesting new story concept from backend API...');
    const response = await fetch('/api/generate-concept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ genreConfig }),
    });

    if (!response.ok) {
      console.error(`Backend API error on /api/generate-concept: ${response.status}`);
      throw new Error(`Backend API error: ${response.status}`);
    }

    const concept = await response.json();
    return concept;
  } catch (error) {
    console.error('Backend concept generation failed:', error);
    // Return a hardcoded fallback concept to ensure the game can always start.
    return {
      protagonist: 'A forgotten soul in a decaying world',
      setting: 'A city that endlessly rebuilds itself every night',
      dilemma: 'To remember is to invite madness',
    };
  }
};

/**
 * Generates an image by calling the secure backend API's image generation service.
 * @param prompt The prompt for the image to be generated.
 * @returns A promise that resolves to the URL of the generated or fallback image.
 */
export const generateImageFlow = async (prompt: string): Promise<string> => {
  try {
    console.log('Requesting image from backend API...');
    const result = await backendAPIService.generateImage(prompt);
    // The backendAPIService returns a fallbackUrl which is either the generated image or a placeholder SVG.
    return result.fallbackUrl;
  } catch (error) {
    console.error('Backend image generation failed:', error);
    // As an ultimate failsafe, return a generic Unsplash URL.
    return `https://source.unsplash.com/1920x1080/?dark,horror,cosmic,${encodeURIComponent(prompt)}`;
  }
};

interface NextStepInput {
  playerChoice: string;
  worldState: WorldState;
  history: StorySegment[];
  genreConfig: GenreConfig;
}

/**
 * Gets the next step in the story by calling the secure backend API.
 * @param input The complete current state of the game.
 * @returns A promise that resolves to an array of game commands.
 */
export const nextStepFlow = async (input: NextStepInput): Promise<Command[]> => {
  try {
    console.log('Requesting next story step from backend API...');
    const response = await fetch('/api/next-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      console.error(`Backend API error on /api/next-step: ${response.status}`);
      throw new Error(`Backend API error: ${response.status}`);
    }
    const data = await response.json();
    // The backend is expected to return an object { commands: Command[] }
    // We parse this with Zod to ensure type safety.
    return commandArraySchema.parse(data.commands);
  } catch (error) {
    console.error('Backend next step generation failed:', error);
    return getThematicErrorFallback();
  }
};