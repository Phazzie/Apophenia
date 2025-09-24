import { commandExecutors } from '../commands';
import { ExecutionContext } from '../commands/command.types';
import { GameCommand } from '../types';

const NON_BLOCKING_COMMANDS = [
  'generateImage',
  'generateMultipleImages',
  'pregenerateImage',
  'generateAmbiance',
];

export const executeCommandQueue = async (commands: GameCommand[]) => {
  const context: ExecutionContext = {};
  console.log('Executing command queue with', commands.length, 'commands');

  for (const command of commands) {
    console.log('Executing command:', command.type, command.payload);
    const executor = commandExecutors[command.type];
    if (executor) {
      try {
        if (NON_BLOCKING_COMMANDS.includes(command.type)) {
          console.log('Running non-blocking command:', command.type);
          executor.execute(command, context);
        } else {
          console.log('Running blocking command:', command.type);
          await executor.execute(command, context);
        }
        console.log('Command executed successfully:', command.type);
      } catch (error) {
        console.error(`Error executing command ${command.type}:`, error);
        console.error('Command payload:', command.payload);
        console.error('Execution context:', context);
        // Continue with other commands rather than failing the entire queue
      }
    } else {
      console.warn(`No executor found for command type: ${command.type}`);
      console.warn('Available executors:', Object.keys(commandExecutors));
    }
  }
  
  console.log('Command queue execution completed');
};
