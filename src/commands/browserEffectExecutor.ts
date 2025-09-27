/**
 * @file browserEffectExecutor.ts
 * @description Command executor for handling browser-level effects, such as changing the page title or opening new tabs.
 * This is part of the Reality Corruption Engine.
 */

import { changePageTitle, openNewTab, manipulateHistory } from '../services/browserManipulator';
import { GameCommand } from '../types';
import { CommandExecutor } from './command.types';

/**
 * Executes a browser effect command.
 * This function takes a `browserEffect` command and calls the appropriate service
 * to manipulate the browser environment, contributing to the game's immersive,
 * meta-narrative experience.
 *
 * @param {GameCommand} command - The command to execute. Must be of type 'browserEffect'.
 * @returns {Promise<void>} A promise that resolves when the effect has been triggered.
 */
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