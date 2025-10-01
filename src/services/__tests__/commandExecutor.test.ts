import { executeCommandQueue } from '../commandExecutor';
import { commandExecutors } from '../../commands';
import { GameCommand } from '../../types';

// Mock the command executors
jest.mock('../../commands', () => ({
  commandExecutors: {
    blockingCommand: {
      execute: jest.fn().mockResolvedValue(undefined),
    },
    // Use a real non-blocking command type from the implementation
    generateImage: {
      execute: jest.fn(),
    },
    failingCommand: {
      execute: jest.fn().mockRejectedValue(new Error('Command failed')),
    },
  },
}));

const mockBlockingExecutor = commandExecutors.blockingCommand.execute as jest.Mock;
const mockNonBlockingExecutor = commandExecutors.generateImage.execute as jest.Mock;
const mockFailingExecutor = commandExecutors.failingCommand.execute as jest.Mock;

describe('executeCommandQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console output for cleaner test results
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.log as jest.Mock).mockRestore();
    (console.warn as jest.Mock).mockRestore();
    (console.error as jest.Mock).mockRestore();
  });

  it('should execute a single blocking command', async () => {
    const commands: GameCommand[] = [{ type: 'blockingCommand', payload: {} }];
    await executeCommandQueue(commands);
    expect(mockBlockingExecutor).toHaveBeenCalledWith(commands[0], {});
  });

  it('should execute a single non-blocking command', async () => {
    const commands: GameCommand[] = [{ type: 'generateImage', payload: {} }];
    await executeCommandQueue(commands);
    expect(mockNonBlockingExecutor).toHaveBeenCalledWith(commands[0], {});
  });

  it('should execute multiple commands in order', async () => {
    const commands: GameCommand[] = [
      { type: 'blockingCommand', payload: { data: 1 } },
      { type: 'generateImage', payload: { data: 2 } },
      { type: 'blockingCommand', payload: { data: 3 } },
    ];
    await executeCommandQueue(commands);
    expect(mockBlockingExecutor).toHaveBeenCalledTimes(2);
    expect(mockNonBlockingExecutor).toHaveBeenCalledTimes(1);
    expect(mockBlockingExecutor).toHaveBeenCalledWith(commands[0], expect.any(Object));
    expect(mockNonBlockingExecutor).toHaveBeenCalledWith(commands[1], expect.any(Object));
    expect(mockBlockingExecutor).toHaveBeenCalledWith(commands[2], expect.any(Object));
  });

  it('should handle unknown command types gracefully', async () => {
    const commands: GameCommand[] = [{ type: 'unknownCommand', payload: {} }];
    await executeCommandQueue(commands);
    expect(console.warn).toHaveBeenCalledWith('No executor found for command type: unknownCommand');
  });

  it('should continue execution even if a command fails', async () => {
    const commands: GameCommand[] = [
      { type: 'blockingCommand', payload: {} },
      { type: 'failingCommand', payload: {} },
      { type: 'generateImage', payload: {} },
    ];
    await executeCommandQueue(commands);
    expect(mockBlockingExecutor).toHaveBeenCalledTimes(1);
    expect(mockFailingExecutor).toHaveBeenCalledTimes(1);
    expect(mockNonBlockingExecutor).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error executing command failingCommand:', expect.any(Error));
  });
});