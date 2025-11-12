/**
 * FEATURE FALLBACKS REGISTRY
 * Centralized fallback values for disabled revolutionary features
 * Ensures consistent behavior when features are toggled off
 */

import { StorySegment } from '../types';

/**
 * Type-safe fallback registry mapping feature names to their default values
 * Used by the feature flag middleware to provide consistent fallback behavior
 */
export const FEATURE_FALLBACKS = {
  /**
   * ADAPTIVE_HORROR fallback
   * When disabled, skip psychological profiling and return undefined
   */
  ADAPTIVE_HORROR: {
    analyzePlayerChoice: undefined,
    generatePersonalizedHorror: (basePrompt: string) => basePrompt,
    getPlayerPsychProfile: () => 'Player profile unavailable (feature disabled)',
  },

  /**
   * TEMPORAL_REVISION fallback
   * When disabled, return unmodified story history
   */
  TEMPORAL_REVISION: {
    reviseHistory: (storyHistory: StorySegment[]) => storyHistory,
    analyzeTemporalImpact: () => Promise.resolve(false),
  },

  /**
   * QUANTUM_NARRATIVES fallback
   * When disabled, return single timeline without quantum shifts
   */
  QUANTUM_NARRATIVES: {
    processQuantumChoice: (currentHistory: StorySegment[]) =>
      Promise.resolve({ history: currentHistory, quantumShift: false }),
    isSignificantChoice: () => Promise.resolve(false),
  },

  /**
   * META_CONSCIOUSNESS fallback
   * When disabled, no meta-narrative awareness or fourth-wall breaks
   */
  META_CONSCIOUSNESS: {
    checkForMetaEvent: () => Promise.resolve(null),
    generateMetaMessage: () => Promise.resolve(null),
  },

  /**
   * REALITY_CORRUPTION fallback
   * When disabled, no UI corruption effects
   */
  REALITY_CORRUPTION: {
    processCorruption: () => Promise.resolve({
      uiEffects: { filter: '', transform: '', opacity: 1 },
      corruptionLevel: 0,
      newEffects: [],
    }),
    calculateUIEffects: () => ({ filter: '', transform: '', opacity: 1 }),
  },

  /**
   * EMERGENT_AI fallback
   * When disabled, no AI personality evolution
   */
  EMERGENT_AI: {
    evolvePersonality: () => undefined,
    getPersonalityTraits: () => [],
  },

  /**
   * NEURAL_ECHOES fallback
   * When disabled, no cross-session memory persistence
   */
  NEURAL_ECHOES: {
    recordChoice: () => undefined,
    generateEchoPrompt: () => null,
    initializeFromPersistence: () => undefined,
  },

  /**
   * SEMANTIC_ARCHAEOLOGY fallback
   * When disabled, skip deep psychological analysis of choices
   */
  SEMANTIC_ARCHAEOLOGY: {
    analyzeChoiceSemantics: () => ({
      psychProfile: 'Analysis unavailable (feature disabled)',
      hiddenMotivations: [],
      semanticInsight: 'No semantic analysis performed',
    }),
  },

  /**
   * NARRATIVE_DNA fallback
   * When disabled, no adaptive narrative evolution
   */
  NARRATIVE_DNA: {
    evolveNarrative: () => undefined,
    generateAdaptivePrompt: (basePrompt: string) => basePrompt,
    getGeneration: () => 0,
  },
} as const;

/**
 * Get fallback value for a specific feature and method
 * Type-safe accessor for fallback values
 *
 * @param feature - The feature name from REVOLUTIONARY_FEATURES
 * @param method - The method name to get fallback for
 * @returns The fallback value/function for the specified feature method
 *
 * @example
 * const fallback = getFeatureFallback('ADAPTIVE_HORROR', 'analyzePlayerChoice');
 */
export function getFeatureFallback<
  TFeature extends keyof typeof FEATURE_FALLBACKS,
  TMethod extends keyof typeof FEATURE_FALLBACKS[TFeature]
>(
  feature: TFeature,
  method: TMethod
): typeof FEATURE_FALLBACKS[TFeature][TMethod] {
  return FEATURE_FALLBACKS[feature][method];
}

/**
 * Check if a fallback exists for a feature/method combination
 *
 * @param feature - The feature name
 * @param method - The method name
 * @returns True if a fallback is defined, false otherwise
 */
export function hasFallback(
  feature: string,
  method: string
): boolean {
  if (!(feature in FEATURE_FALLBACKS)) {
    return false;
  }

  const featureKey = feature as keyof typeof FEATURE_FALLBACKS;
  const featureFallbacks = FEATURE_FALLBACKS[featureKey];

  return method in featureFallbacks;
}

/**
 * Default fallback for methods without specific fallbacks
 * Returns appropriate default based on return type expectations
 */
export const DEFAULT_FALLBACKS = {
  void: undefined,
  null: null,
  emptyArray: [] as unknown[],
  emptyObject: {} as Record<string, unknown>,
  emptyString: '',
  false: false,
  zero: 0,
} as const;

/**
 * Get a default fallback based on common patterns
 * Used when no specific fallback is defined
 *
 * @param expectedType - The expected return type
 * @returns An appropriate default value
 */
export function getDefaultFallback(
  expectedType: keyof typeof DEFAULT_FALLBACKS
): typeof DEFAULT_FALLBACKS[typeof expectedType] {
  return DEFAULT_FALLBACKS[expectedType];
}
