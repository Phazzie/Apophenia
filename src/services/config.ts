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
  xaiAPI: process.env.VITE_XAI_API_KEY || 'test-key',
} : {
  // Browser environment - use import.meta.env
  googleGenAI: import.meta.env.VITE_GEMINI_API_KEY || '',
  googleImagen: import.meta.env.VITE_GEMINI_API_KEY || '',
  xaiAPI: import.meta.env.VITE_XAI_API_KEY || '',
};

// Configuration getter function
export const getConfig = () => {
  return {
    geminiApiKey: API_KEYS.googleGenAI,
    imageApiKey: API_KEYS.googleImagen,
    imagenKey: API_KEYS.googleImagen,
    xaiApiKey: API_KEYS.xaiAPI,
  };
};

// AI Model Configuration - UPGRADED TO GROK-4 FAST REASONING AS PRIMARY
export const AI_MODELS = {
  // Primary text generation with Grok-4 Fast Reasoning - 2M token context with thinking
  PRIMARY_TEXT: 'grok-4-fast-reasoning', // Latest Grok model with 2M token context
  FALLBACK_TEXT: 'gemini-2.5-pro', // Gemini Pro as reliable fallback
  SECONDARY_FALLBACK: 'gemini-2.5-flash', // Final fallback
  
  // Image generation pipeline - Keep Gemini for images as Grok doesn't do images yet
  PRIMARY_IMAGE: 'gemini-2.5-flash-image-preview', // New image generation model
  FALLBACK_IMAGE: 'imagen-3.0-generate-001',
  
  // Configuration for different use cases with 2M token context optimization
  CONCEPT_GENERATION: {
    model: 'grok-4-fast-reasoning', // Grok-4 with massive 2M token context
    temperature: 1.2,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
    enableThinking: true,
    thinkingBudget: 'high',
    contextWindow: 2000000, // 2 million tokens
  },
  STORY_PROGRESSION: {
    model: 'grok-4-fast-reasoning', // Grok-4 with full 2M token conversation history
    temperature: 1.0,
    topK: 0,
    topP: 0.95,
    maxOutputTokens: 8192,
    // Enable thinking mode for complex reasoning
    enableThinking: true,
    thinkingBudget: 'high', // Maximum reasoning power for story progression
    // NEW: Complete 2M token context utilization
    contextOptimization: 'complete_history', // Use entire game history + thinking
    contextWindow: 2000000, // 2 million tokens
  },
  SUMMARIZATION: {
    model: 'grok-4-fast-reasoning', // Grok-4 for complex summarization
    temperature: 0.3,
    topK: 20,
    topP: 0.8,
    maxOutputTokens: 4096, // Increased for detailed summaries
    enableThinking: true, // Enable reasoning for better summaries
    thinkingBudget: 'medium',
    contextWindow: 2000000, // Full context for comprehensive summaries
  },
  // NEW: Revolutionary features enabled by 2M token context
  MEGA_CONTEXT_FEATURES: {
    model: 'grok-4-fast-reasoning',
    temperature: 0.9,
    topK: 30,
    topP: 0.9,
    maxOutputTokens: 8192,
    enableThinking: true,
    thinkingBudget: 'maximum',
    // Utilize full 2M token context window - DOUBLED from Gemini
    contextWindow: 2000000, // 2 million tokens (vs 1M for Gemini)
    // Advanced context utilization strategies enhanced for 2M tokens
    contextStrategies: {
      // Remember COMPLETE game session for perfect consistency
      completeSessionMemory: true,
      // Track ALL player choices and their cascading consequences
      comprehensiveChoiceMapping: true,
      // Maintain detailed character development across entire narrative
      deepCharacterEvolution: true,
      // Cross-reference ALL story elements for perfect consistency
      totalNarrativeConsistency: true,
      // Advanced psychological profiling across ENTIRE session
      masterPsychologicalAnalysis: true,
      // NEW: Multi-session personality development
      crossSessionPersonalityTracking: true,
      // NEW: Deep thematic coherence across massive context
      thematicCoherenceEngine: true,
      // NEW: Foreshadowing and callback system
      narrativeForeshadowingSystem: true,
    }
  }
};

// Validation - warn if API keys are not set
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
