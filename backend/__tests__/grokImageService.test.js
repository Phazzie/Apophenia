/**
 * Unit tests for GrokImageService
 */

const GrokImageService = require('../services/grokImageService');
const axios = require('axios');

jest.mock('axios');
const mockedAxios = axios;

describe('GrokImageService', () => {
  let service;
  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    service = new GrokImageService('test-api-key', mockLogger);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with API key and logger', () => {
      expect(service.apiKey).toBe('test-api-key');
      expect(service.logger).toBe(mockLogger);
      expect(service.model).toBe('grok-2-image-1212');
    });

    it('should warn when no API key provided', () => {
      const serviceWithoutKey = new GrokImageService(null, mockLogger);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'XAI_API_KEY not provided. Grok image service will not function.'
      );
    });
  });

  describe('isConfigured', () => {
    it('should return true when API key is provided', () => {
      expect(service.isConfigured()).toBe(true);
    });

    it('should return false when no API key', () => {
      const serviceWithoutKey = new GrokImageService(null, mockLogger);
      expect(serviceWithoutKey.isConfigured()).toBe(false);
    });
  });

  describe('generateImages', () => {
    const mockApiResponse = {
      data: {
        data: [
          { url: 'https://example.com/image1.jpg' },
          { url: 'https://example.com/image2.jpg' }
        ],
        usage: {
          total_tokens: 100
        }
      }
    };

    beforeEach(() => {
      mockedAxios.post.mockResolvedValue(mockApiResponse);
    });

    it('should generate images successfully', async () => {
      const result = await service.generateImages('test prompt', 2, 'url');

      expect(result).toEqual({
        images: [
          { format: 'url', url: 'https://example.com/image1.jpg', index: 0 },
          { format: 'url', url: 'https://example.com/image2.jpg', index: 1 }
        ],
        usage: { total_tokens: 100 },
        model: 'grok-2-image-1212',
        responseFormat: 'url'
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.x.ai/v1/images/generations',
        {
          model: 'grok-2-image-1212',
          prompt: 'test prompt',
          n: 2,
          image_format: 'url'
        },
        {
          headers: {
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );
    });

    it('should handle base64 format', async () => {
      const base64Response = {
        data: {
          data: [
            { b64_json: 'iVBORw0KGgoAAAANSUhEUgAA...' }
          ],
          usage: { total_tokens: 50 }
        }
      };

      mockedAxios.post.mockResolvedValue(base64Response);

      const result = await service.generateImages('test prompt', 1, 'base64');

      expect(result.images).toEqual([
        { format: 'base64', data: 'iVBORw0KGgoAAAANSUhEUgAA...', index: 0 }
      ]);
    });

    it('should throw error when not configured', async () => {
      const serviceWithoutKey = new GrokImageService(null, mockLogger);

      await expect(serviceWithoutKey.generateImages('test prompt'))
        .rejects
        .toThrow('XAI_API_KEY not configured');
    });

    it('should track usage statistics', async () => {
      await service.generateImages('test prompt', 2, 'url');

      const stats = service.getUsageStats();
      expect(stats.totalRequests).toBe(1);
      expect(stats.successfulRequests).toBe(1);
      expect(stats.totalImagesGenerated).toBe(2);
      expect(stats.totalTokensUsed).toBe(100);
    });

    it('should handle API errors appropriately', async () => {
      const apiError = new Error('API Error');
      apiError.response = {
        status: 401,
        data: { error: { message: 'Invalid API key' } }
      };

      mockedAxios.post.mockRejectedValue(apiError);

      await expect(service.generateImages('test prompt'))
        .rejects
        .toThrow('Invalid XAI API key');

      const stats = service.getUsageStats();
      expect(stats.failedRequests).toBe(1);
    });
  });

  describe('_parseImageResponse', () => {
    it('should parse URL format correctly', () => {
      const responseData = {
        data: [
          { url: 'https://example.com/image1.jpg' },
          { url: 'https://example.com/image2.jpg' }
        ]
      };

      const result = service._parseImageResponse(responseData, 'url');

      expect(result).toEqual([
        { format: 'url', url: 'https://example.com/image1.jpg', index: 0 },
        { format: 'url', url: 'https://example.com/image2.jpg', index: 1 }
      ]);
    });

    it('should parse base64 format correctly', () => {
      const responseData = {
        data: [
          { b64_json: 'iVBORw0KGgoAAAANSUhEUgAA...' }
        ]
      };

      const result = service._parseImageResponse(responseData, 'base64');

      expect(result).toEqual([
        { format: 'base64', data: 'iVBORw0KGgoAAAANSUhEUgAA...', index: 0 }
      ]);
    });

    it('should throw error for invalid response format', () => {
      const invalidResponse = { data: null };

      expect(() => service._parseImageResponse(invalidResponse, 'url'))
        .toThrow('Invalid response format from Grok API');
    });

    it('should throw error for missing image data', () => {
      const responseWithMissingUrl = {
        data: [{ /* missing url */ }]
      };

      expect(() => service._parseImageResponse(responseWithMissingUrl, 'url'))
        .toThrow('Missing URL for image 0');
    });
  });

  describe('_isRetryableError', () => {
    it('should consider network errors as retryable', () => {
      const networkError = new Error('Network Error');
      expect(service._isRetryableError(networkError)).toBe(true);
    });

    it('should consider 5xx errors as retryable', () => {
      const serverError = { response: { status: 500 } };
      expect(service._isRetryableError(serverError)).toBe(true);
    });

    it('should consider 429 as retryable', () => {
      const rateLimitError = { response: { status: 429 } };
      expect(service._isRetryableError(rateLimitError)).toBe(true);
    });

    it('should not consider 4xx errors (except 429) as retryable', () => {
      const clientError = { response: { status: 400 } };
      expect(service._isRetryableError(clientError)).toBe(false);
    });
  });

  describe('retry logic', () => {
    it('should retry on retryable errors', async () => {
      const retryableError = new Error('Network error');
      
      mockedAxios.post
        .mockRejectedValueOnce(retryableError)
        .mockRejectedValueOnce(retryableError)
        .mockResolvedValueOnce({
          data: {
            data: [{ url: 'https://example.com/success.jpg' }],
            usage: { total_tokens: 50 }
          }
        });

      const result = await service.generateImages('test prompt', 1);

      expect(mockedAxios.post).toHaveBeenCalledTimes(3);
      expect(result.images).toHaveLength(1);
    });

    it('should fail after max retries', async () => {
      const retryableError = new Error('Persistent network error');
      mockedAxios.post.mockRejectedValue(retryableError);

      await expect(service.generateImages('test prompt'))
        .rejects
        .toThrow('Grok image generation failed');

      expect(mockedAxios.post).toHaveBeenCalledTimes(3); // initial + 2 retries
    });
  });

  describe('testConnection', () => {
    it('should return success when connection works', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          data: [{ url: 'https://example.com/test.jpg' }],
          usage: { total_tokens: 25 }
        }
      });

      const result = await service.testConnection();

      expect(result).toEqual({
        success: true,
        model: 'grok-2-image-1212',
        imagesGenerated: 1
      });
    });

    it('should return error when not configured', async () => {
      const serviceWithoutKey = new GrokImageService(null, mockLogger);

      const result = await serviceWithoutKey.testConnection();

      expect(result).toEqual({
        success: false,
        error: 'XAI_API_KEY not configured'
      });
    });

    it('should return error when API call fails', async () => {
      mockedAxios.post.mockRejectedValue(new Error('API Error'));

      const result = await service.testConnection();

      expect(result).toEqual({
        success: false,
        error: 'Grok image generation failed: API Error'
      });
    });
  });

  describe('usage statistics', () => {
    it('should calculate success rate correctly', () => {
      service.usageStats.totalRequests = 10;
      service.usageStats.successfulRequests = 8;

      const stats = service.getUsageStats();
      expect(stats.successRate).toBe(80);
    });

    it('should handle zero requests for success rate', () => {
      const stats = service.getUsageStats();
      expect(stats.successRate).toBe(0);
    });

    it('should reset statistics', () => {
      service.usageStats.totalRequests = 5;
      service.resetUsageStats();

      expect(service.usageStats.totalRequests).toBe(0);
    });
  });
});