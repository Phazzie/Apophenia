/**
 * CONTRACT TESTS: State Store Interface (Seam #2)
 *
 * Purpose: Validate that all 4 state stores (real and mock) implement their
 * contracts from src/core/types/seams.ts EXACTLY.
 *
 * What we test:
 * 1. Interface Implementation - All methods and properties exist
 * 2. State Shape - Matches interface exactly (no extra fields beyond Zustand internals)
 * 3. Action Behavior - Actions produce expected state changes
 * 4. Type Safety - All types match contract
 * 5. Reset Functionality - reset() returns to initial state
 * 6. Mock vs Real Parity - Mocks match real stores
 *
 * These tests ensure architectural integrity across the seam boundary.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type {
  GameStateStore,
  WorldStateStore,
  HistoryStore,
  PlayerProfileStore,
  GameState,
  Choice,
  StorySegment,
  WorldState,
  PlayerProfile,
  PsychologicalStatus,
} from '../../src/core/types/seams';
import {
  useGameStateStore,
  useWorldStateStore,
  useHistoryStore,
  usePlayerProfileStore,
} from '../../src/core/state';
import {
  createMockGameStateStore,
  createMockWorldStateStore,
  createMockHistoryStore,
  createMockPlayerProfileStore,
} from '../mocks/mockStores';

// ============================================================================
// GAME STATE STORE CONTRACT TESTS
// ============================================================================

describe('Contract Tests: GameStateStore (Seam #2)', () => {
  beforeEach(() => {
    // Reset store before each test
    useGameStateStore.getState().reset();
  });

  describe('Interface Implementation', () => {
    it('implements all required state properties', () => {
      const store = useGameStateStore.getState();

      // Verify all state properties exist
      expect(store).toHaveProperty('gameState');
      expect(store).toHaveProperty('choices');
      expect(store).toHaveProperty('intrusiveThought');
      expect(store).toHaveProperty('isGenerating');
    });

    it('implements all required action methods', () => {
      const store = useGameStateStore.getState();

      // Verify all action methods exist and are functions
      expect(typeof store.setGameState).toBe('function');
      expect(typeof store.setChoices).toBe('function');
      expect(typeof store.setGenerating).toBe('function');
      expect(typeof store.reset).toBe('function');
    });
  });

  describe('State Shape Compliance', () => {
    it('has correct initial state types', () => {
      const store = useGameStateStore.getState();

      // Verify types
      expect(typeof store.gameState).toBe('string');
      expect(Array.isArray(store.choices)).toBe(true);
      expect(typeof store.isGenerating).toBe('boolean');

      // intrusiveThought can be undefined or Choice object
      if (store.intrusiveThought !== undefined) {
        expect(typeof store.intrusiveThought).toBe('object');
        expect(store.intrusiveThought).toHaveProperty('id');
        expect(store.intrusiveThought).toHaveProperty('text');
        expect(store.intrusiveThought).toHaveProperty('isIntrusive');
      }
    });

    it('has valid initial state values', () => {
      const store = useGameStateStore.getState();

      // Check initial values
      expect(store.gameState).toBe('menu'); // GameState.MENU
      expect(store.choices).toEqual([]);
      expect(store.intrusiveThought).toBeUndefined();
      expect(store.isGenerating).toBe(false);
    });

    it('does not have unexpected extra properties', () => {
      const store = useGameStateStore.getState();

      // Define expected keys (including Zustand internals if any)
      const expectedKeys = [
        'gameState',
        'choices',
        'intrusiveThought',
        'isGenerating',
        'setGameState',
        'setChoices',
        'setGenerating',
        'reset',
      ];

      const actualKeys = Object.keys(store);

      // All expected keys should be present
      expectedKeys.forEach((key) => {
        expect(actualKeys).toContain(key);
      });

      // Should not have too many extra keys (allow for internal Zustand methods)
      expect(actualKeys.length).toBeLessThanOrEqual(expectedKeys.length + 5);
    });
  });

  describe('Action Behavior', () => {
    it('setGameState updates state correctly', () => {
      const store = useGameStateStore.getState();

      store.setGameState('descending' as GameState);
      expect(useGameStateStore.getState().gameState).toBe('descending');

      store.setGameState('unraveling' as GameState);
      expect(useGameStateStore.getState().gameState).toBe('unraveling');

      store.setGameState('collapsed' as GameState);
      expect(useGameStateStore.getState().gameState).toBe('collapsed');
    });

    it('setChoices updates choices and intrusiveThought', () => {
      const store = useGameStateStore.getState();

      const testChoices: Choice[] = [
        { id: '1', text: 'Choice 1', isIntrusive: false },
        { id: '2', text: 'Choice 2', isIntrusive: false },
      ];
      const intrusiveChoice: Choice = {
        id: 'intrusive',
        text: 'Intrusive thought',
        isIntrusive: true,
      };

      // Set choices without intrusive thought
      store.setChoices(testChoices);
      expect(useGameStateStore.getState().choices).toEqual(testChoices);
      expect(useGameStateStore.getState().intrusiveThought).toBeUndefined();

      // Set choices with intrusive thought
      store.setChoices(testChoices, intrusiveChoice);
      expect(useGameStateStore.getState().choices).toEqual(testChoices);
      expect(useGameStateStore.getState().intrusiveThought).toEqual(intrusiveChoice);
    });

    it('setGenerating updates isGenerating flag', () => {
      const store = useGameStateStore.getState();

      store.setGenerating(true);
      expect(useGameStateStore.getState().isGenerating).toBe(true);

      store.setGenerating(false);
      expect(useGameStateStore.getState().isGenerating).toBe(false);
    });

    it('reset returns state to initial values', () => {
      const store = useGameStateStore.getState();

      // Change state
      store.setGameState('descending' as GameState);
      store.setChoices([{ id: '1', text: 'Test', isIntrusive: false }]);
      store.setGenerating(true);

      // Reset
      store.reset();

      // Verify back to initial state
      const resetState = useGameStateStore.getState();
      expect(resetState.gameState).toBe('menu');
      expect(resetState.choices).toEqual([]);
      expect(resetState.intrusiveThought).toBeUndefined();
      expect(resetState.isGenerating).toBe(false);
    });
  });
});

// ============================================================================
// WORLD STATE STORE CONTRACT TESTS
// ============================================================================

describe('Contract Tests: WorldStateStore (Seam #2)', () => {
  beforeEach(() => {
    // Reset store before each test
    useWorldStateStore.getState().reset();
  });

  describe('Interface Implementation', () => {
    it('implements all required state properties', () => {
      const store = useWorldStateStore.getState();

      // Verify worldState property exists
      expect(store).toHaveProperty('worldState');
    });

    it('implements all required action methods', () => {
      const store = useWorldStateStore.getState();

      // Verify all action methods exist and are functions
      expect(typeof store.updateWorld).toBe('function');
      expect(typeof store.increaseHorror).toBe('function');
      expect(typeof store.decreaseHealth).toBe('function');
      expect(typeof store.setCorruption).toBe('function');
      expect(typeof store.reset).toBe('function');
    });
  });

  describe('State Shape Compliance', () => {
    it('worldState has all required properties', () => {
      const store = useWorldStateStore.getState();
      const { worldState } = store;

      // Verify all WorldState properties exist
      expect(worldState).toHaveProperty('protagonist');
      expect(worldState).toHaveProperty('setting');
      expect(worldState).toHaveProperty('dilemma');
      expect(worldState).toHaveProperty('psychologicalStatus');
      expect(worldState).toHaveProperty('systemHealth');
      expect(worldState).toHaveProperty('horrorIntensity');
      expect(worldState).toHaveProperty('corruptionLevel');
      expect(worldState).toHaveProperty('genreConfig');
    });

    it('worldState has correct initial types', () => {
      const store = useWorldStateStore.getState();
      const { worldState } = store;

      // Verify types
      expect(typeof worldState.protagonist).toBe('string');
      expect(typeof worldState.setting).toBe('string');
      expect(typeof worldState.dilemma).toBe('string');
      expect(typeof worldState.psychologicalStatus).toBe('string');
      expect(typeof worldState.systemHealth).toBe('number');
      expect(typeof worldState.horrorIntensity).toBe('number');
      expect(typeof worldState.corruptionLevel).toBe('number');
      expect(typeof worldState.genreConfig).toBe('object');
    });

    it('worldState has valid initial values', () => {
      const store = useWorldStateStore.getState();
      const { worldState } = store;

      // Check initial values
      expect(worldState.protagonist).toBe('');
      expect(worldState.setting).toBe('');
      expect(worldState.dilemma).toBe('');
      expect(worldState.psychologicalStatus).toBe('stable'); // PsychologicalStatus.STABLE
      expect(worldState.systemHealth).toBe(100);
      expect(worldState.horrorIntensity).toBe(0);
      expect(worldState.corruptionLevel).toBe(0);
    });
  });

  describe('Action Behavior', () => {
    it('updateWorld merges partial updates correctly', () => {
      const store = useWorldStateStore.getState();

      store.updateWorld({
        protagonist: 'Test Hero',
        setting: 'Dark Forest',
      });

      const state1 = useWorldStateStore.getState().worldState;
      expect(state1.protagonist).toBe('Test Hero');
      expect(state1.setting).toBe('Dark Forest');
      expect(state1.systemHealth).toBe(100); // Other properties unchanged

      store.updateWorld({
        dilemma: 'Lost in the woods',
      });

      const state2 = useWorldStateStore.getState().worldState;
      expect(state2.protagonist).toBe('Test Hero'); // Previous updates preserved
      expect(state2.dilemma).toBe('Lost in the woods');
    });

    it('increaseHorror increases horror intensity with cap at 10', () => {
      const store = useWorldStateStore.getState();

      store.increaseHorror(3);
      expect(useWorldStateStore.getState().worldState.horrorIntensity).toBe(3);

      store.increaseHorror(5);
      expect(useWorldStateStore.getState().worldState.horrorIntensity).toBe(8);

      // Test cap at 10
      store.increaseHorror(5);
      expect(useWorldStateStore.getState().worldState.horrorIntensity).toBe(10);

      store.increaseHorror(5);
      expect(useWorldStateStore.getState().worldState.horrorIntensity).toBe(10); // Stays at 10
    });

    it('decreaseHealth decreases health with floor at 0', () => {
      const store = useWorldStateStore.getState();

      store.decreaseHealth(30);
      expect(useWorldStateStore.getState().worldState.systemHealth).toBe(70);

      store.decreaseHealth(50);
      expect(useWorldStateStore.getState().worldState.systemHealth).toBe(20);

      // Test floor at 0
      store.decreaseHealth(50);
      expect(useWorldStateStore.getState().worldState.systemHealth).toBe(0);

      store.decreaseHealth(10);
      expect(useWorldStateStore.getState().worldState.systemHealth).toBe(0); // Stays at 0
    });

    it('setCorruption sets corruption level with bounds 0-100', () => {
      const store = useWorldStateStore.getState();

      store.setCorruption(50);
      expect(useWorldStateStore.getState().worldState.corruptionLevel).toBe(50);

      store.setCorruption(75);
      expect(useWorldStateStore.getState().worldState.corruptionLevel).toBe(75);

      // Test upper bound
      store.setCorruption(150);
      expect(useWorldStateStore.getState().worldState.corruptionLevel).toBe(100);

      // Test lower bound
      store.setCorruption(-50);
      expect(useWorldStateStore.getState().worldState.corruptionLevel).toBe(0);
    });

    it('reset returns state to initial values', () => {
      const store = useWorldStateStore.getState();

      // Change state
      store.updateWorld({
        protagonist: 'Changed Hero',
        setting: 'Changed Setting',
      });
      store.increaseHorror(5);
      store.decreaseHealth(30);
      store.setCorruption(50);

      // Reset
      store.reset();

      // Verify back to initial state
      const resetState = useWorldStateStore.getState().worldState;
      expect(resetState.protagonist).toBe('');
      expect(resetState.setting).toBe('');
      expect(resetState.horrorIntensity).toBe(0);
      expect(resetState.systemHealth).toBe(100);
      expect(resetState.corruptionLevel).toBe(0);
    });
  });
});

// ============================================================================
// HISTORY STORE CONTRACT TESTS
// ============================================================================

describe('Contract Tests: HistoryStore (Seam #2)', () => {
  beforeEach(() => {
    // Reset store before each test
    useHistoryStore.getState().reset();
  });

  describe('Interface Implementation', () => {
    it('implements all required state properties', () => {
      const store = useHistoryStore.getState();

      // Verify segments property exists
      expect(store).toHaveProperty('segments');
    });

    it('implements all required action methods', () => {
      const store = useHistoryStore.getState();

      // Verify all action methods exist and are functions
      expect(typeof store.addSegment).toBe('function');
      expect(typeof store.updateSegment).toBe('function');
      expect(typeof store.reviseSegment).toBe('function');
      expect(typeof store.getRecent).toBe('function');
      expect(typeof store.reset).toBe('function');
    });
  });

  describe('State Shape Compliance', () => {
    it('segments is an array', () => {
      const store = useHistoryStore.getState();

      expect(Array.isArray(store.segments)).toBe(true);
    });

    it('segments has valid initial value (empty array)', () => {
      const store = useHistoryStore.getState();

      expect(store.segments).toEqual([]);
      expect(store.segments.length).toBe(0);
    });

    it('segment objects have required properties', () => {
      const store = useHistoryStore.getState();

      const testSegment: StorySegment = {
        id: 'test-1',
        text: 'Test segment text',
        timestamp: Date.now(),
      };

      store.addSegment(testSegment);

      const segment = useHistoryStore.getState().segments[0];
      expect(segment).toHaveProperty('id');
      expect(segment).toHaveProperty('text');
      expect(segment).toHaveProperty('timestamp');
      expect(typeof segment.id).toBe('string');
      expect(typeof segment.text).toBe('string');
      expect(typeof segment.timestamp).toBe('number');
    });
  });

  describe('Action Behavior', () => {
    it('addSegment adds segments in order', () => {
      const store = useHistoryStore.getState();

      const segment1: StorySegment = {
        id: 'seg-1',
        text: 'First segment',
        timestamp: Date.now(),
      };
      const segment2: StorySegment = {
        id: 'seg-2',
        text: 'Second segment',
        timestamp: Date.now(),
      };

      store.addSegment(segment1);
      expect(useHistoryStore.getState().segments).toHaveLength(1);
      expect(useHistoryStore.getState().segments[0].id).toBe('seg-1');

      store.addSegment(segment2);
      expect(useHistoryStore.getState().segments).toHaveLength(2);
      expect(useHistoryStore.getState().segments[1].id).toBe('seg-2');
    });

    it('updateSegment updates specific segment properties', () => {
      const store = useHistoryStore.getState();

      const segment: StorySegment = {
        id: 'seg-1',
        text: 'Original text',
        timestamp: Date.now(),
      };

      store.addSegment(segment);

      // Update segment
      store.updateSegment('seg-1', {
        images: {
          main: 'https://example.com/image.jpg',
          mainStatus: 'loaded',
        },
      });

      const updated = useHistoryStore.getState().segments[0];
      expect(updated.text).toBe('Original text'); // Text unchanged
      expect(updated.images?.main).toBe('https://example.com/image.jpg');
      expect(updated.images?.mainStatus).toBe('loaded');
    });

    it('reviseSegment revises text and sets metadata', () => {
      const store = useHistoryStore.getState();

      const segment: StorySegment = {
        id: 'seg-1',
        text: 'Original text',
        timestamp: Date.now(),
      };

      store.addSegment(segment);

      // Revise segment
      store.reviseSegment('seg-1', 'Revised text');

      const revised = useHistoryStore.getState().segments[0];
      expect(revised.text).toBe('Revised text');
      expect(revised.isRevised).toBe(true);
      expect(revised.originalText).toBe('Original text');
    });

    it('reviseSegment preserves original text on multiple revisions', () => {
      const store = useHistoryStore.getState();

      const segment: StorySegment = {
        id: 'seg-1',
        text: 'Original text',
        timestamp: Date.now(),
      };

      store.addSegment(segment);

      // First revision
      store.reviseSegment('seg-1', 'Revised once');
      const revised1 = useHistoryStore.getState().segments[0];
      expect(revised1.originalText).toBe('Original text');

      // Second revision - should still preserve original
      store.reviseSegment('seg-1', 'Revised twice');
      const revised2 = useHistoryStore.getState().segments[0];
      expect(revised2.text).toBe('Revised twice');
      expect(revised2.originalText).toBe('Original text'); // Still the original
    });

    it('getRecent returns last N segments', () => {
      const store = useHistoryStore.getState();

      // Add 5 segments
      for (let i = 1; i <= 5; i++) {
        store.addSegment({
          id: `seg-${i}`,
          text: `Segment ${i}`,
          timestamp: Date.now(),
        });
      }

      // Get recent 3
      const recent = store.getRecent(3);
      expect(recent).toHaveLength(3);
      expect(recent[0].id).toBe('seg-3');
      expect(recent[1].id).toBe('seg-4');
      expect(recent[2].id).toBe('seg-5');
    });

    it('getRecent handles count larger than segments length', () => {
      const store = useHistoryStore.getState();

      store.addSegment({
        id: 'seg-1',
        text: 'Only segment',
        timestamp: Date.now(),
      });

      const recent = store.getRecent(10);
      expect(recent).toHaveLength(1);
      expect(recent[0].id).toBe('seg-1');
    });

    it('reset clears all segments', () => {
      const store = useHistoryStore.getState();

      // Add segments
      store.addSegment({
        id: 'seg-1',
        text: 'Segment 1',
        timestamp: Date.now(),
      });
      store.addSegment({
        id: 'seg-2',
        text: 'Segment 2',
        timestamp: Date.now(),
      });

      expect(useHistoryStore.getState().segments).toHaveLength(2);

      // Reset
      store.reset();

      expect(useHistoryStore.getState().segments).toEqual([]);
      expect(useHistoryStore.getState().segments).toHaveLength(0);
    });
  });
});

// ============================================================================
// PLAYER PROFILE STORE CONTRACT TESTS
// ============================================================================

describe('Contract Tests: PlayerProfileStore (Seam #2)', () => {
  beforeEach(() => {
    // Reset store before each test
    usePlayerProfileStore.getState().reset();
  });

  describe('Interface Implementation', () => {
    it('implements all required state properties', () => {
      const store = usePlayerProfileStore.getState();

      // Verify profile property exists
      expect(store).toHaveProperty('profile');
    });

    it('implements all required action methods', () => {
      const store = usePlayerProfileStore.getState();

      // Verify all action methods exist and are functions
      expect(typeof store.updateFearProfile).toBe('function');
      expect(typeof store.recordChoice).toBe('function');
      expect(typeof store.analyzePatterns).toBe('function');
      expect(typeof store.reset).toBe('function');
    });
  });

  describe('State Shape Compliance', () => {
    it('profile has all required properties', () => {
      const store = usePlayerProfileStore.getState();
      const { profile } = store;

      // Verify all PlayerProfile properties exist
      expect(profile).toHaveProperty('fearProfile');
      expect(profile).toHaveProperty('choicePatterns');
      expect(profile).toHaveProperty('engagementMetrics');
    });

    it('fearProfile has correct structure', () => {
      const store = usePlayerProfileStore.getState();
      const { fearProfile } = store.profile;

      // Check fear profile properties
      expect(typeof fearProfile.claustrophobia).toBe('number');
      expect(typeof fearProfile.isolation).toBe('number');
      expect(typeof fearProfile.bodyHorror).toBe('number');
      expect(typeof fearProfile.cosmicInsignificance).toBe('number');
      expect(typeof fearProfile.lossOfControl).toBe('number');
      expect(typeof fearProfile.madness).toBe('number');
    });

    it('choicePatterns has correct structure', () => {
      const store = usePlayerProfileStore.getState();
      const { choicePatterns } = store.profile;

      expect(typeof choicePatterns.riskTaking).toBe('number');
      expect(typeof choicePatterns.curiosity).toBe('number');
      expect(typeof choicePatterns.aggression).toBe('number');
      expect(typeof choicePatterns.avoidance).toBe('number');
    });

    it('engagementMetrics has correct structure', () => {
      const store = usePlayerProfileStore.getState();
      const { engagementMetrics } = store.profile;

      expect(typeof engagementMetrics.totalChoices).toBe('number');
      expect(typeof engagementMetrics.averageResponseTime).toBe('number');
      expect(typeof engagementMetrics.sessionDuration).toBe('number');
    });

    it('profile has valid initial values', () => {
      const store = usePlayerProfileStore.getState();
      const { profile } = store;

      // Fear profile should start at 0
      expect(profile.fearProfile.claustrophobia).toBe(0);
      expect(profile.fearProfile.isolation).toBe(0);

      // Choice patterns should start at 0.5 (neutral)
      expect(profile.choicePatterns.riskTaking).toBe(0.5);
      expect(profile.choicePatterns.curiosity).toBe(0.5);

      // Engagement metrics should start at 0
      expect(profile.engagementMetrics.totalChoices).toBe(0);
      expect(profile.engagementMetrics.averageResponseTime).toBe(0);
    });
  });

  describe('Action Behavior', () => {
    it('updateFearProfile updates specific fear intensity', () => {
      const store = usePlayerProfileStore.getState();

      store.updateFearProfile('claustrophobia', 0.7);
      expect(usePlayerProfileStore.getState().profile.fearProfile.claustrophobia).toBe(0.7);

      store.updateFearProfile('madness', 0.9);
      expect(usePlayerProfileStore.getState().profile.fearProfile.madness).toBe(0.9);

      // Previous update should be preserved
      expect(usePlayerProfileStore.getState().profile.fearProfile.claustrophobia).toBe(0.7);
    });

    it('updateFearProfile clamps values between 0 and 1', () => {
      const store = usePlayerProfileStore.getState();

      // Test upper bound
      store.updateFearProfile('claustrophobia', 1.5);
      expect(usePlayerProfileStore.getState().profile.fearProfile.claustrophobia).toBe(1);

      // Test lower bound
      store.updateFearProfile('isolation', -0.5);
      expect(usePlayerProfileStore.getState().profile.fearProfile.isolation).toBe(0);
    });

    it('recordChoice increments totalChoices', () => {
      const store = usePlayerProfileStore.getState();

      const choice: Choice = {
        id: 'choice-1',
        text: 'Test choice',
        isIntrusive: false,
      };

      store.recordChoice(choice, 3000);
      expect(usePlayerProfileStore.getState().profile.engagementMetrics.totalChoices).toBe(1);

      store.recordChoice(choice, 3000);
      expect(usePlayerProfileStore.getState().profile.engagementMetrics.totalChoices).toBe(2);
    });

    it('recordChoice calculates average response time correctly', () => {
      const store = usePlayerProfileStore.getState();

      const choice: Choice = {
        id: 'choice-1',
        text: 'Test choice',
        isIntrusive: false,
      };

      // First choice: 3000ms
      store.recordChoice(choice, 3000);
      expect(usePlayerProfileStore.getState().profile.engagementMetrics.averageResponseTime).toBe(
        3000
      );

      // Second choice: 5000ms, average should be 4000ms
      store.recordChoice(choice, 5000);
      expect(usePlayerProfileStore.getState().profile.engagementMetrics.averageResponseTime).toBe(
        4000
      );

      // Third choice: 6000ms, average should be (3000 + 5000 + 6000) / 3 = 4666.67
      store.recordChoice(choice, 6000);
      expect(
        usePlayerProfileStore.getState().profile.engagementMetrics.averageResponseTime
      ).toBeCloseTo(4666.67, 1);
    });

    it('recordChoice updates patterns based on intrusive choices', () => {
      const store = usePlayerProfileStore.getState();

      const intrusiveChoice: Choice = {
        id: 'intrusive-1',
        text: 'Do something risky',
        isIntrusive: true,
      };

      const initialCuriosity = store.profile.choicePatterns.curiosity;
      const initialRiskTaking = store.profile.choicePatterns.riskTaking;

      store.recordChoice(intrusiveChoice, 3000);

      const updatedProfile = usePlayerProfileStore.getState().profile;

      // Intrusive choices should increase curiosity and risk taking
      expect(updatedProfile.choicePatterns.curiosity).toBeGreaterThan(initialCuriosity);
      expect(updatedProfile.choicePatterns.riskTaking).toBeGreaterThan(initialRiskTaking);
    });

    it('analyzePatterns returns current choice patterns', () => {
      const store = usePlayerProfileStore.getState();

      // Modify patterns
      const choice: Choice = {
        id: 'choice-1',
        text: 'Investigate the sound',
        isIntrusive: false,
      };
      store.recordChoice(choice, 3000);

      const patterns = store.analyzePatterns();

      // Should return ChoicePatterns object
      expect(patterns).toHaveProperty('riskTaking');
      expect(patterns).toHaveProperty('curiosity');
      expect(patterns).toHaveProperty('aggression');
      expect(patterns).toHaveProperty('avoidance');

      // All should be numbers
      expect(typeof patterns.riskTaking).toBe('number');
      expect(typeof patterns.curiosity).toBe('number');
      expect(typeof patterns.aggression).toBe('number');
      expect(typeof patterns.avoidance).toBe('number');
    });

    it('reset returns state to initial values', () => {
      const store = usePlayerProfileStore.getState();

      // Change state
      store.updateFearProfile('claustrophobia', 0.8);
      store.recordChoice(
        { id: '1', text: 'Test', isIntrusive: false },
        3000
      );

      // Reset
      store.reset();

      // Verify back to initial state
      const resetProfile = usePlayerProfileStore.getState().profile;
      expect(resetProfile.fearProfile.claustrophobia).toBe(0);
      expect(resetProfile.engagementMetrics.totalChoices).toBe(0);
      expect(resetProfile.choicePatterns.riskTaking).toBe(0.5);
    });
  });
});

// ============================================================================
// MOCK VS REAL PARITY TESTS
// ============================================================================

describe('Mock vs Real Store Parity', () => {
  describe('GameStateStore Parity', () => {
    it('mock has same methods as real store', () => {
      const realStore = useGameStateStore.getState();
      const mockStore = createMockGameStateStore().getState();

      const realMethods = Object.keys(realStore)
        .filter((key) => typeof realStore[key as keyof typeof realStore] === 'function')
        .sort();

      const mockMethods = Object.keys(mockStore)
        .filter((key) => typeof mockStore[key as keyof typeof mockStore] === 'function')
        .sort();

      expect(mockMethods).toEqual(realMethods);
    });

    it('mock has same state properties as real store', () => {
      const realStore = useGameStateStore.getState();
      const mockStore = createMockGameStateStore().getState();

      const realStateKeys = ['gameState', 'choices', 'intrusiveThought', 'isGenerating'];
      const mockStateKeys = ['gameState', 'choices', 'intrusiveThought', 'isGenerating'];

      realStateKeys.forEach((key) => {
        expect(mockStore).toHaveProperty(key);
      });

      mockStateKeys.forEach((key) => {
        expect(realStore).toHaveProperty(key);
      });
    });
  });

  describe('WorldStateStore Parity', () => {
    it('mock has same methods as real store', () => {
      const realStore = useWorldStateStore.getState();
      const mockStore = createMockWorldStateStore().getState();

      const realMethods = Object.keys(realStore)
        .filter((key) => typeof realStore[key as keyof typeof realStore] === 'function')
        .sort();

      const mockMethods = Object.keys(mockStore)
        .filter((key) => typeof mockStore[key as keyof typeof mockStore] === 'function')
        .sort();

      expect(mockMethods).toEqual(realMethods);
    });

    it('mock worldState has same structure as real store', () => {
      const realWorldState = useWorldStateStore.getState().worldState;
      const mockWorldState = createMockWorldStateStore().getState().worldState;

      const requiredKeys = [
        'protagonist',
        'setting',
        'dilemma',
        'psychologicalStatus',
        'systemHealth',
        'horrorIntensity',
        'corruptionLevel',
        'genreConfig',
      ];

      requiredKeys.forEach((key) => {
        expect(mockWorldState).toHaveProperty(key);
        expect(realWorldState).toHaveProperty(key);
      });
    });
  });

  describe('HistoryStore Parity', () => {
    it('mock has same methods as real store', () => {
      const realStore = useHistoryStore.getState();
      const mockStore = createMockHistoryStore().getState();

      const realMethods = Object.keys(realStore)
        .filter((key) => typeof realStore[key as keyof typeof realStore] === 'function')
        .sort();

      const mockMethods = Object.keys(mockStore)
        .filter((key) => typeof mockStore[key as keyof typeof mockStore] === 'function')
        .sort();

      expect(mockMethods).toEqual(realMethods);
    });

    it('mock segments structure matches real store', () => {
      const realStore = useHistoryStore.getState();
      const mockStore = createMockHistoryStore().getState();

      expect(Array.isArray(realStore.segments)).toBe(true);
      expect(Array.isArray(mockStore.segments)).toBe(true);
    });
  });

  describe('PlayerProfileStore Parity', () => {
    it('mock has same methods as real store', () => {
      const realStore = usePlayerProfileStore.getState();
      const mockStore = createMockPlayerProfileStore().getState();

      const realMethods = Object.keys(realStore)
        .filter((key) => typeof realStore[key as keyof typeof realStore] === 'function')
        .sort();

      const mockMethods = Object.keys(mockStore)
        .filter((key) => typeof mockStore[key as keyof typeof mockStore] === 'function')
        .sort();

      expect(mockMethods).toEqual(realMethods);
    });

    it('mock profile has same structure as real store', () => {
      const realProfile = usePlayerProfileStore.getState().profile;
      const mockProfile = createMockPlayerProfileStore().getState().profile;

      expect(mockProfile).toHaveProperty('fearProfile');
      expect(mockProfile).toHaveProperty('choicePatterns');
      expect(mockProfile).toHaveProperty('engagementMetrics');

      expect(realProfile).toHaveProperty('fearProfile');
      expect(realProfile).toHaveProperty('choicePatterns');
      expect(realProfile).toHaveProperty('engagementMetrics');
    });
  });
});
