import {
  hauntingFlow,
  generateConceptFlow,
  generateImageFlow,
  nextStepFlow,
} from './ai/genkit'; // Using the real Genkit flow
import { summarizeHistoryFlow } from './flows/summaryFlow';
import { GenreConfig, WorldState, StorySegment } from '../types';

export const getNextStep = async (
  playerChoice: string,
  worldState: WorldState,
  history: any[],
  genreConfig: GenreConfig
) => {
  try {
    const commands = await nextStepFlow({
      playerChoice,
      worldState,
      history,
      genreConfig,
    });
    return commands;
  } catch (error) {
    console.error('Error calling nextStepFlow:', error);
    // Fallback to a mock command sequence
    return [
      {
        type: 'displayText',
        payload: {
          content: 'The connection wavers. The signal is lost in static. You are alone.',
        },
      },
      {
        type: 'displayChoices',
        payload: {
          choices: [
            { text: 'Try to reconnect', isIntrusive: false },
            { text: 'Wait', isIntrusive: false },
          ],
        },
      },
    ];
  }
};

export const summarizeHistory = async (
  worldState: WorldState,
  lastSegment: StorySegment
) => {
  return await summarizeHistoryFlow(worldState, lastSegment);
};

export const generateConcept = async (genreConfig: GenreConfig) => {
  try {
    const concept = await generateConceptFlow(genreConfig);
    return concept;
  } catch (error) {
    console.error('Error calling generateConceptFlow:', error);
    // Fallback to a mock concept or handle the error appropriately
    return {
      protagonist: 'A jaded detective',
      setting: 'A rain-slicked city in the near future',
      dilemma: 'A case that defies logic',
    };
  }
};

export const getHauntingWhisper = async () => {
  // In a real application, you would handle the invocation of the Genkit flow here.
  // This might involve making an HTTP request to a cloud function,
  // or using a client-side library provided by Genkit.
  // For now, we'll call it directly, assuming a server-side or integrated environment.
  try {
    // The empty object is passed to satisfy the input schema of the Genkit flow.
    const whisper = await hauntingFlow({});
    return whisper;
  } catch (error) {
    console.error('Error calling hauntingFlow:', error);
    // Fallback to a mock whisper or handle the error appropriately
    return 'A whisper from the static...';
  }
};

export const generateImage = async (prompt: string) => {
  try {
    const imageUrl = await generateImageFlow(prompt);
    return imageUrl;
  } catch (error) {
    console.error('Error calling generateImageFlow:', error);
    // Fallback to a placeholder image
    return `https://picsum.photos/seed/${Math.random()}/1920/1080`;
  }
};
