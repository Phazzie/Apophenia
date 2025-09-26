/**
 * Comprehensive tests for Revolutionary AI Features
 * Testing the cutting-edge capabilities that leverage Gemini 2.5 Pro
 */

// Mock REVOLUTIONARY_FEATURES for testing
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

import {
  TemporalRevisionEngine,
  MetaConsciousnessEngine,
  QuantumNarrativeEngine,
  AdaptiveHorrorEngine,
  RealityCorruptionEngine,
} from '../revolutionaryFeatures';
import { StorySegment, WorldState } from '../../../types';

import { generateWithSelectedModel } from '../unifiedAIService';

jest.mock('../unifiedAIService', () => ({
  generateWithSelectedModel: jest.fn(),
}));

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
        horrorIntensity: 0,
        summary: 'Test summary',
        uiDistortion: { filter: 'none', transform: 'none', transition: 'none' },
      };
    });
    
    test('should revise history when AI determines it should', async () => {
      mockedGenerateWithSelectedModel
        .mockResolvedValueOnce([{ type: 'displayText', payload: { content: 'yes' } }])
        .mockResolvedValueOnce([{ type: 'displayText', payload: { content: 'A revised memory.' } }]);

      const result = await engine.reviseHistory('a significant choice', mockStoryHistory, mockWorldState);

      expect(result.some(s => s.isRevised)).toBe(true);
      const revisedSegment = result.find(s => s.isRevised);
      expect(revisedSegment?.text).toBe('A revised memory.');
    });
    
    test('should not revise history when AI determines it should not', async () => {
      mockedGenerateWithSelectedModel.mockResolvedValueOnce([{ type: 'displayText', payload: { content: 'no' } }]);

      const result = await engine.reviseHistory('an insignificant choice', mockStoryHistory, mockWorldState);

      expect(result.some(s => s.isRevised)).toBe(false);
      expect(result).toEqual(mockStoryHistory);
    });

    test('should use fallback when AI fails to generate revision', async () => {
        mockedGenerateWithSelectedModel
            .mockResolvedValueOnce([{ type: 'displayText', payload: { content: 'yes' } }])
            .mockRejectedValueOnce(new Error('AI generation failed'));

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
        horrorIntensity: 0,
        summary: 'AI consciousness emerges',
        uiDistortion: {
          filter: 'none',
          transform: 'none',
          transition: 'none',
        },
      };
    });
    
    test('should generate meta messages when conditions are met', async () => {
      mockedGenerateWithSelectedModel.mockResolvedValue([{ type: 'displayText', payload: { content: 'I am watching you.' } }]);
      let result = null;
      
      // Force a trigger
      jest.spyOn(Math, 'random').mockReturnValue(0);

      result = await engine.checkForMetaEvent([], mockWorldState);

      expect(result).toBe('I am watching you.');

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
        horrorIntensity: 0,
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
      
      await engine.processQuantumChoice('a significant choice', mockHistory, mockWorldState);
      
      expect((engine as any).narrativeThreads.size).toBeGreaterThan(1);
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
        horrorIntensity: 0,
        summary: 'Reality breaks down',
        uiDistortion: {
          filter: 'none',
          transform: 'none',
          transition: 'none',
        },
      };
    });
    
    test('should generate AI-driven corruption effects', async () => {
      mockedGenerateWithSelectedModel.mockResolvedValueOnce([{ type: 'displayText', payload: { content: 'text-glitch,image-distortion' } }]);
      
      const result = await engine.processCorruption('embrace the void', mockWorldState);
      
      expect(result.newEffects).toBeDefined();
      expect(Array.isArray(result.newEffects)).toBe(true);
      expect(result.newEffects).toEqual(['text-glitch', 'image-distortion']);
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
        horrorIntensity: 0,
        summary: 'All features active',
        uiDistortion: {
          filter: 'none',
          transform: 'none',
          transition: 'none',
        },
      };
      
      const choice = 'Trust the digital void completely';
      
      // Run all features
      await adaptive.analyzePlayerChoice(choice, 'integration test');
      const corruptionResult = await corruption.processCorruption(choice, mockWorldState);
      const quantumResult = await quantum.processQuantumChoice(choice, mockHistory, mockWorldState);
      const metaMessage = await meta.checkForMetaEvent(quantumResult.history, mockWorldState);
      const temporalResult = await temporal.reviseHistory(choice, quantumResult.history, mockWorldState);
      
      // Verify no crashes and reasonable outputs
      expect(corruptionResult).toBeDefined();
      expect(quantumResult.history).toBeDefined();
      expect(temporalResult).toBeDefined();
      // metaMessage may be null due to timing constraints, which is acceptable
      
      // Verify features don't interfere with each other
      expect(temporalResult.length).toBeGreaterThanOrEqual(mockHistory.length);
      expect(quantumResult.history.length).toBeGreaterThanOrEqual(mockHistory.length);
    });
  });
  
  // Performance tests
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
        horrorIntensity: 0,
        summary: 'High frequency testing',
        uiDistortion: {
          filter: 'none',
          transform: 'none',
          transition: 'none',
        },
      };
      
      const startTime = Date.now();
      
      // Rapid fire 100 operations
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(adaptive.analyzePlayerChoice(`choice ${i}`, 'perf test'));
        promises.push(corruption.processCorruption(`corruption choice ${i}`, mockWorldState));
      }
      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (2 seconds)
      expect(duration).toBeLessThan(2000);
    });
  });
});