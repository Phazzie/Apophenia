/**
 * Integration Test: AI → Commands
 * Tests the integration between AI services and command execution
 */

import { describe, it, expect } from 'vitest';
import { MockAIService, mockCommands } from '../mocks/mockAIService';
import { buildMockAIContext } from '../mocks/mockContexts';
import { assertValidCommand } from '../utils/testHelpers';
import { AIProvider } from '../../src/core/types/seams';

describe('AI → Command Integration', () => {
  describe('AI Response to Commands', () => {
    it('should generate valid commands from AI response', async () => {
      const aiService = new MockAIService();
      const context = buildMockAIContext();

      const response = await aiService.generateResponse({
        provider: AIProvider.MOCK,
        prompt: 'Generate story continuation',
        context,
      });

      expect(response.commands).toBeDefined();
      expect(Array.isArray(response.commands)).toBe(true);
      expect(response.commands.length).toBeGreaterThan(0);

      response.commands.forEach((command) => {
        assertValidCommand(command);
      });
    });

    it('should handle displayText commands', async () => {
      const aiService = new MockAIService();
      const context = buildMockAIContext();

      const response = await aiService.generateResponse({
        provider: AIProvider.MOCK,
        prompt: 'Test prompt',
        context,
      });

      const displayTextCommands = response.commands.filter((cmd) => cmd.type === 'displayText');
      expect(displayTextCommands.length).toBeGreaterThan(0);

      displayTextCommands.forEach((cmd) => {
        expect(cmd.type).toBe('displayText');
        expect(cmd.payload).toHaveProperty('content');
        expect(cmd.payload).toHaveProperty('segmentId');
      });
    });

    it('should handle displayChoices commands', async () => {
      const aiService = new MockAIService();
      const context = buildMockAIContext();

      const response = await aiService.generateResponse({
        provider: AIProvider.MOCK,
        prompt: 'Test prompt',
        context,
      });

      const choiceCommands = response.commands.filter((cmd) => cmd.type === 'displayChoices');

      if (choiceCommands.length > 0) {
        choiceCommands.forEach((cmd) => {
          expect(cmd.type).toBe('displayChoices');
          expect(cmd.payload).toHaveProperty('choices');
          expect(Array.isArray(cmd.payload.choices)).toBe(true);
        });
      }
    });

    it('should handle generateImage commands', async () => {
      const aiService = new MockAIService();
      const context = buildMockAIContext();

      const response = await aiService.generateResponse({
        provider: AIProvider.MOCK,
        prompt: 'Test prompt',
        context,
      });

      const imageCommands = response.commands.filter((cmd) => cmd.type === 'generateImage');

      if (imageCommands.length > 0) {
        imageCommands.forEach((cmd) => {
          expect(cmd.type).toBe('generateImage');
          expect(cmd.payload).toHaveProperty('prompt');
          expect(cmd.payload).toHaveProperty('segmentId');
        });
      }
    });
  });

  describe('Command Validation', () => {
    it('should validate all mock commands', () => {
      mockCommands.forEach((command) => {
        assertValidCommand(command);
      });
    });

    it('should have proper command structure', () => {
      mockCommands.forEach((command) => {
        expect(command).toHaveProperty('type');
        expect(command).toHaveProperty('payload');
        expect(typeof command.type).toBe('string');
        expect(typeof command.payload).toBe('object');
      });
    });
  });

  describe('AI Service Integration', () => {
    it('should be available', async () => {
      const aiService = new MockAIService();
      const isAvailable = await aiService.isAvailable();
      expect(isAvailable).toBe(true);
    });

    it('should estimate tokens', () => {
      const aiService = new MockAIService();
      const text = 'This is a test prompt for token estimation';
      const tokens = aiService.estimateTokens(text);

      expect(tokens).toBeGreaterThan(0);
      expect(typeof tokens).toBe('number');
    });

    it('should have correct provider configuration', () => {
      const aiService = new MockAIService();

      expect(aiService.provider).toBe(AIProvider.MOCK);
      expect(aiService.maxTokens).toBeGreaterThan(0);
      expect(typeof aiService.supportsImages).toBe('boolean');
    });
  });
});
