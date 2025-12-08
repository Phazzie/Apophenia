/**
 * ADAPTIVE NARRATIVE DNA ENGINE
 *
 * Manages story evolution through genetic-style mutations and crossover.
 * The narrative "genome" mutates over time, creating unique story variants.
 */

import type { AdaptiveNarrativeDNAEngine as IAdaptiveNarrativeDNAEngine, EngineContext, EngineOutput, NarrativeGenome } from '../types/seams';
import { BaseEngine } from './base/Engine';

export class AdaptiveNarrativeDNAEngine extends BaseEngine implements IAdaptiveNarrativeDNAEngine {
  readonly name = 'AdaptiveNarrativeDNA';
  readonly description = 'Evolves story through genetic-style mutations';
  readonly priority = 2; // Low-medium priority - long-term evolution

  readonly genome: NarrativeGenome; // Immutable - only for interface compliance

  constructor(initialGenome?: NarrativeGenome) {
    super();
    this.genome = initialGenome || this.createInitialGenome();
  }

  isActive(context: EngineContext): boolean {
    // Activate periodically to introduce mutations
    return this.getChoiceCount(context) % 3 === 0 && this.getChoiceCount(context) > 0;
  }

  async process(context: EngineContext): Promise<EngineOutput> {
    try {
      // Validate context first
      this.validateContext(context);

      // Get current genome from context (stateless approach)
      const currentGenome = this.getCurrentGenome(context);

      // Mutate genome based on context (pure function - doesn't mutate state)
      const mutatedGenome = this.mutateGenome(currentGenome, context);

      return {
        engineName: this.name,
        instructions: this.generateInstructionsForGenome(mutatedGenome, context),
        effects: {},
        metadata: {
          genome: mutatedGenome, // Store for next execution
          mutationRate: this.calculateMutationRate(context)
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

  /**
   * Get current genome from context (stateless)
   */
  private getCurrentGenome(context: EngineContext): NarrativeGenome {
    // Try to get from previous engine output metadata
    const previousOutput = context.previousOutput;
    if (previousOutput?.metadata?.genome) {
      return previousOutput.metadata.genome as NarrativeGenome;
    }

    // Fallback to initial genome
    return this.genome;
  }

  /**
   * Pure function that mutates genome without side effects
   */
  private mutateGenome(genome: NarrativeGenome, context: EngineContext): NarrativeGenome {
    const mutationRate = this.calculateMutationRate(context);

    const newGenome: NarrativeGenome = {
      themes: [...genome.themes],
      mutations: genome.mutations,
      generation: genome.generation
    };

    // Mutate themes based on mutation rate
    if (Math.random() < mutationRate) {
      newGenome.themes = this.mutateThemes(newGenome.themes, context);
      newGenome.mutations++;
    }

    // Every 5 choices, increment generation
    if (this.getChoiceCount(context) % 5 === 0) {
      newGenome.generation++;
    }

    return newGenome;
  }

  /**
   * Generate instructions based on a specific genome
   */
  private generateInstructionsForGenome(genome: NarrativeGenome, context: EngineContext): string[] {
    const instructions: string[] = [
      `Emphasize these evolving narrative themes: ${genome.themes.join(', ')}`
    ];

    if (genome.mutations > 5) {
      instructions.push(
        'The story has mutated significantly from its origin',
        'Introduce elements that feel alien to the original premise'
      );
    }

    if (genome.mutations > 10) {
      instructions.push(
        'The narrative DNA is barely recognizable',
        'Embrace the strange evolution - the story has become something new'
      );
    }

    if (genome.generation > 3) {
      instructions.push(
        `This is generation ${genome.generation} of the narrative`,
        'Each generation becomes more refined and targeted'
      );
    }

    return instructions;
  }

  generateInstructions(context: EngineContext): string[] {
    // Get current genome from context (stateless)
    const currentGenome = this.getCurrentGenome(context);
    return this.generateInstructionsForGenome(currentGenome, context);
  }

  mutate(context: EngineContext): NarrativeGenome {
    // Delegate to stateless implementation
    const currentGenome = this.getCurrentGenome(context);
    return this.mutateGenome(currentGenome, context);
  }

  crossover(genome1: NarrativeGenome, genome2: NarrativeGenome): NarrativeGenome {
    // Take half themes from each genome
    const midpoint = Math.floor(genome1.themes.length / 2);

    const newThemes = [
      ...genome1.themes.slice(0, midpoint),
      ...genome2.themes.slice(midpoint)
    ];

    // Remove duplicates
    const uniqueThemes = Array.from(new Set(newThemes));

    return {
      themes: uniqueThemes,
      mutations: genome1.mutations + genome2.mutations,
      generation: Math.max(genome1.generation, genome2.generation) + 1
    };
  }

  private createInitialGenome(): NarrativeGenome {
    return {
      themes: [
        'isolation',
        'decay',
        'mystery',
        'transformation'
      ],
      mutations: 0,
      generation: 1
    };
  }

  private calculateMutationRate(context: EngineContext): number {
    let rate = 0.2; // Base 20% mutation chance

    // Higher horror intensity increases mutation rate
    rate += context.worldState.horrorIntensity * 0.05;

    // Higher corruption increases mutation rate
    rate += (context.worldState.corruptionLevel / 100) * 0.3;

    // Cap at 80%
    return Math.min(0.8, rate);
  }

  private mutateThemes(themes: string[], context: EngineContext): string[] {
    const allPossibleThemes = [
      'isolation',
      'decay',
      'mystery',
      'transformation',
      'paranoia',
      'cosmic horror',
      'body horror',
      'loss of identity',
      'time distortion',
      'reality breakdown',
      'forbidden knowledge',
      'madness',
      'possession',
      'entropy',
      'void',
      'emergence',
      'convergence',
      'dissolution',
      'revelation',
      'corruption',
      'infection',
      'manifestation',
      'aberration',
      'singularity'
    ];

    const mutatedThemes = [...themes];

    // Mutation types
    const mutationType = Math.random();

    if (mutationType < 0.4) {
      // Addition: Add a new theme
      const availableThemes = allPossibleThemes.filter(t => !mutatedThemes.includes(t));
      if (availableThemes.length > 0) {
        const newTheme = this.selectThemeBasedOnContext(availableThemes, context);
        mutatedThemes.push(newTheme);
      }
    } else if (mutationType < 0.7) {
      // Replacement: Replace a random theme
      if (mutatedThemes.length > 0) {
        const indexToReplace = Math.floor(Math.random() * mutatedThemes.length);
        const availableThemes = allPossibleThemes.filter(t => !mutatedThemes.includes(t));
        if (availableThemes.length > 0) {
          const newTheme = this.selectThemeBasedOnContext(availableThemes, context);
          mutatedThemes[indexToReplace] = newTheme;
        }
      }
    } else {
      // Deletion: Remove a theme (if we have more than 2)
      if (mutatedThemes.length > 2) {
        const indexToRemove = Math.floor(Math.random() * mutatedThemes.length);
        mutatedThemes.splice(indexToRemove, 1);
      }
    }

    return mutatedThemes;
  }

  private selectThemeBasedOnContext(availableThemes: string[], context: EngineContext): string {
    // Weight theme selection based on context
    const fearProfile = context.playerProfile.fearProfile;

    // Map fears to preferred themes
    const fearToThemeMap: Record<string, string[]> = {
      claustrophobia: ['isolation', 'entropy', 'convergence'],
      isolation: ['isolation', 'void', 'dissolution'],
      bodyHorror: ['body horror', 'transformation', 'infection', 'corruption'],
      cosmicInsignificance: ['cosmic horror', 'void', 'singularity', 'revelation'],
      lossOfControl: ['possession', 'madness', 'entropy', 'manifestation'],
      madness: ['madness', 'paranoia', 'reality breakdown', 'time distortion']
    };

    // Find themes that match player fears
    const preferredThemes: string[] = [];
    for (const [fear, score] of Object.entries(fearProfile)) {
      if ((score || 0) > 0.4 && fearToThemeMap[fear]) {
        preferredThemes.push(...fearToThemeMap[fear]);
      }
    }

    // Filter to available themes that match preferences
    const matchingThemes = availableThemes.filter(t => preferredThemes.includes(t));

    if (matchingThemes.length > 0) {
      return matchingThemes[Math.floor(Math.random() * matchingThemes.length)];
    }

    // Fallback to random available theme
    return availableThemes[Math.floor(Math.random() * availableThemes.length)];
  }
}
