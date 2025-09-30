import { GameCommand } from '../types';

// This can be expanded with any context the commands might need
// For example, access to other stores or services
export type ExecutionContext = object;

export interface CommandExecutor {
  command: string;
  execute: (command: GameCommand, context?: ExecutionContext) => Promise<void>;
}
