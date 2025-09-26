// Mock configuration for Jest tests
export const API_KEYS = {
  googleGenAI: 'test-key',
  googleImagen: 'test-imagen-key',
  xaiAPI: 'test-xai-key',
};

export const getConfig = () => ({
  geminiApiKey: API_KEYS.googleGenAI,
  imageApiKey: API_KEYS.googleImagen,
  imagenKey: API_KEYS.googleImagen,
  xaiApiKey: API_KEYS.xaiAPI,
});

export const AI_MODELS = {
  PRIMARY_TEXT: 'gemini-2.5-flash-experimental',
  FALLBACK_TEXT: 'gemini-2.5-flash',
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
    model: 'gemini-2.5-flash',
    temperature: 0.3,
    topK: 20,
    topP: 0.8,
    maxOutputTokens: 2048,
    enableThinking: false,
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
  },

  // Neural Echo Chambers - Persistent memory across sessions
  NEURAL_ECHO_CHAMBERS: {
    enabled: true,
    description: 'Persistent memory across sessions that creates echoes of past decisions',
    maxEchoes: 10,
    echoTriggerProbability: 0.25,
  },

  // Breaking the Fifth Wall - Browser manipulation effects
  BREAKING_FIFTH_WALL: {
    enabled: true,
    description: 'Browser manipulation effects that break beyond the fourth wall',
    maxIntensity: 0.8,
    safeMode: true,
  },

  // Semantic Choice Archaeology - Deep psychological profiling
  SEMANTIC_CHOICE_ARCHAEOLOGY: {
    enabled: true,
    description: 'Deep psychological profiling that analyzes semantic meaning and subtext of choices',
    analysisDepth: 'comprehensive',
    profileUpdateFrequency: 'every_choice',
  },

  // Adaptive Narrative DNA - Evolving story genetics
  ADAPTIVE_NARRATIVE_DNA: {
    enabled: true,
    description: 'Evolving story genetics that adapt the narrative structure itself based on player behavior',
    mutationRate: 0.1,
    evolutionPressure: 'moderate',
    maxGenerations: 100,
  },
};