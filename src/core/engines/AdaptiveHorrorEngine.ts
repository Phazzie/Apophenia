/**
 * ADAPTIVE HORROR ENGINE
 *
 * Analyzes player psychological profile and generates personalized horror.
 * Learns from choices and response times to target specific fears.
 */

import type { AdaptiveHorrorEngine as IAdaptiveHorrorEngine, EngineContext, EngineOutput, PlayerProfile } from '../types/seams';
import { BaseEngine } from './base/Engine';

export class AdaptiveHorrorEngine extends BaseEngine implements IAdaptiveHorrorEngine {
  readonly name = 'AdaptiveHorror';
  readonly description = 'Generates personalized horror based on player psychological profile';
  readonly priority = 9; // Highest priority - core horror mechanism

  isActive(context: EngineContext): boolean {
    // Always active once we have some player data
    return (
      this.getChoiceCount(context) >= 2 &&
      context.worldState.horrorIntensity >= 2
    );
  }

  async process(context: EngineContext): Promise<EngineOutput> {
    const fears = this.analyzeFears(context.playerProfile);
    const horrorInstructions = this.generatePersonalizedHorror(fears);

    // Update fear profile based on current context
    const profileUpdates: Partial<PlayerProfile> = {
      fearProfile: this.updateFearProfile(context)
    };

    return {
      engineName: this.name,
      instructions: [
        ...this.generateInstructions(context),
        ...horrorInstructions
      ],
      effects: {
        profileUpdates
      },
      metadata: {
        dominantFears: Array.from(fears.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([fear]) => fear),
        fearScores: Object.fromEntries(fears)
      }
    };
  }

  generateInstructions(context: EngineContext): string[] {
    return [
      'Tailor horror elements to the player\'s specific psychological vulnerabilities',
      'Increase intensity of themes the player responds strongly to',
      'Avoid becoming predictable - vary approaches while targeting core fears'
    ];
  }

  analyzeFears(profile: PlayerProfile): Map<string, number> {
    const fears = new Map<string, number>();

    // Extract fear scores from profile
    const fearProfile = profile.fearProfile;

    fears.set('claustrophobia', fearProfile.claustrophobia || 0);
    fears.set('isolation', fearProfile.isolation || 0);
    fears.set('bodyHorror', fearProfile.bodyHorror || 0);
    fears.set('cosmicInsignificance', fearProfile.cosmicInsignificance || 0);
    fears.set('lossOfControl', fearProfile.lossOfControl || 0);
    fears.set('madness', fearProfile.madness || 0);

    // Analyze choice patterns to infer additional fears
    const patterns = profile.choicePatterns;

    // High avoidance suggests claustrophobia/isolation fears
    if (patterns.avoidance > 0.6) {
      fears.set('claustrophobia', Math.min(1, (fears.get('claustrophobia') || 0) + 0.2));
      fears.set('isolation', Math.min(1, (fears.get('isolation') || 0) + 0.2));
    }

    // Low curiosity suggests fear of unknown/cosmic insignificance
    if (patterns.curiosity < 0.4) {
      fears.set('cosmicInsignificance', Math.min(1, (fears.get('cosmicInsignificance') || 0) + 0.15));
    }

    // High aggression suggests loss of control fears
    if (patterns.aggression > 0.6) {
      fears.set('lossOfControl', Math.min(1, (fears.get('lossOfControl') || 0) + 0.2));
    }

    // Risk taking patterns affect madness fear
    if (patterns.riskTaking > 0.7) {
      fears.set('madness', Math.min(1, (fears.get('madness') || 0) + 0.15));
    } else if (patterns.riskTaking < 0.3) {
      fears.set('lossOfControl', Math.min(1, (fears.get('lossOfControl') || 0) + 0.15));
    }

    return fears;
  }

  generatePersonalizedHorror(fears: Map<string, number>): string[] {
    const instructions: string[] = [];

    // Sort fears by intensity
    const sortedFears = Array.from(fears.entries())
      .sort((a, b) => b[1] - a[1])
      .filter(([, score]) => score > 0.3); // Only use significant fears

    if (sortedFears.length === 0) {
      // Default horror if no clear profile
      return ['Create a sense of unease and wrongness'];
    }

    // Generate instructions for top 2-3 fears
    const topFears = sortedFears.slice(0, 3);

    for (const [fear, intensity] of topFears) {
      const fearInstructions = this.getFearInstructions(fear, intensity);
      instructions.push(...fearInstructions);
    }

    return instructions;
  }

  private getFearInstructions(fear: string, intensity: number): string[] {
    const instructions: string[] = [];

    switch (fear) {
      case 'claustrophobia':
        instructions.push('Emphasize confined spaces, walls closing in, inability to escape');
        if (intensity > 0.7) {
          instructions.push('Make the environment feel suffocatingly small and oppressive');
        }
        break;

      case 'isolation':
        instructions.push('Stress themes of loneliness, abandonment, being watched but alone');
        if (intensity > 0.7) {
          instructions.push('The protagonist is utterly alone, cut off from all connection');
        }
        break;

      case 'bodyHorror':
        instructions.push('Include physical transformation, wrongness of the body, flesh distortion');
        if (intensity > 0.7) {
          instructions.push('Graphic descriptions of body horror and physical corruption');
        }
        break;

      case 'cosmicInsignificance':
        instructions.push('Emphasize vast, incomprehensible forces, human meaninglessness');
        if (intensity > 0.7) {
          instructions.push('Reveal the utter insignificance of humanity in cosmic scope');
        }
        break;

      case 'lossOfControl':
        instructions.push('Create situations where the protagonist cannot control outcomes');
        if (intensity > 0.7) {
          instructions.push('Strip away all agency, make choices feel meaningless');
        }
        break;

      case 'madness':
        instructions.push('Question reality, sanity, and perception of truth');
        if (intensity > 0.7) {
          instructions.push('The protagonist\'s grip on sanity is completely failing');
        }
        break;
    }

    return instructions;
  }

  private updateFearProfile(context: EngineContext): PlayerProfile['fearProfile'] {
    const currentProfile = context.playerProfile.fearProfile;
    const updated = { ...currentProfile };

    // Increase fears based on horror intensity and choices
    const intensity = context.worldState.horrorIntensity;
    const increaseAmount = (intensity / 100) * 0.05; // Small incremental increases

    // Update based on current context
    if (context.currentChoice) {
      // Analyze choice for fear indicators
      const choiceText = context.currentChoice.text.toLowerCase();

      if (choiceText.includes('alone') || choiceText.includes('isolated')) {
        updated.isolation = Math.min(1, (updated.isolation || 0) + increaseAmount);
      }

      if (choiceText.includes('small') || choiceText.includes('confined') || choiceText.includes('trapped')) {
        updated.claustrophobia = Math.min(1, (updated.claustrophobia || 0) + increaseAmount);
      }

      if (choiceText.includes('body') || choiceText.includes('flesh') || choiceText.includes('transform')) {
        updated.bodyHorror = Math.min(1, (updated.bodyHorror || 0) + increaseAmount);
      }

      if (choiceText.includes('universe') || choiceText.includes('cosmic') || choiceText.includes('void')) {
        updated.cosmicInsignificance = Math.min(1, (updated.cosmicInsignificance || 0) + increaseAmount);
      }

      if (choiceText.includes('control') || choiceText.includes('helpless') || choiceText.includes('powerless')) {
        updated.lossOfControl = Math.min(1, (updated.lossOfControl || 0) + increaseAmount);
      }

      if (choiceText.includes('insane') || choiceText.includes('mad') || choiceText.includes('reality')) {
        updated.madness = Math.min(1, (updated.madness || 0) + increaseAmount);
      }
    }

    return updated;
  }
}
