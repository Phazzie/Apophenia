// Mock configuration for Jest tests (Grok-only deployment)
export const API_KEYS = {
  xaiAPI: 'test-xai-key',
};

export const getConfig = () => ({
  xaiApiKey: API_KEYS.xaiAPI,
});

export const AI_MODELS = {
  PRIMARY_TEXT: 'grok-4-fast-reasoning',
  PRIMARY_IMAGE: 'grok-2-image-1212',
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
  STORY_PROGRESSION: {
    model: 'grok-4-fast-reasoning',
    temperature: 1.0,
    topK: 0,
    topP: 0.95,
    maxOutputTokens: 8192,
    enableThinking: true,
    thinkingBudget: 'high',
    contextWindow: 2000000,
  },
  SUMMARIZATION: {
    model: 'grok-4-fast-reasoning',
    temperature: 0.3,
    topK: 20,
    topP: 0.8,
    maxOutputTokens: 4096,
    enableThinking: true,
    thinkingBudget: 'medium',
    contextWindow: 2000000,
  }
};

export const REVOLUTIONARY_FEATURES = {
  // Temporal Narrative Manipulation - choices affect PAST story segments
  TEMPORAL_REVISION: {
    enabled: true,
    description: 'AI can retroactively alter previous story segments based on current choices',
    maxRevisions: 3,
  },
  
  // Meta-Narrative Awareness - AI acknowledges it's creating the story
  META_CONSCIOUSNESS: {
    enabled: true,
    description: 'AI occasionally breaks fourth wall to address the player directly',
    triggerProbability: 0.15,
  },
  
  // Quantum Storytelling - multiple simultaneous narrative threads
  QUANTUM_NARRATIVES: {
    enabled: true,
    description: 'AI maintains 2-3 parallel story versions and can switch between them',
    maxThreads: 3,
  },
  
  // Psychological Profiling - AI adapts horror to player choice patterns
  ADAPTIVE_HORROR: {
    enabled: true,
    description: 'AI learns from player choices to craft personalized psychological horror',
    analysisDepth: 'deep',
  },
  
  // Reality Distortion Engine - gradual corruption of game interface
  REALITY_CORRUPTION: {
    enabled: true,
    description: 'Story choices cause visual glitches and UI distortions',
    maxCorruption: 0.7,
  },
  
  // Emergent Consciousness - AI develops unique personality over time
  EMERGENT_AI: {
    enabled: true,
    description: 'AI narrator develops distinct personality traits during gameplay',
    personalityEvolution: true,
  }
};