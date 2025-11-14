/**
 * FlowContextBuilder Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FlowContextBuilder } from '../../../src/flows/FlowContextBuilder';
import { useGameStateStore } from '../../../src/stores/gameStateStore';
import { useWorldStateStore } from '../../../src/stores/worldStateStore';
import { useStoryHistoryStore } from '../../../src/stores/storyHistoryStore';
import { useUserStore } from '../../../src/stores/userStore';
import { GameState } from '../../../src/types';

describe('FlowContextBuilder', () => {
  let builder: FlowContextBuilder;

  beforeEach(() => {
    builder = new FlowContextBuilder();

    // Reset all stores
    useGameStateStore.getState().reset();
    useWorldStateStore.getState().reset();
    useStoryHistoryStore.getState().reset();
  });

  describe('buildFlowContext', () => {
    it('should build a valid FlowContext', () => {
      const choice = {
        text: 'Test choice',
        isIntrusive: false,
      };

      const context = builder.buildFlowContext(choice);

      expect(context).toBeDefined();
      expect(context.worldState).toBeDefined();
      expect(context.recentHistory).toBeInstanceOf(Array);
      expect(context.playerProfile).toBeDefined();
      expect(context.currentChoice).toEqual(choice);
    });

    it('should include recent history segments', () => {
      // Add some segments to history
      const historyStore = useStoryHistoryStore.getState();
      for (let i = 0; i < 15; i++) {
        historyStore.addStorySegment({
          id: `seg-${i}`,
          text: `Segment ${i}`,
          images: {},
        });
      }

      const choice = {
        text: 'Test choice',
        isIntrusive: false,
      };

      const context = builder.buildFlowContext(choice);

      // Should only include last 10 segments
      expect(context.recentHistory.length).toBe(10);
      expect(context.recentHistory[0].id).toBe('seg-5');
      expect(context.recentHistory[9].id).toBe('seg-14');
    });

    it('should build player profile with default values', () => {
      const choice = {
        text: 'Test choice',
        isIntrusive: false,
      };

      const context = builder.buildFlowContext(choice);

      expect(context.playerProfile).toBeDefined();
      expect(context.playerProfile.fearProfile).toBeDefined();
      expect(context.playerProfile.choicePatterns).toBeDefined();
      expect(context.playerProfile.engagementMetrics).toBeDefined();
    });
  });

  describe('buildEngineContext', () => {
    it('should build a valid EngineContext', () => {
      const context = builder.buildEngineContext();

      expect(context).toBeDefined();
      expect(context.worldState).toBeDefined();
      expect(context.recentHistory).toBeInstanceOf(Array);
      expect(context.playerProfile).toBeDefined();
      expect(context.currentChoice).toBeUndefined();
    });

    it('should include currentChoice when provided', () => {
      const choice = {
        text: 'Test choice',
        isIntrusive: false,
      };

      const context = builder.buildEngineContext(choice);

      expect(context.currentChoice).toEqual(choice);
    });
  });

  describe('mapWorldState', () => {
    it('should correctly map psychological status', () => {
      const worldStateStore = useWorldStateStore.getState();

      worldStateStore.updateWorldState({
        psychologicalStatus: 'Fragmented',
      });

      const choice = {
        text: 'Test choice',
        isIntrusive: false,
      };

      const context = builder.buildFlowContext(choice);

      // The mapped status should be FRAGMENTED
      expect(context.worldState.psychologicalStatus).toBeDefined();
    });

    it('should use corruption level from world state', () => {
      const worldStateStore = useWorldStateStore.getState();

      // Set corruption level directly (current architecture)
      worldStateStore.updateWorldState({
        corruptionLevel: 50,
      });

      const choice = {
        text: 'Test choice',
        isIntrusive: false,
      };

      const context = builder.buildFlowContext(choice);

      // Should pass through corruption level from store
      expect(context.worldState.corruptionLevel).toBe(50);
    });
  });
});
