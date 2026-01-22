/**
 * Contract Tests: Flows (Seam #6)
 *
 * Validates that Flow implementations comply with the interface contracts
 * defined in src/core/types/seams.ts (lines 455-493).
 *
 * These tests verify structure and type compliance, NOT behavior.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type {
  GameFlow,
  FlowResult,
  FlowContext,
  GameState,
  Choice,
  GenreConfig,
  WorldState,
  StorySegment,
  PlayerProfile,
} from '../../src/core/types/seams';
import { DescentFlowImpl, descentFlow } from '../../src/flows/DescentFlow';
import { UnravelingFlowImpl, unravelingFlow } from '../../src/flows/UnravelingFlow';
import { FlowCoordinatorImpl, flowCoordinator } from '../../src/flows/FlowCoordinator';
import { useWorldStateStore } from '../../src/stores/worldStateStore';
import { useGameStateStore } from '../../src/stores/gameStateStore';
import { useStoryHistoryStore } from '../../src/stores/storyHistoryStore';

// Mock AI and command services
vi.mock('../../src/services/ai/unifiedAIService', () => ({
  generateWithSelectedModel: vi.fn().mockResolvedValue([
    {
      type: 'displayText',
      payload: { content: 'Test response', segmentId: 'test-1' },
    },
  ]),
}));

vi.mock('../../src/services/commandExecutor', () => ({
  executeCommandQueue: vi.fn().mockResolvedValue([]),
}));

// Mock engine classes
vi.mock('../../src/core/engines', () => {
  class MockEngine {
    name = 'Mock';
    isActive() { return false; }
    generateInstructions() { return []; }
    process() { return Promise.resolve({ engineName: this.name, instructions: [], effects: {}, metadata: {} }); }
  }

  const mockRegistry = {
    engines: new Map(),
    register(engine: any) { this.engines.set(engine.name, engine); },
    getAll() { return Array.from(this.engines.values()); },
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
    TemporalRevisionEngine: class extends MockEngine { name = 'TemporalRevision'; },
    MetaConsciousnessEngine: class extends MockEngine { name = 'MetaConsciousness'; },
    QuantumNarrativeEngine: class extends MockEngine { name = 'QuantumNarrative'; },
    AdaptiveHorrorEngine: class extends MockEngine { name = 'AdaptiveHorror'; isActive() { return true; } generateInstructions() { return ['Test']; } },
    RealityCorruptionEngine: class extends MockEngine { name = 'RealityCorruption'; isActive() { return true; } generateInstructions() { return ['Test']; } },
    NeuralEchoChamberEngine: class extends MockEngine { name = 'NeuralEcho'; },
    SemanticChoiceArchaeologyEngine: class extends MockEngine { name = 'SemanticArchaeology'; },
    AdaptiveNarrativeDNAEngine: class extends MockEngine { name = 'NarrativeDNA'; },
    FifthWallEngine: class extends MockEngine { name = 'FifthWall'; },
    globalEngineRegistry: mockRegistry,
  };
});

// Helper: Create mock genre
function createMockGenre(): GenreConfig {
  return {
    id: 'test-genre',
    name: 'Test Genre',
    description: 'Test description',
    systemPrompt: 'Test system prompt',
    themes: ['test'],
    fearCategories: ['test'],
    visualStyle: {
      primaryColor: '#000000',
      secondaryColor: '#FFFFFF',
      accentColor: '#FF0000',
      fontFamily: 'monospace',
      atmosphere: 'dark',
    },
  };
}

// Helper: Create mock choice
function createMockChoice(): Choice {
  return {
    id: 'test-choice-1',
    text: 'Test choice text',
    isIntrusive: false,
    psychologicalWeight: 5,
  };
}

// Helper: Create mock player profile
function createMockPlayerProfile(): PlayerProfile {
  return {
    fearProfile: {
      claustrophobia: 0.5,
      isolation: 0.5,
      bodyHorror: 0.5,
      cosmicInsignificance: 0.5,
      lossOfControl: 0.5,
      madness: 0.5,
    },
    choicePatterns: {
      riskTaking: 0.5,
      curiosity: 0.5,
      aggression: 0.5,
      avoidance: 0.5,
    },
    engagementMetrics: {
      totalChoices: 0,
      averageResponseTime: 0,
      sessionDuration: 0,
    },
  };
}

// Helper: Create mock flow context
function createMockFlowContext(): FlowContext {
  const worldState: WorldState = useWorldStateStore.getState().worldState;
  const recentHistory: StorySegment[] = useStoryHistoryStore.getState().storyHistory.slice(-5);
  const playerProfile: PlayerProfile = createMockPlayerProfile();
  const currentChoice = createMockChoice();

  return {
    worldState,
    recentHistory,
    playerProfile,
    currentChoice,
  };
}

describe('Contract Tests: Flows (Seam #6)', () => {
  beforeEach(() => {
    // Reset all stores
    useGameStateStore.getState().reset();
    useWorldStateStore.getState().reset();
    useStoryHistoryStore.getState().reset();
  });

  describe('DescentFlow Interface Compliance', () => {
    const flow = new DescentFlowImpl();

    it('implements GameFlow interface', () => {
      // Verify required properties
      expect(flow).toHaveProperty('name');
      expect(typeof flow.name).toBe('string');

      // Verify required methods
      expect(typeof flow.initialize).toBe('function');
      expect(typeof flow.processChoice).toBe('function');
      expect(typeof flow.shouldTransition).toBe('function');
    });

    it('implements DescentFlow extended interface', () => {
      // DescentFlow-specific methods
      expect(typeof flow.calculateDescentLevel).toBe('function');
      expect(typeof flow.shouldBeginUnraveling).toBe('function');
    });

    it('name property is readonly string', () => {
      expect(flow.name).toBe('Descent');
      expect(typeof flow.name).toBe('string');

      // Verify it's a property, not a method
      expect(typeof (flow as any).name).not.toBe('function');
    });

    it('initialize accepts GenreConfig and returns Promise<void>', async () => {
      const genre = createMockGenre();
      const result = flow.initialize(genre);

      // Verify it returns a Promise
      expect(result).toBeInstanceOf(Promise);

      // Verify the promise resolves to undefined
      await expect(result).resolves.toBeUndefined();
    });

    it('processChoice accepts Choice and returns Promise<FlowResult>', async () => {
      const choice = createMockChoice();
      const result = await flow.processChoice(choice);

      // Verify FlowResult shape
      expect(result).toHaveProperty('commands');
      expect(result).toHaveProperty('worldUpdates');

      // Verify types
      expect(Array.isArray(result.commands)).toBe(true);
      expect(typeof result.worldUpdates).toBe('object');
      expect(result.worldUpdates).not.toBeNull();

      // Optional fields
      if (result.nextState !== undefined) {
        expect(typeof result.nextState).toBe('string');
      }
      if (result.error !== undefined) {
        expect(typeof result.error).toBe('string');
      }

      // Verify no extra fields beyond interface contract
      const validKeys = ['commands', 'worldUpdates', 'nextState', 'error'];
      Object.keys(result).forEach((key) => {
        expect(validKeys).toContain(key);
      });
    });

    it('shouldTransition returns GameState or null', () => {
      const context = createMockFlowContext();
      const result = flow.shouldTransition(context);

      // Should return null or a valid GameState string
      if (result !== null) {
        expect(typeof result).toBe('string');
        const validStates = ['menu', 'generating', 'descending', 'unraveling', 'collapsed'];
        expect(validStates).toContain(result);
      }
    });

    it('calculateDescentLevel returns number', () => {
      const result = flow.calculateDescentLevel();
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    it('shouldBeginUnraveling returns boolean', () => {
      const result = flow.shouldBeginUnraveling();
      expect(typeof result).toBe('boolean');
    });

    it('singleton instance exports correct type', () => {
      expect(descentFlow).toBeInstanceOf(DescentFlowImpl);
      expect(descentFlow.name).toBe('Descent');
    });
  });

  describe('UnravelingFlow Interface Compliance', () => {
    const flow = new UnravelingFlowImpl();

    it('implements GameFlow interface', () => {
      expect(flow).toHaveProperty('name');
      expect(typeof flow.name).toBe('string');

      expect(typeof flow.initialize).toBe('function');
      expect(typeof flow.processChoice).toBe('function');
      expect(typeof flow.shouldTransition).toBe('function');
    });

    it('implements UnravelingFlow extended interface', () => {
      expect(typeof flow.calculateUnravelingLevel).toBe('function');
      expect(typeof flow.shouldCollapse).toBe('function');
      expect(typeof flow.generateCollapseEffect).toBe('function');
    });

    it('name property is readonly string', () => {
      expect(flow.name).toBe('Unraveling');
      expect(typeof flow.name).toBe('string');
    });

    it('initialize accepts GenreConfig and returns Promise<void>', async () => {
      const genre = createMockGenre();
      const result = flow.initialize(genre);

      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBeUndefined();
    });

    it('processChoice returns Promise<FlowResult>', async () => {
      const choice = createMockChoice();
      const result = await flow.processChoice(choice);

      // Verify FlowResult contract
      expect(result).toHaveProperty('commands');
      expect(result).toHaveProperty('worldUpdates');
      expect(Array.isArray(result.commands)).toBe(true);
      expect(typeof result.worldUpdates).toBe('object');

      // Verify no extra fields
      const validKeys = ['commands', 'worldUpdates', 'nextState', 'error'];
      Object.keys(result).forEach((key) => {
        expect(validKeys).toContain(key);
      });
    });

    it('shouldTransition returns GameState or null', () => {
      const context = createMockFlowContext();
      const result = flow.shouldTransition(context);

      if (result !== null) {
        expect(typeof result).toBe('string');
      }
    });

    it('calculateUnravelingLevel returns number', () => {
      const result = flow.calculateUnravelingLevel();
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    it('shouldCollapse returns boolean', () => {
      const result = flow.shouldCollapse();
      expect(typeof result).toBe('boolean');
    });

    it('generateCollapseEffect returns BrowserEffect array', () => {
      const result = flow.generateCollapseEffect();
      expect(Array.isArray(result)).toBe(true);

      // Verify each effect has correct shape
      result.forEach((effect) => {
        expect(effect).toHaveProperty('type');
        expect(typeof effect.type).toBe('string');

        const validTypes = ['changeTitle', 'openTab', 'manipulateHistory', 'vibrate'];
        expect(validTypes).toContain(effect.type);

        if (effect.value !== undefined) {
          expect(typeof effect.value).toBe('string');
        }
      });
    });

    it('singleton instance exports correct type', () => {
      expect(unravelingFlow).toBeInstanceOf(UnravelingFlowImpl);
      expect(unravelingFlow.name).toBe('Unraveling');
    });
  });

  describe('FlowCoordinator Contract', () => {
    const coordinator = new FlowCoordinatorImpl();

    it('implements FlowCoordinator interface', () => {
      expect(typeof coordinator.getCurrentFlow).toBe('function');
      expect(typeof coordinator.transitionTo).toBe('function');
      expect(typeof coordinator.executeEngines).toBe('function');
      expect(typeof coordinator.executeCommands).toBe('function');
    });

    it('getCurrentFlow returns GameFlow', () => {
      const flow = coordinator.getCurrentFlow();

      // Verify it implements GameFlow interface
      expect(flow).toHaveProperty('name');
      expect(typeof flow.name).toBe('string');
      expect(typeof flow.initialize).toBe('function');
      expect(typeof flow.processChoice).toBe('function');
      expect(typeof flow.shouldTransition).toBe('function');
    });

    it('transitionTo accepts GameState and returns Promise<void>', async () => {
      const result = coordinator.transitionTo('descending' as GameState);

      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBeUndefined();
    });

    it('executeEngines returns Promise<EngineOutput[]>', async () => {
      const context = createMockFlowContext();
      const result = await coordinator.executeEngines(context);

      expect(Array.isArray(result)).toBe(true);

      // Verify each output has correct shape
      result.forEach((output) => {
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

    it('executeCommands returns Promise<ExecutionResult[]>', async () => {
      const commands = [
        {
          type: 'displayText' as const,
          payload: { content: 'Test', segmentId: 'test-1' },
        },
      ];

      const result = await coordinator.executeCommands(commands);

      expect(Array.isArray(result)).toBe(true);

      // Verify each result has correct shape
      result.forEach((execResult) => {
        expect(execResult).toHaveProperty('success');
        expect(typeof execResult.success).toBe('boolean');

        if (execResult.error !== undefined) {
          expect(typeof execResult.error).toBe('string');
        }
      });
    });

    it('singleton instance exports correct type', () => {
      expect(flowCoordinator).toBeInstanceOf(FlowCoordinatorImpl);
    });
  });

  describe('Cross-Flow Interface Consistency', () => {
    it('both flows implement same GameFlow base interface', () => {
      const descent = new DescentFlowImpl();
      const unraveling = new UnravelingFlowImpl();

      // Both should have the same base interface
      const descentKeys = Object.getOwnPropertyNames(Object.getPrototypeOf(descent)).filter(
        (key) => typeof (descent as any)[key] === 'function' && key !== 'constructor'
      );
      const unravelingKeys = Object.getOwnPropertyNames(Object.getPrototypeOf(unraveling)).filter(
        (key) => typeof (unraveling as any)[key] === 'function' && key !== 'constructor'
      );

      // Base GameFlow methods should be present in both
      const baseGameFlowMethods = ['initialize', 'processChoice', 'shouldTransition'];
      baseGameFlowMethods.forEach((method) => {
        expect(descentKeys).toContain(method);
        expect(unravelingKeys).toContain(method);
      });
    });

    it('flows can be used interchangeably through GameFlow interface', async () => {
      const flows: GameFlow[] = [new DescentFlowImpl(), new UnravelingFlowImpl()];

      for (const flow of flows) {
        // Should be able to call GameFlow methods on any flow
        expect(typeof flow.name).toBe('string');

        const genre = createMockGenre();
        await expect(flow.initialize(genre)).resolves.toBeUndefined();

        const choice = createMockChoice();
        const result = await flow.processChoice(choice);
        expect(result).toHaveProperty('commands');
        expect(result).toHaveProperty('worldUpdates');

        const context = createMockFlowContext();
        const transition = flow.shouldTransition(context);
        expect(transition === null || typeof transition === 'string').toBe(true);
      }
    });
  });
});
