/**
 * Tests for Grok-4 Fast Reasoning Service
 */

import { XAIAPIClient } from '../grokService';

// Mock fetch for testing
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('XAIAPIClient', () => {
  let client: XAIAPIClient;

  beforeEach(() => {
    client = new XAIAPIClient();
    jest.clearAllMocks();
  });

  describe('generateText', () => {
    it('should generate text with X.AI API', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'Mock response from X.AI',
                thinking: 'Mock thinking process'
              }
            }
          ],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 50,
            total_tokens: 150,
            thinking_tokens: 25
          }
        })
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.generateText(
        'You are a test assistant.',
        'Generate a test response.',
        { enableThinking: true }
      );

      expect(result.content).toBe('Mock response from X.AI');
      expect(result.thinking).toBe('Mock thinking process');
      expect(result.usage.total_tokens).toBe(150);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.x.ai/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer'),
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({
          error: { message: 'Unauthorized' }
        })
      };

      mockFetch.mockResolvedValue(mockResponse);

      await expect(
        client.generateText('System prompt', 'User prompt')
      ).rejects.toThrow('X.AI API error: 401 - Unauthorized');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        client.generateText('System prompt', 'User prompt')
      ).rejects.toThrow('Network error');
    });
  });

  describe('testConnection', () => {
    it('should test text generation successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'Connection successful'
              }
            }
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 2,
            total_tokens: 12
          }
        })
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.testConnection('text');

      expect(result.success).toBe(true);
      expect(result.model).toBe('grok-4-fast-reasoning');
      expect(result.contextWindow).toBe(2000000);
      expect(result.testType).toBe('text');
      expect(result.error).toBeUndefined();
    });

    it('should fail image test with appropriate error', async () => {
      const result = await client.testConnection('image');

      expect(result.success).toBe(false);
      expect(result.testType).toBe('image');
      expect(result.error).toBe('X.AI Grok-4 does not support image generation');
    });

    it('should handle connection test failures', async () => {
      mockFetch.mockRejectedValue(new Error('Connection failed'));

      const result = await client.testConnection('text');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection failed');
    });
  });

  describe('getModelInfo', () => {
    it('should return correct model information', () => {
      const info = client.getModelInfo();

      expect(info.name).toBe('grok-4-fast-reasoning');
      expect(info.provider).toBe('X.AI');
      expect(info.contextWindow).toBe(2000000);
      expect(info.supportsFunctions).toBe(false);
      expect(info.supportsThinking).toBe(true);
      expect(info.supportsImages).toBe(false);
    });
  });
});