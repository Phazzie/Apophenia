/**
 * TEMPORAL REVISION ENGINE
 *
 * Rewrites past story segments to create "false memory" effects.
 * Subtly contradicts earlier events to make the player question reality.
 */

import type { TemporalRevisionEngine as ITemporalRevisionEngine, EngineContext, EngineOutput, StorySegment } from '../types/seams';
import { BaseEngine } from './base/Engine';

export class TemporalRevisionEngine extends BaseEngine implements ITemporalRevisionEngine {
  readonly name = 'TemporalRevision';
  readonly description = 'Rewrites past story segments to create false memory effects';
  readonly priority = 8; // High priority - affects perception early

  isActive(context: EngineContext): boolean {
    // Activate when horror intensity is moderate and we have history to revise
    return (
      this.isHorrorIntenseEnough(context, 4) &&
      this.hasEnoughHistory(context, 3) &&
      this.getChoiceCount(context) > 5
    );
  }

  async process(context: EngineContext): Promise<EngineOutput> {
    const targetSegmentId = this.identifyRevisionTarget(context.recentHistory);

    if (!targetSegmentId) {
      return {
        engineName: this.name,
        instructions: this.generateInstructions(context),
        effects: {},
        metadata: { targetFound: false }
      };
    }

    const targetSegment = context.recentHistory.find(s => s.id === targetSegmentId);
    if (!targetSegment) {
      return {
        engineName: this.name,
        instructions: this.generateInstructions(context),
        effects: {},
        metadata: { targetFound: false }
      };
    }

    const revisedText = await this.generateRevision(targetSegment.text, context);

    return {
      engineName: this.name,
      instructions: this.generateInstructions(context),
      effects: {
        historyRevisions: [{
          id: targetSegmentId,
          newText: revisedText
        }]
      },
      metadata: {
        targetFound: true,
        originalLength: targetSegment.text.length,
        revisedLength: revisedText.length
      }
    };
  }

  generateInstructions(context: EngineContext): string[] {
    const intensity = context.worldState.horrorIntensity;

    const instructions = [
      'Subtly contradict or alter details from earlier in the story',
      'Create inconsistencies that make the player question their memory',
      'Never explicitly acknowledge these changes'
    ];

    if (intensity >= 6) {
      instructions.push('Make the contradictions more noticeable and disturbing');
      instructions.push('Imply that reality itself is unstable');
    }

    if (intensity >= 8) {
      instructions.push('Create significant alterations that completely change earlier meaning');
      instructions.push('Make the protagonist notice inconsistencies without understanding why');
    }

    return instructions;
  }

  identifyRevisionTarget(history: StorySegment[]): string | null {
    if (history.length < 3) {
      return null;
    }

    // Target segments from the first third of history that haven't been revised
    const firstThird = Math.floor(history.length / 3);
    const candidateSegments = history
      .slice(0, firstThird)
      .filter(segment => !segment.isRevised && segment.text.length > 50);

    if (candidateSegments.length === 0) {
      return null;
    }

    // Return a random candidate, weighted toward earlier segments
    const index = Math.floor(Math.random() * Math.min(3, candidateSegments.length));
    return candidateSegments[index].id;
  }

  async generateRevision(original: string, context: EngineContext): Promise<string> {
    // #TODO: Upgrade to LLM-based narrative rewriting (currently uses regex replacement).
    // Simple revision algorithm: introduce subtle contradictions
    const revisionTypes = [
      this.changeCharacterDetail,
      this.alterLocationDetail,
      this.modifyAction,
      this.changeObjectDescription
    ];

    const revisionFn = revisionTypes[Math.floor(Math.random() * revisionTypes.length)];
    return revisionFn.call(this, original, context);
  }

  private changeCharacterDetail(original: string, context: EngineContext): string {
    // Simple replacement of character references with subtle differences
    const protagonist = context.worldState.protagonist;
    if (!protagonist) return original;

    // Add subtle inconsistencies to character descriptions
    // Using word boundaries to avoid false matches (e.g., "his" in "whisper")
    const inconsistencies = [
      { from: /\bhis\b/gi, to: 'her', maxReplacements: 1 },
      { from: /\bher\b/gi, to: 'his', maxReplacements: 1 },
      { from: /\bleft hand\b/gi, to: 'right hand', maxReplacements: 1 },
      { from: /\bright hand\b/gi, to: 'left hand', maxReplacements: 1 },
      { from: /\bhe\b/gi, to: 'she', maxReplacements: 1 },
      { from: /\bshe\b/gi, to: 'he', maxReplacements: 1 }
    ];

    // Pick one inconsistency at random
    if (Math.random() < 0.3) {
      const inc = inconsistencies[Math.floor(Math.random() * inconsistencies.length)];
      // Only replace first occurrence to avoid over-modification
      let replaced = false;
      return original.replace(inc.from, (match) => {
        if (!replaced) {
          replaced = true;
          return inc.to;
        }
        return match;
      });
    }

    return original;
  }

  private alterLocationDetail(original: string, context: EngineContext): string {
    // Change environmental details with specific word boundaries
    const alterations = [
      { from: /\b(a |the |this |that )?door\b/gi, to: '$1window' },
      { from: /\b(a |the |this |that )?window\b/gi, to: '$1door' },
      { from: /\b(the |these |those )?stairs\b/gi, to: '$1ladder' },
      { from: /\b(a |the |this )?ladder\b/gi, to: '$1stairs' },
      { from: /\b(to the |on the )?right\b/gi, to: '$1left' },
      { from: /\b(to the |on the )?left\b/gi, to: '$1right' }
    ];

    if (Math.random() < 0.3) {
      const alt = alterations[Math.floor(Math.random() * alterations.length)];
      // Only replace first occurrence
      let replaced = false;
      return original.replace(alt.from, (match, prefix) => {
        if (!replaced) {
          replaced = true;
          return alt.to.replace('$1', prefix || '');
        }
        return match;
      });
    }

    return original;
  }

  private modifyAction(original: string, context: EngineContext): string {
    // Change verbs to create different actions with specific word boundaries
    const modifications = [
      { from: /\bwalked\b/gi, to: 'ran' },
      { from: /\bran\b/gi, to: 'walked' },
      { from: /\bopened\b/gi, to: 'closed' },
      { from: /\bclosed\b/gi, to: 'opened' },
      { from: /\bwhispered\b/gi, to: 'shouted' },
      { from: /\bshouted\b/gi, to: 'whispered' },
      { from: /\bentered\b/gi, to: 'exited' },
      { from: /\bexited\b/gi, to: 'entered' }
    ];

    if (Math.random() < 0.3) {
      const mod = modifications[Math.floor(Math.random() * modifications.length)];
      // Only replace first occurrence
      let replaced = false;
      return original.replace(mod.from, (match) => {
        if (!replaced) {
          replaced = true;
          return mod.to;
        }
        return match;
      });
    }

    return original;
  }

  private changeObjectDescription(original: string, context: EngineContext): string {
    // Modify object attributes with specific word boundaries
    const changes = [
      { from: /\bred\b/gi, to: 'blue' },
      { from: /\bblue\b/gi, to: 'red' },
      { from: /\bold\b/gi, to: 'new' },
      { from: /\bnew\b/gi, to: 'old' },
      { from: /\blarge\b/gi, to: 'small' },
      { from: /\bsmall\b/gi, to: 'large' },
      { from: /\bbright\b/gi, to: 'dim' },
      { from: /\bdim\b/gi, to: 'bright' }
    ];

    if (Math.random() < 0.3) {
      const change = changes[Math.floor(Math.random() * changes.length)];
      // Only replace first occurrence
      let replaced = false;
      return original.replace(change.from, (match) => {
        if (!replaced) {
          replaced = true;
          return change.to;
        }
        return match;
      });
    }

    return original;
  }
}
