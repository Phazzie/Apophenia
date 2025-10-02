import { act } from 'react';
import { useGameStateStore } from '../gameStateStore';
import { GameState, Choice } from '../../types';

describe('useGameStateStore', () => {
  const initialState = useGameStateStore.getState();

  // Reset store to its initial state before each test
  beforeEach(() => {
    act(() => {
      useGameStateStore.setState(initialState);
    });
  });

  it('should have a default initial state', () => {
    const state = useGameStateStore.getState();
    expect(state.gameState).toBe(GameState.MENU);
    expect(state.choices).toEqual([]);
    expect(state.intrusiveThought).toBeUndefined();
    expect(state.isGenerating).toBe(false);
  });

  it('should correctly set the game state', () => {
    act(() => {
      useGameStateStore.getState().setGameState(GameState.PLAYING);
    });
    expect(useGameStateStore.getState().gameState).toBe(GameState.PLAYING);
  });

  it('should set choices without an intrusive thought', () => {
    const regularChoices: Choice[] = [
      { text: 'Look left', isIntrusive: false },
      { text: 'Look right', isIntrusive: false },
    ];
    act(() => {
      useGameStateStore.getState().setChoices(regularChoices);
    });
    const state = useGameStateStore.getState();
    expect(state.choices).toEqual(regularChoices);
    expect(state.intrusiveThought).toBeUndefined();
  });

  it('should set choices and a separate intrusive thought', () => {
    const regularChoices: Choice[] = [
      { text: 'Open the door', isIntrusive: false },
    ];
    const intrusiveChoice: Choice = {
      text: 'Whisper the ancient words',
      isIntrusive: true,
    };
    act(() => {
      useGameStateStore.getState().setChoices(regularChoices, intrusiveChoice);
    });

    const state = useGameStateStore.getState();
    // The main `choices` array should contain ALL choices
    expect(state.choices).toHaveLength(2);
    expect(state.choices).toContain(intrusiveChoice);
    // The `intrusiveThought` property should be set for special UI handling
    expect(state.intrusiveThought).toEqual(intrusiveChoice);
  });

  it('should correctly set the isGenerating flag', () => {
    act(() => {
      useGameStateStore.getState().setIsGenerating(true);
    });
    expect(useGameStateStore.getState().isGenerating).toBe(true);

    act(() => {
      useGameStateStore.getState().setIsGenerating(false);
    });
    expect(useGameStateStore.getState().isGenerating).toBe(false);
  });

  it('should reset the store to its initial state', () => {
    // First, modify the state
    act(() => {
      useGameStateStore.getState().setGameState(GameState.GAME_OVER);
      useGameStateStore.getState().setIsGenerating(true);
      useGameStateStore.getState().setChoices([{ text: 'A choice', isIntrusive: false }]);
    });

    // Now, reset it
    act(() => {
      useGameStateStore.getState().reset();
    });

    // Check if it matches the initial state
    const state = useGameStateStore.getState();
    expect(state.gameState).toBe(GameState.MENU);
    expect(state.choices).toEqual([]);
    expect(state.intrusiveThought).toBeUndefined();
    expect(state.isGenerating).toBe(false);
  });
});
