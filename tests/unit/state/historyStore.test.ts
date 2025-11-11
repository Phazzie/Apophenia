/**
 * HISTORY STORE - Unit Tests
 *
 * Tests for historyStore implementation.
 * Verifies segment management, updates, revisions, and retrieval.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useHistoryStore } from '../../../src/core/state/historyStore';
import { StorySegment } from '../../../src/core/types/seams';

describe('HistoryStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useHistoryStore.getState().reset();
  });

  describe('Initial State', () => {
    it('should have empty segments array', () => {
      const { segments } = useHistoryStore.getState();
      expect(segments).toEqual([]);
    });
  });

  describe('addSegment', () => {
    it('should add a segment', () => {
      const segment: StorySegment = {
        id: 'seg-1',
        text: 'The darkness deepens...',
        timestamp: Date.now(),
      };

      useHistoryStore.getState().addSegment(segment);

      const { segments } = useHistoryStore.getState();
      expect(segments).toHaveLength(1);
      expect(segments[0]).toEqual(segment);
    });

    it('should add multiple segments in order', () => {
      const segments: StorySegment[] = [
        { id: 'seg-1', text: 'First', timestamp: 1 },
        { id: 'seg-2', text: 'Second', timestamp: 2 },
        { id: 'seg-3', text: 'Third', timestamp: 3 },
      ];

      const { addSegment } = useHistoryStore.getState();
      segments.forEach(addSegment);

      const stored = useHistoryStore.getState().segments;
      expect(stored).toHaveLength(3);
      expect(stored[0].id).toBe('seg-1');
      expect(stored[1].id).toBe('seg-2');
      expect(stored[2].id).toBe('seg-3');
    });

    it('should preserve segment metadata', () => {
      const segment: StorySegment = {
        id: 'seg-1',
        text: 'Test',
        timestamp: 123456,
        isRevised: true,
        originalText: 'Original',
        isQuantumShift: true,
        corruptionLevel: 50,
      };

      useHistoryStore.getState().addSegment(segment);

      const stored = useHistoryStore.getState().segments[0];
      expect(stored.isRevised).toBe(true);
      expect(stored.originalText).toBe('Original');
      expect(stored.isQuantumShift).toBe(true);
      expect(stored.corruptionLevel).toBe(50);
    });
  });

  describe('updateSegment', () => {
    beforeEach(() => {
      // Add some segments
      const segments: StorySegment[] = [
        { id: 'seg-1', text: 'First', timestamp: 1 },
        { id: 'seg-2', text: 'Second', timestamp: 2 },
        { id: 'seg-3', text: 'Third', timestamp: 3 },
      ];
      segments.forEach((seg) => useHistoryStore.getState().addSegment(seg));
    });

    it('should update specific segment properties', () => {
      useHistoryStore.getState().updateSegment('seg-2', {
        text: 'Updated Second',
      });

      const { segments } = useHistoryStore.getState();
      expect(segments[1].text).toBe('Updated Second');
    });

    it('should update image properties', () => {
      useHistoryStore.getState().updateSegment('seg-1', {
        images: {
          main: 'https://example.com/image.jpg',
          mainStatus: 'loaded',
        },
      });

      const segment = useHistoryStore.getState().segments[0];
      expect(segment.images?.main).toBe('https://example.com/image.jpg');
      expect(segment.images?.mainStatus).toBe('loaded');
    });

    it('should not affect other segments', () => {
      useHistoryStore.getState().updateSegment('seg-2', {
        text: 'Updated',
      });

      const { segments } = useHistoryStore.getState();
      expect(segments[0].text).toBe('First');
      expect(segments[2].text).toBe('Third');
    });

    it('should handle non-existent segment gracefully', () => {
      useHistoryStore.getState().updateSegment('non-existent', {
        text: 'New Text',
      });

      // Should not throw, segments should remain unchanged
      const { segments } = useHistoryStore.getState();
      expect(segments).toHaveLength(3);
    });
  });

  describe('reviseSegment', () => {
    beforeEach(() => {
      // Add some segments
      const segments: StorySegment[] = [
        { id: 'seg-1', text: 'Original First', timestamp: 1 },
        { id: 'seg-2', text: 'Original Second', timestamp: 2 },
      ];
      segments.forEach((seg) => useHistoryStore.getState().addSegment(seg));
    });

    it('should revise segment text and mark as revised', () => {
      useHistoryStore.getState().reviseSegment('seg-1', 'New Text');

      const segment = useHistoryStore.getState().segments[0];
      expect(segment.text).toBe('New Text');
      expect(segment.isRevised).toBe(true);
      expect(segment.originalText).toBe('Original First');
    });

    it('should preserve original text on first revision', () => {
      useHistoryStore.getState().reviseSegment('seg-1', 'First Revision');

      const segment = useHistoryStore.getState().segments[0];
      expect(segment.originalText).toBe('Original First');
    });

    it('should preserve original text on multiple revisions', () => {
      useHistoryStore.getState().reviseSegment('seg-1', 'First Revision');
      useHistoryStore.getState().reviseSegment('seg-1', 'Second Revision');

      const segment = useHistoryStore.getState().segments[0];
      expect(segment.text).toBe('Second Revision');
      expect(segment.originalText).toBe('Original First'); // Still original
      expect(segment.isRevised).toBe(true);
    });

    it('should not affect other segments', () => {
      useHistoryStore.getState().reviseSegment('seg-1', 'Revised');

      const segments = useHistoryStore.getState().segments;
      expect(segments[1].text).toBe('Original Second');
      expect(segments[1].isRevised).toBeUndefined();
    });
  });

  describe('getRecent', () => {
    beforeEach(() => {
      // Add 10 segments
      for (let i = 1; i <= 10; i++) {
        useHistoryStore.getState().addSegment({
          id: `seg-${i}`,
          text: `Segment ${i}`,
          timestamp: i,
        });
      }
    });

    it('should return requested number of recent segments', () => {
      const recent = useHistoryStore.getState().getRecent(3);

      expect(recent).toHaveLength(3);
      expect(recent[0].id).toBe('seg-8');
      expect(recent[1].id).toBe('seg-9');
      expect(recent[2].id).toBe('seg-10');
    });

    it('should return all segments if count exceeds total', () => {
      const recent = useHistoryStore.getState().getRecent(20);

      expect(recent).toHaveLength(10);
      expect(recent[0].id).toBe('seg-1');
      expect(recent[9].id).toBe('seg-10');
    });

    it('should return empty array if no segments', () => {
      useHistoryStore.getState().reset();
      const recent = useHistoryStore.getState().getRecent(5);

      expect(recent).toEqual([]);
    });

    it('should return most recent segment when count is 1', () => {
      const recent = useHistoryStore.getState().getRecent(1);

      expect(recent).toHaveLength(1);
      expect(recent[0].id).toBe('seg-10');
    });
  });

  describe('reset', () => {
    it('should clear all segments', () => {
      // Add segments
      for (let i = 1; i <= 5; i++) {
        useHistoryStore.getState().addSegment({
          id: `seg-${i}`,
          text: `Segment ${i}`,
          timestamp: i,
        });
      }

      // Reset
      useHistoryStore.getState().reset();

      expect(useHistoryStore.getState().segments).toEqual([]);
    });
  });

  describe('Interface Compliance', () => {
    it('should implement all required methods', () => {
      const store = useHistoryStore.getState();

      expect(typeof store.addSegment).toBe('function');
      expect(typeof store.updateSegment).toBe('function');
      expect(typeof store.reviseSegment).toBe('function');
      expect(typeof store.getRecent).toBe('function');
      expect(typeof store.reset).toBe('function');
    });

    it('should have segments property', () => {
      const store = useHistoryStore.getState();
      expect('segments' in store).toBe(true);
      expect(Array.isArray(store.segments)).toBe(true);
    });
  });
});
