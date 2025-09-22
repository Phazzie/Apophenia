// Environment configuration for Apophenia
// API keys are loaded from environment variables for security

// Simple environment variable access that works in both Vite and Jest
const isTestEnvironment = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

export const API_KEYS = {
  googleGenAI: isTestEnvironment ? 
    (process.env.VITE_GEMINI_API_KEY || '') : 
    (import.meta.env?.VITE_GEMINI_API_KEY || ''),
  googleNanoBanana: isTestEnvironment ? 
    (process.env.VITE_GOOGLE_NANO_BANANA_KEY || '') : 
    (import.meta.env?.VITE_GOOGLE_NANO_BANANA_KEY || ''),
  googleImagen: isTestEnvironment ? 
    (process.env.VITE_GOOGLE_IMAGEN_KEY || '') : 
    (import.meta.env?.VITE_GOOGLE_IMAGEN_KEY || ''),
};

// Configuration getter function
export const getConfig = () => {
  return {
    geminiApiKey: API_KEYS.googleGenAI,
    imageApiKey: API_KEYS.googleImagen || API_KEYS.googleNanoBanana,
    nanoBananaKey: API_KEYS.googleNanoBanana,
    imagenKey: API_KEYS.googleImagen,
  };
};

// AI Model Configuration
export const AI_MODELS = {
  // Primary text generation with advanced reasoning
  PRIMARY_TEXT: 'gemini-2.0-flash-exp', // Nano Banana is actually Gemini 2.0 Flash Experimental
  FALLBACK_TEXT: 'gemini-1.5-flash',
  
  // Image generation pipeline  
  PRIMARY_IMAGE: 'gemini-2.0-flash-exp', // Nano Banana = Gemini 2.0 Flash Experimental
  FALLBACK_IMAGE: 'imagen-3.0-generate-001',
  
  // Configuration for different use cases
  CONCEPT_GENERATION: {
    model: 'gemini-2.0-flash-exp', // Nano Banana
    temperature: 1.2,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
    enableThinking: true,
    thinkingBudget: 'high',
  },
  STORY_PROGRESSION: {
    model: 'gemini-2.0-flash-exp', // Nano Banana
    temperature: 1.0,
    topK: 0,
    topP: 0.95,
    maxOutputTokens: 8192,
    // Enable thinking mode for complex reasoning
    enableThinking: true,
    thinkingBudget: 'high', // Maximum reasoning power for story progression
  },
  SUMMARIZATION: {
    model: 'gemini-1.5-flash', // Fallback for summarization
    temperature: 0.3,
    topK: 20,
    topP: 0.8,
    maxOutputTokens: 2048,
    enableThinking: false,
  }
};

// Validation - warn if API keys are not set
if (!API_KEYS.googleGenAI) {
  console.warn(
    'Warning: VITE_GEMINI_API_KEY is not set in your .env file. Story generation will use fallbacks.'
  );
}

if (!API_KEYS.googleNanoBanana && !API_KEYS.googleImagen) {
  console.warn(
    'Warning: Google Nano Banana or Imagen API keys not set. Image generation will use Unsplash fallback.'
  );
}

// Revolutionary AI Capabilities for Cosmic Horror
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
  
  // Neural Echo Chambers - persistent memory fragments across playthroughs
  NEURAL_ECHO_CHAMBERS: {
    enabled: true,
    description: 'AI creates persistent memory fragments that haunt players across multiple playthroughs',
    maxEchoes: 20,
    echoIntensity: 0.3,
    bleedProbability: 0.15,
  },
  
  // Semantic Choice Archaeology - deep psychological profiling through linguistics
  SEMANTIC_CHOICE_ARCHAEOLOGY: {
    enabled: true,
    description: 'Advanced NLP analysis builds deep psychological profiles through choice linguistics',
    analysisDepth: 'comprehensive',
    profileComplexity: 'deep',
    targetingPrecision: 'high',
  },
  
  // Breaking the Fifth Wall - browser environment manipulation
  FIFTH_WALL_BREACH: {
    enabled: true,
    description: 'AI manipulates browser environment to create horror outside game boundaries',
    maxBreachIntensity: 0.8,
    browserManipulation: true,
    phantomInteractions: true,
  },
  
  // Adaptive Narrative DNA - evolving story genetics
  ADAPTIVE_NARRATIVE_DNA: {
    enabled: true,
    description: 'Creates evolving narrative genetics unique to each player',
    maxGeneMarkers: 50,
    mutationRate: 0.2,
    expressionComplexity: 'high',
  }
};
