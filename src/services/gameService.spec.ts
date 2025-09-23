/**
 * Tests for gameService.ts
 */

import {
  generateConcept,
  generateImage,
  getNextStep,
  summarizeHistory,
} from './gameService';

import {
  generateConceptFlow,
  generateImageFlow,
  nextStepFlow,
} from './ai/secureGenkit';

import type { Command, GenreConfig, StorySegment, WorldState } from '../types';
import { summarizeHistoryFlow } from './flows/summaryFlow';

// Mock the flow modules
jest.mock('./ai/secureGenkit', () => ({
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
    // Include genreConfig to satisfy WorldState type requirements
    genreConfig: {
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

      // With revolutionary features enabled, the playerChoice gets enhanced
      expect(nextStepFlow).toHaveBeenCalledWith({
        playerChoice: 'Player chose: Open the door. Continue the cosmic horror narrative.',
        worldState: mockWorldState,
        history: mockStoryHistory,
        genreConfig: mockGenreConfig,
      });
      
      // Result now includes additional revolutionary features data
      expect(result.commands).toEqual(commands);
      expect(result).toHaveProperty('revisedHistory');
      expect(result).toHaveProperty('metaMessage');
      expect(result).toHaveProperty('quantumShift');
      expect(result).toHaveProperty('corruptionEffects');
    });

    it('returns error-recovery commands when nextStepFlow throws', async () => {
      // Setup fresh mock for this test only
      const nextStepFlowMock = nextStepFlow as jest.Mock;
      nextStepFlowMock.mockReset();
      nextStepFlowMock.mockRejectedValue(new Error('Network error'));

      const result = await getNextStep('Open the door', mockWorldState, [], mockGenreConfig);

      // Should return fallback commands from secure genkit
      expect(result.commands).toHaveLength(2);
      expect(result.commands[0].type).toBe('displayText');
      expect((result.commands[0].payload as any).content).toContain('cosmic forces continue to manifest');
      expect(result.commands[1].type).toBe('displayChoices');
      expect((result.commands[1].payload as any).choices).toHaveLength(3);
      
      // Result includes revolutionary features structure
      expect(result).toHaveProperty('revisedHistory');
      expect(result).toHaveProperty('metaMessage');
      expect(result).toHaveProperty('quantumShift');
      expect(result).toHaveProperty('corruptionEffects');
      
      // Reset mock after test
      nextStepFlowMock.mockReset();
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

    it('returns a placeholder URL when generateImageFlow throws', async () => {
      (generateImageFlow as jest.Mock).mockResolvedValueOnce('https://source.unsplash.com/1920x1080/?dark,horror,surreal,abstract,a%20broken%20screen%20flickers');

      const result = await generateImage('a broken screen flickers');

      expect(result).toContain('https://source.unsplash.com');
    });
  });
});
