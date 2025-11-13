/**
 * Config Provider Implementation
 *
 * Manages application configuration with runtime updates
 * Implements the ConfigProvider interface from seams.ts
 */

import { AppConfig, ConfigProvider as IConfigProvider } from '../core/types/seams';
import { DEFAULT_CONFIG } from './defaults';

/**
 * Configuration Provider
 *
 * Provides access to app configuration with the ability to
 * update settings at runtime and reset to defaults.
 */
export class ConfigProvider implements IConfigProvider {
  private config: AppConfig;

  constructor(initialConfig?: Partial<AppConfig>) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...initialConfig,
    };
  }

  /**
   * Get current configuration
   * Returns a deep copy to prevent external mutations
   */
  getConfig(): AppConfig {
    return {
      ai: { ...this.config.ai },
      features: { ...this.config.features },
      cache: { ...this.config.cache },
      game: { ...this.config.game },
    };
  }

  /**
   * Update configuration with partial updates
   * Deep merges the updates with current config
   */
  updateConfig(partial: Partial<AppConfig>): void {
    this.config = {
      ...this.config,
      ...partial,
      // Deep merge nested objects
      ai: {
        ...this.config.ai,
        ...(partial.ai || {}),
      },
      features: {
        ...this.config.features,
        ...(partial.features || {}),
      },
      cache: {
        ...this.config.cache,
        ...(partial.cache || {}),
      },
      game: {
        ...this.config.game,
        ...(partial.game || {}),
      },
    };
  }

  /**
   * Reset configuration to defaults
   */
  resetToDefaults(): void {
    this.config = { ...DEFAULT_CONFIG };
  }
}

/**
 * Default singleton instance
 */
export const configProvider = new ConfigProvider();
