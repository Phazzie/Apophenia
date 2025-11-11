/**
 * Mock Image Service for Testing
 * Provides predictable image generation responses without making actual API calls
 */

import { ImageResult, ImageService } from '../../src/core/types/seams';

export const MOCK_IMAGE_URL = 'https://example.com/mock-image.jpg';
export const MOCK_CACHED_IMAGE_URL = 'https://example.com/cached-image.jpg';

export class MockImageService implements ImageService {
  readonly provider = 'mock';
  readonly priority = 1;

  async generate(_prompt: string): Promise<ImageResult> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 30));

    return {
      url: MOCK_IMAGE_URL,
      provider: this.provider,
      cached: false,
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

export class MockFailingImageService implements ImageService {
  readonly provider = 'mock-failing';
  readonly priority = 2;

  async generate(_prompt: string): Promise<ImageResult> {
    await new Promise((resolve) => setTimeout(resolve, 30));

    return {
      url: null,
      provider: this.provider,
      cached: false,
      error: 'Mock service failed',
    };
  }

  async isAvailable(): Promise<boolean> {
    return false;
  }
}

export class MockCachedImageService implements ImageService {
  readonly provider = 'mock-cached';
  readonly priority = 1;

  async generate(_prompt: string): Promise<ImageResult> {
    return {
      url: MOCK_CACHED_IMAGE_URL,
      provider: this.provider,
      cached: true,
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

export function createMockImageResult(overrides?: Partial<ImageResult>): ImageResult {
  return {
    url: MOCK_IMAGE_URL,
    provider: 'mock',
    cached: false,
    ...overrides,
  };
}
