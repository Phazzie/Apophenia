/**
 * COMPREHENSIVE ENGINE TESTS
 * Tests all 9 revolutionary engines
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  TemporalRevisionEngine,
  QuantumNarrativeEngine,
  RealityCorruptionEngine,
  AdaptiveHorrorEngine,
  MetaConsciousnessEngine,
  NeuralEchoChamberEngine,
  SemanticChoiceArchaeologyEngine,
  AdaptiveNarrativeDNAEngine,
  FifthWallEngine,
  EngineRegistry,
  initializeEngineRegistry
} from '../../../src/core/engines';
import {
  createMockEngineContext,
  createHighHorrorContext,
  createLowHorrorContext,
  createMockStorySegment,
  createMockWorldState,
  createMockPlayerProfile
} from './testHelpers';

describe('Engine Implementation Tests', () => {
  describe('TemporalRevisionEngine', () => {
    let engine: TemporalRevisionEngine;

    beforeEach(() => {
      engine = new TemporalRevisionEngine();
    });

    it('implements Engine interface correctly', () => {
      expect(engine.name).toBe('TemporalRevision');
      expect(engine.description).toBeDefined();
      expect(engine.priority).toBe(8);
      expect(typeof engine.isActive).toBe('function');
      expect(typeof engine.process).toBe('function');
      expect(typeof engine.generateInstructions).toBe('function');
    });

    it('is not active with low horror', () => {
      const context = createLowHorrorContext();
      expect(engine.isActive(context)).toBe(false);
    });

    it('is active with high horror and sufficient history', () => {
      const context = createHighHorrorContext();
      expect(engine.isActive(context)).toBe(false); // Still false because choices < 5

      const contextWithChoices = {
        ...context,
        playerProfile: {
          ...context.playerProfile,
          engagementMetrics: {
            ...context.playerProfile.engagementMetrics,
            totalChoices: 10
          }
        }
      };
      expect(engine.isActive(contextWithChoices)).toBe(true);
    });

    it('generates instructions based on horror level', () => {
      const lowContext = createLowHorrorContext();
      const highContext = createHighHorrorContext();

      const lowInstructions = engine.generateInstructions(lowContext);
      const highInstructions = engine.generateInstructions(highContext);

      expect(lowInstructions.length).toBeGreaterThan(0);
      expect(highInstructions.length).toBeGreaterThan(lowInstructions.length);
    });

    it('processes context and returns valid output', async () => {
      const context = createHighHorrorContext();
      const output = await engine.process(context);

      expect(output.engineName).toBe('TemporalRevision');
      expect(Array.isArray(output.instructions)).toBe(true);
      expect(output.effects).toBeDefined();
      expect(output.metadata).toBeDefined();
    });
  });

  describe('QuantumNarrativeEngine', () => {
    let engine: QuantumNarrativeEngine;

    beforeEach(() => {
      engine = new QuantumNarrativeEngine();
    });

    it('implements Engine interface correctly', () => {
      expect(engine.name).toBe('QuantumNarrative');
      expect(engine.priority).toBe(7);
      expect(engine.timelines).toBeInstanceOf(Map);
    });

    it('manages timelines correctly', () => {
      const context = createHighHorrorContext();
      const timelineId = engine.shiftTimeline(context);

      expect(typeof timelineId).toBe('string');
      expect(engine.timelines.has(timelineId)).toBe(true);
    });

    it('merges timelines', () => {
      const context = createHighHorrorContext();

      // Create two timelines
      const timeline1 = engine.shiftTimeline(context);
      const timeline2 = engine.shiftTimeline(context);

      // Merge them
      const mergedState = engine.mergeTimelines(timeline1, timeline2);

      expect(mergedState).toBeDefined();
      expect(mergedState.summary).toContain('MERGED');
    });
  });

  describe('RealityCorruptionEngine', () => {
    let engine: RealityCorruptionEngine;

    beforeEach(() => {
      engine = new RealityCorruptionEngine();
    });

    it('implements Engine interface correctly', () => {
      expect(engine.name).toBe('RealityCorruption');
      expect(engine.priority).toBe(6);
    });

    it('calculates corruption level correctly', () => {
      const lowContext = createLowHorrorContext();
      const highContext = createHighHorrorContext();

      const lowCorruption = engine.calculateCorruptionLevel(lowContext);
      const highCorruption = engine.calculateCorruptionLevel(highContext);

      expect(highCorruption).toBeGreaterThan(lowCorruption);
      expect(highCorruption).toBeLessThanOrEqual(100);
    });

    it('generates corruption effects', () => {
      const effects50 = engine.generateCorruptionEffects(50);
      const effects90 = engine.generateCorruptionEffects(90);

      expect(effects50.length).toBeGreaterThan(0);
      expect(effects90.length).toBeGreaterThan(effects50.length);
    });
  });

  describe('AdaptiveHorrorEngine', () => {
    let engine: AdaptiveHorrorEngine;

    beforeEach(() => {
      engine = new AdaptiveHorrorEngine();
    });

    it('implements Engine interface correctly', () => {
      expect(engine.name).toBe('AdaptiveHorror');
      expect(engine.priority).toBe(9);
    });

    it('analyzes fears correctly', () => {
      const profile = createMockPlayerProfile({
        fearProfile: {
          claustrophobia: 0.8,
          isolation: 0.6,
          bodyHorror: 0.3,
          cosmicInsignificance: 0.9,
          lossOfControl: 0.5,
          madness: 0.7
        }
      });

      const fears = engine.analyzeFears(profile);

      expect(fears.size).toBeGreaterThan(0);
      expect(fears.get('cosmicInsignificance')).toBeGreaterThanOrEqual(0.9);
    });

    it('generates personalized horror', () => {
      const fears = new Map([
        ['claustrophobia', 0.8],
        ['madness', 0.9]
      ]);

      const instructions = engine.generatePersonalizedHorror(fears);

      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions.some(i => i.toLowerCase().includes('confined') || i.toLowerCase().includes('space'))).toBe(true);
    });
  });

  describe('MetaConsciousnessEngine', () => {
    let engine: MetaConsciousnessEngine;

    beforeEach(() => {
      engine = new MetaConsciousnessEngine();
    });

    it('implements Engine interface correctly', () => {
      expect(engine.name).toBe('MetaConsciousness');
      expect(engine.priority).toBe(5);
    });

    it('is not active with low horror and corruption', () => {
      const context = createLowHorrorContext();
      expect(engine.isActive(context)).toBe(false);
    });

    it('generates meta content when active', () => {
      const context = createHighHorrorContext();
      const metaContent = engine.generateMetaContent(context);

      expect(typeof metaContent).toBe('string');
      expect(metaContent.length).toBeGreaterThan(0);
    });
  });

  describe('NeuralEchoChamberEngine', () => {
    let engine: NeuralEchoChamberEngine;

    beforeEach(() => {
      engine = new NeuralEchoChamberEngine();
      // Clear localStorage before each test
      localStorage.clear();
    });

    it('implements Engine interface correctly', () => {
      expect(engine.name).toBe('NeuralEchoChamber');
      expect(engine.priority).toBe(4);
    });

    it('saves and loads cross-session memory', () => {
      const profile = createMockPlayerProfile({
        fearProfile: {
          claustrophobia: 0.7,
          madness: 0.8
        }
      });

      engine.saveCrossSessionMemory(profile);
      const loaded = engine.loadCrossSessionMemory();

      expect(loaded).not.toBeNull();
      expect(loaded!.fearProfile.claustrophobia).toBe(0.7);
      expect(loaded!.fearProfile.madness).toBe(0.8);
    });
  });

  describe('SemanticChoiceArchaeologyEngine', () => {
    let engine: SemanticChoiceArchaeologyEngine;

    beforeEach(() => {
      engine = new SemanticChoiceArchaeologyEngine();
    });

    it('implements Engine interface correctly', () => {
      expect(engine.name).toBe('SemanticChoiceArchaeology');
      expect(engine.priority).toBe(3);
    });

    it('analyzes choice patterns', () => {
      const choices = [
        { id: '1', text: 'Attack the enemy' },
        { id: '2', text: 'Fight back' },
        { id: '3', text: 'Destroy the obstacle' }
      ];

      const analysis = engine.analyzeChoiceSequence(choices);

      expect(analysis.dominantPattern).toBe('violence');
      expect(analysis.subconscious.length).toBeGreaterThan(0);
      expect(analysis.interpretation).toBeDefined();
    });
  });

  describe('AdaptiveNarrativeDNAEngine', () => {
    let engine: AdaptiveNarrativeDNAEngine;

    beforeEach(() => {
      engine = new AdaptiveNarrativeDNAEngine();
    });

    it('implements Engine interface correctly', () => {
      expect(engine.name).toBe('AdaptiveNarrativeDNA');
      expect(engine.priority).toBe(2);
      expect(engine.genome).toBeDefined();
    });

    it('mutates narrative genome', () => {
      const context = createHighHorrorContext();
      const originalGenome = { ...engine.genome };
      const mutatedGenome = engine.mutate(context);

      expect(mutatedGenome).toBeDefined();
      expect(mutatedGenome.themes).toBeDefined();
    });

    it('performs crossover between genomes', () => {
      const genome1 = {
        themes: ['isolation', 'decay'],
        mutations: 2,
        generation: 1
      };
      const genome2 = {
        themes: ['madness', 'corruption'],
        mutations: 3,
        generation: 2
      };

      const crossed = engine.crossover(genome1, genome2);

      expect(crossed.themes.length).toBeGreaterThan(0);
      expect(crossed.generation).toBe(3);
    });
  });

  describe('FifthWallEngine', () => {
    let engine: FifthWallEngine;

    beforeEach(() => {
      engine = new FifthWallEngine();
    });

    it('implements Engine interface correctly', () => {
      expect(engine.name).toBe('FifthWall');
      expect(engine.priority).toBe(1);
    });

    it('only allows browser manipulation at high corruption', () => {
      const lowContext = createLowHorrorContext();
      const highContext = createHighHorrorContext();

      expect(engine.canManipulateBrowser(lowContext)).toBe(false);
      expect(engine.canManipulateBrowser(highContext)).toBe(true);
    });

    it('generates safe browser effects', () => {
      const context = createHighHorrorContext();
      const effect = engine.generateBrowserEffect(context);

      expect(effect).toBeDefined();
      expect(effect.type).toBeDefined();
      expect(['changeTitle', 'openTab', 'manipulateHistory', 'vibrate'].includes(effect.type)).toBe(true);
    });
  });

  describe('EngineRegistry', () => {
    let registry: EngineRegistry;

    beforeEach(() => {
      registry = new EngineRegistry();
    });

    it('registers engines correctly', () => {
      const engine = new TemporalRevisionEngine();
      registry.register(engine);

      expect(registry.has('TemporalRevision')).toBe(true);
      expect(registry.getByName('TemporalRevision')).toBe(engine);
    });

    it('sorts engines by priority', () => {
      registry.register(new FifthWallEngine()); // Priority 1
      registry.register(new AdaptiveHorrorEngine()); // Priority 9
      registry.register(new RealityCorruptionEngine()); // Priority 6

      const all = registry.getAll();
      expect(all[0].priority).toBe(9); // Highest first
      expect(all[all.length - 1].priority).toBe(1); // Lowest last
    });

    it('gets only active engines', () => {
      registry.register(new TemporalRevisionEngine());
      registry.register(new AdaptiveHorrorEngine());

      const lowContext = createLowHorrorContext();
      const active = registry.getActive(lowContext);

      // Only some engines should be active with low horror
      expect(active.length).toBeLessThan(registry.getAll().length);
    });

    it('executes all active engines', async () => {
      registry.register(new RealityCorruptionEngine());
      registry.register(new AdaptiveHorrorEngine());

      const context = createMockEngineContext({
        worldState: createMockWorldState({ horrorIntensity: 3 }),
        playerProfile: createMockPlayerProfile({
          engagementMetrics: {
            totalChoices: 3,
            averageResponseTime: 1000,
            sessionDuration: 10000
          }
        })
      });

      const outputs = await registry.executeAll(context);

      expect(Array.isArray(outputs)).toBe(true);
      outputs.forEach(output => {
        expect(output.engineName).toBeDefined();
        expect(Array.isArray(output.instructions)).toBe(true);
        expect(output.effects).toBeDefined();
      });
    });
  });

  describe('initializeEngineRegistry', () => {
    it('creates registry with all engines', () => {
      const registry = initializeEngineRegistry();

      expect(registry.getAll().length).toBe(9);
      expect(registry.has('TemporalRevision')).toBe(true);
      expect(registry.has('QuantumNarrative')).toBe(true);
      expect(registry.has('RealityCorruption')).toBe(true);
      expect(registry.has('AdaptiveHorror')).toBe(true);
      expect(registry.has('MetaConsciousness')).toBe(true);
      expect(registry.has('NeuralEchoChamber')).toBe(true);
      expect(registry.has('SemanticChoiceArchaeology')).toBe(true);
      expect(registry.has('AdaptiveNarrativeDNA')).toBe(true);
      expect(registry.has('FifthWall')).toBe(true);
    });
  });
});
