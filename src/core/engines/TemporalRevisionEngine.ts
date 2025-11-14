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
    const inconsistencies = [
      { from: /\bhis\b/gi, to: 'her' },
      { from: /\bher\b/gi, to: 'his' },
      { from: /\bleft hand\b/gi, to: 'right hand' },
      { from: /\bright hand\b/gi, to: 'left hand' }
    ];

    // Pick one inconsistency at random
    if (Math.random() < 0.3) {
      const inc = inconsistencies[Math.floor(Math.random() * inconsistencies.length)];
      return original.replace(inc.from, inc.to);
    }

    return original;
  }

  private alterLocationDetail(original: string, context: EngineContext): string {
    // Change environmental details
    const alterations = [
      { from: /\bdoor\b/gi, to: 'window' },
      { from: /\bwindow\b/gi, to: 'door' },
      { from: /\bstairs\b/gi, to: 'ladder' },
      { from: /\bladder\b/gi, to: 'stairs' },
      { from: /\bright\b/gi, to: 'left' },
      { from: /\bleft\b/gi, to: 'right' }
    ];

    if (Math.random() < 0.3) {
      const alt = alterations[Math.floor(Math.random() * alterations.length)];
      return original.replace(alt.from, alt.to);
    }

    return original;
  }

  private modifyAction(original: string, context: EngineContext): string {
    // Change verbs to create different actions
    const modifications = [
      { from: /\bwalked\b/gi, to: 'ran' },
      { from: /\bran\b/gi, to: 'walked' },
      { from: /\bopened\b/gi, to: 'closed' },
      { from: /\bclosed\b/gi, to: 'opened' },
      { from: /\bwhispered\b/gi, to: 'shouted' },
      { from: /\bshouted\b/gi, to: 'whispered' }
    ];

    if (Math.random() < 0.3) {
      const mod = modifications[Math.floor(Math.random() * modifications.length)];
      return original.replace(mod.from, mod.to);
    }

    return original;
  }

  private changeObjectDescription(original: string, context: EngineContext): string {
    // Modify object attributes
    const changes = [
      { from: /\bred\b/gi, to: 'blue' },
      { from: /\bblue\b/gi, to: 'red' },
      { from: /\bold\b/gi, to: 'new' },
      { from: /\bnew\b/gi, to: 'old' },
      { from: /\blarge\b/gi, to: 'small' },
      { from: /\bsmall\b/gi, to: 'large' }
    ];

    if (Math.random() < 0.3) {
      const change = changes[Math.floor(Math.random() * changes.length)];
      return original.replace(change.from, change.to);
    }

    return original;
  }
}
