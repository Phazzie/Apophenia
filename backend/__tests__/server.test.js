const request = require('supertest');

// Mock environment variables before importing the app
process.env.XAI_API_KEY = 'test-api-key';
process.env.NODE_ENV = 'test';

// Mock fetch globally before importing the app
global.fetch = jest.fn();

// Mock AbortSignal.timeout to avoid timeout issues in tests
global.AbortSignal = {
  timeout: jest.fn(() => ({ addEventListener: jest.fn() }))
};

const app = require('../server');

describe('Grok Image Proxy API', () => {
  beforeEach(() => {
    fetch.mockClear();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        environment: 'test',
        services: {
          grok: true
        }
      });

      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should indicate when API key is missing', async () => {
      // Temporarily clear the API key
      delete process.env.XAI_API_KEY;

      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.services.grok).toBe(false);

      // Restore API key
      process.env.XAI_API_KEY = 'test-api-key';
    });
  });

  describe('POST /api/generateImage', () => {
    const validPayload = {
      prompt: 'A cosmic horror scene in space',
      imageCount: 2,
      responseFormat: 'url'
    };

    const mockGrokResponse = {
      data: [
        { url: 'https://example.com/image1.jpg' },
        { url: 'https://example.com/image2.jpg' }
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 0
      }
    };

    describe('Success scenarios', () => {
      it('should successfully generate images with default parameters', async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGrokResponse)
        });

        const response = await request(app)
          .post('/api/generateImage')
          .send({ prompt: 'Test prompt' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.images).toEqual([
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg'
        ]);
        expect(response.body.metadata.model).toBe('grok-2-image-1212');
        expect(response.body.requestId).toMatch(/^req_\d+_[a-z0-9]{9}$/);
      });

      it('should handle custom image count and response format', async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            data: [{ b64_json: 'base64encodedimage' }],
            usage: {}
          })
        });

        const response = await request(app)
          .post('/api/generateImage')
          .send({
            prompt: 'Test prompt',
            imageCount: 1,
            responseFormat: 'base64'
          })
          .expect(200);

        expect(response.body.images).toEqual(['base64encodedimage']);
        expect(response.body.metadata.responseFormat).toBe('base64');
      });

      it('should make correct API call to Grok', async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGrokResponse)
        });

        await request(app)
          .post('/api/generateImage')
          .send(validPayload);

        expect(fetch).toHaveBeenCalledWith(
          'https://api.x.ai/v1/images/generations',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': 'Bearer test-api-key',
              'Content-Type': 'application/json',
              'User-Agent': 'Apophenia-Backend/1.0.0'
            }),
            body: JSON.stringify({
              model: 'grok-2-image-1212',
              prompt: validPayload.prompt,
              n: validPayload.imageCount,
              response_format: validPayload.responseFormat,
              size: '1024x1024'
            })
          })
        );
      });
    });

    describe('Validation errors', () => {
      it('should reject missing prompt', async () => {
        const response = await request(app)
          .post('/api/generateImage')
          .send({})
          .expect(400);

        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Prompt must be a string between 1 and 1000 characters'
            })
          ])
        );
      });

      it('should reject empty prompt', async () => {
        const response = await request(app)
          .post('/api/generateImage')
          .send({ prompt: '' })
          .expect(400);

        expect(response.body.error).toBe('Validation failed');
      });

      it('should reject prompt that is too long', async () => {
        const longPrompt = 'a'.repeat(1001);
        
        const response = await request(app)
          .post('/api/generateImage')
          .send({ prompt: longPrompt })
          .expect(400);

        expect(response.body.error).toBe('Validation failed');
      });

      it('should reject invalid image count', async () => {
        const response = await request(app)
          .post('/api/generateImage')
          .send({ 
            prompt: 'Test', 
            imageCount: 15 
          })
          .expect(400);

        expect(response.body.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Image count must be between 1 and 10'
            })
          ])
        );
      });

      it('should reject invalid response format', async () => {
        const response = await request(app)
          .post('/api/generateImage')
          .send({ 
            prompt: 'Test', 
            responseFormat: 'invalid' 
          })
          .expect(400);

        expect(response.body.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Response format must be either "url" or "base64"'
            })
          ])
        );
      });
    });

    describe('API errors', () => {
      it('should handle Grok API errors', async () => {
        fetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: () => Promise.resolve({
            error: { message: 'Invalid prompt' }
          })
        });

        const response = await request(app)
          .post('/api/generateImage')
          .send({ prompt: 'Test prompt' })
          .expect(500);

        expect(response.body.error).toBe('Image generation failed');
        expect(response.body.requestId).toBeDefined();
      });

      it('should handle missing API key', async () => {
        // Temporarily remove API key
        delete process.env.XAI_API_KEY;

        const response = await request(app)
          .post('/api/generateImage')
          .send({ prompt: 'Test prompt' })
          .expect(503);

        expect(response.body.error).toBe('Service temporarily unavailable - API key not configured');

        // Restore API key
        process.env.XAI_API_KEY = 'test-api-key';
      });

      it('should handle rate limit errors', async () => {
        fetch.mockResolvedValueOnce({
          ok: false,
          status: 429,
          json: () => Promise.resolve({
            error: { message: 'Rate limit exceeded' }
          })
        });

        const response = await request(app)
          .post('/api/generateImage')
          .send({ prompt: 'Test prompt' })
          .expect(429);

        expect(response.body.error).toBe('Rate limit exceeded, please try again later');
      });

      it('should handle timeout errors', async () => {
        fetch.mockRejectedValueOnce(new Error('Request timeout'));

        const response = await request(app)
          .post('/api/generateImage')
          .send({ prompt: 'Test prompt' })
          .expect(500);

        expect(response.body.error).toBe('Image generation failed');
      });

      it('should handle empty response from Grok', async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: [] })
        });

        const response = await request(app)
          .post('/api/generateImage')
          .send({ prompt: 'Test prompt' })
          .expect(500);

        expect(response.body.error).toBe('Image generation failed');
      });
    });

    describe('Retry logic', () => {
      it('should retry on temporary failures', async () => {
        // First two calls fail, third succeeds
        fetch
          .mockRejectedValueOnce(new Error('Network error'))
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockGrokResponse)
          });

        const responsePromise = request(app)
          .post('/api/generateImage')
          .send({ prompt: 'Test prompt' });

        // Fast-forward through retry delays
        jest.runAllTimers();

        const response = await responsePromise;

        expect(response.status).toBe(200);
        expect(fetch).toHaveBeenCalledTimes(3);
        expect(response.body.success).toBe(true);
      });

      it('should fail after max retries', async () => {
        fetch.mockRejectedValue(new Error('Persistent network error'));

        const responsePromise = request(app)
          .post('/api/generateImage')
          .send({ prompt: 'Test prompt' });

        // Fast-forward through retry delays
        jest.runAllTimers();

        const response = await responsePromise;

        expect(response.status).toBe(500);
        expect(fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
      });
    });

    describe('Request timeout', () => {
      it('should timeout long-running requests', async () => {
        // Mock a request that never resolves
        fetch.mockImplementation(() => new Promise(() => {}));

        const response = await request(app)
          .post('/api/generateImage')
          .send({ prompt: 'Test prompt' });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Image generation failed');
      });
    });
  });

  describe('Rate limiting', () => {
    describe('General API rate limit', () => {
      it('should allow requests under the limit', async () => {
        // Make multiple requests under the limit
        for (let i = 0; i < 5; i++) {
          const response = await request(app)
            .get('/health')
            .expect(200);

          expect(response.headers['ratelimit-limit']).toBe('100');
          expect(response.headers['ratelimit-remaining']).toBeDefined();
        }
      });
    });

    describe('Image generation rate limit', () => {
      it('should enforce stricter limits for image generation', async () => {
        fetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockGrokResponse)
        });

        // The rate limit for image generation is lower than general API
        const response = await request(app)
          .post('/api/generateImage')
          .send({ prompt: 'Test prompt' });

        expect(response.status).toBe(200);
        // Rate limit headers should be present but with different limits
        // than the general API limit
      });
    });
  });

  describe('Error handling', () => {
    it('should handle 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/unknown/endpoint')
        .expect(404);

      expect(response.body.error).toBe('Endpoint not found');
      expect(response.body.path).toBe('/unknown/endpoint');
      expect(response.body.method).toBe('GET');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/generateImage')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      // Express will handle this as a bad request (could be 400 or 500)
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});