/**
 * FlowCoordinator Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FlowCoordinatorImpl } from '../../../src/flows/FlowCoordinator';
import { useGameStateStore } from '../../../src/stores/gameStateStore';
import { useWorldStateStore } from '../../../src/stores/worldStateStore';
import { GameState as SeamsGameState } from '../../../src/core/types/seams';
import { GameState } from '../../../src/types';

// Mock the AI service
vi.mock('../../../src/services/ai/unifiedAIService', () => ({
  generateWithSelectedModel: vi.fn().mockResolvedValue([]),
}));

// Mock the command executor
vi.mock('../../../src/services/commandExecutor', () => ({
  executeCommandQueue: vi.fn().mockResolvedValue([]),
}));

// Mock the engine classes
vi.mock('../../../src/core/engines', () => ({
  TemporalRevisionEngine: class {
    name = 'TemporalRevision';
    isActive() { return false; }
    generateInstructions() { return []; }
    process() { return Promise.resolve({ engineName: 'TemporalRevision', instructions: [], effects: {}, metadata: {} }); }
  },
  MetaConsciousnessEngine: class {
    name = 'MetaConsciousness';
    isActive() { return false; }
    generateInstructions() { return []; }
    process() { return Promise.resolve({ engineName: 'MetaConsciousness', instructions: [], effects: {}, metadata: {} }); }
  },
  QuantumNarrativeEngine: class {
    name = 'QuantumNarrative';
    isActive() { return false; }
    generateInstructions() { return []; }
    process() { return Promise.resolve({ engineName: 'QuantumNarrative', instructions: [], effects: {}, metadata: {} }); }
  },
  AdaptiveHorrorEngine: class {
    name = 'AdaptiveHorror';
    isActive() { return true; }
    generateInstructions() { return ['Test instruction']; }
    process() { return Promise.resolve({ engineName: 'AdaptiveHorror', instructions: ['Test instruction'], effects: {}, metadata: {} }); }
  },
  RealityCorruptionEngine: class {
    name = 'RealityCorruption';
    isActive() { return true; }
    generateInstructions() { return ['Test instruction']; }
    process() { return Promise.resolve({ engineName: 'RealityCorruption', instructions: ['Test instruction'], effects: {}, metadata: {} }); }
  },
  NeuralEchoChamberEngine: class {
    name = 'NeuralEcho';
    isActive() { return false; }
    generateInstructions() { return []; }
    process() { return Promise.resolve({ engineName: 'NeuralEcho', instructions: [], effects: {}, metadata: {} }); }
  },
  SemanticChoiceArchaeologyEngine: class {
    name = 'SemanticArchaeology';
    isActive() { return false; }
    generateInstructions() { return []; }
    process() { return Promise.resolve({ engineName: 'SemanticArchaeology', instructions: [], effects: {}, metadata: {} }); }
  },
  AdaptiveNarrativeDNAEngine: class {
    name = 'NarrativeDNA';
    isActive() { return false; }
    generateInstructions() { return []; }
    process() { return Promise.resolve({ engineName: 'NarrativeDNA', instructions: [], effects: {}, metadata: {} }); }
  },
  FifthWallEngine: class {
    name = 'FifthWall';
    isActive() { return false; }
    generateInstructions() { return []; }
    process() { return Promise.resolve({ engineName: 'FifthWall', instructions: [], effects: {}, metadata: {} }); }
  },
}));

describe('FlowCoordinator', () => {
  let coordinator: FlowCoordinatorImpl;

  beforeEach(() => {
    coordinator = new FlowCoordinatorImpl();

    // Reset stores
    useGameStateStore.getState().reset();
    useWorldStateStore.getState().reset();
  });

  describe('getCurrentFlow', () => {
    it('should return descent flow for PLAYING state', () => {
      const gameStateStore = useGameStateStore.getState();
      gameStateStore.setGameState(GameState.PLAYING);

      const flow = coordinator.getCurrentFlow();

      expect(flow.name).toBe('Descent');
    });

    it('should return descent flow for MENU state', () => {
      const gameStateStore = useGameStateStore.getState();
      gameStateStore.setGameState(GameState.MENU);

      const flow = coordinator.getCurrentFlow();

      expect(flow.name).toBe('Descent');
    });

    it('should return unraveling flow when descent level is high', () => {
      const gameStateStore = useGameStateStore.getState();
      const worldStateStore = useWorldStateStore.getState();

      // Set to PLAYING
      gameStateStore.setGameState(GameState.PLAYING);

      // Set high horror and corruption to trigger unraveling
      worldStateStore.updateWorldState({
        horrorIntensity: 10,
        uiDistortion: {
          transform: 'rotate(20deg)',
          filter: 'none',
          transition: 'all 1s',
        },
      });

      const flow = coordinator.getCurrentFlow();

      // Should switch to unraveling
      expect(flow.name).toBe('Unraveling');
    });
  });

  describe('transitionTo', () => {
    it('should transition to a new state', async () => {
      await coordinator.transitionTo(SeamsGameState.DESCENDING);

      const gameState = useGameStateStore.getState().gameState;

      expect(gameState).toBe(GameState.PLAYING);
    });

    it('should update current flow after transition', async () => {
      await coordinator.transitionTo(SeamsGameState.UNRAVELING);

      const flow = coordinator.getCurrentFlow();

      // Should still return a valid flow (Unraveling mapped to PLAYING)
      expect(flow).toBeDefined();
      expect(flow.name).toBeDefined();
    });
  });

  describe('executeEngines', () => {
    it('should execute active engines', async () => {
      const context = {
        worldState: {
          protagonist: 'Test',
          setting: 'Test',
          dilemma: 'Test',
          psychologicalStatus: 'STABLE' as any,
          systemHealth: 100,
          horrorIntensity: 1,
          corruptionLevel: 0,
          genreConfig: {
            id: 'test',
            name: 'Test',
            description: 'Test',
            systemPrompt: 'Test',
            themes: [],
            fearCategories: [],
            visualStyle: {
              primaryColor: '#000',
              secondaryColor: '#FFF',
              accentColor: '#F00',
              fontFamily: 'monospace',
              atmosphere: 'dark' as const,
            },
          },
        },
        recentHistory: [],
        playerProfile: {
          fearProfile: {},
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
        },
        currentChoice: {
          id: 'test',
          text: 'Test choice',
          isIntrusive: false,
        },
      };

      const outputs = await coordinator.executeEngines(context);

      expect(Array.isArray(outputs)).toBe(true);
      // Should have outputs from active engines
      expect(outputs.length).toBeGreaterThan(0);
    });

    it('should skip inactive engines', async () => {
      const context = {
        worldState: {
          protagonist: 'Test',
          setting: 'Test',
          dilemma: 'Test',
          psychologicalStatus: 'STABLE' as any,
          systemHealth: 100,
          horrorIntensity: 1,
          corruptionLevel: 0,
          genreConfig: {
            id: 'test',
            name: 'Test',
            description: 'Test',
            systemPrompt: 'Test',
            themes: [],
            fearCategories: [],
            visualStyle: {
              primaryColor: '#000',
              secondaryColor: '#FFF',
              accentColor: '#F00',
              fontFamily: 'monospace',
              atmosphere: 'dark' as const,
            },
          },
        },
        recentHistory: [],
        playerProfile: {
          fearProfile: {},
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
        },
        currentChoice: {
          id: 'test',
          text: 'Test choice',
          isIntrusive: false,
        },
      };

      const outputs = await coordinator.executeEngines(context);

      // Should only include active engines (2 in our mock)
      expect(outputs.length).toBe(2);
    });
  });

  describe('executeCommands', () => {
    it('should execute a queue of commands', async () => {
      const commands = [
        {
          type: 'displayText' as const,
          payload: { content: 'Test', segmentId: 'test-1' },
        },
        {
          type: 'wait' as const,
          payload: { duration: 100 },
        },
      ];

      const results = await coordinator.executeCommands(commands);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
      expect(results[0].success).toBe(true);
    });

    it('should handle command execution errors', async () => {
      const { executeCommandQueue } = await import('../../../src/services/commandExecutor');
      vi.mocked(executeCommandQueue).mockRejectedValueOnce(new Error('Command failed'));

      const commands = [
        {
          type: 'displayText' as const,
          payload: { content: 'Test', segmentId: 'test-1' },
        },
      ];

      const results = await coordinator.executeCommands(commands);

      expect(results[0].success).toBe(false);
      expect(results[0].error).toBeDefined();
    });
  });
});
