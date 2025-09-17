import { imageGenerationService, ImageVariation } from '../imageGeneration';

jest.mock('../imageGeneration');

describe('ImageGenerationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should generate multiple image variations', async () => {
    const mockVariations: ImageVariation[] = [
      { url: 'test1.jpg', prompt: 'horror prompt 1', quality: 'nano_banana' },
      { url: 'test2.jpg', prompt: 'horror prompt 2', quality: 'imagen' },
      { url: 'test3.jpg', prompt: 'horror prompt 3', quality: 'unsplash' }
    ];

    (imageGenerationService.generateImageVariations as jest.Mock).mockResolvedValue({
      variations: mockVariations,
      selectedIndex: 0
    });

    const result = await imageGenerationService.generateImageVariations('test prompt', 3);

    expect(result.variations).toHaveLength(3);
    expect(result.variations[0].quality).toBe('nano_banana');
    expect(result.selectedIndex).toBe(0);
  });

  test('should handle API failures gracefully', async () => {
    (imageGenerationService.generateImageVariations as jest.Mock).mockRejectedValue(
      new Error('API Error')
    );

    try {
      await imageGenerationService.generateImageVariations('test prompt', 3);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  test('should provide fallback to unsplash when other services fail', async () => {
    const fallbackVariations: ImageVariation[] = [
      { url: 'unsplash1.jpg', prompt: 'test prompt (horror)', quality: 'unsplash' }
    ];

    (imageGenerationService.generateImageVariations as jest.Mock).mockResolvedValue({
      variations: fallbackVariations,
      selectedIndex: 0
    });

    const result = await imageGenerationService.generateImageVariations('test prompt', 1);

    expect(result.variations).toHaveLength(1);
    expect(result.variations[0].quality).toBe('unsplash');
  });
});