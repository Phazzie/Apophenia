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

const API_BASE_URL = '/api/sessions'; // This would be an environment variable in a real app

export const saveSession = async (sessionId: string, data: SessionData): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
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
    const response = await fetch(`${API_BASE_URL}/${sessionId}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.log('No saved session found for this ID.');
        return null;
      }
      throw new Error('Failed to load session');
    }

    return await response.json();
  } catch (error) {
    console.error('Error loading session:', error);
    return null;
  }
};