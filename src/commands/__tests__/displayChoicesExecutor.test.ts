import { displayChoicesExecutor } from '../displayChoices';
import type { CommandExecutor } from '../command.types';

// Mock the game state store and command executor service.
jest.mock('../../stores/gameStateStore', () => {
  const setChoices = jest.fn();
  const getState = () => ({ setChoices });
  const useGameStateStore = { getState };
  return { useGameStateStore };
});

jest.mock('../../services/commandExecutor', () => ({
  executeCommandQueue: jest.fn(),
}));

import { useGameStateStore } from '../../stores/gameStateStore';
import { executeCommandQueue } from '../../services/commandExecutor';

describe('displayChoicesExecutor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should declare the correct command name', () => {
    expect(displayChoicesExecutor.command).toBe('displayChoices');
  });

  it('should set choices and intrusiveThought in the game state store (happy path without predicted image)', async () => {
    const choices = [
      { id: '1', label: 'Option 1' },
      { id: '2', label: 'Option 2' },
    ];
    const intrusiveThought = 'An intrusive thought appears';

    await displayChoicesExecutor.execute({
      type: 'displayChoices',
      payload: {
        choices,
        intrusiveThought,
      },
    } as any);

    const setChoices = useGameStateStore.getState().setChoices as jest.Mock;
    expect(setChoices).toHaveBeenCalledTimes(1);
    expect(setChoices).toHaveBeenCalledWith(choices, intrusiveThought);
    // Should not enqueue pregenerateImage when no predictedImagePrompt present
    expect(executeCommandQueue).not.toHaveBeenCalled();
  });

  it('should non-blockingly enqueue pregenerateImage when predictedImagePrompt is provided', async () => {
    const choices = [{ id: '1', label: 'Only option' }];
    const predictedImagePrompt = 'A serene lake at dawn';

    await displayChoicesExecutor.execute({
      type: 'displayChoices',
      payload: {
        choices,
        intrusiveThought: undefined,
        predictedImagePrompt,
      },
    } as any);

    const setChoices = useGameStateStore.getState().setChoices as jest.Mock;
    expect(setChoices).toHaveBeenCalledTimes(1);
    expect(setChoices).toHaveBeenCalledWith(choices, undefined);

    // Verify executeCommandQueue called with the pregenerateImage command
    expect(executeCommandQueue).toHaveBeenCalledTimes(1);
    expect(executeCommandQueue).toHaveBeenCalledWith([
      {
        type: 'pregenerateImage',
        payload: { prompt: predictedImagePrompt },
      },
    ]);
  });

  it('should handle empty choices array gracefully', async () => {
    const choices: any[] = [];
    await expect(
      displayChoicesExecutor.execute({
        type: 'displayChoices',
        payload: {
          choices,
          intrusiveThought: null,
        },
      } as any),
    ).resolves.toBeUndefined();

    const setChoices = useGameStateStore.getState().setChoices as jest.Mock;
    expect(setChoices).toHaveBeenCalledWith(choices, null);
    expect(executeCommandQueue).not.toHaveBeenCalled();
  });

  it('should accept absence of intrusiveThought', async () => {
    const choices = [{ id: 'x', label: 'X' }];
    await displayChoicesExecutor.execute({
      type: 'displayChoices',
      payload: {
        choices,
        // intrusiveThought intentionally omitted
      },
    } as any);

    const setChoices = useGameStateStore.getState().setChoices as jest.Mock;
    expect(setChoices).toHaveBeenCalledWith(choices, undefined);
  });

  it('should be robust if payload is missing optional fields', async () => {
    // Some callers might accidentally send minimal payload; validate no throw
    await expect(
      displayChoicesExecutor.execute({
        type: 'displayChoices',
        payload: {
          // @ts-expect-error testing runtime robustness
          choices: undefined,
        },
      } as any),
    ).resolves.toBeUndefined();

    const setChoices = useGameStateStore.getState().setChoices as jest.Mock;
    // Even if undefined, verify the call occurs with the provided values
    expect(setChoices).toHaveBeenCalledWith(undefined, undefined);
  });

  it('should not throw if predictedImagePrompt is empty string', async () => {
    const choices = [{ id: '1', label: 'A' }];
    await expect(
      displayChoicesExecutor.execute({
        type: 'displayChoices',
        payload: {
          choices,
          predictedImagePrompt: '',
        },
      } as any),
    ).resolves.toBeUndefined();

    const setChoices = useGameStateStore.getState().setChoices as jest.Mock;
    expect(setChoices).toHaveBeenCalledWith(choices, undefined);

    // Should still "consider" the falsy prompt; in current implementation,
    // condition checks truthiness, so it should NOT call executeCommandQueue.
    expect(executeCommandQueue).not.toHaveBeenCalled();
  });

  it('should enqueue with exact prompt payload when provided', async () => {
    const choices = [{ id: 'a', label: 'A' }];
    const prompt = 'mountain landscape';

    await displayChoicesExecutor.execute({
      type: 'displayChoices',
      payload: {
        choices,
        intrusiveThought: 'ignore me',
        predictedImagePrompt: prompt,
      },
    } as any);

    expect(executeCommandQueue).toHaveBeenCalledWith([
      { type: 'pregenerateImage', payload: { prompt } },
    ]);
  });
});