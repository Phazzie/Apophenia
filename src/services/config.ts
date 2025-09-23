// SECURITY NOTE: This file is deprecated in favor of secure backend API
// API keys are no longer exposed to the frontend
// See SECURE_DEPLOYMENT.md for the new secure architecture

// Environment configuration for Apophenia
// API keys are loaded from environment variables for security

// Conditional environment handling for Vite vs Jest
const isTestEnvironment = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

export const API_KEYS = isTestEnvironment ? {
  // Jest test environment - use process.env
  googleGenAI: process.env.VITE_GEMINI_API_KEY || 'test-key',
  googleImagen: process.env.VITE_GEMINI_API_KEY || 'test-key', // Gemini also handles images
} : {
  // DEPRECATED: Frontend no longer needs API keys
  // All API calls now go through secure backend
  googleGenAI: '',
  googleImagen: '',
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
  // Primary text generation with advanced reasoning - UPGRADED TO 2.5 PRO
  PRIMARY_TEXT: 'gemini-2.5-pro', // Latest Pro model with 1M token context
  FALLBACK_TEXT: 'gemini-2.5-flash',
  
  // Image generation pipeline - UPGRADED TO FLASH IMAGE PREVIEW
  PRIMARY_IMAGE: 'gemini-2.5-flash-image-preview', // New image generation model
  FALLBACK_IMAGE: 'imagen-3.0-generate-001',
  
  // Configuration for different use cases with 1M token context optimization
  CONCEPT_GENERATION: {
    model: 'gemini-2.5-pro', // Pro model with massive context
    temperature: 1.2,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
    enableThinking: true,
    thinkingBudget: 'high',
  },
  STORY_PROGRESSION: {
    model: 'gemini-2.5-pro', // Pro model with full conversation history
    temperature: 1.0,
    topK: 0,
    topP: 0.95,
    maxOutputTokens: 8192,
    // Enable thinking mode for complex reasoning
    enableThinking: true,
    thinkingBudget: 'high', // Maximum reasoning power for story progression
    // NEW: Full conversation context utilization
    contextOptimization: 'full_history', // Use entire game history for context
  },
  SUMMARIZATION: {
    model: 'gemini-2.5-pro', // Pro model for complex summarization
    temperature: 0.3,
    topK: 20,
    topP: 0.8,
    maxOutputTokens: 4096, // Increased for detailed summaries
    enableThinking: true, // Enable reasoning for better summaries
    thinkingBudget: 'medium',
  },
  // NEW: Advanced features enabled by 1M token context
  MEGA_CONTEXT_FEATURES: {
    model: 'gemini-2.5-pro',
    temperature: 0.9,
    topK: 30,
    topP: 0.9,
    maxOutputTokens: 8192,
    enableThinking: true,
    thinkingBudget: 'maximum',
    // Utilize full 1M token context window
    contextWindow: 1000000, // 1 million tokens
    // Advanced context utilization strategies
    contextStrategies: {
      // Remember entire game session for consistency
      fullSessionMemory: true,
      // Track all player choices and their consequences
      choiceConsequenceMapping: true,
      // Maintain detailed character development arcs
      characterEvolutionTracking: true,
      // Cross-reference all story elements for consistency
      narrativeConsistencyCheck: true,
      // Advanced psychological profiling across entire session
      deepPsychologicalAnalysis: true,
    }
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
    'Warning: VITE_GEMINI_API_KEY not set. Image generation will use Unsplash fallback.'
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
