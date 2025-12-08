/**
 * SEMANTIC CHOICE ARCHAEOLOGY ENGINE
 *
 * Analyzes patterns in player choices to uncover subconscious motivations.
 * Reflects these patterns back to create psychological discomfort.
 */

import type { SemanticChoiceArchaeologyEngine as ISemanticChoiceArchaeologyEngine, EngineContext, EngineOutput, Choice, PatternAnalysis } from '../types/seams';
import { BaseEngine } from './base/Engine';

export class SemanticChoiceArchaeologyEngine extends BaseEngine implements ISemanticChoiceArchaeologyEngine {
  readonly name = 'SemanticChoiceArchaeology';
  readonly description = 'Analyzes choice patterns and reflects subconscious motivations';
  readonly priority = 3; // Medium-low priority - analytical enhancement

  isActive(context: EngineContext): boolean {
    // Activate when we have enough choices to analyze
    return this.getChoiceCount(context) >= 5 && this.getChoiceCount(context) % 4 === 0;
  }

  async process(context: EngineContext): Promise<EngineOutput> {
    try {
      // Validate context first
      this.validateContext(context);

      // Reconstruct choice history from previous outputs and current choice (pure functional)
      const previousChoices = this.getChoiceHistoryFromContext(context);
      const currentChoices = context.currentChoice ? [...previousChoices, context.currentChoice] : previousChoices;

      const analysis = this.analyzeChoiceSequence(currentChoices);
      const reflection = this.generateReflection(analysis);

      return {
        engineName: this.name,
        instructions: [
          ...this.generateInstructions(context),
          reflection
        ],
        effects: {},
        metadata: {
          analysis,
          choicesAnalyzed: currentChoices.length,
          choiceHistory: currentChoices // Store for next execution
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
   * Reconstructs choice history from context (stateless)
   */
  private getChoiceHistoryFromContext(context: EngineContext): Choice[] {
    // Try to get from previous engine output metadata
    const previousOutput = context.previousOutput;
    if (previousOutput?.metadata?.choiceHistory && Array.isArray(previousOutput.metadata.choiceHistory)) {
      return previousOutput.metadata.choiceHistory as Choice[];
    }

    // Fallback: empty history (first run)
    return [];
  }

  generateInstructions(context: EngineContext): string[] {
    return [
      'Reflect the player\'s choice patterns back to them',
      'Make observations about their subconscious motivations',
      'Create psychological discomfort through accurate pattern recognition'
    ];
  }

  analyzeChoiceSequence(choices: Choice[]): PatternAnalysis {
    if (choices.length < 3) {
      return {
        dominantPattern: 'insufficient_data',
        subconscious: ['Not enough choices to analyze'],
        interpretation: 'Continue making choices to reveal your patterns'
      };
    }

    // Analyze semantic content of choices
    const patterns = {
      violence: 0,
      avoidance: 0,
      curiosity: 0,
      submission: 0,
      control: 0,
      isolation: 0,
      connection: 0
    };

    for (const choice of choices) {
      const text = choice.text.toLowerCase();

      // Violence/aggression
      if (this.matchesPattern(text, ['attack', 'fight', 'destroy', 'kill', 'break', 'hurt'])) {
        patterns.violence++;
      }

      // Avoidance/escape
      if (this.matchesPattern(text, ['run', 'flee', 'escape', 'hide', 'avoid', 'retreat', 'leave'])) {
        patterns.avoidance++;
      }

      // Curiosity/exploration
      if (this.matchesPattern(text, ['examine', 'investigate', 'explore', 'look', 'search', 'discover'])) {
        patterns.curiosity++;
      }

      // Submission/passivity
      if (this.matchesPattern(text, ['wait', 'submit', 'accept', 'give up', 'surrender', 'comply'])) {
        patterns.submission++;
      }

      // Control/dominance
      if (this.matchesPattern(text, ['take control', 'command', 'force', 'dominate', 'lead', 'demand'])) {
        patterns.control++;
      }

      // Isolation
      if (this.matchesPattern(text, ['alone', 'isolated', 'solitary', 'separate', 'individual'])) {
        patterns.isolation++;
      }

      // Connection
      if (this.matchesPattern(text, ['together', 'help', 'trust', 'connect', 'join', 'ally'])) {
        patterns.connection++;
      }
    }

    // Determine dominant pattern
    const sortedPatterns = Object.entries(patterns)
      .sort((a, b) => b[1] - a[1])
      .filter(([, count]) => count > 0);

    const dominantPattern = sortedPatterns.length > 0 ? sortedPatterns[0][0] : 'neutral';
    const secondaryPattern = sortedPatterns.length > 1 ? sortedPatterns[1][0] : null;

    // Generate subconscious observations
    const subconscious = this.generateSubconsciousObservations(patterns, dominantPattern, secondaryPattern);

    // Generate interpretation
    const interpretation = this.generateInterpretation(dominantPattern, secondaryPattern, choices.length);

    return {
      dominantPattern,
      subconscious,
      interpretation
    };
  }

  generateReflection(analysis: PatternAnalysis): string {
    if (analysis.dominantPattern === 'insufficient_data') {
      return '';
    }

    const reflections = [
      `Observe and comment on the player's ${analysis.dominantPattern} tendencies`,
      `Reflect: "${analysis.interpretation}"`,
      ...analysis.subconscious.map(obs => `Note: ${obs}`)
    ];

    return reflections.join(' | ');
  }

  private matchesPattern(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  private generateSubconsciousObservations(
    patterns: Record<string, number>,
    dominant: string,
    secondary: string | null
  ): string[] {
    const observations: string[] = [];

    // Observations based on dominant pattern
    switch (dominant) {
      case 'violence':
        observations.push('Every problem is met with aggression');
        observations.push('Violence as the first response, not the last');
        break;
      case 'avoidance':
        observations.push('Running becomes a pattern, not a choice');
        observations.push('Fear of confrontation defines every decision');
        break;
      case 'curiosity':
        observations.push('Curiosity despite the consequences');
        observations.push('The need to know outweighs the need to survive');
        break;
      case 'submission':
        observations.push('Acceptance of powerlessness');
        observations.push('Choosing surrender over struggle');
        break;
      case 'control':
        observations.push('The desperate need to be in command');
        observations.push('Control as an illusion of safety');
        break;
      case 'isolation':
        observations.push('Preferring solitude even when connection is offered');
        observations.push('Trust in nothing and no one');
        break;
      case 'connection':
        observations.push('Seeking others in a world of horrors');
        observations.push('Hope that connection might save you');
        break;
    }

    // Add contradictions if secondary pattern exists
    if (secondary && patterns[secondary] > patterns[dominant] * 0.6) {
      observations.push(`Yet beneath ${dominant}, there is ${secondary}`);
      observations.push('Your choices contradict themselves');
    }

    return observations;
  }

  private generateInterpretation(dominant: string, secondary: string | null, choiceCount: number): string {
    const interpretations: Record<string, string> = {
      violence: 'You solve problems by destroying them. But what happens when the problem cannot be destroyed?',
      avoidance: 'You run from everything. But there is nowhere left to run.',
      curiosity: 'You must know, even when knowing will destroy you. Is understanding worth oblivion?',
      submission: 'You have learned helplessness. You accept what others fight against. Is this wisdom or defeat?',
      control: 'You try to control the uncontrollable. Your grip tightens as reality slips away.',
      isolation: 'You push others away. In the end, you will be truly alone. Is that what you wanted?',
      connection: 'You reach for others in the darkness. But what if they reach back with something terrible?',
      neutral: 'Your choices reveal no pattern. Perhaps you have no pattern. Perhaps you have no self.'
    };

    const base = interpretations[dominant] || interpretations.neutral;

    if (choiceCount > 15) {
      return `${base} After ${choiceCount} choices, this is who you have become.`;
    }

    return base;
  }
}
