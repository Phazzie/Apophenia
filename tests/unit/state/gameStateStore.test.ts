/**
 * Unit tests for Game State Store
 * Tests game state management, choices, and generation status
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createMockGameStateStore } from '../../mocks/mockStores';
import { mockChoice1, mockChoice2 } from '../../mocks/mockAIService';
import { GameState } from '../../../src/core/types/seams';
import { mockIntrusiveChoice } from '../../mocks/mockAIService';

describe('GameStateStore', () => {
  let store: ReturnType<typeof createMockGameStateStore>;

  beforeEach(() => {
    store = createMockGameStateStore();
    store.getState().reset();
  });

  describe('Initial State', () => {
    it('should initialize with MENU state', () => {
      const state = store.getState();
      expect(state.gameState).toBe(GameState.MENU);
    });

    it('should initialize with empty choices', () => {
      const state = store.getState();
      expect(state.choices).toEqual([]);
    });

    it('should initialize with isGenerating as false', () => {
      const state = store.getState();
      expect(state.isGenerating).toBe(false);
    });

    it('should initialize without intrusive thought', () => {
      const state = store.getState();
      expect(state.intrusiveThought).toBeUndefined();
    });
  });

  describe('setGameState', () => {
    it('should update game state', () => {
      store.getState().setGameState(GameState.DESCENDING);
      expect(store.getState().gameState).toBe(GameState.DESCENDING);
    });

    it('should handle all game state transitions', () => {
      const states = [
        GameState.MENU,
        GameState.GENERATING,
        GameState.DESCENDING,
        GameState.UNRAVELING,
        GameState.COLLAPSED,
      ];

      states.forEach((state) => {
        store.getState().setGameState(state);
        expect(store.getState().gameState).toBe(state);
      });
    });
  });

  describe('setChoices', () => {
    it('should set choices without intrusive thought', () => {
      const choices = [mockChoice1, mockChoice2];
      store.getState().setChoices(choices);

      const state = store.getState();
      expect(state.choices).toHaveLength(2);
      expect(state.intrusiveThought).toBeUndefined();
    });

    it('should set choices with intrusive thought', () => {
      const choices = [mockChoice1, mockChoice2];
      store.getState().setChoices(choices, mockIntrusiveChoice);

      const state = store.getState();
      expect(state.choices).toHaveLength(2); // Intrusive thought stored separately
      expect(state.intrusiveThought).toEqual(mockIntrusiveChoice);
    });

    it('should replace existing choices', () => {
      store.getState().setChoices([mockChoice1]);
      expect(store.getState().choices).toHaveLength(1);

      store.getState().setChoices([mockChoice2]);
      expect(store.getState().choices).toHaveLength(1);
      expect(store.getState().choices[0].id).toBe(mockChoice2.id);
    });
  });

  describe('setGenerating', () => {
    it('should set isGenerating to true', () => {
      store.getState().setGenerating(true);
      expect(store.getState().isGenerating).toBe(true);
    });

    it('should set isGenerating to false', () => {
      store.getState().setGenerating(true);
      store.getState().setGenerating(false);
      expect(store.getState().isGenerating).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      store.getState().setGameState(GameState.DESCENDING);
      store.getState().setChoices([mockChoice1, mockChoice2]);
      store.getState().setGenerating(true);

      store.getState().reset();

      const state = store.getState();
      expect(state.gameState).toBe(GameState.MENU);
      expect(state.choices).toEqual([]);
      expect(state.isGenerating).toBe(false);
      expect(state.intrusiveThought).toBeUndefined();
    });
  });
});
