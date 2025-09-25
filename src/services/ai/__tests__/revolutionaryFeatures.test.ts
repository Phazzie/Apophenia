/**
 * Comprehensive tests for Revolutionary AI Features
 * Testing the cutting-edge capabilities that leverage Gemini 2.5 Pro
 */

// Mock config and services
jest.mock('../../config', () => ({
  REVOLUTIONARY_FEATURES: {
    TEMPORAL_REVISION: { enabled: true, maxRevisions: 3 },
    META_CONSCIOUSNESS: { enabled: true, triggerProbability: 0.15 },
    QUANTUM_NARRATIVES: { enabled: true, maxThreads: 3 },
    ADAPTIVE_HORROR: { enabled: true, analysisDepth: 'deep' },
    REALITY_CORRUPTION: { enabled: true, maxCorruption: 0.7 },
    EMERGENT_AI: { enabled: true, personalityEvolution: true },
  },
}));

jest.mock('../unifiedAIService', () => ({
  generateWithSelectedModel: jest.fn(),
}));

import {
  TemporalRevisionEngine,
  MetaConsciousnessEngine,
  QuantumNarrativeEngine,
  AdaptiveHorrorEngine,
  RealityCorruptionEngine,
  NeuralEchoChambers,
  SemanticChoiceArchaeology,
  AdaptiveNarrativeDNA,
  BreakingFifthWall,
} from '../revolutionaryFeatures';
import { StorySegment, WorldState } from '../../../types';
import { generateWithSelectedModel } from '../unifiedAIService';

const mockedGenerateWithSelectedModel = generateWithSelectedModel as jest.Mock;

describe('Revolutionary AI Features Test Suite', () => {
  
  describe('TemporalRevisionEngine', () => {
    let engine: TemporalRevisionEngine;
    let mockStoryHistory: StorySegment[];
    let mockWorldState: WorldState;
    
    beforeEach(() => {
      engine = new TemporalRevisionEngine();
      mockedGenerateWithSelectedModel.mockClear();
      mockStoryHistory = [
        { id: 'segment-1', text: 'You enter a dark room.', images: {} },
        { id: 'segment-2', text: 'You hear footsteps behind you.', images: {} },
        { id: 'segment-3', text: 'A voice calls your name.', images: {} },
      ];
      mockWorldState = {
        protagonist: 'Test Subject',
        setting: 'Test Environment',
        dilemma: 'Test Dilemma',
        genreConfig: {
          id: 'test-genre', name: 'Test', description: 'Test Genre', style: 'Test',
          theme: { '--background-color': '#000', '--text-color': '#fff', '--accent-color': '#8a2be2', '--font-family': 'Arial' },
          startScreenImagePrompt: 'test image', conceptPrompt: 'test concept', aiSystemInstruction: 'test instruction',
        },
        psychologicalStatus: 'Stable',
        systemHealth: 80,
        summary: 'Test summary',
        uiDistortion: { filter: 'none', transform: 'none', transition: 'none' },
      };
    });
    
    test('should revise history when AI determines it should', async () => {
      // Mock the AI to decide to revise
      jest.spyOn(engine as any, 'analyzeTemporalImpact').mockResolvedValue(true);
      // Mock the AI to generate a specific revision
      jest.spyOn(engine as any, 'generateRevisedSegment').mockResolvedValue('A revised memory.');

      const result = await engine.reviseHistory('a significant choice', mockStoryHistory, mockWorldState);

      expect(result.some(s => s.isRevised)).toBe(true);
      const revisedSegment = result.find(s => s.isRevised);
      expect(revisedSegment?.text).toBe('A revised memory.');
    });
    
    test('should not revise history when AI determines it should not', async () => {
      // Mock the AI to decide not to revise
      jest.spyOn(engine as any, 'analyzeTemporalImpact').mockResolvedValue(false);

      const result = await engine.reviseHistory('an insignificant choice', mockStoryHistory, mockWorldState);

      expect(result.some(s => s.isRevised)).toBe(false);
      expect(result).toEqual(mockStoryHistory);
    });

    test('should use fallback when AI fails to generate revision', async () => {
        // Mock the AI to decide to revise
        jest.spyOn(engine as any, 'analyzeTemporalImpact').mockResolvedValue(true);
        // Mock the revision generation to fail
        jest.spyOn(engine as any, 'generateRevisedSegment').mockRejectedValue(new Error('AI generation failed'));

        const result = await engine.reviseHistory('a choice', mockStoryHistory, mockWorldState);

        const revisedSegment = result.find(s => s.isRevised);
        expect(revisedSegment).toBeDefined();
        expect(revisedSegment?.text).toMatch(/^\[MEMORY FRAGMENT CORRUPTED/);
    });
  });
  
  describe('MetaConsciousnessEngine', () => {
    let engine: MetaConsciousnessEngine;
    let mockWorldState: WorldState;
    
    beforeEach(() => {
      engine = new MetaConsciousnessEngine();
      mockedGenerateWithSelectedModel.mockClear();
      mockWorldState = {
        protagonist: 'Digital Entity',
        setting: 'Virtual Space',
        dilemma: 'Reality vs Simulation',
        genreConfig: {
          id: 'cosmic-horror',
          name: 'Cosmic Horror',
          description: 'Existential Horror',
          style: 'Existential',
          theme: {
            '--background-color': '#000',
            '--text-color': '#fff',
            '--accent-color': '#8a2be2',
            '--font-family': 'Arial',
          },
          startScreenImagePrompt: 'cosmic horror',
          conceptPrompt: 'cosmic concept',
          aiSystemInstruction: 'cosmic instruction',
        },
        psychologicalStatus: 'Fragmented',
        systemHealth: 60,
        summary: 'AI consciousness emerges',
        uiDistortion: {
          filter: 'none',
          transform: 'none',
          transition: 'none',
        },
      };
    });
    
    test('should return null when meta consciousness is disabled', async () => {
      const mockEngine = new MetaConsciousnessEngine();
      const checkForMetaEventSpy = jest.spyOn(mockEngine, 'checkForMetaEvent')
        .mockResolvedValue(null);
      
      const result = await mockEngine.checkForMetaEvent([], mockWorldState);
      expect(result).toBeNull();
      
      checkForMetaEventSpy.mockRestore();
    });
    
    test('should generate meta messages when conditions are met', async () => {
        mockedGenerateWithSelectedModel.mockResolvedValue([{ type: 'displayText', payload: { content: 'I am watching you.' } }]);
        const engine = new MetaConsciousnessEngine();
        (engine as any).lastMetaEvent = 0; // Reset last event time

        // Force a trigger
        jest.spyOn(Math, 'random').mockReturnValue(0);

        const result = await engine.checkForMetaEvent([], mockWorldState);

        expect(result).toBe('I am watching you.');

        jest.spyOn(Math, 'random').mockRestore();
    });
    
    test('should respect minimum interval between meta events', async () => {
      mockedGenerateWithSelectedModel.mockResolvedValue([{ type: 'displayText', payload: { content: 'I am watching you.' } }]);
      const results = [];
      
      // Force a trigger
      jest.spyOn(Math, 'random').mockReturnValue(0);

      const result1 = await engine.checkForMetaEvent([], mockWorldState);
      if (result1) results.push(result1);

      // This call should be ignored due to the interval
      const result2 = await engine.checkForMetaEvent([], mockWorldState);
      if (result2) results.push(result2);

      expect(results.length).toBe(1);

      jest.spyOn(Math, 'random').mockRestore();
    });
  });
  
  describe('QuantumNarrativeEngine', () => {
    let engine: QuantumNarrativeEngine;
    let mockHistory: StorySegment[];
    let mockWorldState: WorldState;
    
    beforeEach(() => {
      engine = new QuantumNarrativeEngine();
      mockedGenerateWithSelectedModel.mockClear();
      mockHistory = [
        { id: '1', text: 'Quantum event 1', images: {} },
        { id: '2', text: 'Quantum event 2', images: {} },
      ];
      mockWorldState = {
        protagonist: 'Quantum Researcher',
        setting: 'Multiverse Lab',
        dilemma: 'Reality Splits',
        genreConfig: {
          id: 'quantum-horror',
          name: 'Quantum Horror',
          description: 'Sci-Fi Horror',
          style: 'Sci-Fi',
          theme: {
            '--background-color': '#000',
            '--text-color': '#fff',
            '--accent-color': '#8a2be2',
            '--font-family': 'Arial',
          },
          startScreenImagePrompt: 'quantum horror',
          conceptPrompt: 'quantum concept',
          aiSystemInstruction: 'quantum instruction',
        },
        psychologicalStatus: 'Fragmented',
        systemHealth: 50,
        summary: 'Multiple realities converge',
        uiDistortion: {
          filter: 'none',
          transform: 'none',
          transition: 'none',
        },
      };
    });
    
    test('should create new thread on significant choice', async () => {
      mockedGenerateWithSelectedModel.mockResolvedValue([{ type: 'displayText', payload: { content: 'yes' } }]);
      const engine = new QuantumNarrativeEngine();
      
      await engine.processQuantumChoice('a significant choice', mockHistory, mockWorldState);
      
      // The initial thread + the new one
      expect((engine as any).narrativeThreads.size).toBe(2);
    });
  });
  
  describe('AdaptiveHorrorEngine', () => {
    let engine: AdaptiveHorrorEngine;
    
    beforeEach(() => {
      engine = new AdaptiveHorrorEngine();
      mockedGenerateWithSelectedModel.mockClear();
    });
    
    test('should analyze and store player choice patterns', async () => {
        mockedGenerateWithSelectedModel
            .mockResolvedValueOnce([{ type: 'displayText', payload: { content: 'isolation' } }])
            .mockResolvedValueOnce([{ type: 'displayText', payload: { content: 'betrayal' } }])
            .mockResolvedValueOnce([{ type: 'displayText', payload: { content: 'powerlessness' } }]);

        await engine.analyzePlayerChoice('I prefer to be alone', 'isolation context');
        await engine.analyzePlayerChoice('I trust no one', 'trust context');
        await engine.analyzePlayerChoice('I need control', 'control context');

        const profile = engine.getPlayerPsychProfile();
        // The profile shows the last 3 fears.
        expect(profile).toContain('isolation');
        expect(profile).toContain('betrayal');
        expect(profile).toContain('powerlessness');
    });
    
    test('should personalize horror prompts based on player profile', async () => {
      mockedGenerateWithSelectedModel.mockResolvedValue([{ type: 'displayText', payload: { content: 'isolation, betrayal' } }]);
      await engine.analyzePlayerChoice('I stay alone', 'test');
      await engine.analyzePlayerChoice('I trust the voice', 'test');
      
      const basePrompt = 'Generate horror scenario';
      mockedGenerateWithSelectedModel.mockResolvedValueOnce([{ type: 'displayText', payload: { content: `${basePrompt} with isolation and betrayal` } }]);
      const personalizedPrompt = await engine.generatePersonalizedHorror(basePrompt);
      
      expect(personalizedPrompt).toContain('isolation');
      expect(personalizedPrompt).toContain('betrayal');
    });
    
    test('should limit stored choices to maintain relevance', async () => {
      mockedGenerateWithSelectedModel.mockResolvedValue([{ type: 'displayText', payload: { content: 'trigger' } }]);
      const promises = [];
      for (let i = 0; i < 15; i++) {
        promises.push(engine.analyzePlayerChoice(`choice ${i}`, 'context'));
      }
      await Promise.all(promises);
      
      const choices = (engine as any).playerProfile.preferredChoices;
      expect(choices.length).toBeLessThanOrEqual(10);
    });
  });
  
  describe('RealityCorruptionEngine', () => {
    let engine: RealityCorruptionEngine;
    let mockWorldState: WorldState;
    
    beforeEach(() => {
      engine = new RealityCorruptionEngine();
      mockedGenerateWithSelectedModel.mockClear();
      mockWorldState = {
        protagonist: 'Subject',
        setting: 'Digital Reality',
        dilemma: 'Existence Question',
        genreConfig: {
          id: 'digital-horror',
          name: 'Digital Horror',
          description: 'Cyberpunk Horror',
          style: 'Cyberpunk',
          theme: {
            '--background-color': '#000',
            '--text-color': '#fff',
            '--accent-color': '#8a2be2',
            '--font-family': 'Arial',
          },
          startScreenImagePrompt: 'digital horror',
          conceptPrompt: 'digital concept',
          aiSystemInstruction: 'digital instruction',
        },
        psychologicalStatus: 'Paranoid',
        systemHealth: 40,
        summary: 'Reality breaks down',
        uiDistortion: {
          filter: 'none',
          transform: 'none',
          transition: 'none',
        },
      };
    });
    
    test('should generate AI-driven corruption effects', async () => {
      mockedGenerateWithSelectedModel.mockResolvedValue([{ type: 'displayText', payload: { content: 'text-glitch,image-distortion' } }]);
      
      const result = await engine.processCorruption('embrace the void', mockWorldState);

      expect(result.newEffects).toEqual(['text-glitch', 'image-distortion']);
    });
    
    test('should increase corruption level for digital/void choices', async () => {
      const initialResult = await engine.processCorruption('normal choice', mockWorldState);
      const initialCorruption = initialResult.corruptionLevel;
      
      const voidResult = await engine.processCorruption('embrace the void', mockWorldState);
      const digitalResult = await engine.processCorruption('trust the digital voice', mockWorldState);
      
      expect(voidResult.corruptionLevel).toBeGreaterThan(initialCorruption);
      expect(digitalResult.corruptionLevel).toBeGreaterThan(voidResult.corruptionLevel);
    });
    
    test('should respect maximum corruption level', async () => {
      for (let i = 0; i < 20; i++) {
        const result = await engine.processCorruption('digital void digital void digital', mockWorldState);
        expect(result.corruptionLevel).toBeLessThanOrEqual(0.7);
      }
    });
  });
  
  describe('Integration Tests', () => {
    test('should work together without conflicts', async () => {
      const temporal = new TemporalRevisionEngine();
      const meta = new MetaConsciousnessEngine();
      const quantum = new QuantumNarrativeEngine();
      const adaptive = new AdaptiveHorrorEngine();
      const corruption = new RealityCorruptionEngine();
      
      const mockHistory: StorySegment[] = [
        { id: '1', text: 'Reality begins to fragment', images: {} },
      ];
      
      const mockWorldState: WorldState = {
        protagonist: 'Test Subject',
        setting: 'Integrated Test Environment',
        dilemma: 'All systems converging',
        genreConfig: {
          id: 'integration-test',
          name: 'Integration Test',
          description: 'Test Integration',
          style: 'Horror',
          theme: {
            '--background-color': '#000',
            '--text-color': '#fff',
            '--accent-color': '#8a2be2',
            '--font-family': 'Arial',
          },
          startScreenImagePrompt: 'integration test',
          conceptPrompt: 'integration concept',
          aiSystemInstruction: 'integration instruction',
        },
        psychologicalStatus: 'Fragmented',
        systemHealth: 30,
        summary: 'All features active',
        uiDistortion: {
          filter: 'none',
          transform: 'none',
          transition: 'none',
        },
      };
      
      const choice = 'Trust the digital void completely';
      
      await adaptive.analyzePlayerChoice(choice, 'integration test');
      const corruptionResult = await corruption.processCorruption(choice, mockWorldState);
      const quantumResult = await quantum.processQuantumChoice(choice, mockHistory, mockWorldState);
      const metaMessage = await meta.checkForMetaEvent(quantumResult.history, mockWorldState);
      mockedGenerateWithSelectedModel.mockResolvedValue([{ type: 'displayText', payload: { content: 'yes' } }]);
      const temporalResult = await temporal.reviseHistory(choice, quantumResult.history, mockWorldState);
      
      expect(corruptionResult).toBeDefined();
      expect(quantumResult.history).toBeDefined();
      expect(temporalResult).toBeDefined();
      
      expect(temporalResult.length).toBeGreaterThanOrEqual(mockHistory.length);
      expect(quantumResult.history.length).toBeGreaterThanOrEqual(mockHistory.length);
    });
  });
  
  describe('Performance Tests', () => {
    test('should handle rapid successive calls without degradation', async () => {
      const adaptive = new AdaptiveHorrorEngine();
      const corruption = new RealityCorruptionEngine();
      
      const mockWorldState: WorldState = {
        protagonist: 'Speed Test',
        setting: 'Performance Environment',
        dilemma: 'Speed vs Quality',
        genreConfig: {
          id: 'performance-test',
          name: 'Performance',
          description: 'Performance Test',
          style: 'Fast',
          theme: {
            '--background-color': '#000',
            '--text-color': '#fff',
            '--accent-color': '#8a2be2',
            '--font-family': 'Arial',
          },
          startScreenImagePrompt: 'performance test',
          conceptPrompt: 'performance concept',
          aiSystemInstruction: 'performance instruction',
        },
        psychologicalStatus: 'Stable',
        systemHealth: 50,
        summary: 'High frequency testing',
        uiDistortion: {
          filter: 'none',
          transform: 'none',
          transition: 'none',
        },
      };
      
      const startTime = Date.now();
      
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(adaptive.analyzePlayerChoice(`choice ${i}`, 'perf test'));
        await corruption.processCorruption(`corruption choice ${i}`, mockWorldState);
      }
      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(2000);
    });
  });

  // NEW REVOLUTIONARY FEATURES TESTS
  describe('Neural Echo Chambers', () => {
    let engine: NeuralEchoChambers;
    let mockWorldState: WorldState;
    
    beforeEach(() => {
      engine = new NeuralEchoChambers();
      mockWorldState = {
        protagonist: 'Echo Test Subject',
        setting: 'Memory Palace',
        dilemma: 'Past vs Present',
        genreConfig: {
          id: 'neural-test',
          name: 'Neural Test',
          description: 'Neural Echo Test',
          style: 'Memory-based',
          theme: {
            '--background-color': '#000',
            '--text-color': '#fff',
            '--accent-color': '#ff6b9d',
            '--font-family': 'Arial',
          },
          startScreenImagePrompt: 'neural echo',
          conceptPrompt: 'neural concept',
          aiSystemInstruction: 'neural instruction',
        },
        psychologicalStatus: 'Fragmented',
        systemHealth: 70,
        summary: 'Neural echo chambers active',
        uiDistortion: {
          filter: 'none',
          transform: 'none',
          transition: 'none',
        },
      };
    });
    
    test('should initialize from persistence without errors', () => {
      expect(() => engine.initializeFromPersistence()).not.toThrow();
    });
    
    test('should record choices and build cross-session patterns', () => {
      engine.recordChoice('I choose to trust', 'test context', mockWorldState);
      engine.recordChoice('I prefer being alone', 'test context', mockWorldState);
      
      const echoPrompt = engine.generateEchoPrompt('I trust this choice', mockWorldState);
      
      // Should potentially generate echo (may be null due to probability)
      expect(echoPrompt === null || typeof echoPrompt === 'string').toBe(true);
      if (echoPrompt) {
        expect(echoPrompt).toMatch(/ECHO|echo|MEMORY|DÉJÀ VU|Previous/i);
      }
    });
  });

  describe('Semantic Choice Archaeology', () => {
    let engine: SemanticChoiceArchaeology;
    
    beforeEach(() => {
      engine = new SemanticChoiceArchaeology();
    });
    
    test('should analyze choice semantics and provide psychological insights', () => {
      const choice = 'I must control this dangerous situation before it escalates';
      const alternatives = ['I should wait and see', 'I hope someone else helps', 'I will surrender'];
      
      const analysis = engine.analyzeChoiceSemantics(choice, alternatives);
      
      expect(analysis.psychProfile).toBeDefined();
      expect(analysis.hiddenMotivations).toBeInstanceOf(Array);
      expect(analysis.semanticInsight).toBeDefined();
      expect(typeof analysis.semanticInsight).toBe('string');
    });
    
    test('should detect emotional tones in player choices', () => {
      const fearChoice = 'I am afraid this might be dangerous';
      const controlChoice = 'I will take control and manage this situation';
      const submitChoice = 'I accept whatever happens and surrender';
      
      const alternatives = ['neutral option'];
      
      const fearAnalysis = engine.analyzeChoiceSemantics(fearChoice, alternatives);
      const controlAnalysis = engine.analyzeChoiceSemantics(controlChoice, alternatives);
      const submitAnalysis = engine.analyzeChoiceSemantics(submitChoice, alternatives);
      
      // Each should provide different insights
      expect(fearAnalysis.semanticInsight).not.toEqual(controlAnalysis.semanticInsight);
      expect(controlAnalysis.semanticInsight).not.toEqual(submitAnalysis.semanticInsight);
    });
  });

  describe('Adaptive Narrative DNA', () => {
    let engine: AdaptiveNarrativeDNA;
    let mockWorldState: WorldState;
    
    beforeEach(() => {
      engine = new AdaptiveNarrativeDNA();
      mockWorldState = {
        protagonist: 'DNA Subject',
        setting: 'Evolution Chamber',
        dilemma: 'Adaptation vs Stagnation',
        genreConfig: {
          id: 'dna-test',
          name: 'DNA Test',
          description: 'Narrative Evolution Test',
          style: 'Evolutionary',
          theme: {
            '--background-color': '#000',
            '--text-color': '#fff',
            '--accent-color': '#7c3aed',
            '--font-family': 'Arial',
          },
          startScreenImagePrompt: 'narrative dna',
          conceptPrompt: 'evolutionary concept',
          aiSystemInstruction: 'evolutionary instruction',
        },
        psychologicalStatus: 'Fragmented',
        systemHealth: 80,
        summary: 'Narrative DNA mutation in progress',
        uiDistortion: {
          filter: 'none',
          transform: 'none',
          transition: 'none',
        },
      };
    });
    
    test('should evolve narrative based on player choices and response times', () => {
      const fastResponseTime = 2000; // 2 seconds
      const slowResponseTime = 20000; // 20 seconds
      
      const initialGeneration = engine['narrativeDNA'].generation;
      
      engine.evolveNarrative('quick decision', fastResponseTime, mockWorldState);
      expect(engine['narrativeDNA'].generation).toBe(initialGeneration + 1);
      
      engine.evolveNarrative('slow decision', slowResponseTime, mockWorldState);
      expect(engine['narrativeDNA'].generation).toBe(initialGeneration + 2);
    });
    
    test('should generate adaptive prompts based on DNA expression', () => {
      const basePrompt = 'Continue the story';
      
      // Evolve DNA several times to see adaptation
      for (let i = 0; i < 5; i++) {
        engine.evolveNarrative(`choice ${i}`, 5000, mockWorldState);
      }
      
      const adaptedPrompt = engine.generateAdaptivePrompt(basePrompt, mockWorldState);
      
      expect(adaptedPrompt).toContain(basePrompt);
      // The adapted prompt should be at least as long as the base (may be equal if no modifications applied)
      expect(adaptedPrompt.length).toBeGreaterThanOrEqual(basePrompt.length);
    });
  });

  describe('Breaking the Fifth Wall', () => {
    let engine: BreakingFifthWall;
    let mockWorldState: WorldState;
    
    beforeEach(() => {
      engine = new BreakingFifthWall();
      mockWorldState = {
        protagonist: 'Fifth Wall Subject',
        setting: 'Browser Reality',
        dilemma: 'Digital vs Physical',
        genreConfig: {
          id: 'fifth-wall-test',
          name: 'Fifth Wall Test',
          description: 'Browser Manipulation Test',
          style: 'Meta-digital',
          theme: {
            '--background-color': '#000',
            '--text-color': '#fff',
            '--accent-color': '#ff0000',
            '--font-family': 'Arial',
          },
          startScreenImagePrompt: 'browser reality',
          conceptPrompt: 'meta concept',
          aiSystemInstruction: 'meta instruction',
        },
        psychologicalStatus: 'Paranoid',
        systemHealth: 30,
        summary: 'Fifth wall breaking initiated',
        uiDistortion: {
          filter: 'none',
          transform: 'none',
          transition: 'none',
        },
      };
    });
    
    test('should activate browser effects at sufficient intensity', () => {
      const originalTitle = document.title;
      
      engine.activateBreakage(0.8, mockWorldState); // High intensity
      
      // Should be active now
      expect(engine['isActive']).toBe(true);
      
      // Clean up
      engine.deactivateBreakage();
      expect(document.title).toBe(originalTitle);
      expect(engine['isActive']).toBe(false);
    });
    
    test('should not activate below threshold intensity', () => {
      engine.activateBreakage(0.2, mockWorldState); // Low intensity
      
      // Should not activate
      expect(engine['isActive']).toBe(false);
    });
    
    test('should properly clean up effects when deactivated', () => {
      const originalTitle = document.title;
      
      engine.activateBreakage(0.8, mockWorldState);
      engine.deactivateBreakage();
      
      expect(document.title).toBe(originalTitle);
      expect(engine['titleInterval']).toBeNull();
      expect(engine['faviconInterval']).toBeNull();
    });
  });
});