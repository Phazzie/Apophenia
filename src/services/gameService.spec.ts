/**
 * Tests for gameService.ts
 */

import {
  getNextStep,
  summarizeHistory,
  generateConcept,
  generateImage,
} from './gameService';

import {
  generateConceptFlow,
  generateImageFlow,
  nextStepFlow,
} from './ai/genkit';

import { summarizeHistoryFlow } from './flows/summaryFlow';
import type { GenreConfig, WorldState, StorySegment, Command } from '../types';

// Mock the flow modules
jest.mock('./ai/genkit', () => ({
  generateConceptFlow: jest.fn(),
  generateImageFlow: jest.fn(),
  nextStepFlow: jest.fn(),
}));

jest.mock('./flows/summaryFlow', () => ({
  summarizeHistoryFlow: jest.fn(),
}));

describe('gameService', () => {
  let consoleErrorSpy: jest.SpyInstance;

  // --- Mocks with correct types ---
  const mockWorldState: WorldState = {
    protagonist: 'Test Protagonist',
    setting: 'A test setting',
    dilemma: 'A test dilemma',
    summary: 'A test summary',
    psychologicalStatus: 'Stable',
    systemHealth: 100,
    uiDistortion: {
      transform: 'none',
      filter: 'none',
      transition: 'all 1s ease-in-out',
    },
  };

  const mockGenreConfig: GenreConfig = {
    id: 'test-genre',
    name: 'Test Genre',
    description: 'A genre for testing.',
    style: 'Test style',
    theme: {
      '--background-color': '#fff',
      '--text-color': '#000',
      '--accent-color': '#f00',
      '--font-family': 'sans-serif',
    },
    startScreenImagePrompt: 'A test image prompt.',
    conceptPrompt: 'A test concept prompt.',
    aiSystemInstruction: 'You are a test AI.',
  };

  const mockStoryHistory: StorySegment[] = [
    {
      id: 'seg-1',
      text: 'The story so far.',
      images: {},
    },
  ];

  beforeEach(() => {
    jest.resetAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('getNextStep', () => {
    it('returns commands from nextStepFlow on success', async () => {
      const commands: Command[] = [
        { type: 'displayText', payload: { content: 'Hello', segmentId: 'seg-2' } },
      ];
      (nextStepFlow as jest.Mock).mockResolvedValueOnce(commands);

      const result = await getNextStep('Open the door', mockWorldState, mockStoryHistory, mockGenreConfig);

      expect(nextStepFlow).toHaveBeenCalledWith({
        playerChoice: 'Open the door',
        worldState: mockWorldState,
        history: mockStoryHistory,
        genreConfig: mockGenreConfig,
      });
      expect(result).toEqual(commands);
    });

    it('returns fallback commands when nextStepFlow throws', async () => {
      (nextStepFlow as jest.Mock).mockRejectedValueOnce(new Error('network issue'));
      // Mock crypto.randomUUID for predictable fallback IDs
      jest
        .spyOn(crypto, 'randomUUID')
        .mockReturnValue('123e4567-e89b-12d3-a456-426614174000');

      const result = await getNextStep('Open the door', mockWorldState, [], mockGenreConfig);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error calling nextStepFlow:', expect.any(Error));
      expect(result[0].type).toBe('createSegment');
      expect(result[0].payload).toHaveProperty(
        'id',
        '123e4567-e89b-12d3-a456-426614174000'
      );
      expect(result[1].type).toBe('displayText');
      expect(result[1].payload).toHaveProperty(
        'segmentId',
        '123e4567-e89b-12d3-a456-426614174000'
      );
    });
  });

  describe('summarizeHistory', () => {
    it('forwards to summarizeHistoryFlow', async () => {
      (summarizeHistoryFlow as jest.Mock).mockResolvedValueOnce('summary');
      const result = await summarizeHistory(mockWorldState, mockStoryHistory[0]);
      expect(summarizeHistoryFlow).toHaveBeenCalledWith(mockWorldState, mockStoryHistory[0]);
      expect(result).toBe('summary');
    });
  });

  describe('generateConcept', () => {
    it('returns concept from generateConceptFlow on success', async () => {
      const concept = { protagonist: 'A hero', setting: 'A castle', dilemma: 'A dragon' };
      (generateConceptFlow as jest.Mock).mockResolvedValueOnce(concept);
      const result = await generateConcept(mockGenreConfig);
      expect(generateConceptFlow).toHaveBeenCalledWith(mockGenreConfig);
      expect(result).toEqual(concept);
    });
  });

  describe('generateImage', () => {
    it('returns image URL from generateImageFlow on success', async () => {
      (generateImageFlow as jest.Mock).mockResolvedValueOnce('https://img.example.com/abc.png');
      const result = await generateImage('a corridor bathed in red light');
      expect(generateImageFlow).toHaveBeenCalledWith('a corridor bathed in red light');
      expect(result).toBe('https://img.example.com/abc.png');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('returns deterministic placeholder URL when generateImageFlow throws', async () => {
      (generateImageFlow as jest.Mock).mockRejectedValueOnce(new Error('model busy'));
      // Stabilize Math.random so placeholder URL is predictable
      Math.random = () => 0.42;

      const result = await generateImage('a broken screen flickers');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error calling generateImageFlow:',
        expect.any(Error)
      );
      expect(result).toBe('https://picsum.photos/seed/0.42/1920/1080');
    });
  });
});
