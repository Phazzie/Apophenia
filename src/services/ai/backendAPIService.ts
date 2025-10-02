/**
 * Backend API Service for calling server-side endpoints
 * Implements the Grok backend integration with proper error handling
 */

export interface BackendImageResponse {
  description: string;
  fallbackUrl: string;
  imageGenerated: boolean;
  model: string;
}

export interface BackendImageRequest {
  prompt: string;
}

/**
 * HTTP error with context for better debugging
 */
export class BackendAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public context?: string,
    public response?: unknown
  ) {
    super(message);
    this.name = 'BackendAPIError';
  }
}

/**
 * Service class for backend API integration
 */
export class BackendAPIService {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL = '', timeout = 30000) {
    // In development, use relative URLs that will proxy to the backend
    // In production, this could be an absolute URL
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  /**
   * Call the backend image generation endpoint
   * @param prompt The image generation prompt
   * @returns Promise with the backend response
   */
  async generateImage(prompt: string): Promise<BackendImageResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}/api/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new BackendAPIError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          'image-generation',
          errorText
        );
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new BackendAPIError(
          'Invalid response format from backend',
          response.status,
          'image-generation',
          data
        );
      }

      // Ensure required fields exist with defaults
      return {
        description: data.description || 'Generated image description unavailable',
        fallbackUrl: data.fallbackUrl || this.generateEmergencyFallback(prompt),
        imageGenerated: Boolean(data.imageGenerated),
        model: data.model || 'unknown',
      };

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof BackendAPIError) {
        throw error;
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new BackendAPIError(
          'Network error: Unable to connect to backend',
          0,
          'network-error',
          error.message
        );
      }

      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
        throw new BackendAPIError(
          `Request timed out after ${this.timeout}ms`,
          408,
          'image-generation-timeout'
        );
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BackendAPIError(
        `Unexpected error: ${errorMessage}`,
        0,
        'unexpected-error',
        error
      );
    }
  }

  /**
   * Generate emergency fallback SVG when all else fails
   */
  private generateEmergencyFallback(prompt: string): string {
    const keywords = prompt.toLowerCase().split(' ').slice(0, 3).join('-');
    const svgContent = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#1a1a1e"/>
            <stop offset="100%" stop-color="#000000"/>
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <text x="50%" y="45%" font-family="monospace" font-size="18" fill="#e94560" text-anchor="middle" dy=".3em">
          The cosmic forces remain silent...
        </text>
        <text x="50%" y="55%" font-family="monospace" font-size="14" fill="#666" text-anchor="middle" dy=".3em">
          ${keywords}
        </text>
      </svg>
    `.trim();

    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  }

  /**
   * Health check to verify backend connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Default instance for use throughout the app
export const backendAPIService = new BackendAPIService();