/**
 * Test suite for Image Generation Fallback Chain
 * Verifies that all strategies work correctly and fall back appropriately
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { imageGenerationOrchestrator } from '../ImageGenerationOrchestrator';
import {
  BackendAPIStrategy,
  ImagenPrimaryStrategy,
  ImagenSecondaryStrategy,
  UnsplashFallbackStrategy,
  SVGFallbackStrategy,
} from '../ImageGenerationStrategy';
import {
  enhancePromptWithHorrorIntensity,
  generatePromptVariations,
} from '../imagePromptEnhancer';
import {
  generateUnsplashUrl,
  extractPromptKeywords,
  selectRandomHorrorKeywords,
} from '../unsplashFallback';

describe('Image Generation Strategy Pattern', () => {
  describe('Individual Strategies', () => {
    it('should create BackendAPIStrategy', () => {
      const strategy = new BackendAPIStrategy();
      expect(strategy.name).toBe('Backend API');
      expect(strategy.priority).toBe(1);
      expect(strategy.canAttempt()).toBe(true);
    });

    it('should create ImagenPrimaryStrategy', () => {
      const strategy = new ImagenPrimaryStrategy();
      expect(strategy.name).toBe('Imagen Primary');
      expect(strategy.priority).toBe(2);
    });

    it('should create ImagenSecondaryStrategy', () => {
      const strategy = new ImagenSecondaryStrategy();
      expect(strategy.name).toBe('Imagen Secondary');
      expect(strategy.priority).toBe(3);
    });

    it('should create UnsplashFallbackStrategy', () => {
      const strategy = new UnsplashFallbackStrategy();
      expect(strategy.name).toBe('Unsplash Fallback');
      expect(strategy.priority).toBe(4);
      expect(strategy.canAttempt()).toBe(true);
    });

    it('should create SVGFallbackStrategy', () => {
      const strategy = new SVGFallbackStrategy();
      expect(strategy.name).toBe('SVG Emergency');
      expect(strategy.priority).toBe(5);
      expect(strategy.canAttempt()).toBe(true);
    });
  });

  describe('Orchestrator', () => {
    it('should list available strategies', () => {
      const strategies = imageGenerationOrchestrator.getAvailableStrategies();
      expect(strategies.length).toBeGreaterThan(0);
      expect(strategies[0]).toHaveProperty('name');
      expect(strategies[0]).toHaveProperty('available');
      expect(strategies[0]).toHaveProperty('priority');
    });

    it('should generate image with fallback chain', async () => {
      const result = await imageGenerationOrchestrator.generateImage({
        prompt: 'test cosmic horror scene',
        useHorrorIntensity: true,
      });

      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('source');
      expect(result.url).toBeTruthy();
    });

    it('should generate multiple image variations', async () => {
      const result = await imageGenerationOrchestrator.generateImageVariations({
        prompt: 'test horror variations',
        useHorrorIntensity: true,
        variationCount: 3,
      });

      expect(result.variations).toHaveLength(3);
      expect(result.selectedIndex).toBeGreaterThanOrEqual(0);
      expect(result.selectedIndex).toBeLessThan(3);
    });
  });

  describe('Prompt Enhancer', () => {
    it('should enhance prompt with horror intensity', () => {
      const enhanced = enhancePromptWithHorrorIntensity('dark room', 5);
      expect(enhanced).toContain('dark room');
      expect(enhanced).toContain('horror');
    });

    it('should generate prompt variations', () => {
      const variations = generatePromptVariations('base prompt', 3);
      expect(variations).toHaveLength(3);
      variations.forEach((variation) => {
        expect(variation).toContain('base prompt');
      });
    });
  });

  describe('Unsplash Fallback', () => {
    it('should generate Unsplash URL', () => {
      const url = generateUnsplashUrl('horror scene');
      expect(url).toContain('source.unsplash.com');
      expect(url).toContain('1920x1080');
    });

    it('should extract prompt keywords', () => {
      const keywords = extractPromptKeywords('dark horror scene with shadows', 2);
      expect(keywords).toBeTruthy();
      expect(keywords.split(',')).toHaveLength(2);
    });

    it('should select random horror keywords', () => {
      const keywords = selectRandomHorrorKeywords(3);
      expect(keywords.split(',')).toHaveLength(3);
    });
  });

  describe('Fallback Chain Integration', () => {
    it('should test complete fallback chain', async () => {
      const results = await imageGenerationOrchestrator.testFallbackChain(
        'test fallback chain'
      );

      expect(results.length).toBeGreaterThan(0);
      results.forEach((result) => {
        expect(result).toHaveProperty('strategy');
        expect(result).toHaveProperty('success');
      });

      // At least one strategy should succeed (Unsplash or SVG)
      const successCount = results.filter((r) => r.success).length;
      expect(successCount).toBeGreaterThan(0);
    });
  });
});
