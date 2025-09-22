// Mock configuration for Jest tests
export const API_KEYS = {
  googleGenAI: 'test-key',
  googleImagen: 'test-imagen-key',
};

export const getConfig = () => ({
  geminiApiKey: API_KEYS.googleGenAI,
  imageApiKey: API_KEYS.googleImagen,
  imagenKey: API_KEYS.googleImagen,
});

export const AI_MODELS = {
  PRIMARY_TEXT: 'gemini-2.5-flash-experimental',
  FALLBACK_TEXT: 'gemini-1.5-flash',
  PRIMARY_IMAGE: 'imagen-3.0-generate-001',
  FALLBACK_IMAGE: 'imagen-2.0-generate-001',
  CONCEPT_GENERATION: {
    model: 'gemini-2.5-flash-experimental',
    temperature: 1.2,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
    enableThinking: true,
    thinkingBudget: 'high',
  },
  STORY_PROGRESSION: {
    model: 'gemini-2.5-flash-experimental',
    temperature: 1.0,
    topK: 0,
    topP: 0.95,
    maxOutputTokens: 8192,
    enableThinking: true,
    thinkingBudget: 'high',
  },
  SUMMARIZATION: {
    model: 'gemini-1.5-flash',
    temperature: 0.3,
    topK: 20,
    topP: 0.8,
    maxOutputTokens: 2048,
    enableThinking: false,
  }
};

export const REVOLUTIONARY_FEATURES = {
  TEMPORAL_REVISION: {
    enabled: true,
    maxRevisions: 3,
    corruptionThreshold: 0.6,
  },
  META_CONSCIOUSNESS: {
    enabled: true,
    description: 'AI narrator becomes self-aware and comments on the story',
    metaEventProbability: 0.15,
    minIntervalBetweenEvents: 3,
  },
  QUANTUM_NARRATIVES: {
    enabled: true,
    description: 'Story choices retroactively change past events',
    maxQuantumDepth: 2,
  },
  ADAPTIVE_HORROR: {
    enabled: true,
    description: 'AI learns from player choices to craft personalized psychological horror',
    analysisDepth: 'deep',
  },
  REALITY_CORRUPTION: {
    enabled: true,
    description: 'Story choices cause visual glitches and UI distortions',
    maxCorruption: 0.7,
  },
  EMERGENT_AI: {
    enabled: true,
    description: 'AI narrator develops distinct personality traits during gameplay',
    personalityEvolution: true,
  }
};