// Secure API client for Apophenia
// Communicates with backend server to keep API keys secure

// Configuration for API endpoints with intelligent fallback detection
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-api.ondigitalocean.app' // Replace with your DigitalOcean App Platform URL
  : 'http://localhost:3001';

// API client class with enhanced error handling and connection management
export class SecureApiClient {
  private baseUrl: string;
  private connectionCache: Map<string, { available: boolean; lastChecked: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds cache for connection status

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Enhanced request method with timeout, retry logic, and intelligent error handling
   */
  private async makeRequest(endpoint: string, data?: any, options: {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
  } = {}) {
    const {
      timeout = 10000,  // 10 second timeout
      retries = 1,      // 1 retry by default
      retryDelay = 1000 // 1 second delay between retries
    } = options;

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retrying API request to ${endpoint} (attempt ${attempt + 1})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: data ? JSON.stringify(data) : undefined,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            // Check if it's a server error (5xx) that might benefit from retry
            if (response.status >= 500 && attempt < retries) {
              throw new Error(`Server error ${response.status}, will retry`);
            }
            
            // For other errors, include response details
            let errorMessage = `API request failed: ${response.status}`;
            try {
              const errorData = await response.json();
              errorMessage += ` - ${errorData.message || 'Unknown error'}`;
            } catch {
              // If response isn't JSON, use status text
              errorMessage += ` - ${response.statusText}`;
            }
            
            throw new Error(errorMessage);
          }

          // Cache successful connection
          this.cacheConnectionStatus(endpoint, true);
          
          const result = await response.json();
          return result;

        } catch (fetchError) {
          clearTimeout(timeoutId);
          throw fetchError;
        }

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Cache failed connection status
        this.cacheConnectionStatus(endpoint, false);
        
        console.error(`API request attempt ${attempt + 1} failed for ${endpoint}:`, lastError.message);
        
        // Don't retry on certain errors
        if (lastError.name === 'AbortError') {
          lastError.message = `Request timeout after ${timeout}ms`;
          break;
        }
        
        if (lastError.message.includes('Failed to fetch')) {
          lastError.message = 'Backend server is unreachable. Please check if the server is running.';
        }
        
        if (attempt === retries) {
          break;
        }
      }
    }

    throw lastError!;
  }

  /**
   * Cache connection status to avoid repeated failed requests
   */
  private cacheConnectionStatus(endpoint: string, available: boolean) {
    this.connectionCache.set(endpoint, {
      available,
      lastChecked: Date.now()
    });
  }

  /**
   * Check if endpoint was recently tested and failed
   */
  private isEndpointCached(endpoint: string): boolean {
    const cached = this.connectionCache.get(endpoint);
    if (!cached) return false;
    
    const age = Date.now() - cached.lastChecked;
    return age < this.CACHE_DURATION;
  }

  /**
   * Check if cached endpoint is available
   */
  private isCachedEndpointAvailable(endpoint: string): boolean {
    const cached = this.connectionCache.get(endpoint);
    return cached?.available ?? true; // Default to true if not cached
  }

  async generateConcept(genreConfig: any) {
    // Check cache before attempting request
    if (this.isEndpointCached('/generate-concept') && !this.isCachedEndpointAvailable('/generate-concept')) {
      throw new Error('Concept generation endpoint recently failed, using fallback');
    }
    
    return this.makeRequest('/generate-concept', { genreConfig }, {
      timeout: 15000, // Longer timeout for AI generation
      retries: 2,     // More retries for critical functionality
      retryDelay: 2000
    });
  }

  async getNextStep(playerChoice: string, worldState: any, history: any[], genreConfig: any) {
    // Check cache before attempting request
    if (this.isEndpointCached('/next-step') && !this.isCachedEndpointAvailable('/next-step')) {
      throw new Error('Next step endpoint recently failed, using fallback');
    }
    
    return this.makeRequest('/next-step', {
      playerChoice,
      worldState,
      history,
      genreConfig
    }, {
      timeout: 20000, // Even longer timeout for complex story generation
      retries: 2,
      retryDelay: 2000
    });
  }

  async generateImage(prompt: string) {
    // Image generation can be more lenient with fallbacks
    if (this.isEndpointCached('/generate-image') && !this.isCachedEndpointAvailable('/generate-image')) {
      throw new Error('Image generation endpoint recently failed, using fallback');
    }
    
    return this.makeRequest('/generate-image', { prompt }, {
      timeout: 25000, // Longest timeout for image generation
      retries: 1,     // Fewer retries since images are less critical
      retryDelay: 3000
    });
  }

  async summarizeHistory(worldState: any, lastSegment: any) {
    return this.makeRequest('/summarize-history', { worldState, lastSegment }, {
      timeout: 12000,
      retries: 1,
      retryDelay: 1500
    });
  }

  /**
   * Enhanced health check with detailed diagnostics
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'error';
    message: string;
    endpoints?: Record<string, boolean>;
    latency?: number;
  }> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for health check
      
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const latency = Date.now() - startTime;
      
      if (!response.ok) {
        return {
          status: 'error',
          message: `Health check failed with status ${response.status}`,
          latency
        };
      }
      
      const data = await response.json();
      
      return {
        status: 'healthy',
        message: 'Backend is available',
        latency,
        ...data // Include any additional health data from backend
      };
      
    } catch (error) {
      const latency = Date.now() - startTime;
      
      let message = 'Backend unavailable';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          message = 'Backend health check timeout';
        } else if (error.message.includes('Failed to fetch')) {
          message = 'Cannot connect to backend server';
        } else {
          message = error.message;
        }
      }
      
      console.error('Health check failed:', error);
      return {
        status: 'error',
        message,
        latency
      };
    }
  }

  /**
   * Test connection to specific endpoint
   */
  async testEndpoint(endpoint: string): Promise<boolean> {
    try {
      await this.makeRequest(endpoint, {}, { timeout: 3000, retries: 0 });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const apiClient = new SecureApiClient();