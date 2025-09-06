/**
 * Tests for gameService.ts
 *
 * Testing framework: Jest
 * - We use jest.mock to stub external modules.
 * - We spy on console.error for error paths.
 * - We stabilize Math.random for deterministic assertions where needed.
 */

import type { GenreConfig, WorldState, StorySegment } from '../types';

// Import the module under test after mocks so it picks up mocked implementations
// We need to mock relative modules used by the service.
jest.mock('./ai/genkit', () => ({
  generateConceptFlow: jest.fn(),
  generateImageFlow: jest.fn(),
  nextStepFlow: jest.fn(),
}));

jest.mock('./flows/summaryFlow', () => ({
  summarizeHistoryFlow: jest.fn(),
}));

// Now import the service under test
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

describe('gameService', () => {
  let originalRandom: () => number;
  let consoleErrorSpy: jest.SpyInstance;

  const mockWorldState: WorldState = {
    // Provide minimal plausible shape; adapt if project has stricter typing
    location: 'Station',
    inventory: [],
    flags: {},
  } as unknown as WorldState;

  const mockGenreConfig: GenreConfig = {
    // Provide minimal plausible shape
    genre: 'sci-fi',
    tone: 'noir',
  } as unknown as GenreConfig;

  const mockLastSegment: StorySegment = {
    id: 'seg-1',
    content: 'A shadow moves across the bulkhead.',
    choices: [],
  } as unknown as StorySegment;

  beforeEach(() => {
    jest.resetAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    originalRandom = Math.random;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    Math.random = originalRandom;
  });

  describe('getNextStep', () => {
    it('returns commands from nextStepFlow on success', async () => {
      const commands = [
        { type: 'displayText', payload: { content: 'Hello' } },
        { type: 'displayChoices', payload: { choices: [{ text: 'Go', isIntrusive: false }] } },
      ];
      (nextStepFlow as jest.Mock).mockResolvedValueOnce(commands);

      const result = await getNextStep('Open the door', mockWorldState, [{ action: 'start' }], mockGenreConfig);

      expect(nextStepFlow).toHaveBeenCalledWith({
        playerChoice: 'Open the door',
        worldState: mockWorldState,
        history: [{ action: 'start' }],
        genreConfig: mockGenreConfig,
      });
      expect(result).toEqual(commands);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('returns fallback commands when nextStepFlow throws', async () => {
      (nextStepFlow as jest.Mock).mockRejectedValueOnce(new Error('network issue'));

      const result = await getNextStep('Open the door', mockWorldState, [], mockGenreConfig);

      // Verify error path
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error calling nextStepFlow:',
        expect.any(Error)
      );

      // Verify fallback structure
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([
        {
          type: 'displayText',
          payload: {
            content: 'The connection wavers. The signal is lost in static. You are alone.',
          },
        },
        {
          type: 'displayChoices',
          payload: {
            choices: [
              { text: 'Try to reconnect', isIntrusive: false },
              { text: 'Wait', isIntrusive: false },
            ],
          },
        },
      ]);
    });

    it('passes through empty array if nextStepFlow resolves to empty (edge case)', async () => {
      (nextStepFlow as jest.Mock).mockResolvedValueOnce([]);

      const result = await getNextStep('Listen', mockWorldState, [], mockGenreConfig);

      expect(result).toEqual([]);
    });
  });

  describe('summarizeHistory', () => {
    it('forwards to summarizeHistoryFlow and returns its result', async () => {
      const summary = 'A concise summary of recent events.';
      (summarizeHistoryFlow as jest.Mock).mockResolvedValueOnce(summary);

      const result = await summarizeHistory(mockWorldState, mockLastSegment);

      expect(summarizeHistoryFlow).toHaveBeenCalledWith(mockWorldState, mockLastSegment);
      expect(result).toBe(summary);
    });
  });

  describe('generateConcept', () => {
    it('returns concept from generateConceptFlow on success', async () => {
      const concept = {
        protagonist: 'An intrepid explorer',
        setting: 'An uncharted nebula',
        dilemma: 'A paradox beyond comprehension',
      };
      (generateConceptFlow as jest.Mock).mockResolvedValueOnce(concept);

      const result = await generateConcept(mockGenreConfig);

      expect(generateConceptFlow).toHaveBeenCalledWith(mockGenreConfig);
      expect(result).toEqual(concept);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('returns fallback concept when generateConceptFlow throws', async () => {
      (generateConceptFlow as jest.Mock).mockRejectedValueOnce(new Error('API down'));

      const result = await generateConcept(mockGenreConfig);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error calling generateConceptFlow:',
        expect.any(Error)
      );

      expect(result).toEqual({
        protagonist: 'A jaded detective',
        setting: 'A rain-slicked city in the near future',
        dilemma: 'A case that defies logic',
      });
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