import { GenreConfig, WorldState, StorySegment } from '../types';

// Secure API client for Apophenia
// Communicates with backend server to keep API keys secure

// Configuration for API endpoints
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-api.ondigitalocean.app' // Replace with your DigitalOcean App Platform URL
  : 'http://localhost:3001';

// API client class
export class SecureApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async makeRequest(endpoint: string, data?: Record<string, unknown>) {
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

  async generateConcept(genreConfig: GenreConfig) {
    return this.makeRequest('/generate-concept', { genreConfig });
  }

  async getNextStep(playerChoice: string, worldState: WorldState, history: StorySegment[], genreConfig: GenreConfig) {
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

  async summarizeHistory(worldState: WorldState, lastSegment: StorySegment) {
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