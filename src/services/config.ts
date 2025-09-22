// Environment configuration for Apophenia
// API keys are loaded from environment variables for security

// Conditional environment handling for Vite vs Jest
const isTestEnvironment = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

export const API_KEYS = isTestEnvironment ? {
  // Jest test environment - use process.env
  googleGenAI: process.env.VITE_GEMINI_API_KEY || 'test-key',
  googleImagen: process.env.VITE_GOOGLE_IMAGEN_KEY || 'test-imagen-key',
} : {
  // Vite browser environment - use import.meta.env
  googleGenAI: (import.meta as any).env?.VITE_GEMINI_API_KEY || '',
  googleImagen: (import.meta as any).env?.VITE_GOOGLE_IMAGEN_KEY || '',
};

// Configuration getter function
export const getConfig = () => {
  return {
    geminiApiKey: API_KEYS.googleGenAI,
    imageApiKey: API_KEYS.googleImagen,
    imagenKey: API_KEYS.googleImagen,
  };
};

// AI Model Configuration
export const AI_MODELS = {
  // Primary text generation with advanced reasoning
  PRIMARY_TEXT: 'gemini-2.5-flash-experimental', // Latest experimental Gemini model
  FALLBACK_TEXT: 'gemini-2.5-flash',
  
  // Image generation pipeline  
  PRIMARY_IMAGE: 'imagen-3.0-generate-001', // Google Imagen for image generation
  FALLBACK_IMAGE: 'imagen-2.0-generate-001',
  
  // Configuration for different use cases
  CONCEPT_GENERATION: {
    model: 'gemini-2.5-flash-experimental', // Latest experimental model
    temperature: 1.2,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
    enableThinking: true,
    thinkingBudget: 'high',
  },
  STORY_PROGRESSION: {
    model: 'gemini-2.5-flash-experimental', // Latest experimental model
    temperature: 1.0,
    topK: 0,
    topP: 0.95,
    maxOutputTokens: 8192,
    // Enable thinking mode for complex reasoning
    enableThinking: true,
    thinkingBudget: 'high', // Maximum reasoning power for story progression
  },
  SUMMARIZATION: {
    model: 'gemini-2.5-flash', // Stable Gemini 2.5 model for summarization
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

if (!API_KEYS.googleImagen) {
  console.warn(
    'Warning: Google Imagen API key not set. Image generation will use Unsplash fallback.'
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
  }
};
