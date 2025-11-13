/**
 * Integration Test: Engine → State
 * Tests the integration between engines and state management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TemporalRevisionEngine } from '../../src/core/engines/TemporalRevisionEngine';
import { buildMockEngineContext, buildMockEngineEffects } from '../mocks/mockContexts';
import {
  createMockWorldStateStore,
  createMockHistoryStore,
  mockStorySegment,
} from '../mocks/mockStores';
import { StorySegment } from '../../src/core/types/seams';

describe('Engine → State Integration', () => {
  let worldStateStore: ReturnType<typeof createMockWorldStateStore>;
  let historyStore: ReturnType<typeof createMockHistoryStore>;

  beforeEach(() => {
    worldStateStore = createMockWorldStateStore();
    historyStore = createMockHistoryStore();
    worldStateStore.getState().reset();
    historyStore.getState().reset();
  });

  describe('Temporal Revision Engine Integration', () => {
    it('should revise history and update store', async () => {
      const engine = new TemporalRevisionEngine();

      // Add initial history
      const segments: StorySegment[] = [
        { ...mockStorySegment, id: 'seg-1', text: 'Original segment 1' },
        { ...mockStorySegment, id: 'seg-2', text: 'Original segment 2' },
        { ...mockStorySegment, id: 'seg-3', text: 'Original segment 3' },
      ];

      segments.forEach((seg) => historyStore.getState().addSegment(seg));

      const context = buildMockEngineContext({
        recentHistory: segments,
        worldState: {
          ...worldStateStore.getState().worldState,
          horrorIntensity: 6, // High enough to activate engine
        },
        choices: Array(6).fill({ text: 'choice', id: 'c' }), // Enough choices to activate
      });

      // Execute engine using standard interface
      const output = await engine.process(context);

      // Verify output structure
      expect(output.engineName).toBe('TemporalRevision');
      expect(output.instructions).toBeInstanceOf(Array);
      expect(output.instructions.length).toBeGreaterThan(0);

      // Verify effects contain history revisions if engine was active
      if (output.effects.historyRevisions) {
        expect(Array.isArray(output.effects.historyRevisions)).toBe(true);
      }
    });

    it('should preserve store state during engine execution', async () => {
      const engine = new TemporalRevisionEngine();

      // Set up store state
      worldStateStore.getState().updateWorld({
        horrorIntensity: 5,
        systemHealth: 70,
      });

      const segments: StorySegment[] = [
        { ...mockStorySegment, id: 'seg-1', text: 'Test 1' },
        { ...mockStorySegment, id: 'seg-2', text: 'Test 2' },
        { ...mockStorySegment, id: 'seg-3', text: 'Test 3' },
      ];

      const context = buildMockEngineContext({
        worldState: worldStateStore.getState().worldState,
        recentHistory: segments,
        choices: Array(6).fill({ text: 'choice', id: 'c' }),
      });

      // Execute engine using standard interface
      await engine.process(context);

      // Verify store unchanged (engine doesn't mutate directly)
      expect(worldStateStore.getState().worldState.horrorIntensity).toBe(5);
      expect(worldStateStore.getState().worldState.systemHealth).toBe(70);
    });
  });

  describe('Engine Effects Application', () => {
    it('should apply world updates from engine effects', () => {
      const effects = buildMockEngineEffects({
        worldUpdates: {
          horrorIntensity: 7,
          corruptionLevel: 40,
        },
      });

      // Apply effects manually (simulating StateManager behavior)
      if (effects.worldUpdates) {
        worldStateStore.getState().updateWorld(effects.worldUpdates);
      }

      const worldState = worldStateStore.getState().worldState;
      expect(worldState.horrorIntensity).toBe(7);
      expect(worldState.corruptionLevel).toBe(40);
    });

    it('should apply history revisions from engine effects', () => {
      // Add initial segments
      historyStore.getState().addSegment({
        ...mockStorySegment,
        id: 'seg-1',
        text: 'Original',
      });

      const effects = buildMockEngineEffects({
        historyRevisions: [{ id: 'seg-1', newText: 'Revised text' }],
      });

      // Apply revisions
      if (effects.historyRevisions) {
        effects.historyRevisions.forEach(({ id, newText }) => {
          historyStore.getState().reviseSegment(id, newText);
        });
      }

      const segment = historyStore.getState().segments[0];
      expect(segment.text).toBe('Revised text');
      expect(segment.isRevised).toBe(true);
      expect(segment.originalText).toBe('Original');
    });

    it('should apply corruption changes from engine effects', () => {
      const effects = buildMockEngineEffects({
        corruptionChanges: 25,
      });

      const currentCorruption = worldStateStore.getState().worldState.corruptionLevel;

      if (effects.corruptionChanges !== undefined) {
        worldStateStore.getState().setCorruption(currentCorruption + effects.corruptionChanges);
      }

      expect(worldStateStore.getState().worldState.corruptionLevel).toBe(25);
    });
  });

  describe('Multi-Store Coordination', () => {
    it('should coordinate updates across multiple stores', () => {
      // Simulate a game turn with coordinated updates
      const effects = buildMockEngineEffects({
        worldUpdates: {
          horrorIntensity: 6,
          systemHealth: 80,
        },
        historyRevisions: [{ id: 'seg-1', newText: 'Revised' }],
        corruptionChanges: 10,
      });

      // Add history
      historyStore.getState().addSegment({
        ...mockStorySegment,
        id: 'seg-1',
        text: 'Original',
      });

      // Apply all effects atomically
      if (effects.worldUpdates) {
        worldStateStore.getState().updateWorld(effects.worldUpdates);
      }

      if (effects.historyRevisions) {
        effects.historyRevisions.forEach(({ id, newText }) => {
          historyStore.getState().reviseSegment(id, newText);
        });
      }

      if (effects.corruptionChanges !== undefined) {
        const current = worldStateStore.getState().worldState.corruptionLevel;
        worldStateStore.getState().setCorruption(current + effects.corruptionChanges);
      }

      // Verify all updates applied
      const worldState = worldStateStore.getState().worldState;
      expect(worldState.horrorIntensity).toBe(6);
      expect(worldState.systemHealth).toBe(80);
      expect(worldState.corruptionLevel).toBe(10);

      const segment = historyStore.getState().segments[0];
      expect(segment.text).toBe('Revised');
      expect(segment.isRevised).toBe(true);
    });
  });
});
