/**
 * @file index.ts
 * @description Central registry for all command executors in the application.
 * This file aggregates individual command executor modules and exports them as a single
 * map, allowing the command execution service to easily look up and run the
 * appropriate executor for a given command type.
 */

import { CommandExecutor } from './command.types';
import { createSegmentExecutor } from './createSegment';
import { displayChoicesExecutor } from './displayChoices';
import { displayTextExecutor } from './displayText';
import { generateAmbianceExecutor } from './generateAmbiance';
import { generateImageExecutor } from './generateImage';
import { pregenerateImageExecutor } from './pregenerateImage';
import { updateWorldStateExecutor } from './updateWorldState';
import { waitExecutor } from './wait';
import { browserEffectExecutor } from './browserEffectExecutor';

/**
 * A record mapping command names (e.g., 'displayText') to their corresponding
 * command executor objects. This serves as the central lookup table for the
 * command processing system.
 * @type {Record<string, CommandExecutor>}
 */
export const commandExecutors: Record<string, CommandExecutor> = {
  [displayTextExecutor.command]: displayTextExecutor,
  [generateImageExecutor.command]: generateImageExecutor,
  [pregenerateImageExecutor.command]: pregenerateImageExecutor,
  [updateWorldStateExecutor.command]: updateWorldStateExecutor,
  [waitExecutor.command]: waitExecutor,
  [displayChoicesExecutor.command]: displayChoicesExecutor,
  [generateAmbianceExecutor.command]: generateAmbianceExecutor,
  [createSegmentExecutor.command]: createSegmentExecutor,
  [browserEffectExecutor.command]: browserEffectExecutor,
};
