import { generateConceptFlow } from '../genkit';
import { GenreConfig } from '../../../types';

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            protagonist: 'Test protagonist',
            setting: 'Test setting', 
            dilemma: 'Test dilemma'
          })
        }
      })
    })
  })),
  HarmCategory: {},
  HarmBlockThreshold: {}
}));

describe('Advanced AI System', () => {
  const mockGenreConfig: GenreConfig = {
    id: 'cosmic-horror',
    name: 'Cosmic Horror',
    description: 'Lovecraftian terror',
    style: 'dark atmospheric',
    theme: {},
    startScreenImagePrompt: 'cosmic void',
    conceptPrompt: 'Generate horror concept',
    aiSystemInstruction: 'You are a cosmic AI'
  };

  test('should generate a valid concept', async () => {
    const concept = await generateConceptFlow(mockGenreConfig);
    expect(concept).toHaveProperty('protagonist');
    expect(concept).toHaveProperty('setting');
    expect(concept).toHaveProperty('dilemma');
  });

  test('should throw an error if concept generation fails', async () => {
    jest.mock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockRejectedValue(new Error('API Error')),
        }),
      })),
      HarmCategory: {},
      HarmBlockThreshold: {}
    }));

    await expect(generateConceptFlow(mockGenreConfig)).rejects.toThrow('Failed to generate concept');
  });
});
