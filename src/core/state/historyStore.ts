/**
 * HISTORY STORE
 *
 * Manages the narrative history: all story segments, their content, images, and metadata.
 * Implements HistoryStore interface from seams.ts.
 *
 * Features:
 * - Zustand store with localStorage persistence
 * - Synchronous actions only
 * - Support for temporal revision (changing past segments)
 * - Efficient recent segment retrieval
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HistoryStore, StorySegment } from '../types/seams';

/**
 * History Store
 *
 * Maintains a chronological array of all story segments.
 * Supports adding new segments, updating existing ones, and revising past segments
 * (for Temporal Revision Engine).
 * Persists to localStorage for session continuity.
 */
export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      // State
      segments: [],

      // Actions
      addSegment: (segment: StorySegment) =>
        set((state) => ({
          segments: [...state.segments, segment],
        })),

      updateSegment: (id: string, updates: Partial<StorySegment>) =>
        set((state) => ({
          segments: state.segments.map((segment) =>
            segment.id === id
              ? { ...segment, ...updates }
              : segment
          ),
        })),

      reviseSegment: (id: string, newText: string) =>
        set((state) => ({
          segments: state.segments.map((segment) =>
            segment.id === id
              ? {
                  ...segment,
                  text: newText,
                  isRevised: true,
                  originalText: segment.originalText || segment.text,
                }
              : segment
          ),
        })),

      getRecent: (count: number) => {
        const { segments } = get();
        return segments.slice(-count);
      },

      reset: () =>
        set({ segments: [] }),
    }),
    {
      name: 'apophenia-history',
      version: 1,
      // Limit persistence size by only keeping last 100 segments
      partialize: (state) => ({
        segments: state.segments.slice(-100),
      }),
    }
  )
);
