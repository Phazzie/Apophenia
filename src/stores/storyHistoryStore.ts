import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StorySegment } from '../types';

interface StoryHistoryStore {
  storyHistory: StorySegment[];
  addStorySegment: (segment: StorySegment) => void;
  updateSegmentById: (segmentId: string, updates: Partial<StorySegment>) => void;
  reset: () => void;
}

const initialState = {
  storyHistory: [],
};

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
      reset: () => {
        set(initialState);
        // Clear persisted state by resetting localStorage
        localStorage.removeItem('cosmic-narrative-storyhistory');
      },
    }),
    {
      name: 'cosmic-narrative-storyhistory', // unique name for localStorage
    }
  )
);
