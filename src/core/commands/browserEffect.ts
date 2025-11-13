/**
 * BROWSER EFFECT EXECUTOR
 *
 * Executes browser manipulation effects (Fifth Wall).
 * Safely manipulates browser APIs for horror effects.
 */

import { BaseCommandExecutor } from './base/CommandExecutor';
import { Command, ExecutionResult, ValidationResult, BrowserEffect, BrowserEffectExecutor } from '../types/seams';

/**
 * Executor for browserEffect commands
 *
 * Manipulates browser features like title, tabs, history, and vibration.
 * All effects are safe and reversible.
 */
export class BrowserEffectCommandExecutor extends BaseCommandExecutor implements BrowserEffectExecutor {
  /**
   * Check if this executor can handle the given command
   *
   * @param command - The command to check
   * @returns true if this executor can handle the command
   */
  canExecute(command: Command): boolean {
    return command.type === 'browserEffect';
  }

  /**
   * Validate the browserEffect command before execution
   *
   * Checks for:
   * - Required fields (effect type)
   * - Valid effect type (changeTitle, openTab, manipulateHistory, vibrate)
   * - URL validation for openTab effects
   * - Browser API availability
   *
   * @param command - The command to validate
   * @returns Validation result with any errors
   */
  validate(command: Command): ValidationResult {
    if (command.type !== 'browserEffect') {
      return { valid: false, errors: ['Wrong command type'] };
    }

    if (!command.payload || typeof command.payload !== 'object') {
      return { valid: false, errors: ['Invalid payload'] };
    }

    const effect = command.payload as BrowserEffect;

    if (!effect.type) {
      return { valid: false, errors: ['Missing effect type'] };
    }

    const validTypes = ['changeTitle', 'openTab', 'manipulateHistory', 'vibrate'];
    if (!validTypes.includes(effect.type)) {
      return { valid: false, errors: [`Invalid effect type: ${effect.type}`] };
    }

    // Validate URL for openTab effect
    if (effect.type === 'openTab' && effect.value) {
      if (!this.isValidURL(effect.value)) {
        return { valid: false, errors: ['Invalid URL for openTab effect'] };
      }
    }

    // Check if the effect can be executed
    if (!this.canExecuteEffect(effect)) {
      return { valid: false, errors: [`Effect ${effect.type} cannot be executed in current environment`] };
    }

    return { valid: true, errors: [] };
  }

  protected async executeInternal(command: Command): Promise<ExecutionResult> {
    if (command.type !== 'browserEffect') {
      return { success: false, command, error: 'Invalid command type' };
    }

    try {
      const effect = command.payload as BrowserEffect;
      await this.executeEffect(effect);

      return {
        success: true,
        command,
        metadata: {
          effectType: effect.type,
          value: effect.value,
        },
      };
    } catch (error) {
      return {
        success: false,
        command,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check if a browser effect can be executed
   *
   * Verifies browser API availability and permissions.
   */
  canExecuteEffect(effect: BrowserEffect): boolean {
    if (typeof window === 'undefined') {
      return false; // Not in browser environment
    }

    switch (effect.type) {
      case 'changeTitle':
        return typeof document !== 'undefined';

      case 'openTab':
        return typeof window.open === 'function';

      case 'manipulateHistory':
        return typeof window.history !== 'undefined';

      case 'vibrate':
        return typeof navigator !== 'undefined' && 'vibrate' in navigator;

      default: {
        // Exhaustive type check - ensures all BrowserEffect types are handled
        const _exhaustive: never = effect.type;
        console.error(`Unhandled effect type: ${_exhaustive}`);
        return false;
      }
    }
  }

  /**
   * Execute a browser effect
   *
   * Safely manipulates browser APIs.
   */
  async executeEffect(effect: BrowserEffect): Promise<void> {
    switch (effect.type) {
      case 'changeTitle':
        if (effect.value && typeof document !== 'undefined') {
          document.title = effect.value;
        }
        break;

      case 'openTab':
        if (effect.value && typeof window !== 'undefined') {
          // Open in new tab with noopener for security
          window.open(effect.value, '_blank', 'noopener,noreferrer');
        }
        break;

      case 'manipulateHistory':
        if (typeof window !== 'undefined' && window.history) {
          // Push a state to history (can be used for "glitch" effects)
          window.history.pushState(
            { apophenia: true },
            effect.value || '',
            window.location.href
          );
        }
        break;

      case 'vibrate':
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          // Vibrate for 200ms (short pulse)
          navigator.vibrate(200);
        }
        break;

      default: {
        // Exhaustive type check - ensures all BrowserEffect types are handled
        const _exhaustive: never = effect.type;
        throw new Error(`Unknown effect type: ${_exhaustive}`);
      }
    }
  }

  /**
   * Validate URL format
   *
   * @param url - The URL to validate
   * @returns true if URL is valid
   */
  private isValidURL(url: string): boolean {
    try {
      const parsed = new URL(url);
      // Only allow http and https protocols for security
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
