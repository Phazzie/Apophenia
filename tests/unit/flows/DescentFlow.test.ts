/**
 * DescentFlow Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DescentFlowImpl } from '../../../src/flows/DescentFlow';
import { useGameStateStore } from '../../../src/core/state/gameStateStore';
import { useWorldStateStore } from '../../../src/core/state/worldStateStore';
import { useHistoryStore } from '../../../src/core/state/historyStore';
import { GameState } from '../../../src/core/types/seams';

// Mock the AI service
vi.mock('../../../src/services/ai/unifiedAIService', () => ({
  generateWithSelectedModel: vi.fn().mockResolvedValue([
    {
      type: 'displayText',
      payload: { content: 'Test response', segmentId: 'test-1' },
    },
  ]),
}));

// Mock the command executor
vi.mock('../../../src/services/commandExecutor', () => ({
  executeCommandQueue: vi.fn().mockResolvedValue([]),
}));

// Mock the engine classes
vi.mock('../../../src/core/engines', () => {
  class MockEngine {
    name = 'Mock';
    isActive() { return false; }
    generateInstructions() { return []; }
    process() { return Promise.resolve({ engineName: this.name, instructions: [], effects: {}, metadata: {} }); }
  }

  const mockRegistry = {
    engines: new Map(),
    register(engine: any) { this.engines.set(engine.name, engine); },
    async executeAll(context: any) {
      const outputs = [];
      for (const engine of this.engines.values()) {
        if (engine.isActive(context)) {
          outputs.push(await engine.process(context));
        }
      }
      return outputs;
    }
  };

  return {
    TemporalRevisionEngine: class extends MockEngine { name = 'TemporalRevision'; generateInstructions() { return ['Revise past events']; } },
    MetaConsciousnessEngine: class extends MockEngine { name = 'MetaConsciousness'; },
    QuantumNarrativeEngine: class extends MockEngine { name = 'QuantumNarrative'; },
    AdaptiveHorrorEngine: class extends MockEngine { name = 'AdaptiveHorror'; isActive() { return true; } generateInstructions() { return ['Increase horror based on fears']; } },
    RealityCorruptionEngine: class extends MockEngine { name = 'RealityCorruption'; isActive() { return true; } generateInstructions() { return ['Apply visual corruption']; } },
    NeuralEchoChamberEngine: class extends MockEngine { name = 'NeuralEcho'; },
    SemanticChoiceArchaeologyEngine: class extends MockEngine { name = 'SemanticArchaeology'; },
    AdaptiveNarrativeDNAEngine: class extends MockEngine { name = 'NarrativeDNA'; },
    FifthWallEngine: class extends MockEngine { name = 'FifthWall'; },
    globalEngineRegistry: mockRegistry,
  };
});

describe('DescentFlow', () => {
  let flow: DescentFlowImpl;

  beforeEach(() => {
    flow = new DescentFlowImpl();

    // Reset stores
    useGameStateStore.getState().reset();
    useWorldStateStore.getState().reset();
    useHistoryStore.getState().reset();
  });

  describe('initialize', () => {
    it('should initialize with a genre config', async () => {
      const genre = {
        id: 'cosmic-horror',
        name: 'Cosmic Horror',
        description: 'Test description',
        systemPrompt: 'Test prompt',
        themes: ['void', 'madness'],
        fearCategories: ['cosmic', 'existential'],
        visualStyle: {
          primaryColor: '#000000',
          secondaryColor: '#FFFFFF',
          accentColor: '#FF0000',
          fontFamily: 'monospace',
          atmosphere: 'dark' as const,
        },
      };

      await flow.initialize(genre);

      const worldState = useWorldStateStore.getState().worldState;

      expect(worldState.genreConfig.id).toBe('cosmic-horror');
      expect(worldState.horrorIntensity).toBe(1);
      expect(worldState.systemHealth).toBe(100);
    });
  });

  describe('calculateDescentLevel', () => {
    it('should return 0 for initial state', () => {
      const level = flow.calculateDescentLevel();
      expect(level).toBe(0);
    });

    it('should calculate based on horror intensity', () => {
      const worldStateStore = useWorldStateStore.getState();

      worldStateStore.updateWorldState({
        horrorIntensity: 5, // 50% of max
      });

      const level = flow.calculateDescentLevel();

      // 50% horror intensity should give 30% descent (max 60% from horror)
      expect(level).toBeGreaterThan(0);
      expect(level).toBeLessThanOrEqual(60);
    });

    it('should calculate based on corruption level', () => {
      const worldStateStore = useWorldStateStore.getState();

      worldStateStore.updateWorldState({
        corruptionLevel: 100, // Max corruption (0-100)
      });

      const level = flow.calculateDescentLevel();

      // Max corruption (100) should contribute 40% to descent
      expect(level).toBeGreaterThan(0);
      expect(level).toBeLessThanOrEqual(40);
    });
  });

  describe('shouldBeginUnraveling', () => {
    it('should return false for low descent levels', () => {
      expect(flow.shouldBeginUnraveling()).toBe(false);
    });

    it('should return true when descent level exceeds 70%', () => {
      const worldStateStore = useWorldStateStore.getState();

      worldStateStore.updateWorldState({
        horrorIntensity: 10, // Max horror (60% of descent)
        corruptionLevel: 100, // Max corruption (40% of descent)
      });

      const shouldUnravel = flow.shouldBeginUnraveling();

      // Max horror (60%) + max corruption (40%) = 100% > 70%
      expect(shouldUnravel).toBe(true);
    });
  });

  describe('processChoice', () => {
    it('should process a choice and return FlowResult', async () => {
      const choice = {
        id: 'choice-1',
        text: 'Test choice',
        isIntrusive: false,
      };

      const result = await flow.processChoice(choice);

      expect(result).toBeDefined();
      expect(result.commands).toBeDefined();
      expect(result.worldUpdates).toBeDefined();
      expect(Array.isArray(result.commands)).toBe(true);
    });

    it('should transition to unraveling when descent level is high', async () => {
      const worldStateStore = useWorldStateStore.getState();

      // Set high horror and corruption to exceed 70% threshold
      worldStateStore.updateWorldState({
        horrorIntensity: 10, // Max horror (60% of descent)
        corruptionLevel: 100, // Max corruption (40% of descent)
      });

      const choice = {
        id: 'choice-1',
        text: 'Test choice',
        isIntrusive: false,
      };

      const result = await flow.processChoice(choice);

      expect(result.nextState).toBe(GameState.UNRAVELING);
    });

    it('should handle errors gracefully', async () => {
      // Force an error by mocking a failure
      const { generateWithSelectedModel } = await import('../../../src/services/ai/unifiedAIService');
      vi.mocked(generateWithSelectedModel).mockRejectedValueOnce(new Error('AI service failed'));

      const choice = {
        id: 'choice-1',
        text: 'Test choice',
        isIntrusive: false,
      };

      const result = await flow.processChoice(choice);

      expect(result.error).toBeDefined();
      expect(result.commands).toEqual([]);
    });
  });
});
