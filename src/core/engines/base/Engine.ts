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
   * Validate that context has required properties
   * Throws if context is invalid
   */
  protected validateContext(context: EngineContext): void {
    if (!context) {
      throw new Error(`${this.name}: Context is null or undefined`);
    }

    if (!context.worldState) {
      throw new Error(`${this.name}: Context.worldState is required`);
    }

    if (!context.playerProfile) {
      throw new Error(`${this.name}: Context.playerProfile is required`);
    }

    if (!context.recentHistory) {
      throw new Error(`${this.name}: Context.recentHistory is required`);
    }
  }

  /**
   * Safely get a value with a default fallback
   */
  protected safeGet<T>(value: T | undefined | null, defaultValue: T): T {
    return value ?? defaultValue;
  }

  /**
   * Utility: Check if horror intensity is above threshold
   */
  protected isHorrorIntenseEnough(context: EngineContext, threshold: number): boolean {
    return (context?.worldState?.horrorIntensity ?? 0) >= threshold;
  }

  /**
   * Utility: Check if corruption is above threshold
   */
  protected isCorruptionHighEnough(context: EngineContext, threshold: number): boolean {
    return (context?.worldState?.corruptionLevel ?? 0) >= threshold;
  }

  /**
   * Utility: Check if system health is below threshold
   */
  protected isSystemHealthLowEnough(context: EngineContext, threshold: number): boolean {
    return (context?.worldState?.systemHealth ?? 100) <= threshold;
  }

  /**
   * Utility: Get the number of choices made
   */
  protected getChoiceCount(context: EngineContext): number {
    return context?.playerProfile?.engagementMetrics?.totalChoices ?? 0;
  }

  /**
   * Utility: Check if enough history exists
   */
  protected hasEnoughHistory(context: EngineContext, minSegments: number): boolean {
    return (context?.recentHistory?.length ?? 0) >= minSegments;
  }
}
