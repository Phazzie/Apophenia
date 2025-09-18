import { TemporalRevisionEngine } from '../revolutionaryFeatures';
import { REVOLUTIONARY_FEATURES } from '../../config';
import { StorySegment, WorldState, GenreConfig } from '../../../types';

jest.mock('../../config', () => ({
  ...jest.requireActual('../../config'),
  REVOLUTIONARY_FEATURES: {
    TEMPORAL_REVISION: {
      enabled: false,
    },
  },
}));

import { generateText } from '../genkit';

describe('Revolutionary AI Features Test Suite', () => {
  describe('TemporalRevisionEngine', () => {
    const engine = new TemporalRevisionEngine();
    const mockGenreConfig: GenreConfig = {
      id: 'cosmic-horror',
      name: 'Cosmic Horror',
      description: 'Lovecraftian terror',
      style: 'dark atmospheric',
      theme: {},
      startScreenImagePrompt: 'cosmic void',
      conceptPrompt: 'Generate horror concept',
      aiSystemInstruction: 'You are a cosmic AI'
    };
    const mockWorldState: WorldState = {
      protagonist: 'Test protagonist',
      setting: 'Test setting',
      dilemma: 'Test dilemma',
      summary: 'Test summary',
      psychologicalStatus: 'Stable',
      systemHealth: 100,
      uiDistortion: {},
      genreConfig: mockGenreConfig
    };
    const mockStoryHistory: StorySegment[] = [
      { id: '1', text: 'segment 1', images: {} },
      { id: '2', text: 'segment 2', images: {} },
    ];

    test('should return original history when temporal revision is disabled', async () => {
      const result = await engine.reviseHistory('test choice', mockStoryHistory, mockWorldState);
      expect(result).toEqual(mockStoryHistory);
    });
  });
});

describe('TemporalRevisionEngine (enabled)', () => {
  beforeAll(() => {
    jest.mock('../../config', () => ({
      ...jest.requireActual('../../config'),
      REVOLUTIONARY_FEATURES: {
        TEMPORAL_REVISION: {
          enabled: true,
          maxRevisions: 1,
        },
      },
    }));
  });

  afterAll(() => {
    jest.unmock('../../config');
  });

  const engine = new TemporalRevisionEngine();
  const mockGenreConfig: GenreConfig = {
    id: 'cosmic-horror',
    name: 'Cosmic Horror',
    description: 'Lovecraftian terror',
    style: 'dark atmospheric',
    theme: {},
    startScreenImagePrompt: 'cosmic void',
    conceptPrompt: 'Generate horror concept',
    aiSystemInstruction: 'You are a cosmic AI'
  };
  const mockWorldState: WorldState = {
    protagonist: 'Test protagonist',
    setting: 'Test setting',
    dilemma: 'Test dilemma',
    summary: 'Test summary',
    psychologicalStatus: 'Stable',
    systemHealth: 100,
    uiDistortion: {},
    genreConfig: mockGenreConfig
  };
  const mockStoryHistory: StorySegment[] = [
    { id: '1', text: 'segment 1', images: {} },
    { id: '2', text: 'segment 2', images: {} },
  ];

  test('should revise history when temporal revision is enabled', async () => {
    const mockGenerateText = jest.fn().mockResolvedValue(
      JSON.stringify([
        { id: '1', text: 'revised segment 1', images: {} },
        { id: '2', text: 'segment 2', images: {} },
      ])
    );
    jest.mock('../genkit', () => ({
      generateText: mockGenerateText,
    }));

    const result = await engine.reviseHistory('test choice', mockStoryHistory, mockWorldState);

    expect(result).not.toEqual(mockStoryHistory);
    expect(result[0].text).toBe('revised segment 1');
  });
});
