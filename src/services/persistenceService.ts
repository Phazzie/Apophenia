/**
 * @file persistenceService.ts
 * @description This service provides client-side logic for saving and loading player game sessions
 * to a secure backend API. It is a key component of the "Neural Echo Chambers" feature,
 * allowing for long-term, cross-session memory.
 *
 * @note This service is intended to replace the direct use of `localStorage` for more robust,
 * scalable, and secure persistence.
 */

import { WorldState, StorySegment } from '../types';

/**
 * @interface SessionData
 * @description Defines the structure of the data object that represents a saved game session.
 * @property {WorldState} worldState - The complete state of the game world.
 * @property {StorySegment[]} storyHistory - The complete narrative history of the session.
 */
interface SessionData {
  worldState: WorldState;
  storyHistory: StorySegment[];
}

// Use environment variable for API base URL, with a fallback for local development.
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

/**
 * Saves the current game session to the backend.
 * It sends the world state and story history associated with a session ID to the server.
 *
 * @param {string} sessionId - A unique identifier for the game session.
 * @param {SessionData} data - The session data to be saved.
 * @returns {Promise<void>} A promise that resolves when the save operation is complete. It does not reject on failure but logs the error.
 */
export const saveSession = async (sessionId: string, data: SessionData): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: sessionId, data }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to save session. Status: ${response.status}. Body: ${errorBody}`);
    }
    console.log(`Session ${sessionId} saved successfully.`);
  } catch (error) {
    console.error('Error saving session:', error);
    // In a production application, this might trigger a fallback to local storage
    // or queue the save request to be retried later.
  }
};

/**
 * Loads a game session from the backend using a session ID.
 *
 * @param {string} sessionId - The unique identifier for the game session to load.
 * @returns {Promise<SessionData | null>} A promise that resolves to the loaded session data, or null if the session is not found or an error occurs.
 */
export const loadSession = async (sessionId: string): Promise<SessionData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/load/${sessionId}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`No saved session found for ID: ${sessionId}`);
        return null;
      }
      const errorBody = await response.text();
      throw new Error(`Failed to load session. Status: ${response.status}. Body: ${errorBody}`);
    }

    const result = await response.json();
    console.log(`Session ${sessionId} loaded successfully.`);
    return result.data;
  } catch (error) {
    console.error('Error loading session:', error);
    return null;
  }
};