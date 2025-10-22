import { BackendAPIService } from '../backendAPIService';

// Mock fetch for testing
const mockFetch = jest.fn();
(global as unknown as { fetch: typeof mockFetch }).fetch = mockFetch;

describe('BackendAPIService', () => {
  let service: BackendAPIService;

  beforeEach(() => {
    service = new BackendAPIService('', 5000); // 5 second timeout for tests
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('generateImage', () => {
    it('should successfully call backend API and return response', async () => {
      const mockResponse = {
        description: 'A dark cosmic horror scene',
        fallbackUrl: 'https://example.com/image.jpg',
        imageGenerated: true,
        model: 'grok-4-fast-reasoning'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse)
      });

      const result = await service.generateImage('cosmic horror scene');

      expect(mockFetch).toHaveBeenCalledWith('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: 'cosmic horror scene' }),
        signal: expect.any(AbortSignal)
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle HTTP errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: jest.fn().mockResolvedValueOnce('Server error details')
      });

      await expect(service.generateImage('test prompt'))
        .rejects
        .toThrow('HTTP 500: Internal Server Error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(service.generateImage('test prompt'))
        .rejects
        .toThrow('Network error: Unable to connect to backend');
    });

    it('should provide fallback for empty response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({}) // Empty but valid object
      });

      const result = await service.generateImage('test prompt');

      expect(result.description).toBe('Generated image description unavailable');
      expect(result.fallbackUrl).toContain('data:image/svg+xml;base64,');
      expect(result.imageGenerated).toBe(false);
    });

    it('should handle abort signal correctly', async () => {
      const _controller = new AbortController();
      
      mockFetch.mockImplementationOnce(() => {
        // Simulate AbortError
        const error = new Error('The operation was aborted');
        error.name = 'AbortError';
        return Promise.reject(error);
      });

      await expect(service.generateImage('test prompt'))
        .rejects
        .toThrow('Request timed out after');
    });
  });

  describe('healthCheck', () => {
    it('should return true for successful health check', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true
      });

      const result = await service.healthCheck();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/health', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
    });

    it('should return false for failed health check', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false
      });

      const result = await service.healthCheck();
      expect(result).toBe(false);
    });

    it('should return false for network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.healthCheck();
      expect(result).toBe(false);
    });
  });
});