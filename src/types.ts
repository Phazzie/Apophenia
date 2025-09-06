export enum GameState {
  MENU,
  GENERATING_CONCEPT,
  LOADING,
  PLAYING,
  ENDED,
}

export interface WorldState {
  protagonist: string;
  setting: string;
  dilemma:string;
  summary: string;
  psychologicalStatus: 'Stable' | 'Uneasy' | 'Paranoid' | 'Fragmented';
  systemHealth: number;
  uiDistortion: {
    transform: string;
    filter: string;
    transition: string;
  };
}

export interface CommandMeta {
  segmentId?: string;
  correlationId?: string;
  timestamp?: number;
}

export interface CommandBase {
  type: string;
  meta?: CommandMeta;
}

export interface Command extends CommandBase {
  payload?: any; // Keep for backward compatibility, but prefer specific types
}

// Specific command types with proper payloads
export interface DisplayTextCommand extends CommandBase {
  type: 'displayText';
  payload: {
    content: string;
  };
  meta?: CommandMeta;
}

export interface WaitCommand extends CommandBase {
  type: 'wait';
  payload: {
    duration: number;
  };
  meta?: CommandMeta;
}

export interface GenerateImageCommand extends CommandBase {
  type: 'generateImage';
  payload: {
    styleModifier: string;
  };
  meta?: CommandMeta;
}

export interface PregenerateImageCommand extends CommandBase {
  type: 'pregenerateImage';
  payload: {
    prompt: string;
  };
  meta?: CommandMeta;
}

export interface UpdateWorldStateCommand extends CommandBase {
  type: 'updateWorldState';
  payload: Partial<WorldState>;
  meta?: CommandMeta;
}

export interface DisplayChoicesCommand extends CommandBase {
  type: 'displayChoices';
  payload: {
    choices: Choice[];
    intrusiveThought?: Choice;
    predictedImagePrompt?: string;
  };
  meta?: CommandMeta;
}

export interface GenerateAmbianceCommand extends CommandBase {
  type: 'generateAmbiance';
  payload: {
    description: string;
  };
  meta?: CommandMeta;
}

// Union type for all commands
export type GameCommand = 
  | DisplayTextCommand
  | DisplayChoicesCommand
  | GenerateAmbianceCommand
  | WaitCommand
  | GenerateImageCommand
  | PregenerateImageCommand
  | UpdateWorldStateCommand;

export interface GenreConfig {
  id: string;
  name: string;
  description: string;
  style: string;
  theme: {
    '--background-color': string;
    '--text-color': string;
    '--accent-color': string;
    '--font-family': string;
  };
  startScreenImagePrompt: string;
  conceptPrompt: string;
  aiSystemInstruction: string;
}

export interface StorySegment {
  id: string;
  text: string;
  images: {
    main?: string;
    inset?: string[];
    mainStatus?: 'loading' | 'loaded';
  };
}

export interface Choice {
  text: string;
  isIntrusive: boolean;
}
