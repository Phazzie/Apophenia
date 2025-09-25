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
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await saveSession(mockSessionId, mockSessionData);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving session:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it('should handle network errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await saveSession(mockSessionId, mockSessionData);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving session:', expect.any(Error));
      consoleErrorSpy.mockRestore();
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
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const data = await loadSession(mockSessionId);

      expect(data).toBeNull();
      expect(consoleLogSpy).toHaveBeenCalledWith('No saved session found for this ID.');
      consoleLogSpy.mockRestore();
    });

    it('should handle other failed load requests gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const data = await loadSession(mockSessionId);

      expect(data).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading session:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it('should handle network errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const data = await loadSession(mockSessionId);

      expect(data).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading session:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it('should handle invalid JSON responses gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); },
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const data = await loadSession(mockSessionId);

      expect(data).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading session:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });
});