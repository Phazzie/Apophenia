// Secure API client for Apophenia
// Communicates with backend server to keep API keys secure

// Configuration for API endpoints
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-api.com' // Replace with your deployed backend URL
  : 'http://localhost:3001';

// API client class
export class SecureApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async makeRequest(endpoint: string, data?: any) {
    try {
      const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request error for ${endpoint}:`, error);
      throw error;
    }
  }

  async generateConcept(genreConfig: any) {
    return this.makeRequest('/generate-concept', { genreConfig });
  }

  async getNextStep(playerChoice: string, worldState: any, history: any[], genreConfig: any) {
    return this.makeRequest('/next-step', {
      playerChoice,
      worldState,
      history,
      genreConfig
    });
  }

  async generateImage(prompt: string) {
    return this.makeRequest('/generate-image', { prompt });
  }

  async summarizeHistory(worldState: any, lastSegment: any) {
    return this.makeRequest('/summarize-history', { worldState, lastSegment });
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', message: 'Backend unavailable' };
    }
  }
}

export const apiClient = new SecureApiClient();