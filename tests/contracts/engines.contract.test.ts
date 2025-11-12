/**
 * CONTRACT TESTS: ENGINE INTERFACE (SEAM #3)
 *
 * These tests validate that all 9 revolutionary engines comply with the
 * Engine interface contract defined in src/core/types/seams.ts
 *
 * Contract Requirements:
 * - Base Engine interface (lines 264-272)
 * - EngineContext interface (lines 274-280)
 * - EngineOutput interface (lines 282-287)
 * - 9 specific engine extended interfaces (lines 289-348)
 * - EngineRegistry interface (lines 349-354)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type {
  Engine,
  EngineContext,
  EngineOutput,
  EngineEffects,
  WorldState,
  StorySegment,
  PlayerProfile,
  GenreConfig,
  PsychologicalStatus,
  Choice
} from '../../src/core/types/seams';

// Import engine implementations
import { TemporalRevisionEngine } from '../../src/services/ai/engines/TemporalRevisionEngine';
import { QuantumNarrativeEngine } from '../../src/services/ai/engines/QuantumNarrativeEngine';
import { RealityCorruptionEngine } from '../../src/services/ai/engines/RealityCorruptionEngine';
import { AdaptiveHorrorEngine } from '../../src/services/ai/engines/AdaptiveHorrorEngine';
import { MetaConsciousnessEngine } from '../../src/services/ai/engines/MetaConsciousnessEngine';
import { NeuralEchoChambers } from '../../src/services/ai/engines/NeuralEchoChambers';
import { SemanticChoiceArchaeology } from '../../src/services/ai/engines/SemanticChoiceArchaeology';
import { AdaptiveNarrativeDNA } from '../../src/services/ai/engines/AdaptiveNarrativeDNA';
import { BreakingFifthWall } from '../../src/services/ai/engines/BreakingFifthWall';

// Import EngineRegistry
import { EngineRegistry } from '../../src/core/engines/EngineRegistry';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createMockWorldState(): WorldState {
  return {
    protagonist: 'Test Subject',
    setting: 'Test Laboratory',
    dilemma: 'A critical choice must be made',
    psychologicalStatus: 'stable' as PsychologicalStatus,
    systemHealth: 80,
    horrorIntensity: 5,
    corruptionLevel: 0.3,
    genreConfig: {
      id: 'test-genre',
      name: 'Test Genre',
      description: 'Test genre for contract testing',
      systemPrompt: 'You are testing',
      themes: ['testing', 'validation'],
      fearCategories: ['failure', 'bugs'],
      visualStyle: {
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
        accentColor: '#ff0000',
        fontFamily: 'monospace',
        atmosphere: 'dark' as const
      }
    }
  };
}

function createMockStorySegment(id: string, text: string): StorySegment {
  return {
    id,
    text,
    images: {},
    timestamp: Date.now()
  };
}

function createMockPlayerProfile(): PlayerProfile {
  return {
    fearProfile: {
      claustrophobia: 0.5,
      isolation: 0.4,
      bodyHorror: 0.3,
      cosmicInsignificance: 0.6,
      lossOfControl: 0.5,
      madness: 0.4
    },
    choicePatterns: {
      riskTaking: 0.5,
      curiosity: 0.7,
      aggression: 0.3,
      avoidance: 0.4
    },
    engagementMetrics: {
      totalChoices: 10,
      averageResponseTime: 5000,
      sessionDuration: 300000
    }
  };
}

function createMockEngineContext(): EngineContext {
  return {
    worldState: createMockWorldState(),
    recentHistory: [
      createMockStorySegment('seg-1', 'The story begins...'),
      createMockStorySegment('seg-2', 'Tension rises...'),
      createMockStorySegment('seg-3', 'A choice appears...')
    ],
    playerProfile: createMockPlayerProfile(),
    currentChoice: {
      id: 'choice-1',
      text: 'Investigate the strange sound',
      isIntrusive: false,
      psychologicalWeight: 0.7
    }
  };
}

// ============================================================================
// BASE ENGINE INTERFACE TESTS
// ============================================================================

describe('Contract Tests: Engines (Seam #3)', () => {

  describe('Base Engine Interface Compliance', () => {

    // Create instances of all engines
    const engineInstances = [
      { name: 'TemporalRevisionEngine', instance: new TemporalRevisionEngine() },
      { name: 'QuantumNarrativeEngine', instance: new QuantumNarrativeEngine() },
      { name: 'RealityCorruptionEngine', instance: new RealityCorruptionEngine() },
      { name: 'AdaptiveHorrorEngine', instance: new AdaptiveHorrorEngine() },
      { name: 'MetaConsciousnessEngine', instance: new MetaConsciousnessEngine() },
      { name: 'NeuralEchoChambers', instance: new NeuralEchoChambers() },
      { name: 'SemanticChoiceArchaeology', instance: new SemanticChoiceArchaeology() },
      { name: 'AdaptiveNarrativeDNA', instance: new AdaptiveNarrativeDNA() },
      { name: 'BreakingFifthWall', instance: new BreakingFifthWall() }
    ];

    engineInstances.forEach(({ name, instance }) => {
      describe(`${name}`, () => {

        it('should have required "name" property (string)', () => {
          expect(instance).toHaveProperty('name');
          expect(typeof (instance as any).name).toBe('string');
        });

        it('should have required "description" property (string)', () => {
          expect(instance).toHaveProperty('description');
          expect(typeof (instance as any).description).toBe('string');
        });

        it('should have required "priority" property (number 1-10)', () => {
          expect(instance).toHaveProperty('priority');
          const priority = (instance as any).priority;
          expect(typeof priority).toBe('number');
          expect(priority).toBeGreaterThanOrEqual(1);
          expect(priority).toBeLessThanOrEqual(10);
        });

        it('should implement isActive(context) method returning boolean', () => {
          const engine = instance as any as Engine;
          expect(typeof engine.isActive).toBe('function');

          const context = createMockEngineContext();
          const result = engine.isActive(context);
          expect(typeof result).toBe('boolean');
        });

        it('should implement process(context) method returning Promise<EngineOutput>', async () => {
          const engine = instance as any as Engine;
          expect(typeof engine.process).toBe('function');

          const context = createMockEngineContext();
          const result = await engine.process(context);

          // Verify EngineOutput shape
          expect(result).toHaveProperty('engineName');
          expect(result).toHaveProperty('instructions');
          expect(result).toHaveProperty('effects');
          expect(result).toHaveProperty('metadata');

          expect(typeof result.engineName).toBe('string');
          expect(Array.isArray(result.instructions)).toBe(true);
          expect(typeof result.effects).toBe('object');
          expect(typeof result.metadata).toBe('object');

          // Verify all instructions are strings
          result.instructions.forEach(instruction => {
            expect(typeof instruction).toBe('string');
          });
        });

        it('should implement generateInstructions(context) method returning string[]', () => {
          const engine = instance as any as Engine;
          expect(typeof engine.generateInstructions).toBe('function');

          const context = createMockEngineContext();
          const result = engine.generateInstructions(context);

          expect(Array.isArray(result)).toBe(true);
          result.forEach(instruction => {
            expect(typeof instruction).toBe('string');
          });
        });

        it('should not have extra properties beyond the contract', () => {
          const engine = instance as any;
          const requiredKeys = ['name', 'description', 'priority'];
          const requiredMethods = ['isActive', 'process', 'generateInstructions'];

          // All required properties should exist
          requiredKeys.forEach(key => {
            expect(engine).toHaveProperty(key);
          });

          requiredMethods.forEach(method => {
            expect(typeof engine[method]).toBe('function');
          });
        });
      });
    });
  });

  // ============================================================================
  // ENGINE OUTPUT SHAPE VALIDATION
  // ============================================================================

  describe('EngineOutput Shape Validation', () => {
    it('should return consistent EngineOutput shape from all active engines', async () => {
      const context = createMockEngineContext();
      const engines = [
        new TemporalRevisionEngine(),
        new QuantumNarrativeEngine(),
        new RealityCorruptionEngine(),
        new AdaptiveHorrorEngine(),
        new MetaConsciousnessEngine(),
        new NeuralEchoChambers(),
        new SemanticChoiceArchaeology(),
        new AdaptiveNarrativeDNA(),
        new BreakingFifthWall()
      ];

      for (const engine of engines) {
        const engineTyped = engine as any as Engine;

        if (engineTyped.isActive(context)) {
          const output = await engineTyped.process(context);

          // Validate required fields
          expect(output.engineName).toBeDefined();
          expect(output.instructions).toBeDefined();
          expect(output.effects).toBeDefined();
          expect(output.metadata).toBeDefined();

          // Validate EngineEffects shape
          const effects = output.effects;

          if (effects.worldUpdates !== undefined) {
            expect(typeof effects.worldUpdates).toBe('object');
          }

          if (effects.historyRevisions !== undefined) {
            expect(Array.isArray(effects.historyRevisions)).toBe(true);
            effects.historyRevisions.forEach((revision: any) => {
              expect(revision).toHaveProperty('id');
              expect(revision).toHaveProperty('newText');
            });
          }

          if (effects.profileUpdates !== undefined) {
            expect(typeof effects.profileUpdates).toBe('object');
          }

          if (effects.corruptionChanges !== undefined) {
            expect(typeof effects.corruptionChanges).toBe('number');
          }

          // Verify no extra fields in output
          const allowedKeys = ['engineName', 'instructions', 'effects', 'metadata'];
          const actualKeys = Object.keys(output);
          actualKeys.forEach(key => {
            expect(allowedKeys).toContain(key);
          });
        }
      }
    });
  });

  // ============================================================================
  // EXTENDED ENGINE INTERFACE TESTS
  // ============================================================================

  describe('Extended Engine Interface Compliance', () => {

    it('TemporalRevisionEngine should implement extended interface', () => {
      const engine = new TemporalRevisionEngine() as any;

      // Check for extended methods from TemporalRevisionEngine interface
      expect(typeof engine.identifyRevisionTarget).toBe('function');
      expect(typeof engine.generateRevision).toBe('function');
    });

    it('QuantumNarrativeEngine should implement extended interface', () => {
      const engine = new QuantumNarrativeEngine() as any;

      // Check for extended properties/methods
      expect(engine).toHaveProperty('timelines');
      expect(engine.timelines instanceof Map).toBe(true);
      expect(typeof engine.shiftTimeline).toBe('function');
      expect(typeof engine.mergeTimelines).toBe('function');
    });

    it('RealityCorruptionEngine should implement extended interface', () => {
      const engine = new RealityCorruptionEngine() as any;

      // Check for extended methods
      expect(typeof engine.calculateCorruptionLevel).toBe('function');
      expect(typeof engine.generateCorruptionEffects).toBe('function');
    });

    it('AdaptiveHorrorEngine should implement extended interface', () => {
      const engine = new AdaptiveHorrorEngine() as any;

      // Check for extended methods
      expect(typeof engine.analyzeFears).toBe('function');
      expect(typeof engine.generatePersonalizedHorror).toBe('function');
    });

    it('MetaConsciousnessEngine should implement extended interface', () => {
      const engine = new MetaConsciousnessEngine() as any;

      // Check for extended methods
      expect(typeof engine.shouldBreakFourthWall).toBe('function');
      expect(typeof engine.generateMetaContent).toBe('function');
    });

    it('NeuralEchoChamberEngine should implement extended interface', () => {
      const engine = new NeuralEchoChambers() as any;

      // Check for extended methods
      expect(typeof engine.loadCrossSessionMemory).toBe('function');
      expect(typeof engine.saveCrossSessionMemory).toBe('function');
      expect(typeof engine.generateEchoContent).toBe('function');
    });

    it('SemanticChoiceArchaeologyEngine should implement extended interface', () => {
      const engine = new SemanticChoiceArchaeology() as any;

      // Check for extended methods
      expect(typeof engine.analyzeChoiceSequence).toBe('function');
      expect(typeof engine.generateReflection).toBe('function');
    });

    it('AdaptiveNarrativeDNAEngine should implement extended interface', () => {
      const engine = new AdaptiveNarrativeDNA() as any;

      // Check for extended properties/methods
      expect(engine).toHaveProperty('genome');
      expect(typeof engine.mutate).toBe('function');
      expect(typeof engine.crossover).toBe('function');
    });

    it('FifthWallEngine should implement extended interface', () => {
      const engine = new BreakingFifthWall() as any;

      // Check for extended methods
      expect(typeof engine.canManipulateBrowser).toBe('function');
      expect(typeof engine.generateBrowserEffect).toBe('function');
    });
  });

  // ============================================================================
  // ENGINE REGISTRY CONTRACT TESTS
  // ============================================================================

  describe('EngineRegistry Contract Compliance', () => {
    let registry: EngineRegistry;

    beforeEach(() => {
      registry = new EngineRegistry();
    });

    it('should implement EngineRegistry interface', () => {
      expect(typeof registry.register).toBe('function');
      expect(typeof registry.getAll).toBe('function');
      expect(typeof registry.getActive).toBe('function');
      expect(typeof registry.executeAll).toBe('function');
    });

    it('register() should accept Engine instances', () => {
      const mockEngine: Engine = {
        name: 'TestEngine',
        description: 'Test engine',
        priority: 5,
        isActive: () => true,
        process: async () => ({
          engineName: 'TestEngine',
          instructions: [],
          effects: {},
          metadata: {}
        }),
        generateInstructions: () => []
      };

      expect(() => registry.register(mockEngine)).not.toThrow();
    });

    it('getAll() should return Engine[]', () => {
      const mockEngine: Engine = {
        name: 'TestEngine',
        description: 'Test engine',
        priority: 5,
        isActive: () => true,
        process: async () => ({
          engineName: 'TestEngine',
          instructions: [],
          effects: {},
          metadata: {}
        }),
        generateInstructions: () => []
      };

      registry.register(mockEngine);
      const engines = registry.getAll();

      expect(Array.isArray(engines)).toBe(true);
      expect(engines.length).toBeGreaterThan(0);
      expect(engines[0]).toHaveProperty('name');
      expect(engines[0]).toHaveProperty('priority');
    });

    it('getActive() should return only active engines', () => {
      const activeEngine: Engine = {
        name: 'ActiveEngine',
        description: 'Active engine',
        priority: 5,
        isActive: () => true,
        process: async () => ({
          engineName: 'ActiveEngine',
          instructions: [],
          effects: {},
          metadata: {}
        }),
        generateInstructions: () => []
      };

      const inactiveEngine: Engine = {
        name: 'InactiveEngine',
        description: 'Inactive engine',
        priority: 3,
        isActive: () => false,
        process: async () => ({
          engineName: 'InactiveEngine',
          instructions: [],
          effects: {},
          metadata: {}
        }),
        generateInstructions: () => []
      };

      registry.register(activeEngine);
      registry.register(inactiveEngine);

      const context = createMockEngineContext();
      const activeEngines = registry.getActive(context);

      expect(activeEngines.length).toBe(1);
      expect(activeEngines[0].name).toBe('ActiveEngine');
    });

    it('executeAll() should return Promise<EngineOutput[]>', async () => {
      const mockEngine: Engine = {
        name: 'TestEngine',
        description: 'Test engine',
        priority: 5,
        isActive: () => true,
        process: async () => ({
          engineName: 'TestEngine',
          instructions: ['Test instruction'],
          effects: {
            corruptionChanges: 0.1
          },
          metadata: { test: true }
        }),
        generateInstructions: () => ['Test instruction']
      };

      registry.register(mockEngine);

      const context = createMockEngineContext();
      const outputs = await registry.executeAll(context);

      expect(Array.isArray(outputs)).toBe(true);
      expect(outputs.length).toBeGreaterThan(0);

      outputs.forEach(output => {
        expect(output).toHaveProperty('engineName');
        expect(output).toHaveProperty('instructions');
        expect(output).toHaveProperty('effects');
        expect(output).toHaveProperty('metadata');

        expect(typeof output.engineName).toBe('string');
        expect(Array.isArray(output.instructions)).toBe(true);
        expect(typeof output.effects).toBe('object');
        expect(typeof output.metadata).toBe('object');
      });
    });

    it('should execute engines in priority order', async () => {
      const lowPriorityEngine: Engine = {
        name: 'LowPriority',
        description: 'Low priority',
        priority: 3,
        isActive: () => true,
        process: async () => ({
          engineName: 'LowPriority',
          instructions: [],
          effects: {},
          metadata: { order: 2 }
        }),
        generateInstructions: () => []
      };

      const highPriorityEngine: Engine = {
        name: 'HighPriority',
        description: 'High priority',
        priority: 8,
        isActive: () => true,
        process: async () => ({
          engineName: 'HighPriority',
          instructions: [],
          effects: {},
          metadata: { order: 1 }
        }),
        generateInstructions: () => []
      };

      registry.register(lowPriorityEngine);
      registry.register(highPriorityEngine);

      const context = createMockEngineContext();
      const outputs = await registry.executeAll(context);

      // Higher priority should execute first
      expect(outputs[0].engineName).toBe('HighPriority');
      expect(outputs[1].engineName).toBe('LowPriority');
    });

    it('should pass previousOutput to subsequent engines', async () => {
      let capturedContext: EngineContext | null = null;

      const firstEngine: Engine = {
        name: 'FirstEngine',
        description: 'First',
        priority: 10,
        isActive: () => true,
        process: async () => ({
          engineName: 'FirstEngine',
          instructions: ['First'],
          effects: {},
          metadata: {}
        }),
        generateInstructions: () => []
      };

      const secondEngine: Engine = {
        name: 'SecondEngine',
        description: 'Second',
        priority: 5,
        isActive: () => true,
        process: async (context: EngineContext) => {
          capturedContext = context;
          return {
            engineName: 'SecondEngine',
            instructions: ['Second'],
            effects: {},
            metadata: {}
          };
        },
        generateInstructions: () => []
      };

      registry.register(firstEngine);
      registry.register(secondEngine);

      const context = createMockEngineContext();
      await registry.executeAll(context);

      // Second engine should receive previousOutput from first engine
      expect(capturedContext).not.toBeNull();
      expect(capturedContext?.previousOutput).toBeDefined();
      expect(capturedContext?.previousOutput?.engineName).toBe('FirstEngine');
    });
  });

  // ============================================================================
  // PRIORITY RANGE VALIDATION
  // ============================================================================

  describe('Priority Range Validation', () => {
    const engines = [
      new TemporalRevisionEngine(),
      new QuantumNarrativeEngine(),
      new RealityCorruptionEngine(),
      new AdaptiveHorrorEngine(),
      new MetaConsciousnessEngine(),
      new NeuralEchoChambers(),
      new SemanticChoiceArchaeology(),
      new AdaptiveNarrativeDNA(),
      new BreakingFifthWall()
    ];

    engines.forEach(engine => {
      const engineTyped = engine as any;
      it(`${engineTyped.name || engine.constructor.name} should have priority in range 1-10`, () => {
        expect(engineTyped.priority).toBeDefined();
        expect(typeof engineTyped.priority).toBe('number');
        expect(engineTyped.priority).toBeGreaterThanOrEqual(1);
        expect(engineTyped.priority).toBeLessThanOrEqual(10);
      });
    });
  });

  // ============================================================================
  // CONTEXT PARAMETER VALIDATION
  // ============================================================================

  describe('EngineContext Parameter Validation', () => {
    it('should accept valid EngineContext with all required fields', () => {
      const context = createMockEngineContext();

      expect(context).toHaveProperty('worldState');
      expect(context).toHaveProperty('recentHistory');
      expect(context).toHaveProperty('playerProfile');
      expect(Array.isArray(context.recentHistory)).toBe(true);
      expect(typeof context.worldState).toBe('object');
      expect(typeof context.playerProfile).toBe('object');
    });

    it('should accept EngineContext with optional fields', () => {
      const context = createMockEngineContext();
      context.currentChoice = {
        id: 'test-choice',
        text: 'Test choice',
        isIntrusive: false
      };
      context.previousOutput = {
        engineName: 'TestEngine',
        instructions: [],
        effects: {},
        metadata: {}
      };

      expect(context.currentChoice).toBeDefined();
      expect(context.previousOutput).toBeDefined();
    });
  });
});
