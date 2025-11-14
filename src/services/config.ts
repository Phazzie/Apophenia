// SECURITY NOTE: This file is deprecated in favor of secure backend API
// API keys are no longer exposed to the frontend
// See SECURE_DEPLOYMENT.md for the new secure architecture

// Environment configuration for Apophenia
// Conditional environment handling for Vite vs Jest
const isTestEnvironment = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

// Cache configuration with environment variable support
export const CACHE_CONFIG = {
  // Image cache TTL in milliseconds (default: 30 minutes)
  IMAGE_CACHE_TTL: isTestEnvironment 
    ? parseInt(process.env.VITE_IMAGE_CACHE_TTL || '1800000', 10)
    : parseInt(import.meta.env.VITE_IMAGE_CACHE_TTL || '1800000', 10),
  
  // Maximum number of cached images (default: 50)
  IMAGE_CACHE_MAX_SIZE: isTestEnvironment 
    ? parseInt(process.env.VITE_IMAGE_CACHE_MAX_SIZE || '50', 10)
    : parseInt(import.meta.env.VITE_IMAGE_CACHE_MAX_SIZE || '50', 10),
    
  // Enable cache telemetry tracking (default: true)
  ENABLE_CACHE_TELEMETRY: isTestEnvironment 
    ? (process.env.VITE_ENABLE_CACHE_TELEMETRY === 'true')
    : (import.meta.env.VITE_ENABLE_CACHE_TELEMETRY !== 'false'),
};

// AI Model Configuration - GROK-4 FAST REASONING ONLY (Grok-only deployment)
export const AI_MODELS = {
  // Primary text generation with Grok-4 Fast Reasoning - 2M token context with thinking
  PRIMARY_TEXT: 'grok-4-fast-reasoning', // Latest Grok model with 2M token context
  // Fallback removed - Grok-only deployment per INTEGRATION_PLAN.md
  
  // Image generation pipeline - Gemini 2.5 Flash Image primary, Grok fallback
  PRIMARY_IMAGE: 'gemini-2.5-flash-image', // Primary: Gemini 2.5 Flash (native image gen)
  SECONDARY_IMAGE_PROVIDER: 'grok-2-image-1212', // Secondary provider: XAI Grok-2-image
  TERTIARY_IMAGE_PROVIDER: 'unsplash', // Tertiary provider: Unsplash stock photos
  // Note: These are provider identifiers, not model names. Fallback logic is implemented in ImagePipeline.ts.
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
    // Utilize full 2M token context window
    contextWindow: 2000000, // 2 million tokens
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
  
  // Neural Echo Chambers - Cross-session memory persistence
  NEURAL_ECHOES: {
    enabled: true,
    description: 'Cross-session memory persistence using localStorage with psychological profiles',
    maxEchoes: 50,
    encryptionEnabled: true,
  },
  
  // Semantic Choice Archaeology - Deep psychological analysis of choices
  SEMANTIC_ARCHAEOLOGY: {
    enabled: true,
    description: 'Deep psychological analysis of player choice patterns and meaning excavation',
    historyDepth: 20,
    analysisComplexity: 'advanced',
  },
  
  // Adaptive Narrative DNA - Evolutionary story genetics
  NARRATIVE_DNA: {
    enabled: true,
    description: 'Evolutionary story genetics that adapt and mutate over time based on engagement',
    maxMutations: 10,
    evolutionRate: 0.2,
    decayRate: 0.95,
  }
};