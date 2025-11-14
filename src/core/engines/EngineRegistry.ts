/**
 * ENGINE REGISTRY
 *
 * Central registry and coordinator for all engines.
 * Executes engines in priority order and aggregates their outputs.
 */

import type { EngineRegistry as IEngineRegistry, Engine, EngineContext, EngineOutput } from '../types/seams';

export class EngineRegistry implements IEngineRegistry {
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
        console.error(`Error checking if engine ${engine.name} is active:`, error);
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
        console.error(`Error executing engine ${engine.name}:`, error);
        // Continue with other engines even if one fails
      }
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
        console.error(`Error generating instructions from engine ${engine.name}:`, error);
      }
    }

    return allInstructions;
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
 * Create and initialize a registry with all engines
 */
export function createEngineRegistry(): EngineRegistry {
  const registry = new EngineRegistry();

  // Note: Engines will be registered by other systems
  // This factory just creates an empty registry

  return registry;
}
