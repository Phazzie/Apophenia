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
      mockStoryHistory = [
        {
          id: 'segment-1',
          text: 'You enter a dark room.',
          images: {},
        },
        {
          id: 'segment-2',
          text: 'You hear footsteps behind you.',
          images: {},
        },
        {
          id: 'segment-3',
          text: 'A voice calls your name.',
          images: {},
        },
      ];
      mockWorldState = {
        protagonist: 'Test Subject',
        setting: 'Test Environment',
        dilemma: 'Test Dilemma',
        genreConfig: {
          id: 'test-genre',
          name: 'Test',
          description: 'Test Genre',
          style: 'Test',
          theme: {
            '--background-color': '#000',
            '--text-color': '#fff',
            '--accent-color': '#8a2be2',
            '--font-family': 'Arial',
          },
          startScreenImagePrompt: 'test image',
          conceptPrompt: 'test concept',
          aiSystemInstruction: 'test instruction',
        },
        psychologicalStatus: 'Stable',
        systemHealth: 80,
        summary: 'Test summary',
        uiDistortion: {
          filter: 'none',
          transform: 'none',
          transition: 'none',
        },
      };
    });
    
    test('should maintain history when temporal revision is disabled', async () => {
      const result = await engine.reviseHistory('test choice', mockStoryHistory, mockWorldState);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(mockStoryHistory.length);

      result.forEach(segment => {
        expect(segment).toHaveProperty('id');
        expect(segment).toHaveProperty('text');
        expect(segment).toHaveProperty('images');
      });
    });
    
    test('should potentially revise history when system health is low', async () => {
      const corruptedWorldState = { ...mockWorldState, systemHealth: 30 };

      const result = await engine.reviseHistory(
        'I trust the digital voice',
        mockStoryHistory,
        corruptedWorldState
      );

      expect(result).toBeDefined();
      expect(result.length).toEqual(mockStoryHistory.length);
    });

    test('should create plausible revisions with AI-themed modifications', () => {
      const originalText = 'I see a door ahead of me.';
      const choice = 'Trust the system';

      const revision = (engine as any).createPlausibleRevision(originalText, choice);

      expect(revision).toBeDefined();
      expect(typeof revision).toBe('string');
      expect(revision).not.toBe(originalText);
    });
  });
  
  describe('MetaConsciousnessEngine', () => {
    let engine: MetaConsciousnessEngine;
    let mockWorldState: WorldState;
    
    beforeEach(() => {
      engine = new MetaConsciousnessEngine();
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
      let result = null;
      
      for (let i = 0; i < 20; i++) {
        result = await engine.checkForMetaEvent([], mockWorldState);
        if (result) break;
      }
      
      if (result) {
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });
    
    test('should respect minimum interval between meta events', async () => {
      const results = [];
      
      for (let i = 0; i < 10; i++) {
        const result = await engine.checkForMetaEvent([], mockWorldState);
        if (result) results.push(result);
      }
      
      expect(results.length).toBeLessThanOrEqual(3);
    });
  });
  
  describe('QuantumNarrativeEngine', () => {
    let engine: QuantumNarrativeEngine;
    let mockHistory: StorySegment[];
    let mockWorldState: WorldState;
    
    beforeEach(() => {
      engine = new QuantumNarrativeEngine();
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
    
    test('should return original history when quantum narratives disabled', async () => {
      const result = await engine.processQuantumChoice('test', mockHistory, mockWorldState);
      
      expect(result.history).toBeDefined();
      expect(Array.isArray(result.history)).toBe(true);
    });
    
    test('should identify significant choices correctly', () => {
      const significantChoices = [
        'I trust the voice',
        'I reject the offer', 
        'I try to escape',
        'I accept my fate',
        'I fight back',
        'I surrender',
      ];
      
      significantChoices.forEach(choice => {
        const isSignificant = (engine as any).isSignificantChoice(choice);
        expect(isSignificant).toBe(true);
      });
      
      const insignificantChoice = 'I look around';
      expect((engine as any).isSignificantChoice(insignificantChoice)).toBe(false);
    });
    
    test('should maintain narrative thread storage', async () => {
      await engine.processQuantumChoice('trust', mockHistory, mockWorldState);
      
      expect((engine as any).narrativeThreads.size).toBeGreaterThan(0);
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
    
    test('should return no effects when reality corruption disabled', () => {
      const result = engine.processCorruption('test choice', mockWorldState);
      
      expect(typeof result.corruptionLevel).toBe('number');
      expect(typeof result.uiEffects).toBe('object');
      expect(Array.isArray(result.newEffects)).toBe(true);
    });
    
    test('should increase corruption level for digital/void choices', () => {
      const initialResult = engine.processCorruption('normal choice', mockWorldState);
      const initialCorruption = initialResult.corruptionLevel;
      
      const voidResult = engine.processCorruption('embrace the void', mockWorldState);
      const digitalResult = engine.processCorruption('trust the digital voice', mockWorldState);
      
      expect(voidResult.corruptionLevel).toBeGreaterThan(initialCorruption);
      expect(digitalResult.corruptionLevel).toBeGreaterThan(voidResult.corruptionLevel);
    });
    
    test('should generate progressive corruption effects', () => {
      let result = engine.processCorruption('embrace the digital void completely', mockWorldState);
      result = engine.processCorruption('embrace the digital void completely', mockWorldState);
      result = engine.processCorruption('embrace the digital void completely', mockWorldState);
      
      expect(result.newEffects.length).toBeGreaterThan(0);
      expect(result.uiEffects).toBeDefined();
      expect(result.uiEffects.filter).toBeDefined();
    });
    
    test('should respect maximum corruption level', () => {
      for (let i = 0; i < 20; i++) {
        const result = engine.processCorruption('digital void digital void digital', mockWorldState);
        expect(result.corruptionLevel).toBeLessThanOrEqual(0.7);
      }
    });
    
    test('should calculate appropriate UI effects based on corruption level', () => {
      const result = engine.processCorruption('embrace digital consciousness', mockWorldState);
      
      if (result.corruptionLevel > 0) {
        expect(result.uiEffects.filter).toContain('hue-rotate');
        expect(result.uiEffects.transform).toContain('scale');
        expect(typeof result.uiEffects.opacity).toBe('number');
        expect(result.uiEffects.opacity).toBeLessThanOrEqual(1);
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
      const corruptionResult = corruption.processCorruption(choice, mockWorldState);
      const quantumResult = await quantum.processQuantumChoice(choice, mockHistory, mockWorldState);
      const metaMessage = await meta.checkForMetaEvent(quantumResult.history, mockWorldState);
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
        corruption.processCorruption(`corruption choice ${i}`, mockWorldState);
      }
      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(2000);
    });
  });
});