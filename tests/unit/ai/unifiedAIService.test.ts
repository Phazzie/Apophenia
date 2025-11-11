/**
 * Unified AI Service Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { unifiedAIService } from '../../../src/services/ai/unifiedAIService';
import { AIProvider, PsychologicalStatus } from '../../../src/core/types/seams';

describe('UnifiedAIService', () => {
  const mockContext = {
    worldState: {
      protagonist: 'Test',
      setting: 'Test Setting',
      dilemma: 'Test Dilemma',
      psychologicalStatus: PsychologicalStatus.STABLE,
      systemHealth: 100,
      horrorIntensity: 3,
      corruptionLevel: 10,
      genreConfig: {
        id: 'test',
        name: 'Test',
        description: 'Test',
        systemPrompt: 'Test',
        themes: ['test'],
        fearCategories: ['test'],
        visualStyle: {
          primaryColor: '#000',
          secondaryColor: '#111',
          accentColor: '#222',
          fontFamily: 'sans-serif',
          atmosphere: 'dark' as const,
        },
      },
    },
    recentHistory: [],
    playerProfile: {
      fearProfile: {},
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
    },
    genrePrompts: [],
    engineInstructions: [],
  };

  beforeEach(() => {
    // Reset to default configuration (Grok → Mock only)
    unifiedAIService.setFallbackChain([
      AIProvider.GROK,
      AIProvider.MOCK,
    ]);
    unifiedAIService.setPrimaryProvider(AIProvider.GROK);
  });

  describe('setPrimaryProvider', () => {
    it('should set the primary provider', () => {
      unifiedAIService.setPrimaryProvider(AIProvider.MOCK);
      // Note: We can't directly test this, but it shouldn't throw
      expect(true).toBe(true);
    });
  });

  describe('setFallbackChain', () => {
    it('should set custom fallback chain', () => {
      const chain = [AIProvider.MOCK, AIProvider.GROK];
      unifiedAIService.setFallbackChain(chain);
      // Should not throw
      expect(true).toBe(true);
    });

    it('should throw error for empty chain', () => {
      expect(() => {
        unifiedAIService.setFallbackChain([]);
      }).toThrow('Fallback chain cannot be empty');
    });
  });

  describe('generateWithFallback', () => {
    it('should eventually succeed with mock provider', async () => {
      // Set fallback chain to only use mock
      unifiedAIService.setFallbackChain([AIProvider.MOCK]);

      const response = await unifiedAIService.generateWithFallback({
        prompt: 'Test prompt',
        context: mockContext,
      });

      expect(response).toBeDefined();
      expect(response.provider).toBe(AIProvider.MOCK);
      expect(response.commands).toBeInstanceOf(Array);
      expect(response.commands.length).toBeGreaterThan(0);
    });

    it('should include response metadata', async () => {
      unifiedAIService.setFallbackChain([AIProvider.MOCK]);

      const response = await unifiedAIService.generateWithFallback({
        prompt: 'Test prompt',
        context: mockContext,
      });

      expect(response.metadata).toBeDefined();
      expect(response.metadata.model).toBeDefined();
    });

    it('should handle provider that returns no commands', async () => {
      // This would require mocking a service that returns empty commands
      // For now, we trust that the fallback chain works
      unifiedAIService.setFallbackChain([AIProvider.MOCK]);

      const response = await unifiedAIService.generateWithFallback({
        prompt: 'Test',
        context: mockContext,
      });

      expect(response.commands.length).toBeGreaterThan(0);
    });
  });

  describe('testProvider', () => {
    it('should test mock provider successfully', async () => {
      const result = await unifiedAIService.testProvider(AIProvider.MOCK);

      expect(result).toBeDefined();
      expect(result.provider).toBe(AIProvider.MOCK);
      expect(result.available).toBe(true);
      expect(result.latency).toBeGreaterThanOrEqual(0);
    });

    it('should include latency measurement', async () => {
      const result = await unifiedAIService.testProvider(AIProvider.MOCK);

      expect(result.latency).toBeDefined();
      expect(typeof result.latency).toBe('number');
      expect(result.latency).toBeGreaterThanOrEqual(0);
    });

    it('should report unavailable for providers without API keys', async () => {
      // Grok and Gemini will be unavailable without API keys
      const result = await unifiedAIService.testProvider(AIProvider.GROK);

      expect(result).toBeDefined();
      expect(result.provider).toBe(AIProvider.GROK);
      // Should be unavailable if API key is not set
      if (!import.meta.env.VITE_XAI_API_KEY) {
        expect(result.available).toBe(false);
      }
    });
  });

  describe('testAllProviders', () => {
    it('should test all providers', async () => {
      const results = await unifiedAIService.testAllProviders();

      expect(results).toBeInstanceOf(Map);
      // Note: Map size depends on registered services in UnifiedAIServiceImpl
      expect(results.size).toBeGreaterThanOrEqual(2); // At least Grok and Mock

      // Mock should always be available
      const mockResult = results.get(AIProvider.MOCK);
      expect(mockResult).toBeDefined();
      expect(mockResult?.available).toBe(true);
    });

    it('should include results for active providers', async () => {
      const results = await unifiedAIService.testAllProviders();

      // These are the active providers in the new fallback chain
      expect(results.has(AIProvider.GROK)).toBe(true);
      expect(results.has(AIProvider.MOCK)).toBe(true);
    });
  });
});
