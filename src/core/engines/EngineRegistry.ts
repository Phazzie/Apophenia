/**
 * ENGINE REGISTRY
 *
 * Central registry and coordinator for all engines.
 * Executes engines in priority order and aggregates their outputs.
 */

import type { EngineRegistry as IEngineRegistry, Engine, EngineContext, EngineOutput } from '../types/seams';

export class EngineRegistry implements IEngineRegistry {
  // #TODO: See #TODO.md - Validation Tasks
  // Add runtime verification logging here. We need to verify that engines
  // are actually executing and producing outputs in the production environment.

  private engines: Engine[] = [];

  /**
   * Register an engine with the registry
   */
  register(engine: Engine): void {
    // Check if engine with same name already exists
    const existingIndex = this.engines.findIndex(e => e.name === engine.name);

    if (existingIndex >= 0) {
      // Replace existing engine
      this.engines[existingIndex] = engine;
    } else {
      // Add new engine
      this.engines.push(engine);
    }

    // Sort by priority (highest first)
    this.engines.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get all registered engines
   */
  getAll(): Engine[] {
    return [...this.engines];
  }

  /**
   * Get only engines that are active for the given context
   */
  getActive(context: EngineContext): Engine[] {
    return this.engines.filter(engine => {
      try {
        return engine.isActive(context);
      } catch (error) {
        this.logEngineError(engine.name, 'isActive', error);
        return false;
      }
    });
  }

  /**
   * Execute all active engines in priority order
   * Returns aggregated outputs from all engines
   */
  async executeAll(context: EngineContext): Promise<EngineOutput[]> {
    const activeEngines = this.getActive(context);

    if (activeEngines.length === 0) {
      return [];
    }

    const outputs: EngineOutput[] = [];
    const errors: Array<{ engineName: string; error: unknown }> = [];

    // Execute engines sequentially in priority order
    // Each engine can see the output of higher-priority engines via previousOutput
    for (const engine of activeEngines) {
      try {
        const previousOutput = outputs.length > 0 ? outputs[outputs.length - 1] : undefined;

        const contextWithPreviousOutput: EngineContext = {
          ...context,
          previousOutput
        };

        const output = await engine.process(contextWithPreviousOutput);
        outputs.push(output);
      } catch (error) {
        // Log error with full context
        this.logEngineError(engine.name, 'process', error, context);

        // Store error for potential propagation
        errors.push({
          engineName: engine.name,
          error
        });

        // Add error metadata to outputs for debugging
        outputs.push({
          engineName: engine.name,
          instructions: [],
          effects: {},
          metadata: {
            error: true,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorType: error instanceof Error ? error.constructor.name : typeof error
          }
        });

        // Continue with other engines even if one fails
      }
    }

    // If all engines failed, throw to propagate error
    if (errors.length > 0 && outputs.every(o => o.metadata?.error)) {
      throw new EngineExecutionError(
        `All ${errors.length} engines failed to execute`,
        errors
      );
    }

    return outputs;
  }

  /**
   * Get aggregated instructions from all active engines
   */
  getAggregatedInstructions(context: EngineContext): string[] {
    const activeEngines = this.getActive(context);
    const allInstructions: string[] = [];

    for (const engine of activeEngines) {
      try {
        const instructions = engine.generateInstructions(context);
        allInstructions.push(...instructions);
      } catch (error) {
        this.logEngineError(engine.name, 'generateInstructions', error, context);
        // Don't add failed instructions
      }
    }

    return allInstructions;
  }

  /**
   * Log engine errors with full context
   */
  private logEngineError(
    engineName: string,
    method: string,
    error: unknown,
    context?: EngineContext
  ): void {
    const errorDetails = {
      engine: engineName,
      method,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : String(error),
      context: context ? {
        horrorIntensity: context.worldState?.horrorIntensity,
        corruptionLevel: context.worldState?.corruptionLevel,
        choiceCount: context.playerProfile?.engagementMetrics?.totalChoices,
        historyLength: context.recentHistory?.length
      } : undefined
    };

    console.error(`Engine error in ${engineName}.${method}:`, errorDetails);
  }

  /**
   * Clear all registered engines
   */
  clear(): void {
    this.engines = [];
  }

  /**
   * Get engine by name
   */
  getByName(name: string): Engine | undefined {
    return this.engines.find(e => e.name === name);
  }

  /**
   * Check if an engine is registered
   */
  has(name: string): boolean {
    return this.engines.some(e => e.name === name);
  }

  /**
   * Unregister an engine by name
   */
  unregister(name: string): boolean {
    const index = this.engines.findIndex(e => e.name === name);
    if (index >= 0) {
      this.engines.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get summary of registered engines
   */
  getSummary(): {
    total: number;
    engines: Array<{ name: string; priority: number; description: string }>;
  } {
    return {
      total: this.engines.length,
      engines: this.engines.map(e => ({
        name: e.name,
        priority: e.priority,
        description: e.description
      }))
    };
  }
}

/**
 * Custom error class for engine execution failures
 */
export class EngineExecutionError extends Error {
  constructor(
    message: string,
    public readonly failures: Array<{ engineName: string; error: unknown }>
  ) {
    super(message);
    this.name = 'EngineExecutionError';
  }
}

/**
 * Create and initialize a registry with all engines
 */
export function createEngineRegistry(): EngineRegistry {
  const registry = new EngineRegistry();

  // Note: Engines will be registered by other systems
  // This factory just creates an empty registry

  return registry;
}
