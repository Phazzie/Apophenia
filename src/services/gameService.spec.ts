import {
  getNextStep,
  summarizeHistory,
  generateConcept,
  generateImage,
} from './gameService';
import {
  generateConceptWithSelectedModel,
  generateNextStepWithSelectedModel,
} from './ai/unifiedAIService';
import { generateImageFlow } from './ai/secureGenkit';
import { summarizeHistoryFlow } from './flows/summaryFlow';
import * as engines from './ai/engines';
import { Command, GenreConfig, StorySegment, WorldState } from '../types';

// Mock all imported modules
jest.mock('./ai/unifiedAIService');
jest.mock('./ai/secureGenkit');
jest.mock('./flows/summaryFlow');
jest.mock('./ai/engines', () => ({
  temporalRevision: {
    reviseHistory: jest.fn(),
  },
  metaConsciousness: {
    checkForMetaEvent: jest.fn(),
  },
  quantumNarrative: {
    processQuantumChoice: jest.fn(),
  },
  adaptiveHorror: {
    analyzePlayerChoice: jest.fn(),
    generatePersonalizedHorror: jest.fn(),
    getPlayerPsychProfile: jest.fn(),
  },
  realityCorruption: {
    processCorruption: jest.fn(),
  },
  neuralEchoChambers: {
    initializeFromPersistence: jest.fn(),
    recordChoice: jest.fn(),
    generateEchoPrompt: jest.fn(),
  },
  semanticArchaeology: {
    analyzeChoiceSemantics: jest.fn(),
  },
  narrativeDNA: {
    evolveNarrative: jest.fn(),
    generateAdaptivePrompt: jest.fn(),
    getGeneration: jest.fn(),
  },
  fifthWallBreaker: {
    activateBreakage: jest.fn(),
    deactivateBreakage: jest.fn(),
  },
}));

// Typecast mocks for easier use
const mockGenerateNextStep = generateNextStepWithSelectedModel as jest.Mock;
const mockGenerateConcept = generateConceptWithSelectedModel as jest.Mock;
const mockGenerateImage = generateImageFlow as jest.Mock;
const mockSummarizeHistory = summarizeHistoryFlow as jest.Mock;
const mockEngines = engines as jest.Mocked<typeof engines>;

describe('gameService', () => {
  const mockGenreConfig: GenreConfig = {
    id: 'cosmic-horror',
    name: 'Cosmic Horror',
    description: '...',
    style: 'Lovecraftian',
    theme: {},
    startScreenImagePrompt: 'prompt1',
    conceptPrompt: 'prompt2',
    aiSystemInstruction: 'system-instruction',
  };

  const mockWorldState: WorldState = {
    protagonist: 'Test Protag',
    setting: 'Test Setting',
    dilemma: 'Test Dilemma',
    summary: 'A summary',
    psychologicalStatus: 'Stable',
    systemHealth: 100,
    horrorIntensity: 0.1,
    uiDistortion: { transform: 'none', filter: 'none', transition: 'none' },
    genreConfig: mockGenreConfig,
  };

  const mockHistory: StorySegment[] = [{ id: 'seg1', text: 'segment 1', images: {} }];
  const mockCommands: Command[] = [{ type: 'displayText', payload: { content: 'next part', segmentId: 'seg2' } }];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations for a successful run
    mockGenerateNextStep.mockResolvedValue(mockCommands);
    mockEngines.temporalRevision.reviseHistory.mockImplementation((c, h) => Promise.resolve(h));
    mockEngines.quantumNarrative.processQuantumChoice.mockImplementation((c, h) => Promise.resolve({ history: h, quantumShift: false }));
    mockEngines.metaConsciousness.checkForMetaEvent.mockResolvedValue(null);
    mockEngines.realityCorruption.processCorruption.mockResolvedValue({ corruptionLevel: 0, newEffects: [], uiEffects: {} });
    mockEngines.adaptiveHorror.generatePersonalizedHorror.mockImplementation(p => Promise.resolve(p));
    mockEngines.semanticArchaeology.analyzeChoiceSemantics.mockReturnValue({ semanticInsight: '', psychProfile: 'stable', hiddenMotivations: [] });
    mockEngines.narrativeDNA.generateAdaptivePrompt.mockImplementation(p => p);
  });

  describe('getNextStep', () => {
    it('should call all revolutionary engines and the AI model', async () => {
      await getNextStep('A choice', mockWorldState, mockHistory, mockGenreConfig);

      // Verify all engines were called with expected data
      expect(mockEngines.neuralEchoChambers.recordChoice).toHaveBeenCalledWith('A choice', 'game progression', mockWorldState);
      expect(mockEngines.semanticArchaeology.analyzeChoiceSemantics).toHaveBeenCalledWith('A choice', ['A choice']);
      expect(mockEngines.adaptiveHorror.analyzePlayerChoice).toHaveBeenCalledWith('A choice', 'game progression');
      expect(mockEngines.temporalRevision.reviseHistory).toHaveBeenCalledWith('A choice', mockHistory, mockWorldState);
      expect(mockEngines.quantumNarrative.processQuantumChoice).toHaveBeenCalledWith('A choice', mockHistory, mockWorldState);
      expect(mockEngines.metaConsciousness.checkForMetaEvent).toHaveBeenCalledWith(mockHistory, mockWorldState);
      expect(mockEngines.realityCorruption.processCorruption).toHaveBeenCalledWith('A choice', mockWorldState);
      expect(mockEngines.narrativeDNA.evolveNarrative).toHaveBeenCalled();

      // Verify the final AI call was made with the processed data
      expect(mockGenerateNextStep).toHaveBeenCalled();
    });

    it('should return commands and engine results on success', async () => {
      const result = await getNextStep('A choice', mockWorldState, mockHistory, mockGenreConfig);

      expect(result.commands).toEqual(mockCommands);
      expect(result.quantumShift).toBe(false);
      expect(result.metaMessage).toBeUndefined(); // as mocked
    });

    it('should return fallback commands if the main AI call fails', async () => {
      mockGenerateNextStep.mockRejectedValue(new Error('AI Error'));

      const result = await getNextStep('A choice', mockWorldState, mockHistory, mockGenreConfig);

      expect(result.commands).toHaveLength(2);
      expect(result.commands[0].type).toBe('displayText');
      expect(result.commands[1].type).toBe('displayChoices');
    });

    it('should not throw if an engine fails, and return fallback', async () => {
      mockEngines.temporalRevision.reviseHistory.mockRejectedValue(new Error('Engine Failure'));

      const result = await getNextStep('A choice', mockWorldState, mockHistory, mockGenreConfig);

      // Should catch the engine error and return the fallback response
      expect(result.commands).toHaveLength(2);
      expect(result.commands[0].type).toBe('displayText');
      expect(result.commands[0].payload.content).toContain('The fabric of reality fractures');
    });
  });

  describe('generateConcept', () => {
    it('should call generateConceptWithSelectedModel and return its result', async () => {
      const concept = { protagonist: 'p', setting: 's', dilemma: 'd' };
      mockGenerateConcept.mockResolvedValue(concept);

      const result = await generateConcept(mockGenreConfig);

      expect(mockGenerateConcept).toHaveBeenCalledWith(mockGenreConfig);
      expect(result).toEqual(concept);
    });
  });

  describe('generateImage', () => {
    it('should call generateImageFlow and return its result', async () => {
      const imageUrl = 'http://image.url/prompt.png';
      mockGenerateImage.mockResolvedValue(imageUrl);

      const result = await generateImage('a test prompt');

      expect(mockGenerateImage).toHaveBeenCalledWith('a test prompt');
      expect(result).toBe(imageUrl);
    });
  });

  describe('summarizeHistory', () => {
    it('should call summarizeHistoryFlow and return its result', async () => {
      const summary = 'This is a summary.';
      mockSummarizeHistory.mockResolvedValue(summary);

      const result = await summarizeHistory(mockWorldState, mockHistory[0]);

      expect(mockSummarizeHistory).toHaveBeenCalledWith(mockWorldState, mockHistory[0]);
      expect(result).toBe(summary);
    });
  });
});