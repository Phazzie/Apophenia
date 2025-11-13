/**
 * ENGINE EXPORTS
 *
 * Central export point for all engines.
 */

// Base Engine
export { BaseEngine } from './base/Engine';

// Specific Engines
export { TemporalRevisionEngine } from './TemporalRevisionEngine';
export { QuantumNarrativeEngine } from './QuantumNarrativeEngine';
export { RealityCorruptionEngine } from './RealityCorruptionEngine';
export { AdaptiveHorrorEngine } from './AdaptiveHorrorEngine';
export { MetaConsciousnessEngine } from './MetaConsciousnessEngine';
export { NeuralEchoChamberEngine } from './NeuralEchoChamberEngine';
export { SemanticChoiceArchaeologyEngine } from './SemanticChoiceArchaeologyEngine';
export { AdaptiveNarrativeDNAEngine } from './AdaptiveNarrativeDNAEngine';
export { FifthWallEngine } from './FifthWallEngine';

// Registry
export { EngineRegistry, createEngineRegistry } from './EngineRegistry';

// Helper function to create and register all engines
import { EngineRegistry } from './EngineRegistry';
import { TemporalRevisionEngine } from './TemporalRevisionEngine';
import { QuantumNarrativeEngine } from './QuantumNarrativeEngine';
import { RealityCorruptionEngine } from './RealityCorruptionEngine';
import { AdaptiveHorrorEngine } from './AdaptiveHorrorEngine';
import { MetaConsciousnessEngine } from './MetaConsciousnessEngine';
import { NeuralEchoChamberEngine } from './NeuralEchoChamberEngine';
import { SemanticChoiceArchaeologyEngine } from './SemanticChoiceArchaeologyEngine';
import { AdaptiveNarrativeDNAEngine } from './AdaptiveNarrativeDNAEngine';
import { FifthWallEngine } from './FifthWallEngine';

/**
 * Create a fully initialized engine registry with all engines
 */
export function initializeEngineRegistry(): EngineRegistry {
  const registry = new EngineRegistry();

  // Register all engines
  registry.register(new TemporalRevisionEngine());
  registry.register(new QuantumNarrativeEngine());
  registry.register(new RealityCorruptionEngine());
  registry.register(new AdaptiveHorrorEngine());
  registry.register(new MetaConsciousnessEngine());
  registry.register(new NeuralEchoChamberEngine());
  registry.register(new SemanticChoiceArchaeologyEngine());
  registry.register(new AdaptiveNarrativeDNAEngine());
  registry.register(new FifthWallEngine());

  return registry;
}

/**
 * Singleton engine registry instance
 * Shared across all flows to avoid creating duplicate engine instances
 */
export const globalEngineRegistry = initializeEngineRegistry();
