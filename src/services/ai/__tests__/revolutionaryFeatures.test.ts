import { TemporalRevisionEngine, MetaConsciousnessEngine, QuantumNarrativeEngine, AdaptiveHorrorEngine, RealityCorruptionEngine } from '../revolutionaryFeatures';
import { generateWithSelectedModel } from '../../ai/unifiedAIService';
import { StorySegment, WorldState } from '../../../types';

// Mock the unified AI service
jest.mock('../../ai/unifiedAIService');

describe('TemporalRevisionEngine', () => {
  let engine: TemporalRevisionEngine;
  let mockWorldState: WorldState;
  let mockStoryHistory: StorySegment[];

  beforeEach(() => {
    engine = new TemporalRevisionEngine();
    mockWorldState = {
      protagonist: 'Alex',
      setting: 'A haunted house',
      storyPrompt: 'Alex enters the house.',
      psychologicalStatus: 'Stable',
      systemHealth: 100,
    };
    mockStoryHistory = [
      { id: '1', text: 'Segment 1', images: {} },
      { id: '2', text: 'Segment 2', images: {} },
      { id: '3', text: 'Segment 3', images: {} },
    ];
    (generateWithSelectedModel as jest.Mock).mockClear();
  });

  // Test success path
  it('should revise history when the AI successfully returns a revision', async () => {
    const revisedText = 'A revised version of segment 1.';
    (generateWithSelectedModel as jest.Mock).mockResolvedValue([{
      type: 'displayText',
      payload: { content: revisedText },
    }]);

    // Force revision by mocking the random chance
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    const revisedHistory = await engine.reviseHistory('A significant choice', mockStoryHistory, mockWorldState);

    expect(generateWithSelectedModel).toHaveBeenCalled();
    expect(revisedHistory.some(segment => segment.text === revisedText)).toBe(true);
    expect(revisedHistory.some(segment => segment.isRevised)).toBe(true);

    jest.spyOn(Math, 'random').mockRestore();
  });

  // Test failure path
  it('should create a corrupted segment when the AI call fails', async () => {
    (generateWithSelectedModel as jest.Mock).mockRejectedValue(new Error('AI blackout'));

    // Force revision
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    const revisedHistory = await engine.reviseHistory('Another choice', mockStoryHistory, mockWorldState);

    expect(generateWithSelectedModel).toHaveBeenCalled();
    expect(revisedHistory.some(segment => segment.text.includes('MEMORY FRAGMENT CORRUPTED'))).toBe(true);
    expect(revisedHistory.some(segment => segment.isRevised)).toBe(true);
    
    jest.spyOn(Math, 'random').mockRestore();
  });
});

describe('RealityCorruptionEngine', () => {
  let engine: RealityCorruptionEngine;
  let mockWorldState: WorldState;

  beforeEach(() => {
    engine = new RealityCorruptionEngine();
    mockWorldState = {
      protagonist: 'The Corrupted',
      setting: 'A digital hellscape',
      storyPrompt: 'The world is breaking.',
      psychologicalStatus: 'Unraveling',
      systemHealth: 50,
    };
    (generateWithSelectedModel as jest.Mock).mockClear();
  });

  // Test success path
  it('should generate new corruption effects when the AI call succeeds', async () => {
    const effects = 'text-glitch, image-distortion';
    (generateWithSelectedModel as jest.Mock).mockResolvedValue([{
      type: 'displayText',
      payload: { content: effects },
    }]);

    const result = await engine.processCorruption('Embrace the void', mockWorldState);
    
    expect(generateWithSelectedModel).toHaveBeenCalled();
    expect(result.newEffects).toEqual(['text-glitch', 'image-distortion']);
    expect(result.corruptionLevel).toBeGreaterThan(0);
  });

  // Test failure path
  it('should return no new effects if the AI call fails', async () => {
    (generateWithSelectedModel as jest.Mock).mockRejectedValue(new Error('Reality sync error'));

    const result = await engine.processCorruption('Resist the void', mockWorldState);

    expect(generateWithSelectedModel).toHaveBeenCalled();
    expect(result.newEffects).toEqual([]);
  });
});

describe('AdaptiveHorrorEngine', () => {
  let engine: AdaptiveHorrorEngine;

  beforeEach(() => {
    engine = new AdaptiveHorrorEngine();
    (generateWithSelectedModel as jest.Mock).mockClear();
  });

  // Test analyzePlayerChoice success
  it('should analyze player choice and update fear triggers on success', async () => {
    const triggers = 'isolation, paranoia';
    (generateWithSelectedModel as jest.Mock).mockResolvedValue([{
      type: 'displayText',
      payload: { content: triggers },
    }]);

    await engine.analyzePlayerChoice('I chose to hide', 'A dark room');
    
    expect(generateWithSelectedModel).toHaveBeenCalled();
    expect(engine.getPlayerPsychProfile()).toContain('isolation, paranoia');
  });

  // Test analyzePlayerChoice failure
  it('should handle failure during player choice analysis', async () => {
    (generateWithSelectedModel as jest.Mock).mockRejectedValue(new Error('Psych-profile error'));

    await engine.analyzePlayerChoice('I chose to fight', 'A monster');
    
    expect(generateWithSelectedModel).toHaveBeenCalled();
    expect(engine.getPlayerPsychProfile()).toContain('unknown fears');
  });

  // Test generatePersonalizedHorror success
  it('should generate personalized horror based on player profile', async () => {
    const personalizedPrompt = 'A deeply personal horror prompt.';
    // First, populate the profile
    (generateWithSelectedModel as jest.Mock).mockResolvedValueOnce([{
      type: 'displayText',
      payload: { content: 'betrayal' },
    }]);
    await engine.analyzePlayerChoice('I trusted them', 'A friend');

    // Now, test personalization
    (generateWithSelectedModel as jest.Mock).mockResolvedValueOnce([{
      type: 'displayText',
      payload: { content: personalizedPrompt },
    }]);
    
    const result = await engine.generatePersonalizedHorror('A generic prompt');
    expect(result).toBe(personalizedPrompt);
  });

  // Test generatePersonalizedHorror failure
  it('should return the base prompt if personalization fails', async () => {
    // Populate profile
    (generateWithSelectedModel as jest.Mock).mockResolvedValueOnce([{
      type: 'displayText',
      payload: { content: 'loss of identity' },
    }]);
    await engine.analyzePlayerChoice('Who am I?', 'A mirror');

    // Mock failure for personalization
    (generateWithSelectedModel as jest.Mock).mockRejectedValue(new Error('Horror-gen error'));

    const basePrompt = 'A generic prompt';
    const result = await engine.generatePersonalizedHorror(basePrompt);
    expect(result).toBe(basePrompt);
  });
});

describe('QuantumNarrativeEngine', () => {
  let engine: QuantumNarrativeEngine;
  let mockWorldState: WorldState;
  let mockStoryHistory: StorySegment[];

  beforeEach(() => {
    engine = new QuantumNarrativeEngine();
    mockWorldState = {
      protagonist: 'The Anomaly',
      setting: 'A fractured reality',
      storyPrompt: 'Reality is unstable.',
      psychologicalStatus: 'Fragmented',
      systemHealth: 100,
    };
    mockStoryHistory = [{ id: 'q1', text: 'Initial state', images: {} }];
    (generateWithSelectedModel as jest.Mock).mockClear();
  });

  // Test success path
  it('should create a new narrative thread for a significant choice', async () => {
    (generateWithSelectedModel as jest.Mock).mockResolvedValue([{
      type: 'displayText',
      payload: { content: 'yes' },
    }]);

    const result = await engine.processQuantumChoice('A reality-bending choice', mockStoryHistory, mockWorldState);
    
    expect(generateWithSelectedModel).toHaveBeenCalled();
    expect(result.quantumShift).toBeUndefined();
  });

  // Test failure path
  it('should not create a new thread if the significance analysis fails', async () => {
    (generateWithSelectedModel as jest.Mock).mockRejectedValue(new Error('Quantum interference'));

    const result = await engine.processQuantumChoice('A choice of little consequence', mockStoryHistory, mockWorldState);
    
    expect(generateWithSelectedModel).toHaveBeenCalled();
    expect(result.quantumShift).toBeUndefined();
  });
});

describe('MetaConsciousnessEngine', () => {
  let engine: MetaConsciousnessEngine;
  let mockWorldState: WorldState;

  beforeEach(() => {
    engine = new MetaConsciousnessEngine();
    mockWorldState = {
      protagonist: 'Player',
      setting: 'The game',
      storyPrompt: 'The player is playing.',
      psychologicalStatus: 'Aware',
      systemHealth: 100,
    };
    (generateWithSelectedModel as jest.Mock).mockClear();
  });

  // Test success path
  it('should generate a meta message when the AI call succeeds', async () => {
    const metaMessage = 'The AI is aware of your presence.';
    (generateWithSelectedModel as jest.Mock).mockResolvedValue([{
      type: 'displayText',
      payload: { content: metaMessage },
    }]);

    // Force meta event
    jest.spyOn(Math, 'random').mockReturnValue(0.01);

    const result = await engine.checkForMetaEvent([], mockWorldState);
    expect(result).toBe(metaMessage);
    expect(generateWithSelectedModel).toHaveBeenCalled();

    jest.spyOn(Math, 'random').mockRestore();
  });

  // Test failure path
  it('should return null when the AI call fails', async () => {
    (generateWithSelectedModel as jest.Mock).mockRejectedValue(new Error('AI sentience error'));

    // Force meta event
    jest.spyOn(Math, 'random').mockReturnValue(0.01);

    const result = await engine.checkForMetaEvent([], mockWorldState);
    expect(result).toBeNull();
    expect(generateWithSelectedModel).toHaveBeenCalled();

    jest.spyOn(Math, 'random').mockRestore();
  });
});