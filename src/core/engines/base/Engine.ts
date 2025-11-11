/**
 * BASE ENGINE - Abstract base class for all engines
 *
 * All engines must extend this class and implement the required methods.
 * Engines are stateless and receive context, returning effects to apply.
 */

import type { Engine as IEngine, EngineContext, EngineOutput } from '../../types/seams';

export abstract class BaseEngine implements IEngine {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly priority: number;

  /**
   * Determines if this engine should be active for the given context
   */
  abstract isActive(context: EngineContext): boolean;

  /**
   * Process the context and return engine output with instructions and effects
   */
  abstract process(context: EngineContext): Promise<EngineOutput>;

  /**
   * Generate AI instructions based on the context
   */
  abstract generateInstructions(context: EngineContext): string[];

  /**
   * Utility: Check if horror intensity is above threshold
   */
  protected isHorrorIntenseEnough(context: EngineContext, threshold: number): boolean {
    return context.worldState.horrorIntensity >= threshold;
  }

  /**
   * Utility: Check if corruption is above threshold
   */
  protected isCorruptionHighEnough(context: EngineContext, threshold: number): boolean {
    return context.worldState.corruptionLevel >= threshold;
  }

  /**
   * Utility: Check if system health is below threshold
   */
  protected isSystemHealthLowEnough(context: EngineContext, threshold: number): boolean {
    return context.worldState.systemHealth <= threshold;
  }

  /**
   * Utility: Get the number of choices made
   */
  protected getChoiceCount(context: EngineContext): number {
    return context.playerProfile.engagementMetrics.totalChoices;
  }

  /**
   * Utility: Check if enough history exists
   */
  protected hasEnoughHistory(context: EngineContext, minSegments: number): boolean {
    return context.recentHistory.length >= minSegments;
  }
}
