/**
 * Integration tests for Image Pipeline fallback chain
 * Validates: Gemini 2.5 Flash Image (1) → Grok (2) → Unsplash (3)
 */

import { describe, it, expect } from 'vitest';
import { imagePipeline } from '../../src/services/images/ImagePipeline';

describe('Image Pipeline Fallback Chain', () => {
  it('should have correct provider priority order', () => {
    const providers = imagePipeline.getProviders();

    expect(providers.length).toBeGreaterThanOrEqual(3);

    // Verify priority order (lower number = higher priority)
    expect(providers[0].provider).toBe('gemini-flash-image');
    expect(providers[0].priority).toBe(1);

    expect(providers[1].provider).toBe('grok');
    expect(providers[1].priority).toBe(2);

    expect(providers[2].provider).toBe('unsplash');
    expect(providers[2].priority).toBe(3);
  });

  it('should be sorted by priority', () => {
    const providers = imagePipeline.getProviders();

    for (let i = 1; i < providers.length; i++) {
      expect(providers[i].priority).toBeGreaterThanOrEqual(providers[i - 1].priority);
    }
  });

  it('should have cache stats available', () => {
    const stats = imagePipeline.getCacheStats();

    expect(stats).toBeDefined();
    expect(stats.size).toBeDefined();
    expect(stats.maxSize).toBeDefined();
    expect(stats.fillPercentage).toBeDefined();
    expect(stats.expiredCount).toBeDefined();
    expect(stats.size).toBeGreaterThanOrEqual(0);
  });

  it('should support cache operations', () => {
    expect(() => imagePipeline.clearCache()).not.toThrow();
    expect(() => imagePipeline.pruneCache()).not.toThrow();
  });

  it('should test providers availability', async () => {
    const results = await imagePipeline.testProviders();

    expect(results).toBeInstanceOf(Map);
    expect(results.has('gemini-flash-image')).toBe(true);
    expect(results.has('grok')).toBe(true);
    expect(results.has('unsplash')).toBe(true);
  }, 10000); // 10s timeout for API checks
});
