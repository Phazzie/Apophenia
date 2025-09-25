import { saveSession, loadSession } from '../persistenceService';
import { WorldState, StorySegment } from '../../types';

global.fetch = jest.fn();

describe('Persistence Service', () => {
  const mockSessionId = 'test-session';
  const mockWorldState: Partial<WorldState> = { protagonist: 'Test' };
  const mockStoryHistory: Partial<StorySegment>[] = [{ id: '1', text: 'test' }];
  const mockSessionData = {
    worldState: mockWorldState as WorldState,
    storyHistory: mockStoryHistory as StorySegment[],
  };

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('saveSession', () => {
    it('should make a POST request to the correct endpoint', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

      await saveSession(mockSessionId, mockSessionData);

      expect(fetch).toHaveBeenCalledWith(`/api/sessions/${mockSessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockSessionData),
      });
    });

    it('should handle failed save requests gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
      console.error = jest.fn(); // Suppress console error

      await saveSession(mockSessionId, mockSessionData);

      expect(console.error).toHaveBeenCalledWith('Error saving session:', expect.any(Error));
    });
  });

  describe('loadSession', () => {
    it('should make a GET request and return session data', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSessionData,
      });

      const data = await loadSession(mockSessionId);

      expect(fetch).toHaveBeenCalledWith(`/api/sessions/${mockSessionId}`);
      expect(data).toEqual(mockSessionData);
    });

    it('should return null if no session is found (404)', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 404 });
      console.log = jest.fn(); // Suppress console log

      const data = await loadSession(mockSessionId);

      expect(data).toBeNull();
      expect(console.log).toHaveBeenCalledWith('No saved session found for this ID.');
    });

    it('should handle other failed load requests gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });
      console.error = jest.fn(); // Suppress console error

      const data = await loadSession(mockSessionId);

      expect(data).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error loading session:', expect.any(Error));
    });
  });
});