/**
 * FIFTH WALL ENGINE
 *
 * Manipulates the browser itself to create horror outside the game space.
 * Changes page title, opens tabs, manipulates history, etc.
 * SAFELY - respects user boundaries and security.
 */

import type { FifthWallEngine as IFifthWallEngine, EngineContext, EngineOutput, BrowserEffect } from '../types/seams';
import { BaseEngine } from './base/Engine';

export class FifthWallEngine extends BaseEngine implements IFifthWallEngine {
  readonly name = 'FifthWall';
  readonly description = 'Safely manipulates browser to create horror outside game space';
  readonly priority = 1; // Lowest priority - cosmetic enhancement

  isActive(context: EngineContext): boolean {
    // Only activate when horror and corruption are very high
    return (
      this.isHorrorIntenseEnough(context, 7) &&
      this.isCorruptionHighEnough(context, 50) &&
      this.getChoiceCount(context) > 10
    );
  }

  async process(context: EngineContext): Promise<EngineOutput> {
    try {
      // Validate context first
      this.validateContext(context);

      if (!this.canManipulateBrowser(context)) {
        return {
          engineName: this.name,
          instructions: [],
          effects: {},
          metadata: { browserManipulationAllowed: false }
        };
      }

      const effect = this.generateBrowserEffect(context);

      return {
        engineName: this.name,
        instructions: this.generateInstructions(context),
        effects: {},
        metadata: {
          browserManipulationAllowed: true,
          effect
        }
      };
    } catch (error) {
      console.error(`[${this.name}] Processing failed:`, error);

      // Return safe fallback instead of crashing
      return {
        engineName: this.name,
        instructions: [],
        effects: {},
        metadata: {
          error: true,
          errorMessage: error instanceof Error ? error.message : String(error),
          timestamp: Date.now(),
        },
      };
    }
  }

  generateInstructions(context: EngineContext): string[] {
    const instructions: string[] = [];

    if (context.worldState.horrorIntensity >= 7) {
      instructions.push('The horror is escaping the boundaries of the game');
    }

    if (context.worldState.corruptionLevel >= 60) {
      instructions.push('Reality corruption extends beyond the narrative space');
    }

    if (context.worldState.corruptionLevel >= 80) {
      instructions.push('The game acknowledges that it is affecting the player\'s browser');
      instructions.push('Break containment - reference the page title, tabs, or browser itself');
    }

    return instructions;
  }

  canManipulateBrowser(context: EngineContext): boolean {
    // Check if user has consented to browser manipulation
    // This should be stored in WorldState or a user preferences object
    const userConsent = this.hasUserConsent(context);

    // Only allow browser manipulation when:
    // 1. User has given consent (or hasn't explicitly declined)
    // 2. Horror and corruption are sufficiently high
    return (
      userConsent &&
      context.worldState.horrorIntensity >= 7 &&
      context.worldState.corruptionLevel >= 50
    );
  }

  /**
   * Check if user has consented to browser manipulation effects
   * In production, this should check a user preferences store
   * For now, we assume consent unless explicitly disabled
   */
  private hasUserConsent(context: EngineContext): boolean {
    // Check for explicit consent flag in WorldState
    const worldState = context.worldState as typeof context.worldState & {
      browserEffectsConsent?: boolean;
    };

    // If consent is explicitly set, respect it
    if (worldState.browserEffectsConsent !== undefined) {
      return worldState.browserEffectsConsent;
    }

    // Default: assume consent for horror game players
    // In production, this should be an opt-in during game start
    return true;
  }

  generateBrowserEffect(context: EngineContext): BrowserEffect {
    const corruption = context.worldState.corruptionLevel;
    const horror = context.worldState.horrorIntensity;

    // Select effect type based on severity
    const effects: BrowserEffect[] = [];

    // Title changes - least invasive
    if (corruption >= 50) {
      effects.push(
        { type: 'changeTitle', value: 'Help me' },
        { type: 'changeTitle', value: 'I can see you' },
        { type: 'changeTitle', value: 'It knows' },
        { type: 'changeTitle', value: 'There is no escape' },
        { type: 'changeTitle', value: 'You should not have come here' }
      );
    }

    // More severe effects
    if (corruption >= 70) {
      effects.push(
        { type: 'changeTitle', value: 'ERROR: Reality not found' },
        { type: 'changeTitle', value: '[CORRUPTED]' },
        { type: 'changeTitle', value: '01011001 01101111 01110101' } // "You" in binary
      );
    }

    // Vibration (if supported) - physical effect
    if (corruption >= 80 && horror >= 9) {
      effects.push({ type: 'vibrate' });
    }

    // History manipulation - most invasive but safe
    if (corruption >= 85) {
      effects.push({ type: 'manipulateHistory' });
    }

    // Tab opening - only at extreme corruption
    // Note: Modern browsers may block this due to popup blockers
    if (corruption >= 90 && horror >= 9) {
      effects.push(
        { type: 'openTab', value: 'about:blank' } // Safe, just blank page
      );
    }

    // Return a random effect from available options
    if (effects.length === 0) {
      return { type: 'changeTitle', value: 'Apophenia' }; // Default
    }

    return effects[Math.floor(Math.random() * effects.length)];
  }

  /**
   * Get a title message based on context
   */
  private getTitleMessage(context: EngineContext): string {
    const messages = [
      'Help',
      'I see you',
      'It knows',
      'Escape is impossible',
      'You invited this',
      '[CORRUPTED]',
      'Not a game',
      'Real consequences',
      'You cannot close this',
      'It followed you here',
      'Your choices matter',
      'This is permanent',
      'No undo',
      'ERROR',
      'Warning: Reality unstable'
    ];

    // Select based on horror intensity
    const intensity = context.worldState.horrorIntensity;
    if (intensity >= 9) {
      // Most severe messages
      return messages[Math.floor(Math.random() * messages.length)];
    } else if (intensity >= 8) {
      // Medium severity
      const mediumMessages = messages.slice(0, 10);
      return mediumMessages[Math.floor(Math.random() * mediumMessages.length)];
    } else {
      // Lower severity
      const lowerMessages = messages.slice(0, 5);
      return lowerMessages[Math.floor(Math.random() * lowerMessages.length)];
    }
  }
}
