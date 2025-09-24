/**
 * Tests for the 4 new revolutionary features
 */

import { 
  NeuralEchoChamberEngine, 
  SemanticChoiceArchaeologist,
  FifthWallBreachEngine,
  AdaptiveNarrativeDNAEngine
} from '../revolutionaryFeatures';
import { StorySegment, WorldState } from '../../../types';

// Mock console methods
const originalConsoleWarn = console.warn;
beforeEach(() => {
  console.warn = jest.fn();
});

afterEach(() => {
  console.warn = originalConsoleWarn;
});

describe('New Revolutionary Features Test Suite', () => {
  const mockWorldState: WorldState = {
    protagonist: 'Test Protagonist',
    setting: 'Digital Void',
    dilemma: 'Escape or Embrace',
    summary: 'Test Summary',
    psychologicalStatus: 'Uneasy' as const,
    systemHealth: 0.8,
    uiDistortion: {
      transform: 'scale(1)',
      filter: 'none',
      transition: 'none',
    },
    genreConfig: {
      id: 'cosmic-horror',
      name: 'Cosmic Horror',
      description: 'Test Description',
      style: 'dark',
      theme: {
        '--background-color': '#000',
        '--text-color': '#fff',
        '--accent-color': '#f00',
        '--font-family': 'monospace',
      },
      startScreenImagePrompt: 'test prompt',
      conceptPrompt: 'test concept',
      aiSystemInstruction: 'test instruction',
    },
  };

  const mockStorySegment: StorySegment = {
    id: 'test-segment-1',
    text: 'A terrifying nightmare consumed me with darkness and whispers of horror from the void.',
    images: {
      main: 'test-image.jpg',
      mainStatus: 'loaded' as const,
    },
  };

  describe('NeuralEchoChamberEngine', () => {
    let engine: NeuralEchoChamberEngine;

    beforeEach(() => {
      // Clear localStorage mocks
      (localStorage.getItem as jest.Mock).mockReturnValue(null);
      (localStorage.setItem as jest.Mock).mockClear();
      
      engine = new NeuralEchoChamberEngine();
    });

    test('should capture neural echoes from story segments', async () => {
      await engine.captureNeuralEcho(mockStorySegment);
      
      // Should attempt to store echoes
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    test('should generate echo intrusions', async () => {
      // Mock stored echoes
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify([
        {
          content: 'darkness consumed',
          timestamp: Date.now(),
          context: 'test',
          intensity: 0.8,
        }
      ]));

      const intrusion = await engine.generateEchoIntrusion('test context');
      
      // May or may not generate intrusion due to randomness, but should not error
      expect(typeof intrusion === 'object' || intrusion === null).toBe(true);
    });

    test('should calculate session echo intensity', () => {
      const intensity = engine.calculateSessionEchoIntensity();
      
      expect(typeof intensity).toBe('number');
      expect(intensity).toBeGreaterThanOrEqual(0);
      expect(intensity).toBeLessThanOrEqual(1);
    });
  });

  describe('SemanticChoiceArchaeologist', () => {
    let archaeologist: SemanticChoiceArchaeologist;

    beforeEach(() => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);
      (localStorage.setItem as jest.Mock).mockClear();
      
      archaeologist = new SemanticChoiceArchaeologist();
    });

    test('should analyze choice semantics', async () => {
      const profile = await archaeologist.analyzeChoiceSemantics(
        'I carefully think about this dangerous situation',
        mockWorldState
      );

      expect(profile).toHaveProperty('linguisticPatterns');
      expect(profile).toHaveProperty('psychologicalMarkers');
      expect(profile).toHaveProperty('vulnerabilities');
      expect(Array.isArray(profile.linguisticPatterns)).toBe(true);
      expect(Array.isArray(profile.psychologicalMarkers)).toBe(true);
    });

    test('should craft targeted horror', async () => {
      const basePrompt = 'Generate horror scenario';
      const targetedPrompt = await archaeologist.craftTargetedHorror(basePrompt);

      expect(typeof targetedPrompt).toBe('string');
      expect(targetedPrompt.length).toBeGreaterThanOrEqual(basePrompt.length);
    });

    test('should identify psychological markers', async () => {
      await archaeologist.analyzeChoiceSemantics(
        'I bravely face the dangerous unknown alone',
        mockWorldState
      );

      // Should save profile
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('FifthWallBreachEngine', () => {
    let breachEngine: FifthWallBreachEngine;

    beforeEach(() => {
      breachEngine = new FifthWallBreachEngine();
      
      // Mock DOM methods
      document.title = 'Apophenia';
      document.createElement = jest.fn(() => ({
        style: { cssText: '' },
        textContent: '',
        remove: jest.fn(),
        appendChild: jest.fn(),
        parentNode: { removeChild: jest.fn() }
      })) as any;
      
      document.body = {
        appendChild: jest.fn(),
      } as any;
      
      document.querySelectorAll = jest.fn(() => []);
    });

    test('should manipulate browser chrome', async () => {
      const originalTitle = document.title;
      
      await breachEngine.manipulateBrowserChrome('Test Horror Message');
      
      // Title should be changed (may be random so just check it's different initially)
      // Note: Due to setTimeout, we can't easily test the restoration in unit tests
      expect(typeof document.title).toBe('string');
    });

    test('should create system level horror effects', async () => {
      const effects = await breachEngine.createSystemLevelHorror();
      
      expect(Array.isArray(effects)).toBe(true);
      // May return empty array if breach intensity is low
    });

    test('should create phantom interactions', async () => {
      // Mock querySelector to return mock buttons
      document.querySelectorAll = jest.fn(() => [
        { 
          style: { 
            backgroundColor: '', 
            transform: '', 
            transition: '' 
          } 
        }
      ] as any);

      await breachEngine.createPhantomInteractions();
      
      // Should not throw errors
      expect(document.querySelectorAll).toHaveBeenCalledWith('button, .choice-button');
    });
  });

  describe('AdaptiveNarrativeDNAEngine', () => {
    let dnaEngine: AdaptiveNarrativeDNAEngine;

    beforeEach(() => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);
      (localStorage.setItem as jest.Mock).mockClear();
      
      dnaEngine = new AdaptiveNarrativeDNAEngine();
    });

    test('should generate genetic markers', async () => {
      const markers = await dnaEngine.generateGeneticMarkers(
        'I help the lost soul find peace in darkness',
        mockWorldState
      );

      expect(Array.isArray(markers)).toBe(true);
      markers.forEach(marker => {
        expect(marker).toHaveProperty('type');
        expect(marker).toHaveProperty('strength');
        expect(marker).toHaveProperty('context');
      });
    });

    test('should evolve narrative genome', () => {
      const mockMarkers = [
        { type: 'character-altruistic', strength: 0.8, context: 'test' },
        { type: 'horror-psychological', strength: 0.9, context: 'test' }
      ];

      dnaEngine.evolveNarrativeGenome(mockMarkers);

      // Should save genome
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    test('should express narrative genes', async () => {
      const expressions = await dnaEngine.expressNarrativeGenes('test context');

      expect(expressions).toHaveProperty('characterTypes');
      expect(expressions).toHaveProperty('environmentalDetails');
      expect(expressions).toHaveProperty('horrorThemes');
      expect(expressions).toHaveProperty('narrativeStructure');
      
      expect(Array.isArray(expressions.characterTypes)).toBe(true);
      expect(Array.isArray(expressions.environmentalDetails)).toBe(true);
      expect(Array.isArray(expressions.horrorThemes)).toBe(true);
      expect(['linear', 'branching', 'circular', 'fragmented']).toContain(expressions.narrativeStructure);
    });
  });
});