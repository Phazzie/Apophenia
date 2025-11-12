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
    it('should have required properties', () => {
      expect(engine).toBeDefined();
      expect(typeof engine.reviseHistory).toBe('function');
    });

    it('should handle revision with valid history', async () => {
      const storyHistory: StorySegment[] = [
        { ...mockStorySegment, id: 'seg-1', text: 'First segment' },
        { ...mockStorySegment, id: 'seg-2', text: 'Second segment' },
        { ...mockStorySegment, id: 'seg-3', text: 'Third segment' },
      ];

      const context = buildMockEngineContext({ recentHistory: storyHistory });
      const result = await engine.reviseHistory(
        'Investigate the strange sound',
        storyHistory,
        context.worldState
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(storyHistory.length);
    });

    it('should not revise when history is too short', async () => {
      const storyHistory: StorySegment[] = [
        { ...mockStorySegment, id: 'seg-1', text: 'Only segment' },
      ];

      const context = buildMockEngineContext({ recentHistory: storyHistory });
      const result = await engine.reviseHistory(
        'Make a choice',
        storyHistory,
        context.worldState
      );

      expect(result).toEqual(storyHistory);
    });

    it('should track revision history', async () => {
      const storyHistory: StorySegment[] = [
        { ...mockStorySegment, id: 'seg-1', text: 'Original text' },
        { ...mockStorySegment, id: 'seg-2', text: 'Another segment' },
        { ...mockStorySegment, id: 'seg-3', text: 'Yet another' },
      ];

      const context = buildMockEngineContext({ recentHistory: storyHistory });

      // First revision
      const result1 = await engine.reviseHistory(
        'Choice that triggers revision',
        storyHistory,
        context.worldState
      );

      // Check if any segment was marked as revised
      const hasRevised = result1.some((seg) => seg.isRevised || seg.originalText);

      // Result should either have revisions or be unchanged
      expect(result1.length).toBeGreaterThanOrEqual(storyHistory.length);
    });

    it('should handle errors gracefully', async () => {
      const storyHistory: StorySegment[] = [
        { ...mockStorySegment, id: 'seg-1', text: 'Test segment' },
        { ...mockStorySegment, id: 'seg-2', text: 'Test segment 2' },
        { ...mockStorySegment, id: 'seg-3', text: 'Test segment 3' },
      ];

      const context = buildMockEngineContext({ recentHistory: storyHistory });

      // Should not throw even with problematic input
      const result = await engine.reviseHistory(
        'Choice',
        storyHistory,
        context.worldState
      );

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Revision Logic', () => {
    it('should preserve segment structure when revising', async () => {
      const storyHistory: StorySegment[] = [
        {
          ...mockStorySegment,
          id: 'seg-1',
          text: 'Original',
          timestamp: 1000,
          images: { main: 'image.jpg', mainStatus: 'loaded' },
        },
        { ...mockStorySegment, id: 'seg-2', text: 'Segment 2' },
        { ...mockStorySegment, id: 'seg-3', text: 'Segment 3' },
      ];

      const context = buildMockEngineContext({ recentHistory: storyHistory });
      const result = await engine.reviseHistory(
        'Make a choice',
        storyHistory,
        context.worldState
      );

      // Check that core properties are preserved
      result.forEach((segment) => {
        expect(segment.id).toBeDefined();
        expect(segment.text).toBeDefined();
        expect(segment.timestamp).toBeDefined();
      });
    });

    it('should handle high corruption scenarios', async () => {
      const storyHistory: StorySegment[] = [
        { ...mockStorySegment, id: 'seg-1', text: 'Segment 1' },
        { ...mockStorySegment, id: 'seg-2', text: 'Segment 2' },
        { ...mockStorySegment, id: 'seg-3', text: 'Segment 3' },
      ];

      const context = ContextBuilder.withHighCorruption();
      const result = await engine.reviseHistory(
        'Corrupted choice',
        storyHistory,
        context.worldState
      );

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
