/**
 * Unit tests for GeminiImageService
 * Validates Gemini/Imagen integration for image generation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GeminiImageService } from '../../../src/services/images/geminiImageService';

// Mock the GoogleGenerativeAI module
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    inlineData: {
                      mimeType: 'image/png',
                      data: 'base64encodedimagedata',
                    },
                  },
                ],
              },
            },
          ],
          text: () => 'mock response text',
        },
      }),
    }),
  })),
}));

describe('GeminiImageService', () => {
  let service: GeminiImageService;

  beforeEach(() => {
    // Reset environment
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key');
    service = new GeminiImageService();
  });

  it('should have correct provider and priority', () => {
    expect(service.provider).toBe('gemini-imagen');
    expect(service.priority).toBe(1); // Highest priority
  });

  it('should be available when API key is configured', async () => {
    const available = await service.isAvailable();
    expect(available).toBe(true);
  });

  it('should not be available when API key is missing', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    const serviceWithoutKey = new GeminiImageService();
    const available = await serviceWithoutKey.isAvailable();
    expect(available).toBe(false);
  });

  it('should generate image with base64 data', async () => {
    const result = await service.generate('A cosmic horror scene');

    expect(result.url).toBeDefined();
    expect(result.url).toContain('data:image/png;base64,');
    expect(result.provider).toBe('gemini-imagen');
    expect(result.cached).toBe(false);
    expect(result.error).toBeUndefined();
  });

  it('should return failure when API key is not configured', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    const serviceWithoutKey = new GeminiImageService();
    const result = await serviceWithoutKey.generate('Test prompt');

    expect(result.url).toBeNull();
    expect(result.error).toBe('Gemini API key not configured');
  });
});
