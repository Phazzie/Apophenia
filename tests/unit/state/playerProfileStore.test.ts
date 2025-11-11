/**
 * PLAYER PROFILE STORE - Unit Tests
 *
 * Tests for playerProfileStore implementation.
 * Verifies fear profile updates, choice recording, pattern analysis, and metrics.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { usePlayerProfileStore } from '../../../src/core/state/playerProfileStore';
import { Choice } from '../../../src/core/types/seams';

describe('PlayerProfileStore', () => {
  beforeEach(() => {
    // Reset store before each test
    usePlayerProfileStore.getState().reset();
  });

  describe('Initial State', () => {
    it('should have correct initial profile', () => {
      const { profile } = usePlayerProfileStore.getState();

      // Fear profile should be all zeros
      expect(profile.fearProfile.claustrophobia).toBe(0);
      expect(profile.fearProfile.isolation).toBe(0);
      expect(profile.fearProfile.bodyHorror).toBe(0);
      expect(profile.fearProfile.cosmicInsignificance).toBe(0);
      expect(profile.fearProfile.lossOfControl).toBe(0);
      expect(profile.fearProfile.madness).toBe(0);

      // Choice patterns should be at midpoint (0.5)
      expect(profile.choicePatterns.riskTaking).toBe(0.5);
      expect(profile.choicePatterns.curiosity).toBe(0.5);
      expect(profile.choicePatterns.aggression).toBe(0.5);
      expect(profile.choicePatterns.avoidance).toBe(0.5);

      // Engagement metrics should be zero
      expect(profile.engagementMetrics.totalChoices).toBe(0);
      expect(profile.engagementMetrics.averageResponseTime).toBe(0);
      expect(profile.engagementMetrics.sessionDuration).toBe(0);
    });
  });

  describe('updateFearProfile', () => {
    it('should update fear intensity', () => {
      const { updateFearProfile } = usePlayerProfileStore.getState();

      updateFearProfile('claustrophobia', 0.7);
      expect(usePlayerProfileStore.getState().profile.fearProfile.claustrophobia).toBe(
        0.7
      );

      updateFearProfile('isolation', 0.9);
      expect(usePlayerProfileStore.getState().profile.fearProfile.isolation).toBe(0.9);
    });

    it('should clamp intensity between 0 and 1', () => {
      const { updateFearProfile } = usePlayerProfileStore.getState();

      updateFearProfile('madness', 1.5);
      expect(usePlayerProfileStore.getState().profile.fearProfile.madness).toBe(1);

      updateFearProfile('bodyHorror', -0.3);
      expect(usePlayerProfileStore.getState().profile.fearProfile.bodyHorror).toBe(0);
    });

    it('should handle all fear types', () => {
      const { updateFearProfile } = usePlayerProfileStore.getState();

      const fears = [
        'claustrophobia',
        'isolation',
        'bodyHorror',
        'cosmicInsignificance',
        'lossOfControl',
        'madness',
      ];

      fears.forEach((fear, idx) => {
        updateFearProfile(fear, (idx + 1) * 0.1);
      });

      const { fearProfile } = usePlayerProfileStore.getState().profile;
      expect(fearProfile.claustrophobia).toBeCloseTo(0.1);
      expect(fearProfile.isolation).toBeCloseTo(0.2);
      expect(fearProfile.bodyHorror).toBeCloseTo(0.3);
      expect(fearProfile.cosmicInsignificance).toBeCloseTo(0.4);
      expect(fearProfile.lossOfControl).toBeCloseTo(0.5);
      expect(fearProfile.madness).toBeCloseTo(0.6);
    });

    it('should ignore unknown fear types', () => {
      const { updateFearProfile } = usePlayerProfileStore.getState();
      const initialProfile = usePlayerProfileStore.getState().profile;

      updateFearProfile('nonExistentFear', 0.8);

      // Profile should remain unchanged
      expect(usePlayerProfileStore.getState().profile).toEqual(initialProfile);
    });
  });

  describe('recordChoice', () => {
    it('should increment total choices', () => {
      const choice: Choice = { id: '1', text: 'Test choice' };

      usePlayerProfileStore.getState().recordChoice(choice, 1000);
      expect(usePlayerProfileStore.getState().profile.engagementMetrics.totalChoices).toBe(
        1
      );

      usePlayerProfileStore.getState().recordChoice(choice, 1500);
      expect(usePlayerProfileStore.getState().profile.engagementMetrics.totalChoices).toBe(
        2
      );
    });

    it('should calculate average response time', () => {
      const choice: Choice = { id: '1', text: 'Test' };

      usePlayerProfileStore.getState().recordChoice(choice, 1000);
      expect(
        usePlayerProfileStore.getState().profile.engagementMetrics.averageResponseTime
      ).toBe(1000);

      usePlayerProfileStore.getState().recordChoice(choice, 2000);
      expect(
        usePlayerProfileStore.getState().profile.engagementMetrics.averageResponseTime
      ).toBe(1500); // (1000 + 2000) / 2

      usePlayerProfileStore.getState().recordChoice(choice, 3000);
      expect(
        usePlayerProfileStore.getState().profile.engagementMetrics.averageResponseTime
      ).toBe(2000); // (1000 + 2000 + 3000) / 3
    });

    it('should increase risk-taking for high psychological weight', () => {
      const riskyChoice: Choice = {
        id: '1',
        text: 'Risky choice',
        psychologicalWeight: 0.9,
      };

      const initialRiskTaking =
        usePlayerProfileStore.getState().profile.choicePatterns.riskTaking;

      usePlayerProfileStore.getState().recordChoice(riskyChoice, 1000);

      const newRiskTaking =
        usePlayerProfileStore.getState().profile.choicePatterns.riskTaking;
      expect(newRiskTaking).toBeGreaterThan(initialRiskTaking);
    });

    it('should increase curiosity and risk-taking for intrusive choices', () => {
      const intrusiveChoice: Choice = {
        id: '1',
        text: 'Disturbing choice',
        isIntrusive: true,
      };

      const initial = usePlayerProfileStore.getState().profile.choicePatterns;

      usePlayerProfileStore.getState().recordChoice(intrusiveChoice, 1000);

      const updated = usePlayerProfileStore.getState().profile.choicePatterns;
      expect(updated.curiosity).toBeGreaterThan(initial.curiosity);
      expect(updated.riskTaking).toBeGreaterThan(initial.riskTaking);
    });

    it('should increase aggression for aggressive choices', () => {
      const aggressiveChoice: Choice = {
        id: '1',
        text: 'Attack the creature',
      };

      const initialAggression =
        usePlayerProfileStore.getState().profile.choicePatterns.aggression;

      usePlayerProfileStore.getState().recordChoice(aggressiveChoice, 1000);

      const newAggression =
        usePlayerProfileStore.getState().profile.choicePatterns.aggression;
      expect(newAggression).toBeGreaterThan(initialAggression);
    });

    it('should increase avoidance for avoidance choices', () => {
      const avoidanceChoice: Choice = {
        id: '1',
        text: 'Run away and hide',
      };

      const initialAvoidance =
        usePlayerProfileStore.getState().profile.choicePatterns.avoidance;

      usePlayerProfileStore.getState().recordChoice(avoidanceChoice, 1000);

      const newAvoidance =
        usePlayerProfileStore.getState().profile.choicePatterns.avoidance;
      expect(newAvoidance).toBeGreaterThan(initialAvoidance);
    });

    it('should increase curiosity for investigative choices', () => {
      const investigativeChoice: Choice = {
        id: '1',
        text: 'Investigate the strange sound',
      };

      const initialCuriosity =
        usePlayerProfileStore.getState().profile.choicePatterns.curiosity;

      usePlayerProfileStore.getState().recordChoice(investigativeChoice, 1000);

      const newCuriosity =
        usePlayerProfileStore.getState().profile.choicePatterns.curiosity;
      expect(newCuriosity).toBeGreaterThan(initialCuriosity);
    });

    it('should cap patterns at 1.0', () => {
      const riskyChoice: Choice = {
        id: '1',
        text: 'Very risky',
        psychologicalWeight: 0.9,
      };

      // Record many risky choices
      for (let i = 0; i < 50; i++) {
        usePlayerProfileStore.getState().recordChoice(riskyChoice, 1000);
      }

      const { choicePatterns } = usePlayerProfileStore.getState().profile;
      expect(choicePatterns.riskTaking).toBeLessThanOrEqual(1.0);
      expect(choicePatterns.curiosity).toBeLessThanOrEqual(1.0);
      expect(choicePatterns.aggression).toBeLessThanOrEqual(1.0);
      expect(choicePatterns.avoidance).toBeLessThanOrEqual(1.0);
    });
  });

  describe('analyzePatterns', () => {
    it('should return current choice patterns', () => {
      const choice: Choice = { id: '1', text: 'Attack' };

      usePlayerProfileStore.getState().recordChoice(choice, 1000);

      const patterns = usePlayerProfileStore.getState().analyzePatterns();

      expect(patterns).toEqual(
        usePlayerProfileStore.getState().profile.choicePatterns
      );
      expect(patterns.riskTaking).toBeDefined();
      expect(patterns.curiosity).toBeDefined();
      expect(patterns.aggression).toBeDefined();
      expect(patterns.avoidance).toBeDefined();
    });
  });

  describe('reset', () => {
    it('should reset profile to initial state', () => {
      const { updateFearProfile, recordChoice, reset } =
        usePlayerProfileStore.getState();

      // Modify profile
      updateFearProfile('madness', 0.8);
      recordChoice({ id: '1', text: 'Test' }, 1000);

      // Reset
      reset();

      const { profile } = usePlayerProfileStore.getState();

      // Check fear profile reset
      expect(profile.fearProfile.madness).toBe(0);

      // Check patterns reset
      expect(profile.choicePatterns.riskTaking).toBe(0.5);

      // Check metrics reset
      expect(profile.engagementMetrics.totalChoices).toBe(0);
      expect(profile.engagementMetrics.averageResponseTime).toBe(0);
    });
  });

  describe('Interface Compliance', () => {
    it('should implement all required methods', () => {
      const store = usePlayerProfileStore.getState();

      expect(typeof store.updateFearProfile).toBe('function');
      expect(typeof store.recordChoice).toBe('function');
      expect(typeof store.analyzePatterns).toBe('function');
      expect(typeof store.reset).toBe('function');
    });

    it('should have profile property with correct structure', () => {
      const { profile } = usePlayerProfileStore.getState();

      expect(profile).toBeDefined();
      expect(profile.fearProfile).toBeDefined();
      expect(profile.choicePatterns).toBeDefined();
      expect(profile.engagementMetrics).toBeDefined();
    });
  });
});
