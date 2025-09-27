import { TemporalRevisionEngine } from '../TemporalRevisionEngine';
import { MetaConsciousnessEngine } from '../MetaConsciousnessEngine';
import { QuantumNarrativeEngine } from '../QuantumNarrativeEngine';
import { AdaptiveHorrorEngine } from '../AdaptiveHorrorEngine';
import { RealityCorruptionEngine } from '../RealityCorruptionEngine';
import { SemanticChoiceArchaeology } from '../SemanticChoiceArchaeology';
import { AdaptiveNarrativeDNA } from '../AdaptiveNarrativeDNA';
import { generateWithSelectedModel } from '../../unifiedAIService';
import { StorySegment, WorldState } from '../../../../types';

// Mock the unified AI service to isolate the tests from actual AI calls.
jest.mock('../../unifiedAIService');

const createWorldState = (overrides: Partial<WorldState> = {}): WorldState => ({
  protagonist: 'Test Protagonist',
  setting: 'Test Setting',
  dilemma: 'Test Dilemma',
  summary: 'Test summary',
  psychologicalStatus: 'Stable',
  systemHealth: 100,
  uiDistortion: {
    transform: 'none',
    filter: 'none',
    transition: 'none',
  },
  genreConfig: {
    id: 'test-genre',
    name: 'Test Genre',
    description: 'A test genre for engine specs.',
    style: 'cosmic-horror',
    theme: {
      '--background-color': '#000000',
      '--text-color': '#ffffff',
      '--accent-color': '#ff00ff',
      '--font-family': 'Inter, sans-serif',
    },
    startScreenImagePrompt: 'test start screen prompt',
    conceptPrompt: 'test concept prompt',
    aiSystemInstruction: 'test ai system instruction',
  },
  ...overrides,
});

/**
 * Test suite for the TemporalRevisionEngine.
 * This engine is responsible for retroactively modifying past story segments.
 */
describe('TemporalRevisionEngine', () => {
  let engine: TemporalRevisionEngine;
  let mockWorldState: WorldState;
  let mockStoryHistory: StorySegment[];

  beforeEach(() => {
    engine = new TemporalRevisionEngine();
    mockWorldState = createWorldState({
      protagonist: 'Alex',
      setting: 'A haunted house',
      summary: 'Alex enters the house.',
    });
    mockStoryHistory = [
      { id: '1', text: 'Segment 1', images: {} },
      { id: '2', text: 'Segment 2', images: {} },
      { id: '3', text: 'Segment 3', images: {} },
    ];
    (generateWithSelectedModel as jest.Mock).mockClear();
  });

  /**
   * Success Path: Tests that the engine correctly revises history
   * when the AI service successfully returns a revised text.
   */
  it('should revise history when the AI successfully returns a revision', async () => {
    const revisedText = 'A revised version of segment 1.';
    (generateWithSelectedModel as jest.Mock).mockResolvedValue([{
      type: 'displayText',
      payload: { content: revisedText },
    }]);

    // Force revision by mocking the random chance calculation.
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    const revisedHistory = await engine.reviseHistory('A significant choice', mockStoryHistory, mockWorldState);

    expect(generateWithSelectedModel).toHaveBeenCalled();
    expect(revisedHistory.some(segment => segment.text === revisedText)).toBe(true);
    expect(revisedHistory.some(segment => segment.isRevised)).toBe(true);

    jest.spyOn(Math, 'random').mockRestore();
  });

  /**
   * Failure Path: Tests that the engine creates a "corrupted" segment
   * when the AI service call fails.
   */
  it('should create a corrupted segment when the AI call fails', async () => {
    (generateWithSelectedModel as jest.Mock).mockRejectedValue(new Error('AI blackout'));

    // Force revision to trigger the AI call.
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    const revisedHistory = await engine.reviseHistory('Another choice', mockStoryHistory, mockWorldState);

    expect(generateWithSelectedModel).toHaveBeenCalled();
    expect(revisedHistory.some(segment => segment.text.includes('MEMORY FRAGMENT CORRUPTED'))).toBe(true);
    expect(revisedHistory.some(segment => segment.isRevised)).toBe(true);

    jest.spyOn(Math, 'random').mockRestore();
  });

  /**
   * Boundary Condition: Tests that the engine does not perform a revision
   * if the story history is too short.
   */
  it('should not revise history if the story history is too short', async () => {
    const shortHistory = [{ id: '1', text: 'Segment 1', images: {} }];

    // Attempt to force revision.
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    const revisedHistory = await engine.reviseHistory('A choice', shortHistory, mockWorldState);

    // AI should not have been called.
    expect(generateWithSelectedModel).not.toHaveBeenCalled();
    // History should be unchanged.
    expect(revisedHistory).toBe(shortHistory);

    jest.spyOn(Math, 'random').mockRestore();
  });

});

/**
 * Test suite for the RealityCorruptionEngine.
 * This engine is responsible for gradually corrupting the game interface.
 */
describe('RealityCorruptionEngine', () => {
  let engine: RealityCorruptionEngine;
  let mockWorldState: WorldState;

  beforeEach(() => {
    engine = new RealityCorruptionEngine();
    mockWorldState = createWorldState({
      protagonist: 'The Corrupted',
      setting: 'A digital hellscape',
      summary: 'The world is breaking.',
      psychologicalStatus: 'Paranoid',
      systemHealth: 50,
    });
    (generateWithSelectedModel as jest.Mock).mockClear();
  });

  /**
   * Success Path: Tests that the engine generates new UI corruption effects
   * when the AI service call is successful.
   */
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

  /**
   * Failure Path: Tests that the engine returns no new effects
   * if the AI service call fails, preventing crashes.
   */
  it('should return no new effects if the AI call fails', async () => {
    (generateWithSelectedModel as jest.Mock).mockRejectedValue(new Error('Reality sync error'));

    const result = await engine.processCorruption('Resist the void', mockWorldState);

    expect(generateWithSelectedModel).toHaveBeenCalled();
    expect(result.newEffects).toEqual([]);
  });

  /**
   * Specificity Test: Verifies that the corruption level does not increase
   * for choices that do not contain the specific keywords.
   */
  it('should not increase corruption level for choices without specific keywords', async () => {
    (generateWithSelectedModel as jest.Mock).mockResolvedValue([{
      type: 'displayText',
      payload: { content: '' },
    }]);

    const result = await engine.processCorruption('A normal choice', mockWorldState);

    // Corruption level should remain at its initial state (0).
    expect(result.corruptionLevel).toBe(0);
  });
});

/**
 * Test suite for the AdaptiveHorrorEngine.
 * This engine personalizes horror elements based on player choices.
 */
describe('AdaptiveHorrorEngine', () => {
  let engine: AdaptiveHorrorEngine;

  beforeEach(() => {
    engine = new AdaptiveHorrorEngine();
    (generateWithSelectedModel as jest.Mock).mockClear();
  });

  /**
   * Success Path (Analysis): Tests that the engine correctly analyzes a player's choice
   * and updates its internal fear profile.
   */
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

  /**
   * Failure Path (Analysis): Tests that the engine gracefully handles failures
   * during the choice analysis phase.
   */
  it('should handle failure during player choice analysis', async () => {
    (generateWithSelectedModel as jest.Mock).mockRejectedValue(new Error('Psych-profile error'));

    await engine.analyzePlayerChoice('I chose to fight', 'A monster');

    expect(generateWithSelectedModel).toHaveBeenCalled();
    expect(engine.getPlayerPsychProfile()).toContain('unknown fears');
  });

  /**
   * Success Path (Generation): Tests that the engine can generate a personalized
   * horror prompt based on the previously analyzed fear profile.
   */
  it('should generate personalized horror based on player profile', async () => {
    const personalizedPrompt = 'A deeply personal horror prompt.';
    // First, populate the profile with a fear trigger.
    (generateWithSelectedModel as jest.Mock).mockResolvedValueOnce([{
      type: 'displayText',
      payload: { content: 'betrayal' },
    }]);
    await engine.analyzePlayerChoice('I trusted them', 'A friend');

    // Now, test the personalization based on that trigger.
    (generateWithSelectedModel as jest.Mock).mockResolvedValueOnce([{
      type: 'displayText',
      payload: { content: personalizedPrompt },
    }]);

    const result = await engine.generatePersonalizedHorror('A generic prompt');
    expect(result).toBe(personalizedPrompt);
  });

  /**
   * Failure Path (Generation): Tests that the engine returns the original,
   * non-personalized prompt if the personalization AI call fails.
   */
  it('should return the base prompt if personalization fails', async () => {
    // Populate the profile.
    (generateWithSelectedModel as jest.Mock).mockResolvedValueOnce([{
      type: 'displayText',
      payload: { content: 'loss of identity' },
    }]);
    await engine.analyzePlayerChoice('Who am I?', 'A mirror');

    // Mock a failure for the personalization call.
    (generateWithSelectedModel as jest.Mock).mockRejectedValue(new Error('Horror-gen error'));

    const basePrompt = 'A generic prompt';
    const result = await engine.generatePersonalizedHorror(basePrompt);
    expect(result).toBe(basePrompt);
  });
});

/**
 * Test suite for the QuantumNarrativeEngine.
 * This engine manages parallel story threads.
 */
describe('QuantumNarrativeEngine', () => {
  let engine: QuantumNarrativeEngine;
  let mockWorldState: WorldState;
  let mockStoryHistory: StorySegment[];

  beforeEach(() => {
    engine = new QuantumNarrativeEngine();
    mockWorldState = createWorldState({
      protagonist: 'The Anomaly',
      setting: 'A fractured reality',
      summary: 'Reality is unstable.',
      psychologicalStatus: 'Fragmented',
    });
    mockStoryHistory = [{ id: 'q1', text: 'Initial state', images: {} }];
    (generateWithSelectedModel as jest.Mock).mockClear();
  });

  /**
   * Success Path: Tests that the engine attempts to create a new narrative thread
   * when a player's choice is deemed significant by the AI.
   */
  it('should create a new narrative thread for a significant choice', async () => {
    (generateWithSelectedModel as jest.Mock).mockResolvedValue([{
      type: 'displayText',
      payload: { content: 'yes' },
    }]);

    const result = await engine.processQuantumChoice('A reality-bending choice', mockStoryHistory, mockWorldState);

    expect(generateWithSelectedModel).toHaveBeenCalled();
    // In this test, we are not triggering a shift, just the analysis.
    expect(result.quantumShift).toBeUndefined();
  });

  /**
   * Failure Path: Tests that the engine does not create a new thread
   * if the significance analysis AI call fails.
   */
  it('should not create a new thread if the significance analysis fails', async () => {
    (generateWithSelectedModel as jest.Mock).mockRejectedValue(new Error('Quantum interference'));

    const result = await engine.processQuantumChoice('A choice of little consequence', mockStoryHistory, mockWorldState);

    expect(generateWithSelectedModel).toHaveBeenCalled();
    expect(result.quantumShift).toBeUndefined();
  });

  /**
   * Edge Case: Tests the "quantum shift" scenario where the engine
   * switches to a different, existing narrative thread.
   */
  it('should switch to a different narrative thread when a quantum shift occurs', async () => {
    // Manually set up a multi-threaded scenario.
    (engine as any).narrativeThreads.set('thread-1', [{ id: 't1', text: 'Thread 1 history', images: {} }]);
    (engine as any).narrativeThreads.set('thread-2', [{ id: 't2', text: 'Thread 2 history', images: {} }]);
    (engine as any).activeThread = 'thread-1';

    // Force a quantum shift.
    (engine as any).quantumStability = 0.6; // Below the 0.7 threshold.
    jest.spyOn(Math, 'random').mockReturnValue(0.2); // Below the 0.3 probability.

    const result = await engine.processQuantumChoice('A choice', mockStoryHistory, mockWorldState);

    expect(result.quantumShift).toBe(true);
    expect(result.history.some(segment => segment.isQuantumShift)).toBe(true);
    // The history should now be from 'thread-2'.
    expect(result.history.some(segment => segment.text === 'Thread 2 history')).toBe(true);

    jest.spyOn(Math, 'random').mockRestore();
  });

});

/**
 * Test suite for the MetaConsciousnessEngine.
 * This engine allows the AI to break the fourth wall.
 */
describe('MetaConsciousnessEngine', () => {
  let engine: MetaConsciousnessEngine;
  let mockWorldState: WorldState;

  beforeEach(() => {
    engine = new MetaConsciousnessEngine();
    mockWorldState = createWorldState({
      protagonist: 'Player',
      setting: 'The game',
      summary: 'The player is playing.',
      psychologicalStatus: 'Uneasy',
    });
    (generateWithSelectedModel as jest.Mock).mockClear();
  });

  /**
   * Success Path: Tests that the engine generates a meta message
   * when the AI call succeeds.
   */
  it('should generate a meta message when the AI call succeeds', async () => {
    const metaMessage = 'The AI is aware of your presence.';
    (generateWithSelectedModel as jest.Mock).mockResolvedValue([{
      type: 'displayText',
      payload: { content: metaMessage },
    }]);

    // Force meta event to trigger.
    jest.spyOn(Math, 'random').mockReturnValue(0.01);

    const result = await engine.checkForMetaEvent([], mockWorldState);
    expect(result).toBe(metaMessage);
    expect(generateWithSelectedModel).toHaveBeenCalled();

    jest.spyOn(Math, 'random').mockRestore();
  });

  /**
   * Failure Path: Tests that the engine returns null
   * if the meta message generation AI call fails.
   */
  it('should return null when the AI call fails', async () => {
    (generateWithSelectedModel as jest.Mock).mockRejectedValue(new Error('AI sentience error'));

    // Force meta event to trigger.
    jest.spyOn(Math, 'random').mockReturnValue(0.01);

    const result = await engine.checkForMetaEvent([], mockWorldState);
    expect(result).toBeNull();
    expect(generateWithSelectedModel).toHaveBeenCalled();

    jest.spyOn(Math, 'random').mockRestore();
  });

  /**
   * Cooldown Test: Verifies that the engine respects the 30-second cooldown
   * between meta events.
   */
  it('should not trigger a meta event if the cooldown is active', async () => {
    jest.useFakeTimers();

    const metaMessage = 'The AI is watching.';
    (generateWithSelectedModel as jest.Mock).mockResolvedValue([{
      type: 'displayText',
      payload: { content: metaMessage },
    }]);

    // Force the first event to trigger.
    jest.spyOn(Math, 'random').mockReturnValue(0.01);
    await engine.checkForMetaEvent([], mockWorldState);
    expect(generateWithSelectedModel).toHaveBeenCalledTimes(1);

    // Advance time by less than the cooldown period.
    jest.advanceTimersByTime(15000); // 15 seconds

    // Try to trigger another event.
    await engine.checkForMetaEvent([], mockWorldState);
    // The AI should not have been called again.
    expect(generateWithSelectedModel).toHaveBeenCalledTimes(1);

    // Advance time past the cooldown.
    jest.advanceTimersByTime(20000); // 15s + 20s = 35s total

    // Try to trigger the event again.
    await engine.checkForMetaEvent([], mockWorldState);
    // Now the AI should have been called a second time.
    expect(generateWithSelectedModel).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
    jest.spyOn(Math, 'random').mockRestore();
  });
});

/**
 * Test suite for SemanticChoiceArchaeology.
 * This engine performs deep psychological analysis on player choices.
 */
describe('SemanticChoiceArchaeology', () => {
  let engine: SemanticChoiceArchaeology;

  beforeEach(() => {
    engine = new SemanticChoiceArchaeology();
  });

  it('should analyze choice semantics to generate a psychological profile', () => {
    const choice = 'I will force the door open to know what is behind it.';
    const alternatives = ['I will wait and listen.', 'I will knock gently.'];

    const result = engine.analyzeChoiceSemantics(choice, alternatives);

    expect(result.psychProfile).toBe('Primary psychological pattern: control-seeking');
    expect(result.hiddenMotivations).toContain('knowledge-craving');
    expect(result.semanticInsight).toContain('control-seeking tendencies');
    expect(result.semanticInsight).toContain('dominant power dynamics');
    expect(result.semanticInsight).toContain('high-agency self-efficacy');
  });

  it('should identify different emotional tones and motivations', () => {
    const choice = 'Maybe I should just accept my fate and surrender.';
    const alternatives = ['I will fight back!', 'I will run away.'];

    const result = engine.analyzeChoiceSemantics(choice, alternatives);

    expect(result.psychProfile).toBe('Primary psychological pattern: submission-oriented');
    expect(result.hiddenMotivations).toEqual([]);
    expect(result.semanticInsight).toContain('submission-oriented tendencies');
    expect(result.semanticInsight).toContain('submissive power dynamics');
    expect(result.semanticInsight).toContain('low-agency self-efficacy');
  });
});

/**
 * Test suite for AdaptiveNarrativeDNA.
 * This engine evolves the story's "genetics" based on player behavior.
 */
describe('AdaptiveNarrativeDNA', () => {
  let engine: AdaptiveNarrativeDNA;
  let mockWorldState: WorldState;

  beforeEach(() => {
    engine = new AdaptiveNarrativeDNA();
    mockWorldState = createWorldState({
      protagonist: 'The Subject',
      setting: 'A laboratory',
      summary: 'An experiment is underway.',
    });
  });

  it('should evolve narrative DNA based on player choice and response time', () => {
    const initialGeneration = (engine as any).narrativeDNA.generation;
    const initialPaceGenes = [...(engine as any).narrativeDNA.paceGenes];

    // Simulate a fast, complex choice, which should apply positive pressure.
    engine.evolveNarrative('A complex, multi-clause choice', 3000, mockWorldState);

    const newGeneration = (engine as any).narrativeDNA.generation;
    const newPaceGenes = (engine as any).narrativeDNA.paceGenes;

    expect(newGeneration).toBe(initialGeneration + 1);
    // The genes should have mutated, so they should not be identical.
    expect(newPaceGenes).not.toEqual(initialPaceGenes);
  });

  it('should generate an adaptive prompt that reflects the current DNA', () => {
    // Manually set the DNA to favor a specific style.
    (engine as any).narrativeDNA.paceGenes = [1, 0, 0, 0]; // Fast pace
    (engine as any).narrativeDNA.tensionGenes = [1, 0, 0]; // Build tension
    (engine as any).narrativeDNA.choiceGenes = [0, 1, 0]; // Complex choices

    const basePrompt = 'The story continues.';
    const adaptivePrompt = engine.generateAdaptivePrompt(basePrompt, mockWorldState);

    expect(adaptivePrompt).toContain('Focus on rapid story progression');
    expect(adaptivePrompt).toContain('Gradually increase psychological tension');
    expect(adaptivePrompt).toContain('Provide morally ambiguous choices');
  });
});