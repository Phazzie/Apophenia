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
  canExecute(command: Command): boolean {
    return command.type === 'browserEffect';
  }

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

      default:
        return false;
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

      default:
        throw new Error(`Unknown effect type: ${effect.type}`);
    }
  }
}
