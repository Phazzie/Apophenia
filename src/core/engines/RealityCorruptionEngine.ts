/**
 * REALITY CORRUPTION ENGINE
 *
 * Calculates and manages UI corruption effects based on game state.
 * Creates visual glitches, text distortions, and interface breakdown.
 */

import type { RealityCorruptionEngine as IRealityCorruptionEngine, EngineContext, EngineOutput } from '../types/seams';
import { BaseEngine } from './base/Engine';

export class RealityCorruptionEngine extends BaseEngine implements IRealityCorruptionEngine {
  readonly name = 'RealityCorruption';
  readonly description = 'Manages UI corruption and reality breakdown effects';
  readonly priority = 6; // Medium-high priority - affects presentation

  isActive(context: EngineContext): boolean {
    // Always active once corruption begins
    return context.worldState.corruptionLevel > 0 || context.worldState.horrorIntensity >= 3;
  }

  async process(context: EngineContext): Promise<EngineOutput> {
    const newCorruptionLevel = this.calculateCorruptionLevel(context);
    const corruptionEffects = this.generateCorruptionEffects(newCorruptionLevel);

    return {
      engineName: this.name,
      instructions: this.generateInstructions(context),
      effects: {
        corruptionChanges: newCorruptionLevel
      },
      metadata: {
        previousCorruption: context.worldState.corruptionLevel,
        newCorruption: newCorruptionLevel,
        effects: corruptionEffects
      }
    };
  }

  generateInstructions(context: EngineContext): string[] {
    const level = context.worldState.corruptionLevel;
    const instructions: string[] = [];

    if (level < 20) {
      instructions.push('Subtle hints that something is wrong with the reality');
    } else if (level < 40) {
      instructions.push(
        'Introduce minor glitches and inconsistencies in the narrative',
        'Text may occasionally appear corrupted or strange'
      );
    } else if (level < 60) {
      instructions.push(
        'Reality is clearly breaking down',
        'Create noticeable contradictions and impossibilities',
        'The interface itself becomes unreliable'
      );
    } else if (level < 80) {
      instructions.push(
        'Severe reality corruption - major impossibilities',
        'The narrative becomes increasingly fragmented',
        'Visual and textual glitches are frequent'
      );
    } else {
      instructions.push(
        'Total reality collapse imminent',
        'Narrative coherence is nearly gone',
        'The story acknowledges its own corruption',
        'Embrace complete chaos and paradox'
      );
    }

    return instructions;
  }

  calculateCorruptionLevel(context: EngineContext): number {
    const currentLevel = context.worldState.corruptionLevel;
    const horrorIntensity = context.worldState.horrorIntensity;
    const systemHealth = context.worldState.systemHealth;
    const choiceCount = this.getChoiceCount(context);

    // Base corruption increase
    let increase = 0;

    // Horror intensity drives corruption
    if (horrorIntensity >= 3) {
      increase += (horrorIntensity - 2) * 1.5;
    }

    // Low system health accelerates corruption
    if (systemHealth < 50) {
      increase += (50 - systemHealth) * 0.3;
    }

    if (systemHealth < 25) {
      increase += 5; // Critical system failure
    }

    // More choices = more corruption (player actions cause reality breakdown)
    if (choiceCount > 10) {
      increase += (choiceCount - 10) * 0.5;
    }

    // Check if player has high fear scores (Adaptive Horror engine effect)
    const fearProfile = context.playerProfile.fearProfile;
    const highFears = Object.values(fearProfile).filter(score => (score || 0) > 0.6).length;
    if (highFears >= 2) {
      increase += highFears * 2;
    }

    // Calculate new level (capped at 100)
    const newLevel = Math.min(100, currentLevel + increase);

    return Math.round(newLevel);
  }

  generateCorruptionEffects(level: number): string[] {
    const effects: string[] = [];

    if (level >= 10) {
      effects.push('subtle-color-shift');
    }

    if (level >= 20) {
      effects.push('text-flicker');
    }

    if (level >= 30) {
      effects.push('mild-rotation');
    }

    if (level >= 40) {
      effects.push('chromatic-aberration');
      effects.push('scan-lines');
    }

    if (level >= 50) {
      effects.push('text-scramble');
      effects.push('random-glitch');
    }

    if (level >= 60) {
      effects.push('severe-distortion');
      effects.push('inverted-colors');
    }

    if (level >= 70) {
      effects.push('reality-tear');
      effects.push('segment-duplication');
    }

    if (level >= 80) {
      effects.push('complete-breakdown');
      effects.push('impossible-geometry');
    }

    if (level >= 90) {
      effects.push('narrative-collapse');
      effects.push('void-emergence');
    }

    return effects;
  }
}
