/**
 * DescentFlow Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DescentFlowImpl } from '../../../src/flows/DescentFlow';
import { useGameStateStore } from '../../../src/stores/gameStateStore';
import { useWorldStateStore } from '../../../src/stores/worldStateStore';
import { useStoryHistoryStore } from '../../../src/stores/storyHistoryStore';
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

// Mock the engines
vi.mock('../../../src/services/ai/engines', () => ({
  temporalRevision: {
    name: 'TemporalRevision',
    isActive: () => false,
    generateInstructions: () => ['Revise past events'],
  },
  metaConsciousness: {
    name: 'MetaConsciousness',
    isActive: () => false,
    generateInstructions: () => [],
  },
  quantumNarrative: {
    name: 'QuantumNarrative',
    isActive: () => false,
    generateInstructions: () => [],
  },
  adaptiveHorror: {
    name: 'AdaptiveHorror',
    isActive: () => true,
    generateInstructions: () => ['Increase horror based on fears'],
  },
  realityCorruption: {
    name: 'RealityCorruption',
    isActive: () => true,
    generateInstructions: () => ['Apply visual corruption'],
  },
  neuralEchoChambers: {
    name: 'NeuralEcho',
    isActive: () => false,
    generateInstructions: () => [],
  },
  semanticArchaeology: {
    name: 'SemanticArchaeology',
    isActive: () => false,
    generateInstructions: () => [],
  },
  narrativeDNA: {
    name: 'NarrativeDNA',
    isActive: () => false,
    generateInstructions: () => [],
  },
  fifthWallBreaker: {
    name: 'FifthWall',
    isActive: () => false,
    generateInstructions: () => [],
  },
}));

describe('DescentFlow', () => {
  let flow: DescentFlowImpl;

  beforeEach(() => {
    flow = new DescentFlowImpl();

    // Reset stores
    useGameStateStore.getState().reset();
    useWorldStateStore.getState().reset();
    useStoryHistoryStore.getState().reset();
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
        uiDistortion: {
          transform: 'rotate(20deg)', // Max corruption
          filter: 'none',
          transition: 'all 1s',
        },
      });

      const level = flow.calculateDescentLevel();

      // Max corruption should contribute 40% to descent
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
        horrorIntensity: 10, // Max horror
        uiDistortion: {
          transform: 'rotate(20deg)', // Max corruption
          filter: 'none',
          transition: 'all 1s',
        },
      });

      const shouldUnravel = flow.shouldBeginUnraveling();

      // Max horror + max corruption should exceed 70%
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

      // Set high horror and corruption
      worldStateStore.updateWorldState({
        horrorIntensity: 10,
        uiDistortion: {
          transform: 'rotate(20deg)',
          filter: 'none',
          transition: 'all 1s',
        },
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
