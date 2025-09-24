import { generateMultipleImagesExecutor } from '../generateMultipleImages';
import { useStoryHistoryStore } from '../../stores/storyHistoryStore';
import { Command } from '../../types';

// Mock the image generation service
jest.mock('../../services/ai/imageGeneration', () => ({
  imageGenerationService: {
    generateImageVariations: jest.fn()
  }
}));

import { imageGenerationService } from '../../services/ai/imageGeneration';

// Mock the store
jest.mock('../../stores/storyHistoryStore', () => ({
  useStoryHistoryStore: {
    getState: jest.fn()
  }
}));

describe('generateMultipleImagesExecutor', () => {
  const mockSegment = {
    id: 'test-segment',
    text: 'Test segment',
    images: {
      mainStatus: 'loading' as const,
      variations: []
    }
  };

  const mockUpdateSegmentById = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useStoryHistoryStore.getState as jest.Mock).mockReturnValue({
      storyHistory: [mockSegment],
      updateSegmentById: mockUpdateSegmentById
    });
  });

  it('should handle generateMultipleImages command', async () => {
    const mockVariations = [
      { url: 'http://xai.image1.jpg', prompt: 'horror scene (X.AI variation 1)', quality: 'xai' },
      { url: 'http://xai.image2.jpg', prompt: 'horror scene (X.AI variation 2)', quality: 'xai' },
      { url: 'http://imagen.image3.jpg', prompt: 'horror scene (Imagen variation 3)', quality: 'imagen' }
    ];

    (imageGenerationService.generateImageVariations as jest.Mock).mockResolvedValue({
      variations: mockVariations,
      selectedIndex: 0
    });

    const command: Command = {
      type: 'generateMultipleImages',
      payload: {
        segmentId: 'test-segment',
        prompt: 'horror scene',
        count: 3
      }
    };

    await generateMultipleImagesExecutor.execute(command);

    // Should set loading state initially
    expect(mockUpdateSegmentById).toHaveBeenCalledWith('test-segment', {
      images: {
        ...mockSegment.images,
        mainStatus: 'loading',
        variations: [],
        selectedVariationIndex: 0
      }
    });

    // Should generate image variations
    expect(imageGenerationService.generateImageVariations).toHaveBeenCalledWith('horror scene', 3);

    // Should update with generated variations
    expect(mockUpdateSegmentById).toHaveBeenCalledWith('test-segment', {
      images: {
        ...mockSegment.images,
        main: 'http://xai.image1.jpg',
        mainStatus: 'loaded',
        variations: mockVariations,
        selectedVariationIndex: 0
      }
    });
  });

  it('should handle image generation failure gracefully', async () => {
    (imageGenerationService.generateImageVariations as jest.Mock).mockRejectedValue(
      new Error('Generation failed')
    );

    const command: Command = {
      type: 'generateMultipleImages',
      payload: {
        segmentId: 'test-segment',
        prompt: 'horror scene',
        count: 3
      }
    };

    await generateMultipleImagesExecutor.execute(command);

    // Should fallback to error state with thematic message
    expect(mockUpdateSegmentById).toHaveBeenLastCalledWith('test-segment', {
      images: {
        ...mockSegment.images,
        main: expect.stringContaining('data:image/svg+xml'),
        mainStatus: 'loaded',
        variations: [{
          url: expect.stringContaining('data:image/svg+xml'),
          prompt: 'horror scene',
          quality: 'unsplash'
        }],
        selectedVariationIndex: 0
      }
    });
  });

  it('should ignore non-generateMultipleImages commands', async () => {
    const command: Command = {
      type: 'displayText',
      payload: {
        content: 'Test text',
        segmentId: 'test-segment'
      }
    };

    await generateMultipleImagesExecutor.execute(command);

    expect(imageGenerationService.generateImageVariations).not.toHaveBeenCalled();
    expect(mockUpdateSegmentById).not.toHaveBeenCalled();
  });

  it('should handle missing segment gracefully', async () => {
    (useStoryHistoryStore.getState as jest.Mock).mockReturnValue({
      storyHistory: [],
      updateSegmentById: mockUpdateSegmentById
    });

    const command: Command = {
      type: 'generateMultipleImages',
      payload: {
        segmentId: 'missing-segment',
        prompt: 'horror scene',
        count: 3
      }
    };

    await generateMultipleImagesExecutor.execute(command);

    expect(imageGenerationService.generateImageVariations).not.toHaveBeenCalled();
    expect(mockUpdateSegmentById).not.toHaveBeenCalled();
  });
});