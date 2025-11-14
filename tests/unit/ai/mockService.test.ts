/**
 * Mock Service Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { mockService } from '../../../src/services/ai/mockService';
import {
  AIProvider,
  AIRequest,
  PsychologicalStatus,
} from '../../../src/core/types/seams';

describe('MockService', () => {
  const mockRequest: AIRequest = {
    provider: AIProvider.MOCK,
    prompt: 'Generate next story segment',
    context: {
      worldState: {
        protagonist: 'Test Protagonist',
        setting: 'Test Setting',
        dilemma: 'Test Dilemma',
        psychologicalStatus: PsychologicalStatus.STABLE,
        systemHealth: 100,
        horrorIntensity: 3,
        corruptionLevel: 10,
        genreConfig: {
          id: 'test',
          name: 'Test Genre',
          description: 'Test',
          systemPrompt: 'Test',
          themes: ['test'],
          fearCategories: ['test'],
          visualStyle: {
            primaryColor: '#000',
            secondaryColor: '#111',
            accentColor: '#222',
            fontFamily: 'sans-serif',
            atmosphere: 'dark',
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
    },
  };

  describe('isAvailable', () => {
    it('should always return true', async () => {
      const result = await mockService.isAvailable();
      expect(result).toBe(true);
    });
  });

  describe('generateResponse', () => {
    it('should generate a valid response', async () => {
      const response = await mockService.generateResponse(mockRequest);

      expect(response).toBeDefined();
      expect(response.provider).toBe(AIProvider.MOCK);
      expect(response.content).toBeDefined();
      expect(response.commands).toBeInstanceOf(Array);
      expect(response.metadata).toBeDefined();
      expect(response.metadata.model).toBe('mock-v1');
    });

    it('should generate valid commands', async () => {
      const response = await mockService.generateResponse(mockRequest);

      expect(response.commands.length).toBeGreaterThan(0);

      // Should have createSegment command
      const createSegment = response.commands.find((c) => c.type === 'createSegment');
      expect(createSegment).toBeDefined();

      // Should have displayText command
      const displayText = response.commands.find((c) => c.type === 'displayText');
      expect(displayText).toBeDefined();

      // Should have displayChoices command
      const displayChoices = response.commands.find((c) => c.type === 'displayChoices');
      expect(displayChoices).toBeDefined();
    });

    it('should include narrative text', async () => {
      const response = await mockService.generateResponse(mockRequest);

      const displayText = response.commands.find((c) => c.type === 'displayText');
      expect(displayText).toBeDefined();

      if (displayText && displayText.type === 'displayText') {
        expect(displayText.payload.content).toBeTruthy();
        expect(displayText.payload.content.length).toBeGreaterThan(0);
      }
    });

    it('should include choices', async () => {
      const response = await mockService.generateResponse(mockRequest);

      const displayChoices = response.commands.find((c) => c.type === 'displayChoices');
      expect(displayChoices).toBeDefined();

      if (displayChoices && displayChoices.type === 'displayChoices') {
        expect(displayChoices.payload.choices).toBeInstanceOf(Array);
        expect(displayChoices.payload.choices.length).toBeGreaterThan(0);

        // Each choice should have required fields
        displayChoices.payload.choices.forEach((choice) => {
          expect(choice.id).toBeDefined();
          expect(choice.text).toBeDefined();
        });
      }
    });

    it('should sometimes include intrusive thoughts', async () => {
      // Run multiple times to test randomness
      let hasIntrusive = false;

      for (let i = 0; i < 10; i++) {
        const response = await mockService.generateResponse(mockRequest);
        const displayChoices = response.commands.find((c) => c.type === 'displayChoices');

        if (displayChoices && displayChoices.type === 'displayChoices') {
          if (displayChoices.payload.intrusiveThought) {
            hasIntrusive = true;
            expect(displayChoices.payload.intrusiveThought.isIntrusive).toBe(true);
            break;
          }
        }
      }

      // At least one run should have an intrusive thought (probability ~0.3^10 = very low)
      expect(hasIntrusive).toBe(true);
    }, 10000); // Increase timeout to 10 seconds for multiple iterations

    it('should increase horror intensity', async () => {
      const response = await mockService.generateResponse(mockRequest);

      const updateWorld = response.commands.find((c) => c.type === 'updateWorldState');

      if (updateWorld && updateWorld.type === 'updateWorldState') {
        if ('horrorIntensity' in updateWorld.payload) {
          expect(updateWorld.payload.horrorIntensity).toBeGreaterThan(
            mockRequest.context.worldState.horrorIntensity
          );
        }
      }
    });

    it('should simulate latency', async () => {
      const startTime = Date.now();
      await mockService.generateResponse(mockRequest);
      const endTime = Date.now();

      const elapsed = endTime - startTime;
      expect(elapsed).toBeGreaterThan(500); // Min delay
    });

    it('should include metadata', async () => {
      const response = await mockService.generateResponse(mockRequest);

      expect(response.metadata.tokensUsed).toBeDefined();
      expect(response.metadata.latency).toBeDefined();
      expect(response.metadata.model).toBe('mock-v1');
    });
  });

  describe('estimateTokens', () => {
    it('should estimate tokens correctly', () => {
      const text = 'This is a test string with twenty characters';
      const tokens = mockService.estimateTokens(text);

      // ~4 characters per token
      const expected = Math.ceil(text.length / 4);
      expect(tokens).toBe(expected);
    });

    it('should handle empty string', () => {
      const tokens = mockService.estimateTokens('');
      expect(tokens).toBe(0);
    });

    it('should handle long text', () => {
      const text = 'a'.repeat(1000);
      const tokens = mockService.estimateTokens(text);

      expect(tokens).toBe(250); // 1000 / 4
    });
  });
});
