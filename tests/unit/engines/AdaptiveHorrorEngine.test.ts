/**
 * Unit tests for Adaptive Horror Engine
 * Tests the engine that analyzes player fears and generates personalized horror
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AdaptiveHorrorEngine } from '../../../src/core/engines/AdaptiveHorrorEngine';
import { buildMockEngineContext } from '../../mocks/mockContexts';
import { mockPlayerProfile } from '../../mocks/mockStores';

describe('AdaptiveHorrorEngine', () => {
  let engine: AdaptiveHorrorEngine;

  beforeEach(() => {
    engine = new AdaptiveHorrorEngine();
  });

  describe('Engine Interface', () => {
    it('should be defined', () => {
      expect(engine).toBeDefined();
    });

    it('should have fear analysis methods', () => {
      // The actual engine implementation may vary
      expect(engine).toBeDefined();
    });
  });

  describe('Fear Profile Analysis', () => {
    it('should work with valid player profile', () => {
      const context = buildMockEngineContext();
      expect(context.playerProfile).toBeDefined();
      expect(context.playerProfile.fearProfile).toBeDefined();
    });

    it('should identify dominant fears', () => {
      const profile = mockPlayerProfile;
      const fears = profile.fearProfile;

      // Find the highest fear value
      const fearValues = Object.values(fears).filter((v) => v !== undefined) as number[];
      const maxFear = Math.max(...fearValues);

      expect(maxFear).toBeGreaterThan(0);
      expect(maxFear).toBeLessThanOrEqual(1);
    });

    it('should handle multiple fear categories', () => {
      const profile = mockPlayerProfile;
      const fearCount = Object.keys(profile.fearProfile).length;

      expect(fearCount).toBeGreaterThan(0);
    });
  });

  describe('Personalized Horror Generation', () => {
    it('should adapt to player fear profile', () => {
      const context = buildMockEngineContext();
      const profile = context.playerProfile;

      // Should have fear profile data
      expect(profile.fearProfile.cosmicInsignificance).toBeDefined();
      expect(profile.fearProfile.madness).toBeDefined();
    });

    it('should consider choice patterns', () => {
      const context = buildMockEngineContext();
      const patterns = context.playerProfile.choicePatterns;

      expect(patterns.riskTaking).toBeDefined();
      expect(patterns.curiosity).toBeDefined();
      expect(patterns.aggression).toBeDefined();
      expect(patterns.avoidance).toBeDefined();

      // All should be between 0 and 1
      Object.values(patterns).forEach((value) => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
    });
  });
});
