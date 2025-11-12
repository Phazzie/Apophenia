/**
 * Contract Tests: Config (Seam #9)
 *
 * Validates that configuration system conforms to interface contracts
 * defined in src/core/types/seams.ts lines 584-622
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { AppConfig, ConfigProvider as IConfigProvider } from '../../src/core/types/seams';
import { DEFAULT_CONFIG } from '../../src/config/defaults';
import { ConfigProvider } from '../../src/config/ConfigProvider';
import { AIProvider } from '../../src/core/types/seams';

describe('Contract Tests: Config (Seam #9)', () => {
  describe('AppConfig Interface Compliance', () => {
    it('DEFAULT_CONFIG matches AppConfig interface structure', () => {
      const config = DEFAULT_CONFIG;

      // Verify top-level properties exist
      expect(config).toHaveProperty('ai');
      expect(config).toHaveProperty('features');
      expect(config).toHaveProperty('cache');
      expect(config).toHaveProperty('game');
    });

    it('DEFAULT_CONFIG has valid AI configuration', () => {
      const config = DEFAULT_CONFIG;

      // Verify AI config structure
      expect(config.ai).toHaveProperty('primaryProvider');
      expect(config.ai).toHaveProperty('fallbackChain');
      expect(config.ai).toHaveProperty('defaultTemperature');
      expect(config.ai).toHaveProperty('maxTokens');

      // Verify AI config types
      expect(typeof config.ai.primaryProvider).toBe('string');
      expect(Array.isArray(config.ai.fallbackChain)).toBe(true);
      expect(typeof config.ai.defaultTemperature).toBe('number');
      expect(typeof config.ai.maxTokens).toBe('number');

      // Verify AI config values are reasonable
      expect(config.ai.defaultTemperature).toBeGreaterThanOrEqual(0);
      expect(config.ai.defaultTemperature).toBeLessThanOrEqual(2);
      expect(config.ai.maxTokens).toBeGreaterThan(0);
    });

    it('DEFAULT_CONFIG has valid features configuration', () => {
      const config = DEFAULT_CONFIG;

      // Verify all feature flags exist
      expect(config.features).toHaveProperty('temporalRevision');
      expect(config.features).toHaveProperty('quantumNarrative');
      expect(config.features).toHaveProperty('realityCorruption');
      expect(config.features).toHaveProperty('adaptiveHorror');
      expect(config.features).toHaveProperty('metaConsciousness');
      expect(config.features).toHaveProperty('neuralEcho');
      expect(config.features).toHaveProperty('semanticArchaeology');
      expect(config.features).toHaveProperty('narrativeDNA');
      expect(config.features).toHaveProperty('fifthWall');

      // Verify all feature flags are booleans
      Object.values(config.features).forEach((value) => {
        expect(typeof value).toBe('boolean');
      });
    });

    it('DEFAULT_CONFIG has valid cache configuration', () => {
      const config = DEFAULT_CONFIG;

      // Verify cache config structure
      expect(config.cache).toHaveProperty('imageMaxSize');
      expect(config.cache).toHaveProperty('imageTTL');
      expect(config.cache).toHaveProperty('enablePersistence');

      // Verify cache config types
      expect(typeof config.cache.imageMaxSize).toBe('number');
      expect(typeof config.cache.imageTTL).toBe('number');
      expect(typeof config.cache.enablePersistence).toBe('boolean');

      // Verify cache config values are reasonable
      expect(config.cache.imageMaxSize).toBeGreaterThan(0);
      expect(config.cache.imageTTL).toBeGreaterThan(0);
    });

    it('DEFAULT_CONFIG has valid game configuration', () => {
      const config = DEFAULT_CONFIG;

      // Verify game config structure
      expect(config.game).toHaveProperty('defaultGenre');
      expect(config.game).toHaveProperty('maxHistorySegments');
      expect(config.game).toHaveProperty('horrorIntensityRate');
      expect(config.game).toHaveProperty('corruptionThreshold');

      // Verify game config types
      expect(typeof config.game.defaultGenre).toBe('string');
      expect(typeof config.game.maxHistorySegments).toBe('number');
      expect(typeof config.game.horrorIntensityRate).toBe('number');
      expect(typeof config.game.corruptionThreshold).toBe('number');

      // Verify game config values are reasonable
      expect(config.game.maxHistorySegments).toBeGreaterThan(0);
      expect(config.game.horrorIntensityRate).toBeGreaterThanOrEqual(0);
      expect(config.game.horrorIntensityRate).toBeLessThanOrEqual(1);
      expect(config.game.corruptionThreshold).toBeGreaterThanOrEqual(0);
      expect(config.game.corruptionThreshold).toBeLessThanOrEqual(100);
    });

    it('all config values have correct types', () => {
      const config = DEFAULT_CONFIG;

      // AI config types
      expect(typeof config.ai.primaryProvider).toBe('string');
      expect(Array.isArray(config.ai.fallbackChain)).toBe(true);
      expect(typeof config.ai.defaultTemperature).toBe('number');
      expect(typeof config.ai.maxTokens).toBe('number');

      // Features config types (all booleans)
      Object.values(config.features).forEach((value) => {
        expect(typeof value).toBe('boolean');
      });

      // Cache config types
      expect(typeof config.cache.imageMaxSize).toBe('number');
      expect(typeof config.cache.imageTTL).toBe('number');
      expect(typeof config.cache.enablePersistence).toBe('boolean');

      // Game config types
      expect(typeof config.game.defaultGenre).toBe('string');
      expect(typeof config.game.maxHistorySegments).toBe('number');
      expect(typeof config.game.horrorIntensityRate).toBe('number');
      expect(typeof config.game.corruptionThreshold).toBe('number');
    });

    it('fallbackChain contains valid AIProvider values', () => {
      const config = DEFAULT_CONFIG;
      const validProviders = Object.values(AIProvider);

      config.ai.fallbackChain.forEach((provider) => {
        expect(validProviders).toContain(provider);
      });
    });

    it('primaryProvider is a valid AIProvider value', () => {
      const config = DEFAULT_CONFIG;
      const validProviders = Object.values(AIProvider);

      expect(validProviders).toContain(config.ai.primaryProvider);
    });
  });

  describe('ConfigProvider Interface Compliance', () => {
    let provider: ConfigProvider;

    beforeEach(() => {
      provider = new ConfigProvider();
    });

    it('implements ConfigProvider interface methods', () => {
      // Verify all required methods exist
      expect(typeof provider.getConfig).toBe('function');
      expect(typeof provider.updateConfig).toBe('function');
      expect(typeof provider.resetToDefaults).toBe('function');
    });

    it('getConfig returns AppConfig', () => {
      const config = provider.getConfig();

      // Verify it returns an object with correct structure
      expect(config).toHaveProperty('ai');
      expect(config).toHaveProperty('features');
      expect(config).toHaveProperty('cache');
      expect(config).toHaveProperty('game');
    });

    it('getConfig returns a copy, not a reference', () => {
      const config1 = provider.getConfig();
      const config2 = provider.getConfig();

      // Should be equal but not the same reference
      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2);

      // Modifying one should not affect the other
      config1.ai.primaryProvider = AIProvider.MOCK;
      expect(config2.ai.primaryProvider).not.toBe(AIProvider.MOCK);
    });

    it('updateConfig accepts Partial<AppConfig>', () => {
      expect(() => {
        provider.updateConfig({
          ai: { primaryProvider: AIProvider.MOCK },
        });
      }).not.toThrow();
    });

    it('updateConfig merges partial updates', () => {
      const originalConfig = provider.getConfig();

      provider.updateConfig({
        ai: { primaryProvider: AIProvider.MOCK },
      });

      const updatedConfig = provider.getConfig();

      // Primary provider should be updated
      expect(updatedConfig.ai.primaryProvider).toBe(AIProvider.MOCK);

      // Other AI properties should remain unchanged
      expect(updatedConfig.ai.fallbackChain).toEqual(originalConfig.ai.fallbackChain);
      expect(updatedConfig.ai.defaultTemperature).toBe(originalConfig.ai.defaultTemperature);
      expect(updatedConfig.ai.maxTokens).toBe(originalConfig.ai.maxTokens);

      // Other top-level properties should remain unchanged
      expect(updatedConfig.features).toEqual(originalConfig.features);
      expect(updatedConfig.cache).toEqual(originalConfig.cache);
      expect(updatedConfig.game).toEqual(originalConfig.game);
    });

    it('updateConfig can update multiple sections', () => {
      provider.updateConfig({
        ai: { primaryProvider: AIProvider.MOCK },
        features: { temporalRevision: false },
        game: { defaultGenre: 'test-genre' },
      });

      const config = provider.getConfig();

      expect(config.ai.primaryProvider).toBe(AIProvider.MOCK);
      expect(config.features.temporalRevision).toBe(false);
      expect(config.game.defaultGenre).toBe('test-genre');
    });

    it('updateConfig preserves other properties when updating nested objects', () => {
      provider.updateConfig({
        features: { temporalRevision: false },
      });

      const config = provider.getConfig();

      // Updated property
      expect(config.features.temporalRevision).toBe(false);

      // Other features should remain from defaults
      expect(config.features.quantumNarrative).toBe(DEFAULT_CONFIG.features.quantumNarrative);
      expect(config.features.adaptiveHorror).toBe(DEFAULT_CONFIG.features.adaptiveHorror);
    });

    it('resetToDefaults restores DEFAULT_CONFIG', () => {
      // Make some changes
      provider.updateConfig({
        ai: { primaryProvider: AIProvider.MOCK },
        features: { temporalRevision: false },
        game: { defaultGenre: 'test-genre' },
      });

      // Reset
      provider.resetToDefaults();

      const config = provider.getConfig();

      // Should match defaults
      expect(config.ai.primaryProvider).toBe(DEFAULT_CONFIG.ai.primaryProvider);
      expect(config.features.temporalRevision).toBe(DEFAULT_CONFIG.features.temporalRevision);
      expect(config.game.defaultGenre).toBe(DEFAULT_CONFIG.game.defaultGenre);
    });

    it('resetToDefaults completely replaces config', () => {
      provider.updateConfig({
        ai: {
          primaryProvider: AIProvider.MOCK,
          fallbackChain: [AIProvider.MOCK],
          defaultTemperature: 0.1,
          maxTokens: 100,
        },
      });

      provider.resetToDefaults();

      const config = provider.getConfig();

      // All values should match defaults exactly
      expect(config).toEqual(DEFAULT_CONFIG);
    });
  });

  describe('ConfigProvider Instance Behavior', () => {
    it('can be instantiated without arguments', () => {
      expect(() => new ConfigProvider()).not.toThrow();
    });

    it('can be instantiated with initial config', () => {
      const initialConfig: Partial<AppConfig> = {
        ai: { primaryProvider: AIProvider.MOCK },
      };

      const provider = new ConfigProvider(initialConfig);
      const config = provider.getConfig();

      expect(config.ai.primaryProvider).toBe(AIProvider.MOCK);
    });

    it('initial config merges with defaults', () => {
      const initialConfig: Partial<AppConfig> = {
        ai: { primaryProvider: AIProvider.MOCK },
      };

      const provider = new ConfigProvider(initialConfig);
      const config = provider.getConfig();

      // Custom value
      expect(config.ai.primaryProvider).toBe(AIProvider.MOCK);

      // Default values should still exist
      expect(config.features).toEqual(DEFAULT_CONFIG.features);
      expect(config.cache).toEqual(DEFAULT_CONFIG.cache);
      expect(config.game).toEqual(DEFAULT_CONFIG.game);
    });

    it('multiple instances are independent', () => {
      const provider1 = new ConfigProvider();
      const provider2 = new ConfigProvider();

      provider1.updateConfig({ ai: { primaryProvider: AIProvider.MOCK } });

      const config1 = provider1.getConfig();
      const config2 = provider2.getConfig();

      expect(config1.ai.primaryProvider).toBe(AIProvider.MOCK);
      expect(config2.ai.primaryProvider).toBe(DEFAULT_CONFIG.ai.primaryProvider);
    });
  });

  describe('Config Value Constraints', () => {
    it('AI temperature is within reasonable bounds', () => {
      const config = DEFAULT_CONFIG;
      expect(config.ai.defaultTemperature).toBeGreaterThanOrEqual(0);
      expect(config.ai.defaultTemperature).toBeLessThanOrEqual(2);
    });

    it('AI maxTokens is positive', () => {
      const config = DEFAULT_CONFIG;
      expect(config.ai.maxTokens).toBeGreaterThan(0);
    });

    it('cache imageMaxSize is positive', () => {
      const config = DEFAULT_CONFIG;
      expect(config.cache.imageMaxSize).toBeGreaterThan(0);
    });

    it('cache imageTTL is positive', () => {
      const config = DEFAULT_CONFIG;
      expect(config.cache.imageTTL).toBeGreaterThan(0);
    });

    it('game maxHistorySegments is positive', () => {
      const config = DEFAULT_CONFIG;
      expect(config.game.maxHistorySegments).toBeGreaterThan(0);
    });

    it('game horrorIntensityRate is between 0 and 1', () => {
      const config = DEFAULT_CONFIG;
      expect(config.game.horrorIntensityRate).toBeGreaterThanOrEqual(0);
      expect(config.game.horrorIntensityRate).toBeLessThanOrEqual(1);
    });

    it('game corruptionThreshold is between 0 and 100', () => {
      const config = DEFAULT_CONFIG;
      expect(config.game.corruptionThreshold).toBeGreaterThanOrEqual(0);
      expect(config.game.corruptionThreshold).toBeLessThanOrEqual(100);
    });
  });

  describe('Feature Flags', () => {
    it('all feature flags are defined', () => {
      const config = DEFAULT_CONFIG;
      const expectedFeatures = [
        'temporalRevision',
        'quantumNarrative',
        'realityCorruption',
        'adaptiveHorror',
        'metaConsciousness',
        'neuralEcho',
        'semanticArchaeology',
        'narrativeDNA',
        'fifthWall',
      ];

      expectedFeatures.forEach((feature) => {
        expect(config.features).toHaveProperty(feature);
      });
    });

    it('feature flags can be toggled', () => {
      const provider = new ConfigProvider();

      provider.updateConfig({
        features: { temporalRevision: false },
      });

      let config = provider.getConfig();
      expect(config.features.temporalRevision).toBe(false);

      provider.updateConfig({
        features: { temporalRevision: true },
      });

      config = provider.getConfig();
      expect(config.features.temporalRevision).toBe(true);
    });

    it('toggling one feature does not affect others', () => {
      const provider = new ConfigProvider();
      const originalConfig = provider.getConfig();

      provider.updateConfig({
        features: { temporalRevision: false },
      });

      const updatedConfig = provider.getConfig();

      // Changed feature
      expect(updatedConfig.features.temporalRevision).toBe(false);

      // Other features unchanged
      expect(updatedConfig.features.quantumNarrative).toBe(originalConfig.features.quantumNarrative);
      expect(updatedConfig.features.adaptiveHorror).toBe(originalConfig.features.adaptiveHorror);
      expect(updatedConfig.features.metaConsciousness).toBe(originalConfig.features.metaConsciousness);
    });
  });

  describe('Type Safety', () => {
    it('ConfigProvider satisfies IConfigProvider interface', () => {
      const provider: IConfigProvider = new ConfigProvider();

      // Should compile and work correctly
      const config = provider.getConfig();
      expect(config).toBeDefined();

      provider.updateConfig({ ai: { primaryProvider: AIProvider.MOCK } });
      provider.resetToDefaults();
    });

    it('getConfig return type satisfies AppConfig', () => {
      const provider = new ConfigProvider();
      const config: AppConfig = provider.getConfig();

      // Should compile - verifying type compatibility
      expect(config.ai).toBeDefined();
      expect(config.features).toBeDefined();
      expect(config.cache).toBeDefined();
      expect(config.game).toBeDefined();
    });
  });
});
