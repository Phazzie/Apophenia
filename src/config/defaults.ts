/**
 * DEFAULT CONFIGURATION
 *
 * Zero-config defaults that allow the app to run without any setup.
 * Environment variables can override these values.
 *
 * Design Philosophy:
 * - Works offline with mock AI by default
 * - Progressive enhancement with real AI providers
 * - All features enabled by default (can be disabled via flags)
 */

import { AppConfig, AIProvider } from '../core/types/seams';

/**
 * Default Application Configuration
 *
 * This configuration ensures:
 * 1. App works without ANY API keys (uses mock AI)
 * 2. Grok is primary provider when key is present
 * 3. All revolutionary features are enabled
 * 4. Sensible performance defaults
 */
export const DEFAULT_CONFIG: AppConfig = {
  ai: {
    // Primary provider (Grok for text + images)
    primaryProvider: AIProvider.GROK,

    // Fallback chain: Grok → Mock (no Gemini per integration plan)
    fallbackChain: [AIProvider.GROK, AIProvider.MOCK],

    // AI generation parameters
    defaultTemperature: 0.8,  // Creative but not too chaotic
    maxTokens: 2000,          // Enough for rich narrative responses
  },

  features: {
    // All revolutionary features enabled by default
    temporalRevision: true,           // Rewrite past events
    quantumNarrative: true,           // Parallel timelines
    realityCorruption: true,          // Progressive UI corruption
    adaptiveHorror: true,             // Personalized fear targeting
    metaConsciousness: true,          // Fourth-wall breaking
    neuralEcho: true,                 // Cross-session memory
    semanticArchaeology: true,        // Choice pattern analysis
    narrativeDNA: true,               // Evolutionary storytelling
    fifthWall: true,                  // Browser manipulation
  },

  cache: {
    // Image cache settings (LRU with TTL)
    imageMaxSize: 50,                 // Max 50 cached images
    imageTTL: 30 * 60 * 1000,        // 30 minutes TTL
    enablePersistence: true,          // Save to localStorage
  },

  game: {
    // Gameplay defaults
    defaultGenre: 'cosmic-horror',    // Default genre ID
    maxHistorySegments: 100,          // Max story segments before pruning
    horrorIntensityRate: 0.5,         // How fast horror escalates (0-1)
    corruptionThreshold: 70,          // Corruption % to trigger unraveling
  },
};

/**
 * Get configuration with environment variable overrides
 *
 * Environment variables:
 * - VITE_XAI_API_KEY: Grok API key (for text + images)
 * - VITE_DEFAULT_GENRE: Override default genre
 * - VITE_FEATURE_FLAGS: JSON object to disable features
 */
export function getConfig(): AppConfig {
  const config = { ...DEFAULT_CONFIG };

  // Override default genre if specified
  const envGenre = import.meta.env.VITE_DEFAULT_GENRE;
  if (envGenre) {
    config.game.defaultGenre = envGenre;
  }

  // Override feature flags if specified
  const envFeatures = import.meta.env.VITE_FEATURE_FLAGS;
  if (envFeatures) {
    try {
      const featureOverrides = JSON.parse(envFeatures);
      config.features = { ...config.features, ...featureOverrides };
    } catch (error) {
      console.warn('Failed to parse VITE_FEATURE_FLAGS:', error);
    }
  }

  // Determine primary provider based on available API keys
  const hasGrokKey = !!import.meta.env.VITE_XAI_API_KEY;

  if (!hasGrokKey) {
    // No API keys - use mock by default
    config.ai.primaryProvider = AIProvider.MOCK;
    config.ai.fallbackChain = [AIProvider.MOCK];
    console.info('🎭 Running in MOCK mode (no API keys detected)');
  } else {
    console.info('🤖 Grok AI enabled');
  }

  return config;
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
  const config = getConfig();
  return config.features[feature] ?? false;
}

/**
 * Get AI provider configuration
 */
export function getAIConfig() {
  return getConfig().ai;
}

/**
 * Get cache configuration
 */
export function getCacheConfig() {
  return getConfig().cache;
}

/**
 * Get game configuration
 */
export function getGameConfig() {
  return getConfig().game;
}
