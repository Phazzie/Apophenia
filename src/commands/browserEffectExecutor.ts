import { changePageTitle, openNewTab, manipulateHistory } from '../services/browserManipulator';
import { Command, GameCommand } from '../types';
import { CommandExecutor } from './command.types';

export const executeBrowserEffect = async (command: GameCommand): Promise<void> => {
  if (command.type !== 'browserEffect') {
    return;
  }

  const { effect, value } = command.payload;

  switch (effect) {
    case 'changeTitle':
      if (value) {
        changePageTitle(value);
      }
      break;
    case 'openTab':
      if (value) {
        openNewTab(value);
      }
      break;
    case 'manipulateHistory':
      manipulateHistory();
      break;
    default:
      console.warn(`Unknown browser effect: ${effect}`);
  }
};

export const browserEffectExecutor: CommandExecutor = {
  command: 'browserEffect',
  execute: executeBrowserEffect,
};