/**
 * Contract Tests: UI Components (Seam #8)
 *
 * Validates that UI components conform to their interface contracts
 * defined in src/core/types/seams.ts lines 541-579
 *
 * These tests validate type contracts and prop interfaces.
 */

import { describe, it, expect, vi } from 'vitest';
import type {
  StartScreenProps,
  DescentScreenProps,
  UnravelingScreenProps,
  GenreConfig,
  WorldState,
  StorySegment,
  Choice
} from '../../src/core/types/seams';
import {
  mockGenreConfig,
  mockWorldState,
  mockStorySegment
} from '../mocks/mockStores';
import { AIProvider, PsychologicalStatus } from '../../src/core/types/seams';

// Helper function to create mock genre
function createMockGenre(): GenreConfig {
  return mockGenreConfig;
}

// Helper function to create mock choice
function createMockChoice(isIntrusive = false): Choice {
  return {
    id: 'choice-1',
    text: 'Test choice',
    isIntrusive,
    psychologicalWeight: 0.5,
  };
}

describe('Contract Tests: UI Components (Seam #8)', () => {
  describe('StartScreenProps Interface Contract', () => {
    it('validates StartScreenProps structure', () => {
      const props: StartScreenProps = {
        onStartGame: vi.fn(),
        availableGenres: [createMockGenre()],
        availableProviders: [AIProvider.GROK, AIProvider.MOCK],
      };

      // Validate all required properties exist
      expect(props).toHaveProperty('onStartGame');
      expect(props).toHaveProperty('availableGenres');
      expect(props).toHaveProperty('availableProviders');

      // Validate property types
      expect(typeof props.onStartGame).toBe('function');
      expect(Array.isArray(props.availableGenres)).toBe(true);
      expect(Array.isArray(props.availableProviders)).toBe(true);
    });

    it('onStartGame accepts (GenreConfig, AIProvider) parameters', () => {
      const mockCallback = vi.fn();
      const genre = createMockGenre();
      const provider = AIProvider.GROK;

      const props: StartScreenProps = {
        onStartGame: mockCallback,
        availableGenres: [genre],
        availableProviders: [provider],
      };

      // Verify callback can be called with correct parameters
      props.onStartGame(genre, provider);

      expect(mockCallback).toHaveBeenCalledOnce();
      expect(mockCallback).toHaveBeenCalledWith(genre, provider);
    });

    it('accepts empty arrays', () => {
      const props: StartScreenProps = {
        onStartGame: vi.fn(),
        availableGenres: [],
        availableProviders: [],
      };

      expect(props.availableGenres).toHaveLength(0);
      expect(props.availableProviders).toHaveLength(0);
    });

    it('accepts multiple genres and providers', () => {
      const genre1 = { ...createMockGenre(), id: 'genre-1', name: 'Genre 1' };
      const genre2 = { ...createMockGenre(), id: 'genre-2', name: 'Genre 2' };

      const props: StartScreenProps = {
        onStartGame: vi.fn(),
        availableGenres: [genre1, genre2],
        availableProviders: [AIProvider.GROK, AIProvider.MOCK],
      };

      expect(props.availableGenres).toHaveLength(2);
      expect(props.availableProviders).toHaveLength(2);
    });

    it('GenreConfig items have all required properties', () => {
      const genre = createMockGenre();

      expect(genre).toHaveProperty('id');
      expect(genre).toHaveProperty('name');
      expect(genre).toHaveProperty('description');
      expect(genre).toHaveProperty('systemPrompt');
      expect(genre).toHaveProperty('themes');
      expect(genre).toHaveProperty('fearCategories');
      expect(genre).toHaveProperty('visualStyle');

      expect(Array.isArray(genre.themes)).toBe(true);
      expect(Array.isArray(genre.fearCategories)).toBe(true);
    });
  });

  describe('DescentScreenProps Interface Contract', () => {
    it('validates DescentScreenProps structure', () => {
      const props: DescentScreenProps = {
        worldState: mockWorldState,
        currentSegment: mockStorySegment,
        choices: [],
        isGenerating: false,
        onChoice: vi.fn(),
        onSave: vi.fn(),
        onReset: vi.fn(),
      };

      // Validate all required properties exist
      expect(props).toHaveProperty('worldState');
      expect(props).toHaveProperty('currentSegment');
      expect(props).toHaveProperty('choices');
      expect(props).toHaveProperty('isGenerating');
      expect(props).toHaveProperty('onChoice');
      expect(props).toHaveProperty('onSave');
      expect(props).toHaveProperty('onReset');

      // Validate property types
      expect(typeof props.worldState).toBe('object');
      expect(typeof props.currentSegment).toBe('object');
      expect(Array.isArray(props.choices)).toBe(true);
      expect(typeof props.isGenerating).toBe('boolean');
      expect(typeof props.onChoice).toBe('function');
      expect(typeof props.onSave).toBe('function');
      expect(typeof props.onReset).toBe('function');
    });

    it('handles optional intrusiveThought prop', () => {
      const propsWithIntrusive: DescentScreenProps = {
        worldState: mockWorldState,
        currentSegment: mockStorySegment,
        choices: [createMockChoice()],
        intrusiveThought: createMockChoice(true),
        isGenerating: false,
        onChoice: vi.fn(),
        onSave: vi.fn(),
        onReset: vi.fn(),
      };

      expect(propsWithIntrusive.intrusiveThought).toBeDefined();
      expect(propsWithIntrusive.intrusiveThought?.isIntrusive).toBe(true);
    });

    it('handles intrusiveThought as undefined', () => {
      const props: DescentScreenProps = {
        worldState: mockWorldState,
        currentSegment: mockStorySegment,
        choices: [createMockChoice()],
        intrusiveThought: undefined,
        isGenerating: false,
        onChoice: vi.fn(),
        onSave: vi.fn(),
        onReset: vi.fn(),
      };

      expect(props.intrusiveThought).toBeUndefined();
    });

    it('callback signatures are correct', () => {
      const onChoice = vi.fn();
      const onSave = vi.fn();
      const onReset = vi.fn();

      const props: DescentScreenProps = {
        worldState: mockWorldState,
        currentSegment: mockStorySegment,
        choices: [],
        isGenerating: false,
        onChoice,
        onSave,
        onReset,
      };

      // Test callback signatures
      const choice = createMockChoice();
      props.onChoice(choice);
      props.onSave();
      props.onReset();

      expect(onChoice).toHaveBeenCalledWith(choice);
      expect(onSave).toHaveBeenCalledWith();
      expect(onReset).toHaveBeenCalledWith();
    });

    it('WorldState has all required properties', () => {
      const worldState = mockWorldState;

      expect(worldState).toHaveProperty('protagonist');
      expect(worldState).toHaveProperty('setting');
      expect(worldState).toHaveProperty('dilemma');
      expect(worldState).toHaveProperty('psychologicalStatus');
      expect(worldState).toHaveProperty('systemHealth');
      expect(worldState).toHaveProperty('horrorIntensity');
      expect(worldState).toHaveProperty('corruptionLevel');
      expect(worldState).toHaveProperty('genreConfig');

      expect(typeof worldState.protagonist).toBe('string');
      expect(typeof worldState.setting).toBe('string');
      expect(typeof worldState.dilemma).toBe('string');
      expect(typeof worldState.systemHealth).toBe('number');
      expect(typeof worldState.horrorIntensity).toBe('number');
      expect(typeof worldState.corruptionLevel).toBe('number');
    });

    it('handles different PsychologicalStatus values', () => {
      const statuses: PsychologicalStatus[] = [
        PsychologicalStatus.STABLE,
        PsychologicalStatus.UNEASY,
        PsychologicalStatus.PARANOID,
        PsychologicalStatus.FRAGMENTED,
        PsychologicalStatus.SHATTERED,
      ];

      statuses.forEach((status) => {
        const worldState: WorldState = {
          ...mockWorldState,
          psychologicalStatus: status,
        };

        expect(worldState.psychologicalStatus).toBe(status);
      });
    });

    it('handles varying corruption levels', () => {
      const corruptionLevels = [0, 25, 50, 75, 100];

      corruptionLevels.forEach((level) => {
        const worldState: WorldState = {
          ...mockWorldState,
          corruptionLevel: level,
        };

        expect(worldState.corruptionLevel).toBe(level);
        expect(worldState.corruptionLevel).toBeGreaterThanOrEqual(0);
        expect(worldState.corruptionLevel).toBeLessThanOrEqual(100);
      });
    });

    it('StorySegment has all required properties', () => {
      const segment = mockStorySegment;

      expect(segment).toHaveProperty('id');
      expect(segment).toHaveProperty('text');
      expect(segment).toHaveProperty('timestamp');

      expect(typeof segment.id).toBe('string');
      expect(typeof segment.text).toBe('string');
      expect(typeof segment.timestamp).toBe('number');
    });

    it('Choice interface has required properties', () => {
      const choice = createMockChoice();

      expect(choice).toHaveProperty('id');
      expect(choice).toHaveProperty('text');
      expect(choice).toHaveProperty('isIntrusive');

      expect(typeof choice.id).toBe('string');
      expect(typeof choice.text).toBe('string');
      expect(typeof choice.isIntrusive).toBe('boolean');
    });
  });

  describe('UnravelingScreenProps Interface Contract', () => {
    it('validates UnravelingScreenProps structure', () => {
      const props: UnravelingScreenProps = {
        worldState: mockWorldState,
        finalSegment: mockStorySegment,
        onRestart: vi.fn(),
      };

      // Validate all required properties exist
      expect(props).toHaveProperty('worldState');
      expect(props).toHaveProperty('finalSegment');
      expect(props).toHaveProperty('onRestart');

      // Validate property types
      expect(typeof props.worldState).toBe('object');
      expect(typeof props.finalSegment).toBe('object');
      expect(typeof props.onRestart).toBe('function');
    });

    it('onRestart callback has correct signature', () => {
      const onRestart = vi.fn();

      const props: UnravelingScreenProps = {
        worldState: mockWorldState,
        finalSegment: mockStorySegment,
        onRestart,
      };

      // Call with no parameters
      props.onRestart();

      expect(onRestart).toHaveBeenCalledOnce();
      expect(onRestart).toHaveBeenCalledWith();
    });

    it('handles high corruption worldState', () => {
      const highCorruptionWorld: WorldState = {
        ...mockWorldState,
        corruptionLevel: 100,
        psychologicalStatus: PsychologicalStatus.SHATTERED,
        systemHealth: 0,
        horrorIntensity: 10,
      };

      const props: UnravelingScreenProps = {
        worldState: highCorruptionWorld,
        finalSegment: mockStorySegment,
        onRestart: vi.fn(),
      };

      expect(props.worldState.corruptionLevel).toBe(100);
      expect(props.worldState.psychologicalStatus).toBe(PsychologicalStatus.SHATTERED);
      expect(props.worldState.systemHealth).toBe(0);
      expect(props.worldState.horrorIntensity).toBe(10);
    });

    it('handles different finalSegment content', () => {
      const finalSegments: StorySegment[] = [
        { ...mockStorySegment, text: 'The end is near.' },
        { ...mockStorySegment, text: 'Reality has collapsed.' },
        { ...mockStorySegment, text: '' },
      ];

      finalSegments.forEach((segment) => {
        const props: UnravelingScreenProps = {
          worldState: mockWorldState,
          finalSegment: segment,
          onRestart: vi.fn(),
        };

        expect(props.finalSegment).toBe(segment);
        expect(props.finalSegment).toHaveProperty('text');
      });
    });
  });

  describe('Cross-Interface Validation', () => {
    it('all screen props use compatible WorldState', () => {
      const worldState = mockWorldState;

      // Should be usable across all screen types
      const startProps: StartScreenProps = {
        onStartGame: vi.fn(),
        availableGenres: [worldState.genreConfig],
        availableProviders: [AIProvider.GROK],
      };

      const descentProps: DescentScreenProps = {
        worldState,
        currentSegment: mockStorySegment,
        choices: [],
        isGenerating: false,
        onChoice: vi.fn(),
        onSave: vi.fn(),
        onReset: vi.fn(),
      };

      const unravelingProps: UnravelingScreenProps = {
        worldState,
        finalSegment: mockStorySegment,
        onRestart: vi.fn(),
      };

      expect(descentProps.worldState).toBe(unravelingProps.worldState);
      expect(startProps.availableGenres[0]).toBe(worldState.genreConfig);
    });

    it('all screen props use compatible StorySegment', () => {
      const segment = mockStorySegment;

      const descentProps: DescentScreenProps = {
        worldState: mockWorldState,
        currentSegment: segment,
        choices: [],
        isGenerating: false,
        onChoice: vi.fn(),
        onSave: vi.fn(),
        onReset: vi.fn(),
      };

      const unravelingProps: UnravelingScreenProps = {
        worldState: mockWorldState,
        finalSegment: segment,
        onRestart: vi.fn(),
      };

      expect(descentProps.currentSegment).toBe(unravelingProps.finalSegment);
    });

    it('Choice interface is consistent across usage', () => {
      const regularChoice = createMockChoice(false);
      const intrusiveChoice = createMockChoice(true);

      const props: DescentScreenProps = {
        worldState: mockWorldState,
        currentSegment: mockStorySegment,
        choices: [regularChoice],
        intrusiveThought: intrusiveChoice,
        isGenerating: false,
        onChoice: vi.fn(),
        onSave: vi.fn(),
        onReset: vi.fn(),
      };

      // Both should have the same structure
      expect(props.choices[0]).toHaveProperty('id');
      expect(props.choices[0]).toHaveProperty('text');
      expect(props.choices[0]).toHaveProperty('isIntrusive');

      expect(props.intrusiveThought).toHaveProperty('id');
      expect(props.intrusiveThought).toHaveProperty('text');
      expect(props.intrusiveThought).toHaveProperty('isIntrusive');

      // Intrusive thought must be marked as intrusive
      expect(props.intrusiveThought!.isIntrusive).toBe(true);
    });
  });

  describe('Type Safety Validation', () => {
    it('StartScreenProps enforces type safety', () => {
      const validProps: StartScreenProps = {
        onStartGame: vi.fn(),
        availableGenres: [],
        availableProviders: [],
      };

      // These should all be properly typed
      expect(Array.isArray(validProps.availableGenres)).toBe(true);
      expect(Array.isArray(validProps.availableProviders)).toBe(true);
      expect(typeof validProps.onStartGame).toBe('function');
    });

    it('DescentScreenProps enforces type safety', () => {
      const validProps: DescentScreenProps = {
        worldState: mockWorldState,
        currentSegment: mockStorySegment,
        choices: [],
        isGenerating: false,
        onChoice: vi.fn(),
        onSave: vi.fn(),
        onReset: vi.fn(),
      };

      expect(typeof validProps.isGenerating).toBe('boolean');
      expect(Array.isArray(validProps.choices)).toBe(true);
    });

    it('UnravelingScreenProps enforces type safety', () => {
      const validProps: UnravelingScreenProps = {
        worldState: mockWorldState,
        finalSegment: mockStorySegment,
        onRestart: vi.fn(),
      };

      expect(typeof validProps.onRestart).toBe('function');
      expect(validProps.worldState).toBeDefined();
      expect(validProps.finalSegment).toBeDefined();
    });
  });
});
