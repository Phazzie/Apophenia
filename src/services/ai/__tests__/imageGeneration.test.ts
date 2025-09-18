import { imageGenerationService } from '../imageGeneration';
import { API_KEYS } from '../../config';

// Ensure API keys are not set for these tests to force fallbacks
jest.mock('../../config', () => ({
  ...jest.requireActual('../../config'),
  API_KEYS: {
    googleGenAI: '',
    googleNanoBanana: '',
    googleImagen: '',
  },
}));

describe('ImageGenerationService Fallbacks', () => {
  test('should fallback to Unsplash when no API keys are provided', async () => {
    const result = await imageGenerationService.generateImageVariations('a dark and stormy night', 3);

    expect(result.variations).toHaveLength(3);
    result.variations.forEach(variation => {
      expect(variation.url).toContain('unsplash.com');
      expect(variation.quality).toBe('unsplash');
    });
  });
});

describe('ImageGenerationService with Gemini', () => {
  beforeAll(() => {
    jest.mock('../../config', () => ({
      ...jest.requireActual('../../config'),
      API_KEYS: {
        googleGenAI: 'fake-api-key',
        googleNanoBanana: '',
        googleImagen: '',
      },
    }));
  });

  afterAll(() => {
    jest.unmock('../../config');
  });

  test('should call generateImageWithGemini when API key is provided', async () => {
    // Mock the generateImageWithGemini function
    const mockGenerateImageWithGemini = jest.spyOn(imageGenerationService, 'generateImageWithGemini');
    mockGenerateImageWithGemini.mockResolvedValue({
      url: 'http://fake-gemini-image.com/1',
      quality: 'gemini',
      prompt: 'a dark and stormy night'
    });

    const result = await imageGenerationService.generateImageVariations('a dark and stormy night', 3);

    expect(result.variations).toHaveLength(3);
    expect(mockGenerateImageWithGemini).toHaveBeenCalledTimes(3);
    result.variations.forEach(variation => {
      expect(variation.url).toContain('fake-gemini-image.com');
      expect(variation.quality).toBe('gemini');
    });

    // Restore the original function
    mockGenerateImageWithGemini.mockRestore();
  });
});
