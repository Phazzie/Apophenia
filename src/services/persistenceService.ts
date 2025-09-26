/**
 * Persistence Service
 *
 * This service handles saving and loading player data to a backend API.
 * This is the client-side implementation for the "Neural Echo Chambers" feature.
 */

import { WorldState, StorySegment } from '../types';

interface SessionData {
  worldState: WorldState;
  storyHistory: StorySegment[];
}

// Use environment variable for API base URL, fallback to localhost for development
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

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
      throw new Error('Failed to save session');
    }
  } catch (error) {
    console.error('Error saving session:', error);
    // In a real app, you might want to handle this more gracefully,
    // e.g., by queueing the save request and retrying later.
  }
};

export const loadSession = async (sessionId: string): Promise<SessionData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/load/${sessionId}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.log('No saved session found for this ID.');
        return null;
      }
      throw new Error('Failed to load session');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error loading session:', error);
    return null;
  }
};