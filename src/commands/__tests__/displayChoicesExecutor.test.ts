import { displayChoicesExecutor } from '../displayChoices';
import { useGameStateStore } from '../../stores/gameStateStore';
import { executeCommandQueue } from '../../services/commandExecutor';
import { Command, Choice, GameState } from '../../types';

// Mock the stores and services
jest.mock('../../stores/gameStateStore', () => {
  const setChoices = jest.fn();
  const setGameState = jest.fn();
  const getState = () => ({ setChoices, setGameState });
  return { useGameStateStore: { getState } };
});

jest.mock('../../services/commandExecutor', () => ({
  executeCommandQueue: jest.fn(),
}));

describe('displayChoicesExecutor', () => {
  let setChoicesMock: jest.Mock;
  let setGameStateMock: jest.Mock;
  let executeCommandQueueMock: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    setChoicesMock = useGameStateStore.getState().setChoices as jest.Mock;
    setGameStateMock = useGameStateStore.getState().setGameState as jest.Mock;
    executeCommandQueueMock = executeCommandQueue as jest.Mock;
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
