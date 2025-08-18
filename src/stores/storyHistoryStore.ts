import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StorySegment } from '../types';

interface StoryHistoryStore {
  storyHistory: StorySegment[];
  addStorySegment: (segment: StorySegment) => void;
  updateLastStorySegment: (updates: Partial<StorySegment>) => void;
  modifyStorySegment: (segmentId: string, newText: string) => void;
  reset: () => void;
}

const initialState = {
  storyHistory: [],
};

export const useStoryHistoryStore = create<StoryHistoryStore>()(
  persist(
    (set) => ({
      ...initialState,
      addStorySegment: (segment) =>
        set((state) => ({ storyHistory: [...state.storyHistory, segment] })),
      updateLastStorySegment: (updates) =>
        set((state) => {
          const lastSegment = state.storyHistory[state.storyHistory.length - 1];
          if (lastSegment) {
            const updatedSegment = { ...lastSegment, ...updates };
            return {
              storyHistory: [
                ...state.storyHistory.slice(0, -1),
                updatedSegment,
              ],
            };
          }
          return state;
        }),
      modifyStorySegment: (segmentId, newText) =>
        set((state) => ({
          storyHistory: state.storyHistory.map((segment) =>
            segment.id === segmentId ? { ...segment, text: newText } : segment
          ),
        })),
      reset: () => set(initialState),
    }),
    {
      name: 'cosmic-narrative-storyhistory', // unique name for localStorage
    }
  )
);
