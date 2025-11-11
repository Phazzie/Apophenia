/**
 * Prompt Builder Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { promptBuilder } from '../../../src/services/ai/promptBuilder';
import {
  GenreConfig,
  AIContext,
  WorldState,
  Choice,
  PsychologicalStatus,
} from '../../../src/core/types/seams';

// Mock genre config
const mockGenre: GenreConfig = {
  id: 'cosmic-horror',
  name: 'Cosmic Horror',
  description: 'Face the incomprehensible void',
  systemPrompt: 'You are a cosmic horror narrator',
  themes: ['existential dread', 'cosmic insignificance'],
  fearCategories: ['madness', 'void'],
  visualStyle: {
    primaryColor: '#1a0033',
    secondaryColor: '#330066',
    accentColor: '#9933ff',
    fontFamily: 'monospace',
    atmosphere: 'dark',
  },
};

// Mock world state
const mockWorldState: WorldState = {
  protagonist: 'Alice',
  setting: 'An abandoned space station',
  dilemma: 'Reality is unraveling',
  psychologicalStatus: PsychologicalStatus.UNEASY,
  systemHealth: 75,
  horrorIntensity: 5,
  corruptionLevel: 30,
  genreConfig: mockGenre,
};

describe('PromptBuilder', () => {
  describe('buildSystemPrompt', () => {
    it('should build a system prompt with genre and engines', () => {
      const engines = ['TemporalRevision', 'RealityCorruption'];

      const prompt = promptBuilder.buildSystemPrompt(mockGenre, engines);

      expect(prompt).toContain('Cosmic Horror');
      expect(prompt).toContain('TemporalRevision');
      expect(prompt).toContain('RealityCorruption');
      expect(prompt).toContain('existential dread');
      expect(prompt).toContain('dark');
    });

    it('should handle empty engine list', () => {
      const prompt = promptBuilder.buildSystemPrompt(mockGenre, []);

      expect(prompt).toContain('ACTIVE ENGINES: None');
    });

    it('should include all genre themes', () => {
      const prompt = promptBuilder.buildSystemPrompt(mockGenre, []);

      expect(prompt).toContain('existential dread');
      expect(prompt).toContain('cosmic insignificance');
    });

    it('should include visual style information', () => {
      const prompt = promptBuilder.buildSystemPrompt(mockGenre, []);

      expect(prompt).toContain('#1a0033');
      expect(prompt).toContain('#330066');
      expect(prompt).toContain('dark');
    });
  });

  describe('buildContextPrompt', () => {
    it('should build context with world state and history', () => {
      const context: AIContext = {
        worldState: mockWorldState,
        recentHistory: [
          {
            id: 'seg-1',
            text: 'The station creaks ominously',
            timestamp: Date.now(),
          },
        ],
        playerProfile: {
          fearProfile: {
            madness: 0.7,
            isolation: 0.5,
          },
          choicePatterns: {
            riskTaking: 0.6,
            curiosity: 0.8,
            aggression: 0.3,
            avoidance: 0.4,
          },
          engagementMetrics: {
            totalChoices: 5,
            averageResponseTime: 3000,
            sessionDuration: 600000,
          },
        },
        genrePrompts: ['Increase tension', 'Add visual corruption'],
        engineInstructions: ['Revise a past segment'],
      };

      const prompt = promptBuilder.buildContextPrompt(context);

      expect(prompt).toContain('Alice');
      expect(prompt).toContain('An abandoned space station');
      expect(prompt).toContain('Reality is unraveling');
      expect(prompt).toContain('75/100'); // System health
      expect(prompt).toContain('5/10'); // Horror intensity
      expect(prompt).toContain('30/100'); // Corruption level
      expect(prompt).toContain('The station creaks ominously');
      expect(prompt).toContain('madness: 70%');
      expect(prompt).toContain('Risk Taking: 60%');
    });

    it('should handle empty history', () => {
      const context: AIContext = {
        worldState: mockWorldState,
        recentHistory: [],
        playerProfile: {
          fearProfile: {},
          choicePatterns: {
            riskTaking: 0,
            curiosity: 0,
            aggression: 0,
            avoidance: 0,
          },
          engagementMetrics: {
            totalChoices: 0,
            averageResponseTime: 0,
            sessionDuration: 0,
          },
        },
        genrePrompts: [],
        engineInstructions: [],
      };

      const prompt = promptBuilder.buildContextPrompt(context);

      expect(prompt).toContain('No history yet');
      expect(prompt).toContain('No special instructions');
    });

    it('should summarize recent history', () => {
      const context: AIContext = {
        worldState: mockWorldState,
        recentHistory: [
          { id: 'seg-1', text: 'First segment with some text here', timestamp: Date.now() },
          { id: 'seg-2', text: 'Second segment', timestamp: Date.now() },
          { id: 'seg-3', text: 'Third segment', timestamp: Date.now(), isRevised: true },
        ],
        playerProfile: {
          fearProfile: {},
          choicePatterns: { riskTaking: 0, curiosity: 0, aggression: 0, avoidance: 0 },
          engagementMetrics: { totalChoices: 0, averageResponseTime: 0, sessionDuration: 0 },
        },
        genrePrompts: [],
        engineInstructions: [],
      };

      const prompt = promptBuilder.buildContextPrompt(context);

      expect(prompt).toContain('[REVISED]');
      expect(prompt).toContain('First segment');
      expect(prompt).toContain('Second segment');
    });
  });

  describe('buildChoicePrompt', () => {
    it('should build prompt for normal choice', () => {
      const choice: Choice = {
        id: 'c1',
        text: 'Investigate the noise',
        consequence: 'You find something disturbing',
        psychologicalWeight: 0.6,
      };

      const prompt = promptBuilder.buildChoicePrompt(mockWorldState, choice);

      expect(prompt).toContain('Investigate the noise');
      expect(prompt).toContain('You find something disturbing');
      expect(prompt).toContain('0.6');
      expect(prompt).toContain('5/10'); // Horror intensity
    });

    it('should handle intrusive thought choice', () => {
      const choice: Choice = {
        id: 'c1',
        text: 'SUBMIT TO THE VOID',
        isIntrusive: true,
        psychologicalWeight: 1.0,
      };

      const prompt = promptBuilder.buildChoicePrompt(mockWorldState, choice);

      expect(prompt).toContain('INTRUSIVE THOUGHT');
      expect(prompt).toContain('psychological weight');
    });

    it('should include current world state metrics', () => {
      const choice: Choice = {
        id: 'c1',
        text: 'Continue forward',
      };

      const prompt = promptBuilder.buildChoicePrompt(mockWorldState, choice);

      expect(prompt).toContain('Horror intensity: 5/10');
      expect(prompt).toContain('Corruption level: 30/100');
      expect(prompt).toContain('System health: 75/100');
    });
  });

  describe('injectEngineInstructions', () => {
    it('should inject instructions into prompt', () => {
      const basePrompt = 'Generate the next story segment';
      const instructions = ['Revise a past event', 'Increase corruption level'];

      const result = promptBuilder.injectEngineInstructions(basePrompt, instructions);

      expect(result).toContain('Generate the next story segment');
      expect(result).toContain('ACTIVE ENGINE INSTRUCTIONS');
      expect(result).toContain('1. Revise a past event');
      expect(result).toContain('2. Increase corruption level');
    });

    it('should return original prompt if no instructions', () => {
      const basePrompt = 'Generate the next story segment';

      const result = promptBuilder.injectEngineInstructions(basePrompt, []);

      expect(result).toBe(basePrompt);
    });

    it('should number instructions correctly', () => {
      const instructions = ['First', 'Second', 'Third'];

      const result = promptBuilder.injectEngineInstructions('', instructions);

      expect(result).toContain('1. First');
      expect(result).toContain('2. Second');
      expect(result).toContain('3. Third');
    });
  });
});
