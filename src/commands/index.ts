import { CommandExecutor } from './command.types';
import { displayTextExecutor } from './displayText';
import { generateImageExecutor } from './generateImage';
import { pregenerateImageExecutor } from './pregenerateImage';
import { updateWorldStateExecutor } from './updateWorldState';
import { waitExecutor } from './wait';
import { displayChoicesExecutor } from './displayChoices';
import { generateAmbianceExecutor } from './generateAmbiance';

export const commandExecutors: Record<string, CommandExecutor> = {
  [displayTextExecutor.command]: displayTextExecutor,
  [generateImageExecutor.command]: generateImageExecutor,
  [pregenerateImageExecutor.command]: pregenerateImageExecutor,
  [updateWorldStateExecutor.command]: updateWorldStateExecutor,
  [waitExecutor.command]: waitExecutor,
  [displayChoicesExecutor.command]: displayChoicesExecutor,
  [generateAmbianceExecutor.command]: generateAmbianceExecutor,
};
