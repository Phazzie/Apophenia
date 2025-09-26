import { CommandExecutor } from './command.types';
import { createSegmentExecutor } from './createSegment';
import { displayChoicesExecutor } from './displayChoices';
import { displayTextExecutor } from './displayText';
import { generateAmbianceExecutor } from './generateAmbiance';
import { generateImageExecutor } from './generateImage';
import { pregenerateImageExecutor } from './pregenerateImage';
import { updateWorldStateExecutor } from './updateWorldState';
import { waitExecutor } from './wait';

export const commandExecutors: Record<string, CommandExecutor> = {
  [displayTextExecutor.command]: displayTextExecutor,
  [generateImageExecutor.command]: generateImageExecutor,
  [pregenerateImageExecutor.command]: pregenerateImageExecutor,
  [updateWorldStateExecutor.command]: updateWorldStateExecutor,
  [waitExecutor.command]: waitExecutor,
  [displayChoicesExecutor.command]: displayChoicesExecutor,
  [generateAmbianceExecutor.command]: generateAmbianceExecutor,
  [createSegmentExecutor.command]: createSegmentExecutor,
};
