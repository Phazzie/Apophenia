/**
 * @file storyHistoryStore.ts
 * @description Zustand store for managing the narrative history of the game.
 * This store holds an array of all story segments, representing the chronological
 * progression of the player's unique narrative.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StorySegment } from '../types';

/**
 * @interface StoryHistoryStore
 * @description Defines the structure of the story history store, including its state and actions.
 */
interface StoryHistoryStore {
  /** An array of story segments that form the complete narrative history. */
  storyHistory: StorySegment[];
  /** Appends a new story segment to the end of the history. */
  addStorySegment: (segment: StorySegment) => void;
  /** Finds a segment by its ID and merges the provided updates. */
  updateSegmentById: (segmentId: string, updates: Partial<StorySegment>) => void;
  /** Completely replaces the entire story history with a new one, a crucial function for the Temporal Revision Engine. */
  replaceStoryHistory: (newHistory: StorySegment[]) => void;
  /** Resets the story history to its initial empty state. */
  reset: () => void;
}

/**
 * @constant {object} initialState
 * @description The default initial state for the story history store.
 */
const initialState = {
  storyHistory: [],
};

/**
 * @hook useStoryHistoryStore
 * @description A Zustand hook for accessing the story history store.
 * This store is persisted to local storage, allowing the full narrative
 * to be saved and restored between sessions, which is essential for the "Continue" feature.
 */
export const useStoryHistoryStore = create<StoryHistoryStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      addStorySegment: (segment) =>
        set((state) => ({ storyHistory: [...state.storyHistory, segment] })),

      updateSegmentById: (segmentId, updates) =>
        set((state) => ({
          storyHistory: state.storyHistory.map((segment) =>
            segment.id === segmentId ? { ...segment, ...updates } : segment
          ),
        })),

      replaceStoryHistory: (newHistory) =>
        set({ storyHistory: newHistory }),

      reset: () => {
        set(initialState);
        // Explicitly remove the item from localStorage on reset to ensure a clean state.
        localStorage.removeItem('cosmic-narrative-storyhistory');
      },
    }),
    {
      name: 'cosmic-narrative-storyhistory', // unique name for localStorage key
    }
  )
);
