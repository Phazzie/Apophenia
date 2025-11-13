import { commandExecutors, ExecutionContext } from '../core/commands';
import { Command } from '../core/types/seams';

const NON_BLOCKING_COMMANDS = [
  'generateImage',
  'pregenerateImage',
  'generateAmbiance',
];

export const executeCommandQueue = async (commands: Command[]) => {
  console.log('Executing command queue with', commands.length, 'commands');

  for (const command of commands) {
    console.log('Executing command:', command.type, command.payload);
    const executor = commandExecutors[command.type];
    if (executor) {
      try {
        if (NON_BLOCKING_COMMANDS.includes(command.type)) {
          console.log('Running non-blocking command:', command.type);
          executor.execute(command);
        } else {
          console.log('Running blocking command:', command.type);
          await executor.execute(command);
        }
        console.log('Command executed successfully:', command.type);
      } catch (error) {
        console.error(`Error executing command ${command.type}:`, error);
        console.error('Command payload:', command.payload);
        // Continue with other commands rather than failing the entire queue
      }
    } else {
      console.warn(`No executor found for command type: ${command.type}`);
      console.warn('Available executors:', Object.keys(commandExecutors));
    }
  }

  console.log('Command queue execution completed');
};
