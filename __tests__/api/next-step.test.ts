import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/ai/next-step/route';
import * as gameLogic from '@/lib/game-logic';

vi.mock('@/lib/game-logic', () => ({
  getNextStep: vi.fn(),
}));

describe('/api/ai/next-step', () => {
  it('should call getNextStep and return the result', async () => {
    const mockResult = { commands: [{ type: 'displayText', payload: { content: 'Hello', segmentId: '1' } }] };
    (gameLogic.getNextStep as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);

    const requestBody = {
      playerChoice: 'Go left',
      worldState: {},
      history: [],
      genreConfig: {},
    };

    const request = new Request('http://localhost/api/ai/next-step', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual(mockResult);
    expect(gameLogic.getNextStep).toHaveBeenCalledWith(
      requestBody.playerChoice,
      requestBody.worldState,
      requestBody.history,
      requestBody.genreConfig
    );
  });

  it('should return a 500 error if getNextStep throws an error', async () => {
    const errorMessage = 'Test error';
    (gameLogic.getNextStep as ReturnType<typeof vi.fn>).mockRejectedValue(new Error(errorMessage));

    const requestBody = {
      playerChoice: 'Go left',
      worldState: {},
      history: [],
      genreConfig: {},
    };

    const request = new Request('http://localhost/api/ai/next-step', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody).toEqual({ error: 'Internal Server Error', details: errorMessage });
  });
});
