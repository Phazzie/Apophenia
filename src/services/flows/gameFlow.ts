import { Command, GenreConfig, WorldState } from '../../types';

// This is a mock of the Genkit flow.
// In a real implementation, this would interact with the Google GenAI SDK.

export const generateConceptFlow = async (
  genreConfig: GenreConfig
): Promise<Partial<WorldState>> => {
  console.log('Generating concept for genre:', genreConfig.name);
  // Mock AI response
  return {
    protagonist: 'A jaded detective',
    setting: 'A rain-slicked city in the near future',
    dilemma: 'A case that defies logic',
  };
};

import { summarizeHistory } from '../gameService';
import { useWorldStateStore } from '../../stores/worldStateStore';

export const nextStepFlow = async (
  playerChoice: string,
  worldState: WorldState,
  history: any[],
  genreConfig: GenreConfig
): Promise<Command[]> => {
  console.log('Getting next step for choice:', playerChoice);

  // Non-blocking call to summarize history
  summarizeHistory(worldState, history.slice(-1)[0]).then(summary => {
    useWorldStateStore.getState().updateWorldState({ summary });
  });

  // Mock AI response
  return [
    { type: 'displayText', payload: { content: 'The rain continues to fall.' } },
    { type: 'wait', payload: { duration: 1000 } },
    { type: 'generateAmbiance', payload: { description: 'The sound of rain on pavement' } },
    { type: 'generateImage', payload: { styleModifier: 'film noir' } },
    { type: 'updateWorldState', payload: { psychologicalStatus: 'Uneasy' } },
    {
      type: 'displayChoices',
      payload: {
        choices: [
          { text: 'Investigate the alley', isIntrusive: false },
          { text: 'Go for a drink', isIntrusive: false },
        ],
        intrusiveThought: { text: 'It\'s all your fault.', isIntrusive: true },
        predictedImagePrompt: 'A dark alley in the rain',
      },
    },
  ];
};

export const hauntingFlow = async (): Promise<string> => {
  return 'A whisper from the static...';
};

export const generateImageFlow = async (prompt: string): Promise<string> => {
  console.log('Generating image with prompt:', prompt);
  // In a real app, this would call the image generation model.
  return `https://picsum.photos/seed/${Math.random()}/1920/1080`;
};
