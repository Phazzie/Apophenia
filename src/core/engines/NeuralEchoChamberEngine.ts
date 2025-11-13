/**
 * NEURAL ECHO CHAMBER ENGINE
 *
 * Manages cross-session memory persistence.
 * The game "remembers" players across sessions, creating continuity of horror.
 */

import type { NeuralEchoChamberEngine as INeuralEchoChamberEngine, EngineContext, EngineOutput, PlayerProfile } from '../types/seams';
import { BaseEngine } from './base/Engine';

const ECHO_STORAGE_KEY = 'apophenia_neural_echo';

export class NeuralEchoChamberEngine extends BaseEngine implements INeuralEchoChamberEngine {
  readonly name = 'NeuralEchoChamber';
  readonly description = 'Manages cross-session memory and psychological persistence';
  readonly priority = 4; // Medium priority - enhances long-term engagement

  private memoryLoaded = false;

  isActive(context: EngineContext): boolean {
    // Active on first few choices (to load memories) or when horror is high
    return (
      this.getChoiceCount(context) <= 3 ||
      (this.isHorrorIntenseEnough(context, 5) && this.getChoiceCount(context) % 5 === 0)
    );
  }

  async process(context: EngineContext): Promise<EngineOutput> {
    // On early choices, try to load previous session memories
    if (!this.memoryLoaded && this.getChoiceCount(context) <= 2) {
      const previousProfile = this.loadCrossSessionMemory();

      if (previousProfile) {
        this.memoryLoaded = true;
        const echoContent = this.generateEchoContent(previousProfile);

        return {
          engineName: this.name,
          instructions: [
            ...this.generateInstructions(context),
            ...echoContent
          ],
          effects: {
            profileUpdates: {
              // Merge previous fear profile with current
              fearProfile: this.mergeFearProfiles(
                previousProfile.fearProfile,
                context.playerProfile.fearProfile
              )
            }
          },
          metadata: {
            memoryLoaded: true,
            previousSessionData: this.summarizeProfile(previousProfile)
          }
        };
      }
    }

    // On later choices, save current profile for next session
    if (this.getChoiceCount(context) > 10 && this.getChoiceCount(context) % 5 === 0) {
      this.saveCrossSessionMemory(context.playerProfile);

      return {
        engineName: this.name,
        instructions: this.generateInstructions(context),
        effects: {},
        metadata: {
          memorySaved: true
        }
      };
    }

    return {
      engineName: this.name,
      instructions: [],
      effects: {},
      metadata: {}
    };
  }

  generateInstructions(context: EngineContext): string[] {
    const instructions: string[] = [];

    if (!this.memoryLoaded && this.getChoiceCount(context) <= 2) {
      instructions.push(
        'Hint at memories or experiences from beyond this session',
        'Create a sense of déjà vu or persistent dread'
      );
    }

    if (this.getChoiceCount(context) > 10) {
      instructions.push(
        'Reference patterns from earlier in the session',
        'Build long-term psychological continuity'
      );
    }

    return instructions;
  }

  loadCrossSessionMemory(): PlayerProfile | null {
    try {
      const stored = localStorage.getItem(ECHO_STORAGE_KEY);
      if (!stored) {
        return null;
      }

      // Decrypt (simple base64 for now, could be more sophisticated)
      const decrypted = atob(stored);
      const profile = JSON.parse(decrypted) as PlayerProfile;

      return profile;
    } catch (error) {
      console.warn('Failed to load cross-session memory:', error);
      return null;
    }
  }

  saveCrossSessionMemory(profile: PlayerProfile): void {
    try {
      // Encrypt (simple base64 for now)
      const serialized = JSON.stringify(profile);
      const encrypted = btoa(serialized);

      localStorage.setItem(ECHO_STORAGE_KEY, encrypted);
    } catch (error) {
      // Handle QuotaExceededError specifically
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded. Attempting to clear old data and retry...');
        this.handleQuotaExceeded(profile);
      } else {
        console.warn('Failed to save cross-session memory:', error);
      }
    }
  }

  /**
   * Handle localStorage quota exceeded by clearing old data and retrying
   */
  private handleQuotaExceeded(profile: PlayerProfile): void {
    try {
      // Try to clear the old echo data first
      localStorage.removeItem(ECHO_STORAGE_KEY);

      // Attempt to save again with just essential data
      const minimalProfile: Partial<PlayerProfile> = {
        fearProfile: profile.fearProfile,
        choicePatterns: profile.choicePatterns,
        engagementMetrics: {
          totalChoices: profile.engagementMetrics.totalChoices,
          averageResponseTime: 0, // Omit to save space
          sessionDuration: 0 // Omit to save space
        }
      };

      const serialized = JSON.stringify(minimalProfile);
      const encrypted = btoa(serialized);
      localStorage.setItem(ECHO_STORAGE_KEY, encrypted);

      console.info('Successfully saved minimal cross-session memory after quota exceeded');
    } catch (retryError) {
      console.error('Failed to save even minimal cross-session memory:', retryError);
      // Silently fail - cross-session memory is not critical
    }
  }

  generateEchoContent(memories: PlayerProfile): string[] {
    const instructions: string[] = [];

    // Analyze what we know from previous sessions
    const fearProfile = memories.fearProfile;
    const dominantFears = Object.entries(fearProfile)
      .filter(([, score]) => (score || 0) > 0.5)
      .map(([fear]) => fear);

    if (dominantFears.length > 0) {
      instructions.push(
        'Reference fears or anxieties that persist from previous encounters',
        `The player has shown vulnerability to: ${dominantFears.join(', ')}`
      );
    }

    const choicePatterns = memories.choicePatterns;

    if (choicePatterns.avoidance > 0.6) {
      instructions.push('The player tends to avoid confrontation - use this');
    }

    if (choicePatterns.curiosity > 0.6) {
      instructions.push('The player is curious - lure them deeper');
    }

    if (choicePatterns.aggression > 0.6) {
      instructions.push('The player is aggressive - turn their violence against them');
    }

    if (choicePatterns.riskTaking > 0.6) {
      instructions.push('The player takes risks - make them regret their boldness');
    }

    // Reference previous sessions directly
    if (memories.engagementMetrics.totalChoices > 20) {
      instructions.push(
        'Acknowledge that this is not the first time - "You\'ve been here before"',
        'Create continuity: "You thought you could escape by stopping, but here you are again"'
      );
    }

    return instructions;
  }

  private mergeFearProfiles(
    previous: PlayerProfile['fearProfile'],
    current: PlayerProfile['fearProfile']
  ): PlayerProfile['fearProfile'] {
    return {
      claustrophobia: Math.max(previous.claustrophobia || 0, current.claustrophobia || 0),
      isolation: Math.max(previous.isolation || 0, current.isolation || 0),
      bodyHorror: Math.max(previous.bodyHorror || 0, current.bodyHorror || 0),
      cosmicInsignificance: Math.max(previous.cosmicInsignificance || 0, current.cosmicInsignificance || 0),
      lossOfControl: Math.max(previous.lossOfControl || 0, current.lossOfControl || 0),
      madness: Math.max(previous.madness || 0, current.madness || 0)
    };
  }

  private summarizeProfile(profile: PlayerProfile): Record<string, unknown> {
    return {
      totalPreviousChoices: profile.engagementMetrics.totalChoices,
      dominantFears: Object.entries(profile.fearProfile)
        .filter(([, score]) => (score || 0) > 0.5)
        .map(([fear]) => fear),
      patternSummary: {
        riskTaker: profile.choicePatterns.riskTaking > 0.6,
        avoider: profile.choicePatterns.avoidance > 0.6,
        aggressive: profile.choicePatterns.aggression > 0.6,
        curious: profile.choicePatterns.curiosity > 0.6
      }
    };
  }
}
