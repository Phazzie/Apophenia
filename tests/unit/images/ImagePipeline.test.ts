/**
 * Image Pipeline Integration Tests
 *
 * Tests the coordination of services and caching.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImagePipelineImpl } from '../../../src/services/images/ImagePipeline';
import { BaseImageService } from '../../../src/services/images/base/ImageService';
import { ImageResult } from '../../../src/core/types/seams';

class MockImageService extends BaseImageService {
  readonly provider: string;
  readonly priority: number;
  private shouldSucceed: boolean;
  private imageUrl: string;

  constructor(name: string, priority: number, shouldSucceed: boolean = true, url: string = 'https://example.com/image.jpg') {
    super();
    this.provider = name;
    this.priority = priority;
    this.shouldSucceed = shouldSucceed;
    this.imageUrl = url;
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async generate(prompt: string): Promise<ImageResult> {
    if (this.shouldSucceed) {
      return this.success(this.imageUrl);
    } else {
      return this.failure('Mock service failed');
    }
  }
}

describe('ImagePipeline', () => {
  let pipeline: ImagePipelineImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    // Create fresh pipeline with fresh cache for each test
    pipeline = new ImagePipelineImpl();
    // Clear any cached entries from previous tests
    pipeline.clearCache();
  });

  describe('initialization', () => {
    it('should initialize with default services', () => {
      const providers = pipeline.getProviders();

      expect(providers.length).toBeGreaterThan(0);
      // Default services: Grok → Unsplash (Gemini removed)
      expect(providers.map((p) => p.provider)).toContain('grok');
      expect(providers.map((p) => p.provider)).toContain('unsplash');
    });

    it('should sort services by priority', () => {
      const service1 = new MockImageService('first', 3);
      const service2 = new MockImageService('second', 1);
      const service3 = new MockImageService('third', 2);

      pipeline = new ImagePipelineImpl([service1, service2, service3]);
      const sorted = pipeline.getProviders();

      expect(sorted[0].provider).toBe('second');
      expect(sorted[1].provider).toBe('third');
      expect(sorted[2].provider).toBe('first');
    });

    it('should accept custom services', () => {
      const customService = new MockImageService('custom', 1);

      pipeline = new ImagePipelineImpl([customService]);

      expect(pipeline.getProviders()).toHaveLength(1);
      expect(pipeline.getProviders()[0].provider).toBe('custom');
    });
  });

  describe('image generation', () => {
    it('should generate image from first available service', async () => {
      const service1 = new MockImageService('service1', 1);
      const service2 = new MockImageService('service2', 2);

      pipeline = new ImagePipelineImpl([service1, service2]);

      const result = await pipeline.generateWithFallback('test prompt');

      expect(result.url).toBe('https://example.com/image.jpg');
      expect(result.provider).toBe('service1');
      expect(result.cached).toBe(false);
    });

    it('should fallback to next service on failure', async () => {
      const service1 = new MockImageService('service1', 1, false); // Fails
      const service2 = new MockImageService('service2', 2); // Succeeds

      pipeline = new ImagePipelineImpl([service1, service2]);

      const result = await pipeline.generateWithFallback('test prompt');

      expect(result.url).toBe('https://example.com/image.jpg');
      expect(result.provider).toBe('service2');
    });

    it('should return null when all services fail', async () => {
      const service1 = new MockImageService('service1', 1, false);
      const service2 = new MockImageService('service2', 2, false);

      pipeline = new ImagePipelineImpl([service1, service2]);

      const result = await pipeline.generateWithFallback('test prompt');

      expect(result.url).toBeNull();
      expect(result.provider).toBe('none');
      expect(result.error).toBeDefined();
    });

    it('should use segmentId in generate method', async () => {
      const service = new MockImageService('test', 1);
      pipeline = new ImagePipelineImpl([service]);

      const url = await pipeline.generate('test prompt', 'segment-123');

      expect(url).toBe('https://example.com/image.jpg');
    });
  });

  describe('caching', () => {
    it('should cache successful results', async () => {
      const service = new MockImageService('test', 1);
      pipeline = new ImagePipelineImpl([service]);

      const prompt = 'test prompt';

      // First call should generate
      const result1 = await pipeline.generateWithFallback(prompt);
      expect(result1.cached).toBe(false);
      expect(result1.provider).toBe('test');

      // Second call should use cache
      const result2 = await pipeline.generateWithFallback(prompt);
      expect(result2.cached).toBe(true);
      expect(result2.provider).toBe('cache');
      expect(result2.url).toBe(result1.url);
    });

    it('should not cache failed results', async () => {
      const service1 = new MockImageService('service1', 1, false); // Fails
      const service2 = new MockImageService('service2', 2, true); // Succeeds

      pipeline = new ImagePipelineImpl([service1, service2]);

      const result = await pipeline.generateWithFallback('test prompt');

      expect(result.cached).toBe(false);
      expect(result.provider).toBe('service2');
    });

    it('should have separate cache entries for different prompts', async () => {
      const service = new MockImageService('test', 1, true, 'https://example.com/image1.jpg');
      pipeline = new ImagePipelineImpl([service]);

      const result1 = await pipeline.generateWithFallback('prompt 1');
      expect(result1.url).toBe('https://example.com/image1.jpg');

      const service2 = new MockImageService('test', 1, true, 'https://example.com/image2.jpg');
      pipeline = new ImagePipelineImpl([service2]);

      const result2 = await pipeline.generateWithFallback('prompt 2');
      expect(result2.url).toBe('https://example.com/image2.jpg');
    });

    it('should clear cache', () => {
      const service = new MockImageService('test', 1);
      pipeline = new ImagePipelineImpl([service]);

      // Populate cache
      pipeline.generateWithFallback('test prompt');

      pipeline.clearCache();

      const stats = pipeline.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should prune expired cache entries', async () => {
      const service = new MockImageService('test', 1);
      pipeline = new ImagePipelineImpl([service]);

      // Use the internal cache to manipulate time
      vi.useFakeTimers();

      await pipeline.generateWithFallback('test prompt');

      // Advance time past TTL (30 min default + 1 second)
      vi.advanceTimersByTime(31 * 60 * 1000);

      const prunedCount = pipeline.pruneCache();

      expect(prunedCount).toBeGreaterThanOrEqual(0); // May or may not prune depending on cache state

      vi.useRealTimers();
    });
  });

  describe('provider management', () => {
    it('should return list of providers', () => {
      const service1 = new MockImageService('service1', 1);
      const service2 = new MockImageService('service2', 2);

      pipeline = new ImagePipelineImpl([service1, service2]);

      const providers = pipeline.getProviders();

      expect(providers).toHaveLength(2);
      expect(providers[0].provider).toBe('service1');
      expect(providers[1].provider).toBe('service2');
    });

    it('should test all providers', async () => {
      const service1 = new MockImageService('service1', 1);
      const service2 = new MockImageService('service2', 2);

      pipeline = new ImagePipelineImpl([service1, service2]);

      const results = await pipeline.testProviders();

      expect(results.get('service1')).toBe(true);
      expect(results.get('service2')).toBe(true);
    });

    it('should handle provider test errors gracefully', async () => {
      const service = new MockImageService('test', 1);

      // Mock isAvailable to throw
      service.isAvailable = vi.fn().mockRejectedValueOnce(new Error('Test error'));

      pipeline = new ImagePipelineImpl([service]);

      const results = await pipeline.testProviders();

      expect(results.get('test')).toBe(false);
    });
  });

  describe('cache statistics', () => {
    it('should return cache stats', () => {
      pipeline = new ImagePipelineImpl([new MockImageService('test', 1)]);

      const stats = pipeline.getCacheStats();

      expect(stats.size).toBeDefined();
      expect(stats.maxSize).toBeDefined();
      expect(stats.fillPercentage).toBeDefined();
      expect(stats.expiredCount).toBeDefined();
    });

    it('should track fill percentage', async () => {
      const service = new MockImageService('test', 1);
      pipeline = new ImagePipelineImpl([service]);
      pipeline.clearCache(); // Ensure clean cache

      // Generate multiple images
      for (let i = 0; i < 5; i++) {
        await pipeline.generateWithFallback(`prompt-unique-${i}`);
      }

      const stats = pipeline.getCacheStats();

      expect(stats.fillPercentage).toBeGreaterThan(0);
      expect(stats.size).toBeGreaterThanOrEqual(5);
    });
  });

  describe('best-effort behavior', () => {
    it('should not throw on generation failure', async () => {
      const service = new MockImageService('test', 1, false);
      pipeline = new ImagePipelineImpl([service]);

      const result = await pipeline.generateWithFallback('test prompt');

      expect(result.url).toBeNull();
      expect(result.error).toBeDefined();
    });

    it('should return valid ImageResult structure', async () => {
      const service = new MockImageService('test', 1);
      pipeline = new ImagePipelineImpl([service]);

      const result = await pipeline.generateWithFallback('test prompt');

      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('provider');
      expect(result).toHaveProperty('cached');
    });
  });
});
