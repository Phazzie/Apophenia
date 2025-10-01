import { useGameStateStore } from '../gameStateStore';
import { GameState } from '../../types';
import { act } from 'react';

describe('useGameStateStore', () => {
  beforeEach(() => {
    act(() => {
      useGameStateStore.getState().reset();
    });
  });

  it('should have the correct initial state', () => {
    const { gameState, choices, intrusiveThought, isGenerating } =
      useGameStateStore.getState();
    expect(gameState).toBe(GameState.MENU);
    expect(choices).toEqual([]);
    expect(intrusiveThought).toBeUndefined();
    expect(isGenerating).toBe(false);
  });

  it('should set the game state correctly', () => {
    act(() => {
      useGameStateStore.getState().setGameState(GameState.PLAYING);
    });
    expect(useGameStateStore.getState().gameState).toBe(GameState.PLAYING);
  });

  it('should set choices without an intrusive thought', () => {
    const newChoices = [{ text: 'Choice 1' }, { text: 'Choice 2' }];
    act(() => {
      useGameStateStore.getState().setChoices(newChoices);
    });
    const { choices, intrusiveThought } = useGameStateStore.getState();
    expect(choices).toEqual(newChoices);
    expect(intrusiveThought).toBeUndefined();
  });

  it('should set choices with an intrusive thought', () => {
    const newChoices = [{ text: 'Choice 1' }];
    const intrusive = { text: 'Intrusive thought' };
    act(() => {
      useGameStateStore.getState().setChoices(newChoices, intrusive);
    });
    const { choices, intrusiveThought } = useGameStateStore.getState();
    expect(choices).toEqual([...newChoices, intrusive]);
    expect(intrusiveThought).toEqual(intrusive);
  });

  it('should set the isGenerating flag', () => {
    act(() => {
      useGameStateStore.getState().setIsGenerating(true);
    });
    expect(useGameStateStore.getState().isGenerating).toBe(true);

    act(() => {
      useGameStateStore.getState().setIsGenerating(false);
    });
    expect(useGameStateStore.getState().isGenerating).toBe(false);
  });

  it('should reset to the initial state', () => {
    act(() => {
      useGameStateStore.getState().setGameState(GameState.PLAYING);
      useGameStateStore.getState().setChoices([{ text: 'A choice' }]);
      useGameStateStore.getState().setIsGenerating(true);
    });

    act(() => {
      useGameStateStore.getState().reset();
    });

    const { gameState, choices, intrusiveThought, isGenerating } =
      useGameStateStore.getState();
    expect(gameState).toBe(GameState.MENU);
    expect(choices).toEqual([]);
    expect(intrusiveThought).toBeUndefined();
    expect(isGenerating).toBe(false);
  });
});