/**
 * Contract Tests: Image Services (Seam #7)
 *
 * Validates that Image Service implementations comply with the interface contracts
 * defined in src/core/types/seams.ts (lines 499-536).
 *
 * These tests verify structure and type compliance, NOT behavior.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { ImageService, ImageResult, ImagePipeline } from '../../src/core/types/seams';
import { GrokImageService, grokImageService } from '../../src/services/images/grokImageService';
import { UnsplashService, unsplashService } from '../../src/services/images/unsplashService';
import { ImagePipelineImpl, imagePipeline } from '../../src/services/images/ImagePipeline';

describe('Contract Tests: Image Services (Seam #7)', () => {
  describe('Service Interface Compliance', () => {
    const services: Array<{ name: string; service: ImageService }> = [
      { name: 'GrokImageService', service: grokImageService },
      { name: 'UnsplashService', service: unsplashService },
    ];

    services.forEach(({ name, service }) => {
      describe(`${name} Interface Compliance`, () => {
        it('implements ImageService interface', () => {
          // Verify required properties
          expect(service).toHaveProperty('provider');
          expect(service).toHaveProperty('priority');

          // Verify property types
          expect(typeof service.provider).toBe('string');
          expect(typeof service.priority).toBe('number');

          // Verify required methods
          expect(typeof service.generate).toBe('function');
          expect(typeof service.isAvailable).toBe('function');
        });

        it('provider property is readonly string', () => {
          expect(typeof service.provider).toBe('string');
          expect(service.provider.length).toBeGreaterThan(0);

          // Verify it's a property, not a method
          expect(typeof (service as any).provider).not.toBe('function');
        });

        it('priority property is readonly number', () => {
          expect(typeof service.priority).toBe('number');
          expect(service.priority).toBeGreaterThanOrEqual(0);

          // Verify it's a property, not a method
          expect(typeof (service as any).priority).not.toBe('function');
        });

        it('generate accepts string and returns Promise<ImageResult>', async () => {
          const result = service.generate('test prompt');

          // Verify it returns a Promise
          expect(result).toBeInstanceOf(Promise);

          // Await and verify ImageResult shape
          const imageResult = await result;

          // Verify required fields
          expect(imageResult).toHaveProperty('url');
          expect(imageResult).toHaveProperty('provider');
          expect(imageResult).toHaveProperty('cached');

          // Verify types
          if (imageResult.url !== null) {
            expect(typeof imageResult.url).toBe('string');
          }
          expect(typeof imageResult.provider).toBe('string');
          expect(typeof imageResult.cached).toBe('boolean');

          // Optional error field
          if (imageResult.error !== undefined) {
            expect(typeof imageResult.error).toBe('string');
          }

          // Verify no extra fields beyond interface contract
          const validKeys = ['url', 'provider', 'cached', 'error'];
          Object.keys(imageResult).forEach((key) => {
            expect(validKeys).toContain(key);
          });
        });

        it('isAvailable returns Promise<boolean>', async () => {
          const result = service.isAvailable();

          // Verify it returns a Promise
          expect(result).toBeInstanceOf(Promise);

          // Await and verify boolean
          const available = await result;
          expect(typeof available).toBe('boolean');
        });
      });
    });
  });

  describe('GrokImageService Specific', () => {
    const service = new GrokImageService();

    it('has correct provider name', () => {
      expect(service.provider).toBe('grok');
    });

    it('has correct priority', () => {
      expect(service.priority).toBe(1);
      expect(typeof service.priority).toBe('number');
    });

    it('singleton instance exports correct type', () => {
      expect(grokImageService).toBeInstanceOf(GrokImageService);
      expect(grokImageService.provider).toBe('grok');
    });
  });

  describe('UnsplashService Specific', () => {
    const service = new UnsplashService();

    it('has correct provider name', () => {
      expect(service.provider).toBe('unsplash');
    });

    it('has correct priority', () => {
      expect(service.priority).toBe(3);
      expect(typeof service.priority).toBe('number');
    });

    it('singleton instance exports correct type', () => {
      expect(unsplashService).toBeInstanceOf(UnsplashService);
      expect(unsplashService.provider).toBe('unsplash');
    });
  });

  describe('ImagePipeline Contract', () => {
    let pipeline: ImagePipelineImpl;

    beforeEach(() => {
      pipeline = new ImagePipelineImpl();
    });

    it('implements ImagePipeline interface', () => {
      // Verify required methods
      expect(typeof pipeline.generate).toBe('function');
      expect(typeof pipeline.generateWithFallback).toBe('function');
      expect(typeof pipeline.getProviders).toBe('function');
      expect(typeof pipeline.testProviders).toBe('function');
    });

    it('generate accepts prompt and segmentId, returns Promise<string | null>', async () => {
      const result = pipeline.generate('test prompt', 'test-segment-id');

      // Verify it returns a Promise
      expect(result).toBeInstanceOf(Promise);

      // Await and verify return type
      const url = await result;
      expect(url === null || typeof url === 'string').toBe(true);
    });

    it('generateWithFallback accepts string and returns Promise<ImageResult>', async () => {
      const result = pipeline.generateWithFallback('test prompt');

      // Verify it returns a Promise
      expect(result).toBeInstanceOf(Promise);

      // Await and verify ImageResult shape
      const imageResult = await result;

      expect(imageResult).toHaveProperty('url');
      expect(imageResult).toHaveProperty('provider');
      expect(imageResult).toHaveProperty('cached');

      if (imageResult.url !== null) {
        expect(typeof imageResult.url).toBe('string');
      }
      expect(typeof imageResult.provider).toBe('string');
      expect(typeof imageResult.cached).toBe('boolean');

      // Verify no extra fields
      const validKeys = ['url', 'provider', 'cached', 'error'];
      Object.keys(imageResult).forEach((key) => {
        expect(validKeys).toContain(key);
      });
    });

    it('getProviders returns ImageService array', () => {
      const providers = pipeline.getProviders();

      // Verify it returns an array
      expect(Array.isArray(providers)).toBe(true);

      // Verify each item implements ImageService interface
      providers.forEach((provider) => {
        expect(provider).toHaveProperty('provider');
        expect(provider).toHaveProperty('priority');
        expect(typeof provider.generate).toBe('function');
        expect(typeof provider.isAvailable).toBe('function');

        expect(typeof provider.provider).toBe('string');
        expect(typeof provider.priority).toBe('number');
      });
    });

    it('testProviders returns Promise<Map<string, boolean>>', async () => {
      const result = pipeline.testProviders();

      // Verify it returns a Promise
      expect(result).toBeInstanceOf(Promise);

      // Await and verify Map structure
      const results = await result;

      expect(results instanceof Map).toBe(true);

      // Verify each entry
      results.forEach((available, provider) => {
        expect(typeof provider).toBe('string');
        expect(typeof available).toBe('boolean');
      });

      // Should have results for all registered providers
      expect(results.size).toBeGreaterThan(0);
    });

    it('singleton instance exports correct type', () => {
      expect(imagePipeline).toBeInstanceOf(ImagePipelineImpl);
    });
  });

  describe('ImageResult Contract', () => {
    it('successful result has correct shape', async () => {
      const service = grokImageService;

      // Generate any result (may succeed or fail based on API availability)
      const result = await service.generate('test prompt');

      // Required fields
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('provider');
      expect(result).toHaveProperty('cached');

      // Type validation
      if (result.url !== null) {
        expect(typeof result.url).toBe('string');
      }
      expect(typeof result.provider).toBe('string');
      expect(typeof result.cached).toBe('boolean');

      // Optional error field
      if (result.error !== undefined) {
        expect(typeof result.error).toBe('string');
      }
    });

    it('failed result has correct shape', async () => {
      // Force a failure by using invalid/unavailable service
      const service = new GrokImageService();

      // Even if it fails, should return valid ImageResult
      const result = await service.generate('test prompt');

      // Should have all required fields
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('provider');
      expect(result).toHaveProperty('cached');

      // Failed result should have url: null and error message
      if (result.url === null) {
        // When url is null, error should be present
        expect(result.error).toBeDefined();
        expect(typeof result.error).toBe('string');
      }
    });

    it('cached result has correct shape', async () => {
      const pipeline = new ImagePipelineImpl();

      // Generate same prompt twice to get cached result
      const prompt = 'unique-test-prompt-' + Date.now();
      await pipeline.generateWithFallback(prompt);
      const cachedResult = await pipeline.generateWithFallback(prompt);

      // Verify cached result structure
      expect(cachedResult).toHaveProperty('url');
      expect(cachedResult).toHaveProperty('provider');
      expect(cachedResult).toHaveProperty('cached');

      // If cached successfully
      if (cachedResult.cached === true) {
        expect(cachedResult.provider).toBe('cache');
      }
    });
  });

  describe('Priority Ordering', () => {
    it('services are ordered by priority', () => {
      const pipeline = new ImagePipelineImpl();
      const providers = pipeline.getProviders();

      // Verify sorted by priority (ascending)
      for (let i = 0; i < providers.length - 1; i++) {
        expect(providers[i].priority).toBeLessThanOrEqual(providers[i + 1].priority);
      }
    });

    it('Grok has higher priority than Unsplash', () => {
      expect(grokImageService.priority).toBeLessThan(unsplashService.priority);
    });
  });

  describe('Service Interchangeability', () => {
    it('all services can be used through ImageService interface', async () => {
      const services: ImageService[] = [grokImageService, unsplashService];

      for (const service of services) {
        // Should be able to call ImageService methods on any service
        expect(typeof service.provider).toBe('string');
        expect(typeof service.priority).toBe('number');

        const available = await service.isAvailable();
        expect(typeof available).toBe('boolean');

        const result = await service.generate('test prompt');
        expect(result).toHaveProperty('url');
        expect(result).toHaveProperty('provider');
        expect(result).toHaveProperty('cached');
      }
    });

    it('services can be registered in pipeline polymorphically', () => {
      const services: ImageService[] = [grokImageService, unsplashService];

      const pipeline = new ImagePipelineImpl(services);
      const registered = pipeline.getProviders();

      expect(registered.length).toBe(services.length);
      registered.forEach((service) => {
        expect(service).toHaveProperty('provider');
        expect(service).toHaveProperty('priority');
        expect(typeof service.generate).toBe('function');
        expect(typeof service.isAvailable).toBe('function');
      });
    });
  });

  describe('Error Handling Contracts', () => {
    it('services never throw, always return ImageResult', async () => {
      const services = [grokImageService, unsplashService];

      for (const service of services) {
        // Even with invalid input, should return valid ImageResult
        const result = await service.generate('');

        expect(result).toHaveProperty('url');
        expect(result).toHaveProperty('provider');
        expect(result).toHaveProperty('cached');

        // If it failed, should have error
        if (result.url === null) {
          expect(result.error).toBeDefined();
        }
      }
    });

    it('pipeline never throws, returns null on complete failure', async () => {
      const pipeline = new ImagePipelineImpl();

      // Should not throw even with invalid input
      const url = await pipeline.generate('', 'test-segment');

      // Returns null on failure, not throw
      expect(url === null || typeof url === 'string').toBe(true);
    });

    it('generateWithFallback always returns valid ImageResult', async () => {
      const pipeline = new ImagePipelineImpl();

      const result = await pipeline.generateWithFallback('test');

      // Always returns valid structure
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('provider');
      expect(result).toHaveProperty('cached');

      // On complete failure
      if (result.url === null) {
        expect(result.provider).toBe('none');
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('Best-Effort Behavior Contract', () => {
    it('services implement best-effort pattern', async () => {
      const service = grokImageService;

      // Service should attempt generation without throwing
      const result = await service.generate('test prompt');

      // Result should indicate success or failure gracefully
      if (result.url === null) {
        // Failed gracefully with error message
        expect(result.error).toBeDefined();
      } else {
        // Succeeded
        expect(typeof result.url).toBe('string');
      }
    });

    it('pipeline implements fallback chain', async () => {
      const pipeline = new ImagePipelineImpl();

      const result = await pipeline.generateWithFallback('test prompt');

      // Should try all services and return result
      expect(result).toBeDefined();
      expect(typeof result.provider).toBe('string');

      // Provider indicates which service succeeded or 'none'
      const validProviders = ['grok', 'unsplash', 'cache', 'none'];
      expect(validProviders).toContain(result.provider);
    });
  });
});
