import { describe, it, expect, beforeEach, vi } from 'vitest';
import { displayChoicesExecutor } from '@/src/commands/displayChoices';
import { useGameStateStore } from '@/lib/stores/gameStateStore';
import { executeCommandQueue } from '@/src/services/commandExecutor';
import { Command, Choice, GameState } from '@/lib/types';

// Mock the stores and services
vi.mock('@/lib/stores/gameStateStore', () => {
  const setChoices = vi.fn();
  const setGameState = vi.fn();
  const getState = () => ({ setChoices, setGameState });
  return { useGameStateStore: { getState } };
});

vi.mock('@/src/services/commandExecutor', () => ({
  executeCommandQueue: vi.fn(),
}));

describe('displayChoicesExecutor', () => {
  let setChoicesMock: ReturnType<typeof vi.fn>;
  let setGameStateMock: ReturnType<typeof vi.fn>;
  let executeCommandQueueMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks before each test
    setChoicesMock = useGameStateStore.getState().setChoices as ReturnType<typeof vi.fn>;
    setGameStateMock = useGameStateStore.getState().setGameState as ReturnType<typeof vi.fn>;
    executeCommandQueueMock = executeCommandQueue as ReturnType<typeof vi.fn>;
    setChoicesMock.mockClear();
    setGameStateMock.mockClear();
    executeCommandQueueMock.mockClear();
  });

  it('should declare the correct command name', () => {
    expect(displayChoicesExecutor.command).toBe('displayChoices');
  });

  it('should set choices and game state correctly', async () => {
    const choices: Choice[] = [
      { text: 'Option 1', isIntrusive: false },
      { text: 'Option 2', isIntrusive: true },
    ];
    const intrusiveThought: Choice = { text: 'An intrusive thought', isIntrusive: true };

    const command: Command = {
      type: 'displayChoices',
      payload: { choices, intrusiveThought },
    };

    await displayChoicesExecutor.execute(command, {});

    expect(setChoicesMock).toHaveBeenCalledTimes(1);
    expect(setChoicesMock).toHaveBeenCalledWith(choices, intrusiveThought);
    expect(setGameStateMock).toHaveBeenCalledTimes(1);
    expect(setGameStateMock).toHaveBeenCalledWith(GameState.PLAYING);
    expect(executeCommandQueueMock).not.toHaveBeenCalled();
  });

  it('should enqueue pregenerateImage when predictedImagePrompt is provided', async () => {
    const choices: Choice[] = [{ text: 'Only option', isIntrusive: false }];
    const predictedImagePrompt = 'A serene lake at dawn';

    const command: Command = {
      type: 'displayChoices',
      payload: { choices, predictedImagePrompt },
    };

    await displayChoicesExecutor.execute(command, {});

    expect(setChoicesMock).toHaveBeenCalledWith(choices, undefined);
    expect(setGameStateMock).toHaveBeenCalledWith(GameState.PLAYING);

    expect(executeCommandQueueMock).toHaveBeenCalledTimes(1);
    const expectedPregenerateCommand: Command = {
      type: 'pregenerateImage',
      payload: { prompt: predictedImagePrompt },
    };
    expect(executeCommandQueueMock).toHaveBeenCalledWith([expectedPregenerateCommand]);
  });

  it('should handle an empty choices array gracefully', async () => {
    const command: Command = {
      type: 'displayChoices',
      payload: { choices: [] },
    };

    await displayChoicesExecutor.execute(command, {});

    expect(setChoicesMock).toHaveBeenCalledWith([], undefined);
    expect(setGameStateMock).toHaveBeenCalledWith(GameState.PLAYING);
    expect(executeCommandQueueMock).not.toHaveBeenCalled();
  });

  it('should handle absence of intrusiveThought', async () => {
    const choices: Choice[] = [{ text: 'X', isIntrusive: false }];
    const command: Command = {
      type: 'displayChoices',
      payload: { choices },
    };

    await displayChoicesExecutor.execute(command, {});

    expect(setChoicesMock).toHaveBeenCalledWith(choices, undefined);
  });
});
