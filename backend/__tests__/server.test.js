/**
 * Integration tests for Grok Image Proxy Backend
 */

const request = require('supertest');

// Mock the GrokImageService before importing the server
const mockGrokService = {
  isConfigured: jest.fn(() => true),
  generateImages: jest.fn(),
  getUsageStats: jest.fn(() => ({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalImagesGenerated: 0,
    totalTokensUsed: 0,
    successRate: 0
  })),
  testConnection: jest.fn()
};

jest.mock('../services/grokImageService', () => {
  return jest.fn(() => mockGrokService);
});

const app = require('../server');

describe('Apophenia Backend API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        environment: expect.any(String),
        services: {
          grok: expect.any(Boolean)
        }
      });
    });
  });

  describe('POST /api/generateImage', () => {
    const validRequestBody = {
      prompt: 'A beautiful cosmic nebula with stars',
      imageCount: 2,
      responseFormat: 'url'
    };

    const mockSuccessResponse = {
      images: [
        { format: 'url', url: 'https://example.com/image1.jpg', index: 0 },
        { format: 'url', url: 'https://example.com/image2.jpg', index: 1 }
      ],
      usage: { total_tokens: 100 },
      model: 'grok-2-image-1212'
    };

    beforeEach(() => {
      mockGrokService.generateImages.mockResolvedValue(mockSuccessResponse);
    });

    describe('Success scenarios', () => {
      it('should generate images successfully with valid request', async () => {
        const response = await request(app)
          .post('/api/generateImage')
          .send(validRequestBody)
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          images: expect.arrayContaining([
            expect.objectContaining({
              format: 'url',
              url: expect.any(String),
              index: expect.any(Number)
            })
          ]),
          metadata: expect.objectContaining({
            imageCount: 2,
            responseFormat: 'url',
            generatedAt: expect.any(String),
            duration: expect.any(String)
          }),
          usage: expect.any(Object)
        });

        expect(mockGrokService.generateImages).toHaveBeenCalledWith(
          validRequestBody.prompt,
          validRequestBody.imageCount,
          validRequestBody.responseFormat
        );
      });

      it('should handle base64 response format', async () => {
        const base64Request = {
          ...validRequestBody,
          responseFormat: 'base64'
        };
        
        const base64Response = {
          images: [
            { format: 'base64', data: 'iVBORw0KGgoAAAANSUhEUgAA...', index: 0 }
          ],
          usage: { total_tokens: 50 },
          model: 'grok-2-image-1212'
        };
        
        mockGrokService.generateImages.mockResolvedValue(base64Response);

        const response = await request(app)
          .post('/api/generateImage')
          .send(base64Request)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.images[0]).toMatchObject({
          format: 'base64',
          data: expect.any(String)
        });
      });

      it('should use default values for optional parameters', async () => {
        const minimalRequest = {
          prompt: 'A simple test image'
        };

        await request(app)
          .post('/api/generateImage')
          .send(minimalRequest)
          .expect(200);

        expect(mockGrokService.generateImages).toHaveBeenCalledWith(
          minimalRequest.prompt,
          4, // default imageCount
          'url' // default responseFormat
        );
      });
    });

    describe('Validation errors', () => {
      it('should reject requests without prompt', async () => {
        const response = await request(app)
          .post('/api/generateImage')
          .send({
            imageCount: 2
          })
          .expect(400);

        expect(response.body).toMatchObject({
          error: 'Validation failed',
          message: 'Invalid request parameters',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'prompt',
              message: expect.stringContaining('required')
            })
          ])
        });
      });

      it('should reject prompts that are too short', async () => {
        const response = await request(app)
          .post('/api/generateImage')
          .send({
            prompt: 'short'
          })
          .expect(400);

        expect(response.body.details[0]).toMatchObject({
          field: 'prompt',
          message: expect.stringContaining('at least 10 characters')
        });
      });

      it('should reject prompts that are too long', async () => {
        const longPrompt = 'A'.repeat(1001);
        
        const response = await request(app)
          .post('/api/generateImage')
          .send({
            prompt: longPrompt
          })
          .expect(400);

        expect(response.body.details[0]).toMatchObject({
          field: 'prompt',
          message: expect.stringContaining('cannot exceed 1000 characters')
        });
      });

      it('should reject invalid imageCount values', async () => {
        const response = await request(app)
          .post('/api/generateImage')
          .send({
            prompt: 'A valid prompt for testing',
            imageCount: 15
          })
          .expect(400);

        expect(response.body.details[0]).toMatchObject({
          field: 'imageCount',
          message: expect.stringContaining('cannot exceed 10')
        });
      });

      it('should reject invalid responseFormat values', async () => {
        const response = await request(app)
          .post('/api/generateImage')
          .send({
            prompt: 'A valid prompt for testing',
            responseFormat: 'invalid'
          })
          .expect(400);

        expect(response.body.details[0]).toMatchObject({
          field: 'responseFormat',
          message: expect.stringContaining('must be either "url" or "base64"')
        });
      });
    });

    describe('Service error scenarios', () => {
      it('should handle API key not configured error', async () => {
        mockGrokService.generateImages.mockRejectedValue(
          new Error('XAI_API_KEY not configured')
        );

        const response = await request(app)
          .post('/api/generateImage')
          .send(validRequestBody)
          .expect(500);

        expect(response.body).toMatchObject({
          error: 'Internal Server Error'
        });
      });

      it('should handle Grok API timeout', async () => {
        mockGrokService.generateImages.mockRejectedValue(
          new Error('Request timeout')
        );

        const response = await request(app)
          .post('/api/generateImage')
          .send(validRequestBody)
          .expect(500);

        expect(response.body.error).toBeDefined();
      });

      it('should handle rate limiting errors', async () => {
        mockGrokService.generateImages.mockRejectedValue(
          new Error('Rate limit exceeded for Grok API')
        );

        const response = await request(app)
          .post('/api/generateImage')
          .send(validRequestBody)
          .expect(500);

        expect(response.body.error).toBeDefined();
      });
    });

    describe('Rate limiting', () => {
      it('should apply rate limits to API endpoints', async () => {
        // This is a basic test - in a real scenario you'd need to make multiple requests
        // to trigger rate limiting, but that would make the test slow and flaky
        const response = await request(app)
          .post('/api/generateImage')
          .send(validRequestBody)
          .expect(200);

        expect(response.headers).toHaveProperty('ratelimit-limit');
        expect(response.headers).toHaveProperty('ratelimit-remaining');
        expect(response.headers).toHaveProperty('ratelimit-reset');
      });
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/api/unknown')
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Not Found',
        message: expect.stringContaining('not found'),
        availableEndpoints: expect.arrayContaining([
          'GET /health',
          'POST /api/generateImage'
        ])
      });
    });
  });
});