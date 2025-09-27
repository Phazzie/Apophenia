/**
 * @file createSegment.ts
 * @description Command executor for creating a new, empty story segment in the narrative history.
 */

import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { GameCommand } from '../types';
import { CommandExecutor } from './command.types';

/**
 * The command executor for the `createSegment` command.
 * This executor is responsible for adding a new, empty story segment to the
 * `storyHistoryStore`. This new segment acts as a container that subsequent
 * commands (like `displayText` or `generateImage`) will populate with content.
 */
export const createSegmentExecutor: CommandExecutor = {
  command: 'createSegment',
  /**
   * Executes the createSegment command by adding a new segment to the story history.
   * @param {GameCommand} command - The command object, expected to be of type 'createSegment'.
   * @returns {Promise<void>} A promise that resolves when the segment has been created.
   */
  execute: async (command: GameCommand) => {
    if (command.type !== 'createSegment') {
      return;
    }

    const { addStorySegment } = useStoryHistoryStore.getState();
    addStorySegment({
      id: command.payload.id,
      text: '', // Text will be added by a subsequent 'displayText' command
      images: {}, // Images will be added by subsequent 'generateImage' commands
    });
  },
};