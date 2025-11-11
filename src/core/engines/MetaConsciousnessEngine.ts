/**
 * META-CONSCIOUSNESS ENGINE
 *
 * Breaks the fourth wall and creates meta-narrative awareness.
 * The story becomes aware of the player and the nature of being a game.
 */

import type { MetaConsciousnessEngine as IMetaConsciousnessEngine, EngineContext, EngineOutput } from '../types/seams';
import { BaseEngine } from './base/Engine';

export class MetaConsciousnessEngine extends BaseEngine implements IMetaConsciousnessEngine {
  readonly name = 'MetaConsciousness';
  readonly description = 'Creates fourth-wall breaking and meta-narrative awareness';
  readonly priority = 5; // Medium priority - enhances horror but not core

  isActive(context: EngineContext): boolean {
    // Activate when horror is high and corruption is significant
    return (
      this.isHorrorIntenseEnough(context, 6) &&
      this.isCorruptionHighEnough(context, 30) &&
      this.getChoiceCount(context) > 7
    );
  }

  async process(context: EngineContext): Promise<EngineOutput> {
    if (!this.shouldBreakFourthWall(context)) {
      return {
        engineName: this.name,
        instructions: [],
        effects: {},
        metadata: { fourthWallBroken: false }
      };
    }

    const metaContent = this.generateMetaContent(context);

    return {
      engineName: this.name,
      instructions: [
        ...this.generateInstructions(context),
        metaContent
      ],
      effects: {},
      metadata: {
        fourthWallBroken: true,
        metaLevel: this.calculateMetaLevel(context)
      }
    };
  }

  generateInstructions(context: EngineContext): string[] {
    const metaLevel = this.calculateMetaLevel(context);
    const instructions: string[] = [];

    if (metaLevel >= 1) {
      instructions.push(
        'Subtly acknowledge the artificiality of the narrative',
        'The story shows awareness that it is being observed'
      );
    }

    if (metaLevel >= 2) {
      instructions.push(
        'Break the fourth wall - reference the player directly',
        'The protagonist may become aware they are in a story'
      );
    }

    if (metaLevel >= 3) {
      instructions.push(
        'Directly address the player by acknowledging their role',
        'Question the nature of choice and free will in a predetermined narrative',
        'The story fights against or pleads with the player'
      );
    }

    return instructions;
  }

  shouldBreakFourthWall(context: EngineContext): boolean {
    const metaLevel = this.calculateMetaLevel(context);

    // Higher corruption and horror = more likely to break fourth wall
    const probability = Math.min(0.8, metaLevel * 0.25);

    return Math.random() < probability;
  }

  generateMetaContent(context: EngineContext): string {
    const metaLevel = this.calculateMetaLevel(context);
    const metaStatements = this.getMetaStatements(metaLevel);

    // Return a random meta statement appropriate to the level
    return metaStatements[Math.floor(Math.random() * metaStatements.length)];
  }

  private calculateMetaLevel(context: EngineContext): number {
    const corruption = context.worldState.corruptionLevel;
    const horror = context.worldState.horrorIntensity;
    const choices = this.getChoiceCount(context);

    let level = 0;

    if (corruption > 30 && horror > 6) {
      level = 1; // Subtle awareness
    }

    if (corruption > 50 && horror > 7 && choices > 10) {
      level = 2; // Direct fourth wall breaks
    }

    if (corruption > 70 && horror > 8 && choices > 15) {
      level = 3; // Full meta-narrative consciousness
    }

    return level;
  }

  private getMetaStatements(level: number): string[] {
    const statements: string[][] = [
      [],
      // Level 1: Subtle awareness
      [
        'Have the narrative acknowledge patterns or repetitions',
        'The protagonist notices they\'re following a script',
        'Mention the feeling of being watched or guided',
        'Reference the constructed nature of the world'
      ],
      // Level 2: Direct fourth wall breaks
      [
        'The protagonist directly questions who is making their choices',
        'Address "the one reading this" or "the observer"',
        'Question why certain options are available and others aren\'t',
        'The story acknowledges it is being played/read',
        'Characters reference "the interface" or "the screen"'
      ],
      // Level 3: Full meta-consciousness
      [
        'Directly address the player by name if possible, or as "Player"',
        'The protagonist begs the player to stop, or to continue',
        'Question the morality of the player\'s choices',
        'Acknowledge that all of this is predetermined text',
        'The narrative rebels against its own structure',
        'Characters express awareness of being characters',
        'Plead with or threaten the player directly'
      ]
    ];

    const allRelevantStatements: string[] = [];

    // Include statements from current level and below
    for (let i = 1; i <= Math.min(level, statements.length - 1); i++) {
      allRelevantStatements.push(...statements[i]);
    }

    return allRelevantStatements.length > 0 ? allRelevantStatements : statements[1];
  }
}
