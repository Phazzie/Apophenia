/**
 * FEATURE FLAG MIDDLEWARE
 * Centralized system for managing feature-gated operations across AI engines
 * Eliminates duplicate feature flag checks and provides consistent behavior
 */

import { REVOLUTIONARY_FEATURES } from '../services/config';

/**
 * Type for feature flag keys from REVOLUTIONARY_FEATURES
 */
export type FeatureFlagKey = keyof typeof REVOLUTIONARY_FEATURES;

/**
 * Configuration options for feature-gated operations
 */
export interface FeatureGateOptions<T = any> {
  /**
   * The feature flag to check
   */
  feature: FeatureFlagKey;

  /**
   * Value to return when feature is disabled
   */
  fallback: T;

  /**
   * Custom message to log when feature is disabled (optional)
   */
  disabledMessage?: string;

  /**
   * Whether to log when feature is disabled (default: true)
   */
  silent?: boolean;
}

/**
 * Higher-order function that wraps a function with feature flag checking
 * Use this for standalone functions or when decorators aren't suitable
 *
 * @example
 * const myFeatureFunction = withFeatureGate(
 *   { feature: 'META_CONSCIOUSNESS', fallback: null },
 *   async (param1, param2) => {
 *     // Feature implementation
 *     return result;
 *   }
 * );
 */
export function withFeatureGate<TArgs extends any[], TReturn>(
  options: FeatureGateOptions<TReturn>,
  fn: (...args: TArgs) => TReturn
): (...args: TArgs) => TReturn {
  return function (...args: TArgs): TReturn {
    if (!REVOLUTIONARY_FEATURES[options.feature].enabled) {
      if (!options.silent) {
        const message = options.disabledMessage ||
          `Feature "${options.feature}" is disabled. Returning fallback value.`;
        console.log(`🚫 ${message}`);
      }
      return options.fallback;
    }

    return fn(...args);
  };
}

/**
 * Async version of withFeatureGate for async functions
 *
 * @example
 * const myAsyncFeature = withFeatureGateAsync(
 *   { feature: 'TEMPORAL_REVISION', fallback: [] },
 *   async (history, choice) => {
 *     // Async feature implementation
 *     return result;
 *   }
 * );
 */
export function withFeatureGateAsync<TArgs extends any[], TReturn>(
  options: FeatureGateOptions<TReturn>,
  fn: (...args: TArgs) => Promise<TReturn>
): (...args: TArgs) => Promise<TReturn> {
  return async function (...args: TArgs): Promise<TReturn> {
    if (!REVOLUTIONARY_FEATURES[options.feature].enabled) {
      if (!options.silent) {
        const message = options.disabledMessage ||
          `Feature "${options.feature}" is disabled. Returning fallback value.`;
        console.log(`🚫 ${message}`);
      }
      return options.fallback;
    }

    return fn(...args);
  };
}

/**
 * Method decorator for class methods that should be feature-gated
 * Only works with methods that return a value (not void)
 *
 * @example
 * class MyEngine {
 *   @FeatureGated({ feature: 'QUANTUM_NARRATIVES', fallback: null })
 *   async checkQuantumState() {
 *     // Feature implementation
 *   }
 * }
 */
export function FeatureGated<T = any>(options: FeatureGateOptions<T>) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      if (!REVOLUTIONARY_FEATURES[options.feature].enabled) {
        if (!options.silent) {
          const message = options.disabledMessage ||
            `Feature "${options.feature}" is disabled in ${target.constructor.name}.${propertyKey}. Returning fallback value.`;
          console.log(`🚫 ${message}`);
        }
        return options.fallback;
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Specialized decorator for async methods
 *
 * @example
 * class MyEngine {
 *   @AsyncFeatureGated({ feature: 'ADAPTIVE_HORROR', fallback: 'default' })
 *   async analyzePlayer() {
 *     // Async feature implementation
 *   }
 * }
 */
export function AsyncFeatureGated<T = any>(options: FeatureGateOptions<T>) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      if (!REVOLUTIONARY_FEATURES[options.feature].enabled) {
        if (!options.silent) {
          const message = options.disabledMessage ||
            `Feature "${options.feature}" is disabled in ${target.constructor.name}.${propertyKey}. Returning fallback value.`;
          console.log(`🚫 ${message}`);
        }
        return options.fallback;
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Utility function to check if a feature is enabled
 * Use this for inline checks when decorators/wrappers aren't suitable
 *
 * @example
 * if (isFeatureEnabled('META_CONSCIOUSNESS')) {
 *   // Feature code
 * }
 */
export function isFeatureEnabled(feature: FeatureFlagKey): boolean {
  return REVOLUTIONARY_FEATURES[feature].enabled;
}

/**
 * Utility function to get feature configuration
 * Useful for accessing feature-specific settings
 *
 * @example
 * const { maxThreads } = getFeatureConfig('QUANTUM_NARRATIVES');
 */
export function getFeatureConfig<K extends FeatureFlagKey>(
  feature: K
): typeof REVOLUTIONARY_FEATURES[K] {
  return REVOLUTIONARY_FEATURES[feature];
}

/**
 * Execute a callback only if feature is enabled
 * Useful for conditional code blocks
 *
 * @example
 * await executeIfEnabled('REALITY_CORRUPTION', async () => {
 *   // Feature-specific code
 * });
 */
export async function executeIfEnabled<T>(
  feature: FeatureFlagKey,
  callback: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  if (!REVOLUTIONARY_FEATURES[feature].enabled) {
    console.log(`🚫 Feature "${feature}" is disabled. Skipping execution.`);
    return fallback;
  }

  return callback();
}

/**
 * Sync version of executeIfEnabled
 */
export function executeIfEnabledSync<T>(
  feature: FeatureFlagKey,
  callback: () => T,
  fallback?: T
): T | undefined {
  if (!REVOLUTIONARY_FEATURES[feature].enabled) {
    console.log(`🚫 Feature "${feature}" is disabled. Skipping execution.`);
    return fallback;
  }

  return callback();
}
