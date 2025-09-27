/**
 * @file secureApiClient.ts
 * @description Defines a client for securely communicating with the backend server.
 * This client abstracts away the fetch calls to various backend endpoints, providing a clean
 * interface for the rest of the application to use for AI-related tasks without handling
 * API keys on the frontend.
 */

import { GenreConfig, StorySegment, WorldState } from '../types';

/**
 * @constant {string} API_BASE_URL
 * @description The base URL for the backend API. It dynamically switches between a production URL
 * and a local development URL based on the `NODE_ENV` environment variable.
 */
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-api.ondigitalocean.app' // This should be replaced with the actual production backend URL.
  : 'http://localhost:3001';

/**
 * A client class for making secure, authenticated requests to the backend API.
 * It handles the construction of requests and parsing of responses for all AI operations.
 */
export class SecureApiClient {
  private baseUrl: string;

  /**
   * Initializes the API client with the appropriate base URL.
   */
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * A generic private method for making a POST request to a specific backend endpoint.
   *
   * @private
   * @param {string} endpoint - The API endpoint to hit (e.g., '/generate-concept').
   * @param {any} [data] - The JSON payload to send with the request.
   * @returns {Promise<any>} A promise that resolves with the JSON response from the backend.
   * @throws {Error} If the network request or the API call fails.
   */
  private async makeRequest(endpoint: string, data?: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API request to ${endpoint} failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request error for endpoint ${endpoint}:`, error);
      throw error; // Re-throw the error to be handled by the calling function.
    }
  }

  /**
   * Requests a new story concept from the backend.
   * @param {GenreConfig} genreConfig - The configuration for the desired genre.
   * @returns {Promise<any>} The response from the backend containing the new concept.
   */
  async generateConcept(genreConfig: GenreConfig): Promise<any> {
    return this.makeRequest('/generate-concept', { genreConfig });
  }

  /**
   * Requests the next step in the story from the backend.
   * @param {string} playerChoice - The player's last choice.
   * @param {WorldState} worldState - The current world state.
   * @param {StorySegment[]} history - The recent story history.
   * @param {GenreConfig} genreConfig - The genre configuration.
   * @returns {Promise<any>} The response from the backend containing the next set of commands.
   */
  async getNextStep(playerChoice: string, worldState: WorldState, history: StorySegment[], genreConfig: GenreConfig): Promise<any> {
    return this.makeRequest('/next-step', {
      playerChoice,
      worldState,
      history,
      genreConfig
    });
  }

  /**
   * Requests an image generation from the backend.
   * @param {string} prompt - The prompt for the image.
   * @returns {Promise<any>} The response from the backend, typically containing an image URL.
   */
  async generateImage(prompt: string): Promise<any> {
    return this.makeRequest('/generate-image', { prompt });
  }

  /**
   * Requests a summarization of the story history from the backend.
   * @param {WorldState} worldState - The current world state.
   * @param {StorySegment} lastSegment - The last segment of the story.
   * @returns {Promise<any>} The response from the backend containing the summary.
   */
  async summarizeHistory(worldState: WorldState, lastSegment: StorySegment): Promise<any> {
    return this.makeRequest('/summarize-history', { worldState, lastSegment });
  }

  /**
   * Performs a health check against the backend API to ensure it's running and available.
   * @returns {Promise<any>} The health status of the backend.
   */
  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', message: 'Backend unavailable' };
    }
  }
}

/**
 * A singleton instance of the SecureApiClient, intended to be used throughout the application.
 */
export const apiClient = new SecureApiClient();