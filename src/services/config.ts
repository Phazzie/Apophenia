/**
 * @file config.ts
 * @description Central configuration file for the Apophenia application.
 * This file manages API keys, AI model settings, and feature flags for the revolutionary AI engines.
 * It's designed to handle different environments (development, test, production) gracefully.
 *
 * @deprecated The practice of storing API keys on the frontend is deprecated.
 * This configuration is being phased out in favor of a secure backend API approach
 * where all keys are stored on the server. See `secureGenkit.ts` and `secureApiClient.ts`.
 */

// Conditional environment handling for Vite (browser) vs. Jest (Node.js)
const isTestEnvironment = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

/**
 * @constant {object} API_KEYS
 * @description An object that holds the API keys for various AI services.
 * It dynamically loads keys from environment variables (`.env` file) to avoid hardcoding them.
 * Provides separate logic for browser and test environments.
 * @property {string} googleGenAI - API key for Google Gemini text generation.
 * @property {string} googleImagen - API key for Google Imagen image generation (often the same as Gemini).
 * @property {string} xaiAPI - API key for X.AI's Grok models.
 */
export const API_KEYS = isTestEnvironment ? {
  // Jest test environment - use process.env
  googleGenAI: process.env.VITE_GEMINI_API_KEY || 'test-key',
  googleImagen: process.env.VITE_GEMINI_API_KEY || 'test-key',
  xaiAPI: process.env.VITE_XAI_API_KEY || 'test-key',
} : {
  // Browser environment - use import.meta.env
  googleGenAI: import.meta.env.VITE_GEMINI_API_KEY || '',
  googleImagen: import.meta.env.VITE_GEMINI_API_KEY || '',
  xaiAPI: import.meta.env.VITE_XAI_API_KEY || '',
};

/**
 * A getter function to retrieve the current set of API keys.
 * @returns {object} An object containing the API keys.
 * @deprecated This function is part of the old, insecure method of handling API keys on the client.
 */
export const getConfig = () => {
  return {
    geminiApiKey: API_KEYS.googleGenAI,
    imageApiKey: API_KEYS.googleImagen,
    imagenKey: API_KEYS.googleImagen,
    xaiApiKey: API_KEYS.xaiAPI,
  };
};

/**
 * @constant {object} AI_MODELS
 * @description A comprehensive configuration object for all AI models used in the application.
 * It defines the model names and generation parameters (like temperature, max tokens) for
 * different use cases, such as concept generation, story progression, and summarization.
 * This centralized configuration allows for easy tuning and swapping of models.
 */
export const AI_MODELS = {
  // Defines the model pipeline for text generation, starting with the primary model and defining fallbacks.
  PRIMARY_TEXT: 'grok-4-fast-reasoning',
  FALLBACK_TEXT: 'gemini-2.5-pro',
  SECONDARY_FALLBACK: 'gemini-2.5-flash',
  
  // Defines the model pipeline for image generation.
  PRIMARY_IMAGE: 'grok-4-fast-reasoning',
  FALLBACK_IMAGE: 'imagen-3.0-generate-001',
  SECONDARY_FALLBACK_IMAGE: 'imagen-2.0-generate-001',
  
  // Configuration for generating the initial story concept. Tuned for creativity.
  CONCEPT_GENERATION: {
    model: 'grok-4-fast-reasoning',
    temperature: 1.2,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
    enableThinking: true,
    thinkingBudget: 'high',
    contextWindow: 2000000,
  },
  // Configuration for progressing the main story. Tuned for coherence and following instructions.
  STORY_PROGRESSION: {
    model: 'grok-4-fast-reasoning',
    temperature: 1.0,
    topK: 0,
    topP: 0.95,
    maxOutputTokens: 8192,
    enableThinking: true,
    thinkingBudget: 'high',
    contextOptimization: 'complete_history',
    contextWindow: 2000000,
  },
  // Configuration for summarizing text. Tuned for accuracy and conciseness.
  SUMMARIZATION: {
    model: 'grok-4-fast-reasoning',
    temperature: 0.3,
    topK: 20,
    topP: 0.8,
    maxOutputTokens: 4096,
    enableThinking: true,
    thinkingBudget: 'medium',
    contextWindow: 2000000,
  },
  // Defines parameters for features that leverage the large 2M token context window of Grok-4.
  MEGA_CONTEXT_FEATURES: {
    model: 'grok-4-fast-reasoning',
    temperature: 0.9,
    topK: 30,
    topP: 0.9,
    maxOutputTokens: 8192,
    enableThinking: true,
    thinkingBudget: 'maximum',
    contextWindow: 2000000,
    // Defines strategies for how the large context window should be used.
    contextStrategies: {
      completeSessionMemory: true,
      comprehensiveChoiceMapping: true,
      deepCharacterEvolution: true,
      totalNarrativeConsistency: true,
      masterPsychologicalAnalysis: true,
      crossSessionPersonalityTracking: true,
      thematicCoherenceEngine: true,
      narrativeForeshadowingSystem: true,
    }
  }
};

// Runtime validation to warn developers if essential API keys are missing.
if (!API_KEYS.xaiAPI) {
  console.warn(
    'Warning: VITE_XAI_API_KEY is not set in your .env file. Story generation will use Gemini fallback.'
  );
}
if (!API_KEYS.googleGenAI) {
  console.warn(
    'Warning: VITE_GEMINI_API_KEY is not set in your .env file. Fallback story generation may be limited.'
  );
}
if (!API_KEYS.googleImagen) {
  console.warn(
    'Warning: VITE_GEMINI_API_KEY not set. Image generation will use Unsplash fallback.'
  );
}

/**
 * @constant {object} REVOLUTIONARY_FEATURES
 * @description A set of feature flags that control the 8 advanced AI engines.
 * This allows for easy enabling or disabling of specific experimental features for testing,
 * performance tuning, or tiered access in a production environment. Each feature has an
 * `enabled` flag and other relevant configuration parameters.
 */
export const REVOLUTIONARY_FEATURES = {
  /** Engine 1: AI can retroactively alter past story segments. */
  TEMPORAL_REVISION: {
    enabled: true,
    description: 'AI can retroactively alter previous story segments based on current choices',
    maxRevisions: 3,
  },
  /** Engine 2: AI occasionally breaks the fourth wall. */
  META_CONSCIOUSNESS: {
    enabled: true,
    description: 'AI occasionally breaks fourth wall to address the player directly',
    triggerProbability: 0.15,
  },
  /** Engine 3: AI maintains multiple parallel story versions. */
  QUANTUM_NARRATIVES: {
    enabled: true,
    description: 'AI maintains 2-3 parallel story versions and can switch between them',
    maxThreads: 3,
  },
  /** Engine 4: AI learns from player choices to craft personalized horror. */
  ADAPTIVE_HORROR: {
    enabled: true,
    description: 'AI learns from player choices to craft personalized psychological horror',
    analysisDepth: 'deep',
  },
  /** Engine 5: Story choices cause visual glitches and UI distortions. */
  REALITY_CORRUPTION: {
    enabled: true,
    description: 'Story choices cause visual glitches and UI distortions',
    maxCorruption: 0.7,
  },
  /** Engine 6: AI narrator develops distinct personality traits during gameplay. */
  EMERGENT_AI: {
    enabled: true,
    description: 'AI narrator develops distinct personality traits during gameplay',
    personalityEvolution: true,
  },
  /** Engine 7: Cross-session memory persistence using localStorage. */
  NEURAL_ECHOES: {
    enabled: true,
    description: 'Cross-session memory persistence using localStorage with psychological profiles',
    maxEchoes: 50,
    encryptionEnabled: true,
  },
  /** Engine 8: Deep psychological analysis of player choice patterns. */
  SEMANTIC_ARCHAEOLOGY: {
    enabled: true,
    description: 'Deep psychological analysis of player choice patterns and meaning excavation',
    historyDepth: 20,
    analysisComplexity: 'advanced',
  },
  /** Engine 9: Evolutionary story genetics that adapt and mutate over time. */
  NARRATIVE_DNA: {
    enabled: true,
    description: 'Evolutionary story genetics that adapt and mutate over time based on engagement',
    maxMutations: 10,
    evolutionRate: 0.2,
    decayRate: 0.95,
  }
};
