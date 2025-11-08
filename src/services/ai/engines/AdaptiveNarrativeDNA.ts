import { WorldState } from '../../../types';
import { isFeatureEnabled } from '../../../utils/featureFlagMiddleware';

/**
 * ADAPTIVE NARRATIVE DNA
 * Evolving story genetics that adapt the narrative structure itself based on player behavior
 * Creates unique narrative "DNA" that mutates and evolves throughout gameplay
 */
export class AdaptiveNarrativeDNA {
  private narrativeDNA: {
    paceGenes: number[];        // Controls story pacing
    tensionGenes: number[];     // Controls tension building
    choiceGenes: number[];      // Controls choice complexity
    themeGenes: number[];       // Controls thematic elements
    structureGenes: number[];   // Controls narrative structure
    generation: number;         // DNA evolution generation
  } = {
    paceGenes: [0.5, 0.5, 0.5, 0.5],       // Fast, Medium, Slow, Variable
    tensionGenes: [0.5, 0.5, 0.5],         // Build, Release, Sustain
    choiceGenes: [0.5, 0.5, 0.5],          // Simple, Complex, Ambiguous
    themeGenes: [0.5, 0.5, 0.5, 0.5],      // Horror, Mystery, Sci-fi, Philosophical
    structureGenes: [0.5, 0.5, 0.5],       // Linear, Branching, Cyclical
    generation: 1,
  };

  private static readonly MUTABLE_GENE_KEYS = ['paceGenes', 'tensionGenes', 'choiceGenes'] as const;

  evolveNarrative(playerChoice: string, responseTime: number, worldState: WorldState): void {
    // Feature gate: Skip evolution if NARRATIVE_DNA is disabled
    if (!isFeatureEnabled('NARRATIVE_DNA')) {
      console.log('🚫 Narrative DNA feature is disabled. Skipping evolution.');
      return;
    }

    const selectionPressure = this.calculateSelectionPressure(playerChoice, responseTime, worldState);
    this.mutateGenes(selectionPressure);
    this.adaptiveSelection();
    this.narrativeDNA.generation++;

    console.log(`🧬 Narrative DNA Evolution: Generation ${this.narrativeDNA.generation}, Pressure: ${selectionPressure.toFixed(2)}`);
  }

  generateAdaptivePrompt(basePrompt: string): string {
    // Feature gate: Return unmodified prompt if NARRATIVE_DNA is disabled
    if (!isFeatureEnabled('NARRATIVE_DNA')) {
      return basePrompt;
    }

    const dnaModifiers = this.expressGenes();

    let adaptedPrompt = basePrompt;

    // Apply pace genes
    if (dnaModifiers.pace === 'fast') {
      adaptedPrompt += ' Focus on rapid story progression with quick, decisive events.';
    } else if (dnaModifiers.pace === 'slow') {
      adaptedPrompt += ' Develop story slowly with rich atmospheric details and contemplation.';
    }

    // Apply tension genes
    if (dnaModifiers.tension === 'build') {
      adaptedPrompt += ' Gradually increase psychological tension and unease.';
    } else if (dnaModifiers.tension === 'release') {
      adaptedPrompt += ' Provide temporary relief or resolution before building new tension.';
    }

    // Apply choice genes
    if (dnaModifiers.choices === 'complex') {
      adaptedPrompt += ' Provide morally ambiguous choices with unclear consequences.';
    } else if (dnaModifiers.choices === 'simple') {
      adaptedPrompt += ' Offer clear-cut choices with obvious implications.';
    }

    return adaptedPrompt;
  }

  private calculateSelectionPressure(choice: string, responseTime: number, worldState: WorldState): number {
    let pressure = 0.0;

    // Quick decisions indicate engagement (positive pressure)
    if (responseTime < 5000) pressure += 0.2;
    else if (responseTime > 15000) pressure -= 0.1;

    // Choice complexity preference
    const choiceComplexity = (choice.match(/,/g) || []).length + 1;
    if (choiceComplexity > 2) pressure += 0.1;

    // System health affects adaptation rate
    const healthFactor = worldState.systemHealth / 100;
    pressure *= healthFactor;

    return Math.max(-0.5, Math.min(0.5, pressure));
  }

  private mutateGenes(pressure: number): void {
    const mutationRate = Math.abs(pressure) * 0.1;

    AdaptiveNarrativeDNA.MUTABLE_GENE_KEYS.forEach(key => {
      this.narrativeDNA[key] = this.mutateGeneSet(this.narrativeDNA[key], mutationRate, pressure);
    });
  }

  private mutateGeneSet(genes: number[], mutationRate: number, pressure: number): number[] {
    return genes.map(gene => this.mutateGene(gene, mutationRate, pressure));
  }

  private mutateGene(gene: number, mutationRate: number, pressure: number): number {
    if (Math.random() < mutationRate) {
      const mutation = (Math.random() - 0.5) * 0.2 * Math.sign(pressure);
      return Math.max(0, Math.min(1, gene + mutation));
    }
    return gene;
  }

  private adaptiveSelection(): void {
    // Ensure gene values sum appropriately for probability distributions
    AdaptiveNarrativeDNA.MUTABLE_GENE_KEYS.forEach(key => {
      this.narrativeDNA[key] = this.normalizeGenes(this.narrativeDNA[key]);
    });
  }

  private normalizeGenes(genes: number[]): number[] {
    const sum = genes.reduce((a, b) => a + b, 0);
    return sum > 0 ? genes.map(g => g / sum) : genes.map(() => 1 / genes.length);
  }

  private expressGenes(): { pace: string; tension: string; choices: string } {
    const paceIndex = this.selectFromProbabilities(this.narrativeDNA.paceGenes);
    const tensionIndex = this.selectFromProbabilities(this.narrativeDNA.tensionGenes);
    const choiceIndex = this.selectFromProbabilities(this.narrativeDNA.choiceGenes);

    return {
      pace: ['fast', 'medium', 'slow', 'variable'][paceIndex],
      tension: ['build', 'release', 'sustain'][tensionIndex],
      choices: ['simple', 'complex', 'ambiguous'][choiceIndex],
    };
  }

  private selectFromProbabilities(probabilities: number[]): number {
    const total = probabilities.reduce((a, b) => a + b, 0);
    if (total <= 0) return 0;
    const r = Math.random() * total;
    let cumulative = 0;
    for (let i = 0; i < probabilities.length; i++) {
      cumulative += probabilities[i];
      if (r < cumulative) return i;
    }
    return probabilities.length - 1;
  }

  public getGeneration(): number {
    return this.narrativeDNA.generation;
  }
}