/**
 * @file displayText.ts
 * @description Command executor for appending text to a story segment.
 */

import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { GameCommand } from '../types';
import { CommandExecutor } from './command.types';

/**
 * The command executor for the `displayText` command.
 * This executor is responsible for finding a specific story segment by its ID
 * and appending new text content to it. This is how the narrative is progressively built.
 */
export const displayTextExecutor: CommandExecutor = {
  command: 'displayText',
  /**
   * Executes the displayText command.
   * Finds the target story segment and appends the provided content to its text property.
   * If the segment is not found, it logs an error.
   *
   * @param {GameCommand} command - The command object, expected to be of type 'displayText'.
   * @returns {Promise<void>} A promise that resolves when the text has been appended.
   */
  execute: async (command: GameCommand) => {
    if (command.type !== 'displayText') {
      return;
    }

    const { storyHistory, updateSegmentById } = useStoryHistoryStore.getState();
    const segment = storyHistory.find((s: any) => s.id === command.payload.segmentId);

    if (segment) {
      updateSegmentById(command.payload.segmentId, {
        text: segment.text + command.payload.content,
      });
    } else {
      console.error(`displayText: Segment with id ${command.payload.segmentId} not found. Story history length: ${storyHistory.length}`);
      // As a fallback, this could create a new segment, but for now, we log an error
      // to enforce that a `createSegment` command must precede `displayText`.
    }
  },
};
