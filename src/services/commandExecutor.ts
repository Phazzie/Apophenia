import { GameCommand } from '../types';
import { commandExecutors } from '../commands';
import { ExecutionContext } from '../commands/command.types';

const NON_BLOCKING_COMMANDS = [
  'generateImage',
  'pregenerateImage',
  'generateAmbiance',
];

export const executeCommandQueue = async (commands: GameCommand[]) => {
  const context: ExecutionContext = {};

  for (const command of commands) {
    const executor = commandExecutors[command.type];
    if (executor) {
      if (NON_BLOCKING_COMMANDS.includes(command.type)) {
        executor.execute(command, context);
      } else {
        await executor.execute(command, context);
      }
    } else {
      console.warn(`No executor found for command type: ${command.type}`);
    }
  }
};
