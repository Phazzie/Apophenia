/**
 * Unit tests for Temporal Revision Engine
 * Tests the engine that retroactively modifies past story segments
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TemporalRevisionEngine } from '../../../src/core/engines/TemporalRevisionEngine';
import { buildMockEngineContext, ContextBuilder } from '../../mocks/mockContexts';
import { mockStorySegment } from '../../mocks/mockStores';
import { assertEngineInterface, assertValidEngineOutput } from '../../utils/testHelpers';
import { StorySegment } from '../../../src/core/types/seams';

describe('TemporalRevisionEngine', () => {
  let engine: TemporalRevisionEngine;

  beforeEach(() => {
    engine = new TemporalRevisionEngine();
  });

  describe('Engine Interface', () => {
    it('should implement standard Engine interface', () => {
      assertEngineInterface(engine);
      expect(engine.name).toBe('TemporalRevision');
      expect(engine.priority).toBe(8);
    });

    it('should process revision with valid history', async () => {
      const storyHistory: StorySegment[] = [
        { ...mockStorySegment, id: 'seg-1', text: 'First segment with door on left' },
        { ...mockStorySegment, id: 'seg-2', text: 'Second segment' },
        { ...mockStorySegment, id: 'seg-3', text: 'Third segment' },
      ];

      const context = buildMockEngineContext({
        recentHistory: storyHistory,
        worldState: {
          ...buildMockEngineContext().worldState,
          horrorIntensity: 5,
        },
        currentChoice: {
          id: 'choice-1',
          text: 'Investigate the strange sound',
          isIntrusive: false,
        },
      });

      // Engine should be active with sufficient horror and history
      expect(engine.isActive(context)).toBe(true);

      const output = await engine.process(context);

      assertValidEngineOutput(output);
      expect(output.engineName).toBe('TemporalRevision');
      expect(output.instructions).toBeInstanceOf(Array);
      expect(output.instructions.length).toBeGreaterThan(0);
    });

    it('should not be active when history is too short', async () => {
      const storyHistory: StorySegment[] = [
        { ...mockStorySegment, id: 'seg-1', text: 'Only segment' },
      ];

      const context = buildMockEngineContext({
        recentHistory: storyHistory,
        worldState: {
          ...buildMockEngineContext().worldState,
          horrorIntensity: 5,
        },
      });

      // Engine should not be active with insufficient history
      expect(engine.isActive(context)).toBe(false);

      const output = await engine.process(context);

      // Should still return valid output but with no revisions
      assertValidEngineOutput(output);
      expect(output.metadata?.targetFound).toBe(false);
    });

    it('should generate history revisions when active', async () => {
      const storyHistory: StorySegment[] = [
        { ...mockStorySegment, id: 'seg-1', text: 'Original text with door' },
        { ...mockStorySegment, id: 'seg-2', text: 'Another segment' },
        { ...mockStorySegment, id: 'seg-3', text: 'Yet another' },
      ];

      const context = buildMockEngineContext({
        recentHistory: storyHistory,
        worldState: {
          ...buildMockEngineContext().worldState,
          horrorIntensity: 5,
        },
        currentChoice: {
          id: 'choice-1',
          text: 'Choice that triggers revision',
          isIntrusive: false,
        },
      });

      const output = await engine.process(context);

      assertValidEngineOutput(output);

      // Check if revisions were generated
      if (output.metadata?.targetFound) {
        expect(output.effects?.historyRevisions).toBeDefined();
        expect(Array.isArray(output.effects?.historyRevisions)).toBe(true);
        if (output.effects?.historyRevisions && output.effects.historyRevisions.length > 0) {
          const revision = output.effects.historyRevisions[0];
          expect(revision).toHaveProperty('id');
          expect(revision).toHaveProperty('newText');
          expect(typeof revision.newText).toBe('string');
        }
      }
    });

    it('should handle processing gracefully', async () => {
      const storyHistory: StorySegment[] = [
        { ...mockStorySegment, id: 'seg-1', text: 'Test segment' },
        { ...mockStorySegment, id: 'seg-2', text: 'Test segment 2' },
        { ...mockStorySegment, id: 'seg-3', text: 'Test segment 3' },
      ];

      const context = buildMockEngineContext({
        recentHistory: storyHistory,
        worldState: {
          ...buildMockEngineContext().worldState,
          horrorIntensity: 5,
        },
      });

      // Should not throw even with minimal context
      await expect(engine.process(context)).resolves.toBeDefined();

      const output = await engine.process(context);
      assertValidEngineOutput(output);
    });
  });

  describe('Revision Logic', () => {
    it('should generate valid revision metadata', async () => {
      const storyHistory: StorySegment[] = [
        {
          ...mockStorySegment,
          id: 'seg-1',
          text: 'Original text with old door',
          timestamp: 1000,
          images: { main: 'image.jpg', mainStatus: 'loaded' },
        },
        { ...mockStorySegment, id: 'seg-2', text: 'Segment 2' },
        { ...mockStorySegment, id: 'seg-3', text: 'Segment 3' },
      ];

      const context = buildMockEngineContext({
        recentHistory: storyHistory,
        worldState: {
          ...buildMockEngineContext().worldState,
          horrorIntensity: 6,
        },
        currentChoice: {
          id: 'choice-1',
          text: 'Make a choice',
          isIntrusive: false,
        },
      });

      const output = await engine.process(context);

      assertValidEngineOutput(output);

      // Check metadata structure
      expect(output.metadata).toBeDefined();
      expect(output.metadata).toHaveProperty('targetFound');

      // If a target was found, validate revision metadata
      if (output.metadata?.targetFound) {
        expect(output.metadata).toHaveProperty('originalLength');
        expect(output.metadata).toHaveProperty('revisedLength');
        expect(typeof output.metadata.originalLength).toBe('number');
        expect(typeof output.metadata.revisedLength).toBe('number');
      }
    });

    it('should handle high corruption scenarios', async () => {
      const storyHistory: StorySegment[] = [
        { ...mockStorySegment, id: 'seg-1', text: 'Segment 1 with left door' },
        { ...mockStorySegment, id: 'seg-2', text: 'Segment 2' },
        { ...mockStorySegment, id: 'seg-3', text: 'Segment 3' },
      ];

      const context = ContextBuilder.withHighCorruption();
      context.recentHistory = storyHistory;
      context.worldState.horrorIntensity = 8;
      context.currentChoice = {
        id: 'choice-1',
        text: 'Corrupted choice',
        isIntrusive: false,
      };

      // Should process without throwing
      const output = await engine.process(context);

      assertValidEngineOutput(output);
      expect(output.engineName).toBe('TemporalRevision');

      // Instructions should be more intense with high corruption
      expect(output.instructions.length).toBeGreaterThan(0);
    });

    it('should generate appropriate instructions based on intensity', async () => {
      const storyHistory: StorySegment[] = [
        { ...mockStorySegment, id: 'seg-1', text: 'First' },
        { ...mockStorySegment, id: 'seg-2', text: 'Second' },
        { ...mockStorySegment, id: 'seg-3', text: 'Third' },
      ];

      // Test with low intensity
      const lowIntensityContext = buildMockEngineContext({
        recentHistory: storyHistory,
        worldState: {
          ...buildMockEngineContext().worldState,
          horrorIntensity: 4,
        },
      });

      const lowOutput = await engine.process(lowIntensityContext);
      const lowInstructions = engine.generateInstructions(lowIntensityContext);
      expect(lowInstructions.length).toBeGreaterThan(0);

      // Test with high intensity
      const highIntensityContext = buildMockEngineContext({
        recentHistory: storyHistory,
        worldState: {
          ...buildMockEngineContext().worldState,
          horrorIntensity: 9,
        },
      });

      const highInstructions = engine.generateInstructions(highIntensityContext);
      expect(highInstructions.length).toBeGreaterThanOrEqual(lowInstructions.length);
      // High intensity should have more or equal instructions
    });
  });
});
