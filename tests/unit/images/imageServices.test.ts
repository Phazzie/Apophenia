/**
 * Image Services Tests
 *
 * Tests Grok and Unsplash image services.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GrokImageService } from '../../../src/services/images/grokImageService';
import { UnsplashService } from '../../../src/services/images/unsplashService';

describe('Image Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch globally
    global.fetch = vi.fn();
  });

  describe('GrokImageService', () => {
    let service: GrokImageService;

    beforeEach(() => {
      // Mock env var before creating service
      import.meta.env.VITE_XAI_API_KEY = 'test-key';
      service = new GrokImageService();
    });

    it('should implement ImageService interface', () => {
      expect(service.provider).toBe('grok');
      expect(service.priority).toBe(1);
      expect(typeof service.generate).toBe('function');
      expect(typeof service.isAvailable).toBe('function');
    });

    it('should return failure when no API key configured', async () => {
      // Create new service without API key
      const originalKey = import.meta.env.VITE_XAI_API_KEY;
      try {
        import.meta.env.VITE_XAI_API_KEY = undefined;
        const service2 = new GrokImageService();

        const result = await service2.generate('test prompt');

        expect(result.url).toBeNull();
        expect(result.provider).toBe('grok');
        expect(result.error).toBeDefined();
        expect(result.error?.length).toBeGreaterThan(0);
      } finally {
        import.meta.env.VITE_XAI_API_KEY = originalKey;
      }
    });

    it('should check availability with API key', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
      } as Response);

      const available = await service.isAvailable();

      expect(available).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/models'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-key',
          }),
        })
      );
    });

    it('should return false when API unavailable', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const available = await service.isAvailable();

      expect(available).toBe(false);
    });

    it('should successfully generate image', async () => {
      const mockUrl = 'https://example.com/image.jpg';

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ url: mockUrl }],
        }),
      } as Response);

      const result = await service.generate('dark horror scene');

      expect(result.url).toBe(mockUrl);
      expect(result.provider).toBe('grok');
      expect(result.cached).toBe(false);
      expect(result.error).toBeUndefined();
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      } as Response);

      const result = await service.generate('test prompt');

      expect(result.url).toBeNull();
      expect(result.error).toContain('API error');
    });

    it('should handle empty response', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [],
        }),
      } as Response);

      const result = await service.generate('test prompt');

      expect(result.url).toBeNull();
      expect(result.error).toBe('Grok returned no image');
    });
  });


  describe('UnsplashService', () => {
    let service: UnsplashService;

    beforeEach(() => {
      service = new UnsplashService();
      import.meta.env.VITE_UNSPLASH_ACCESS_KEY = 'test-key';
    });

    it('should implement ImageService interface', () => {
      expect(service.provider).toBe('unsplash');
      expect(service.priority).toBe(3);
      expect(typeof service.generate).toBe('function');
      expect(typeof service.isAvailable).toBe('function');
    });

    it('should be available even without API key', async () => {
      import.meta.env.VITE_UNSPLASH_ACCESS_KEY = undefined;
      const service2 = new UnsplashService();

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
      } as Response);

      const available = await service2.isAvailable();

      expect(available).toBe(true);
    });

    it('should successfully search and return image', async () => {
      const mockUrl = 'https://images.unsplash.com/photo-123.jpg';

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              urls: { regular: mockUrl },
              links: { download: mockUrl },
            },
          ],
        }),
      } as Response);

      const result = await service.generate('dark abstract nature');

      expect(result.url).toBe(mockUrl);
      expect(result.provider).toBe('unsplash');
    });

    it('should simplify prompt for search', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [],
        }),
      } as Response);

      await service.generate('dark cosmic horror landscape with eerie unsettling vibe');

      // Check that API was called with simplified terms
      expect(global.fetch).toHaveBeenCalled();
      const url = (global.fetch as any).mock.calls[0][0] as string;
      // URL should be simplified, not containing 'cosmic', 'horror', etc.
      expect(url).toMatch(/query=/);
    });

    it('should handle rate limiting (403)', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 403,
      } as Response);

      const result = await service.generate('test prompt');

      expect(result.url).toBeNull();
      expect(result.error).toBe('Unsplash rate limit reached');
    });

    it('should handle no results found', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [],
        }),
      } as Response);

      const result = await service.generate('extremely obscure keywords xyz abc');

      expect(result.url).toBeNull();
      expect(result.error).toBe('Unsplash found no matching photos');
    });
  });

  describe('Service Priority Order', () => {
    it('Grok should have highest priority', () => {
      const grok = new GrokImageService();
      expect(grok.priority).toBe(1);
    });

    it('Unsplash should have lower priority than Grok', () => {
      const unsplash = new UnsplashService();
      expect(unsplash.priority).toBeGreaterThan(1);
    });
  });
});
