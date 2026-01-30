// #TODO MAINTAIN: This is the Source of Truth for state. Do not modify without updating Seams contracts.
/**
 * PLAYER PROFILE STORE
 *
 * Manages the psychological profile of the player: fear responses, choice patterns,
 * and engagement metrics.
 * Implements PlayerProfileStore interface from seams.ts.
 *
 * Features:
 * - Zustand store with localStorage persistence
 * - Synchronous actions only
 * - Adaptive fear profile (0-1 normalized scores)
 * - Pattern analysis for choice behavior
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlayerProfileStore, PlayerProfile, Choice, ChoicePatterns } from '../types/seams';

// Default initial profile
const initialProfile: PlayerProfile = {
  fearProfile: {
    claustrophobia: 0,
    isolation: 0,
    bodyHorror: 0,
    cosmicInsignificance: 0,
    lossOfControl: 0,
    madness: 0,
  },
  choicePatterns: {
    riskTaking: 0.5,
    curiosity: 0.5,
    aggression: 0.5,
    avoidance: 0.5,
  },
  engagementMetrics: {
    totalChoices: 0,
    averageResponseTime: 0,
    sessionDuration: 0,
  },
  crossSessionData: undefined,
};

/**
 * Player Profile Store
 *
 * Tracks psychological profile, choice patterns, and engagement metrics.
 * Used by Adaptive Horror Engine to personalize horror content.
 * Persists to localStorage for cross-session learning.
 */
export const usePlayerProfileStore = create<PlayerProfileStore>()(
  persist(
    (set, get) => ({
      // State
      profile: initialProfile,

      // Actions
      updateFearProfile: (fear: string, intensity: number) =>
        set((state) => {
          // Clamp intensity between 0 and 1
          const clampedIntensity = Math.min(1, Math.max(0, intensity));

          // Check if fear exists in profile
          if (fear in state.profile.fearProfile) {
            return {
              profile: {
                ...state.profile,
                fearProfile: {
                  ...state.profile.fearProfile,
                  [fear]: clampedIntensity,
                },
              },
            };
          }

          // If fear doesn't exist, don't update
          return state;
        }),

      recordChoice: (choice: Choice, responseTime: number) =>
        set((state) => {
          const { totalChoices, averageResponseTime } = state.profile.engagementMetrics;

          // Calculate new average response time
          const newTotalChoices = totalChoices + 1;
          const newAverageResponseTime =
            (averageResponseTime * totalChoices + responseTime) / newTotalChoices;

          // Update choice patterns based on choice characteristics
          const patterns = { ...state.profile.choicePatterns };

          // Analyze choice to update patterns
          if (choice.psychologicalWeight && choice.psychologicalWeight > 0.7) {
            // High psychological weight = risky choice
            patterns.riskTaking = Math.min(
              1,
              patterns.riskTaking + 0.05
            );
          }

          if (choice.isIntrusive) {
            // Choosing intrusive thought = high curiosity
            patterns.curiosity = Math.min(1, patterns.curiosity + 0.1);
            patterns.riskTaking = Math.min(1, patterns.riskTaking + 0.05);
          }

          // Check choice text for patterns (simple heuristics)
          const choiceText = choice.text.toLowerCase();

          if (choiceText.includes('attack') || choiceText.includes('fight')) {
            patterns.aggression = Math.min(1, patterns.aggression + 0.05);
          }

          if (
            choiceText.includes('run') ||
            choiceText.includes('hide') ||
            choiceText.includes('avoid')
          ) {
            patterns.avoidance = Math.min(1, patterns.avoidance + 0.05);
          }

          if (
            choiceText.includes('investigate') ||
            choiceText.includes('explore') ||
            choiceText.includes('examine')
          ) {
            patterns.curiosity = Math.min(1, patterns.curiosity + 0.05);
          }

          return {
            profile: {
              ...state.profile,
              choicePatterns: patterns,
              engagementMetrics: {
                ...state.profile.engagementMetrics,
                totalChoices: newTotalChoices,
                averageResponseTime: newAverageResponseTime,
              },
            },
          };
        }),

      analyzePatterns: (): ChoicePatterns => {
        const { profile } = get();
        return profile.choicePatterns;
      },

      reset: () =>
        set({ profile: initialProfile }),
    }),
    {
      name: 'apophenia-player-profile',
      version: 1,
    }
  )
);
