/**
 * Flow Constants
 *
 * Centralized constants for flow orchestration.
 * These values control flow behavior, thresholds, and effects.
 */

/**
 * Descent Flow Constants
 */
export const DESCENT_CONSTANTS = {
  // Descent level calculation weights
  HORROR_WEIGHT: 0.6, // 60% from horror intensity (0-10 scale)
  CORRUPTION_WEIGHT: 0.4, // 40% from corruption level (0-100 scale)

  // Transition thresholds
  UNRAVELING_THRESHOLD: 70, // Start unraveling when descent level exceeds 70%

  // History context
  RECENT_HISTORY_COUNT: 10, // Number of recent story segments to include in context
} as const;

/**
 * Unraveling Flow Constants
 */
export const UNRAVELING_CONSTANTS = {
  // Unraveling level calculation weights
  HORROR_FACTOR_WEIGHT: 0.4, // 40% from horror intensity
  HEALTH_FACTOR_WEIGHT: 0.3, // 30% from system health degradation
  CORRUPTION_FACTOR_WEIGHT: 0.3, // 30% from corruption level

  // Transition thresholds
  COLLAPSE_THRESHOLD: 90, // Complete collapse when unraveling exceeds 90%

  // Effect amplification
  EFFECT_AMPLIFICATION_MULTIPLIER: 1.5, // Amplify effects by 1.5x during unraveling

  // System degradation
  SYSTEM_HEALTH_DECAY: 5, // System health decreases by 5 per choice during unraveling

  // Browser effects thresholds
  TITLE_CHANGE_THRESHOLD: 75, // Change page title when unraveling > 75%
  HISTORY_MANIPULATION_THRESHOLD: 85, // Manipulate history when unraveling > 85%
  VIBRATION_THRESHOLD: 95, // Trigger vibration when unraveling > 95%

  // History context
  RECENT_HISTORY_COUNT: 10, // Number of recent story segments to include in context
} as const;

/**
 * Flow Initialization Constants
 */
export const FLOW_INIT_CONSTANTS = {
  // Initial horror intensity boost when entering unraveling
  UNRAVELING_HORROR_BOOST: 2,

  // Initial system health penalty when entering unraveling
  UNRAVELING_HEALTH_PENALTY: 30,
} as const;

/**
 * Player profile defaults (when no profile exists)
 */
export const PLAYER_PROFILE_DEFAULTS = {
  choicePatterns: {
    riskTaking: 0.5,
    curiosity: 0.5,
    aggression: 0.3,
    avoidance: 0.4,
  },
  engagementMetrics: {
    totalChoices: 0,
    averageResponseTime: 0,
    sessionDuration: 0,
  },
} as const;
