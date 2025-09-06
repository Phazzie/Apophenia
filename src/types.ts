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

export interface Command {
  type: string;
  payload?: any;
  meta?: {
    segmentId?: string;
    correlationId?: string;
    timestamp?: number;
  };
}

// Specific command types with proper payloads
export interface DisplayTextCommand extends Command {
  type: 'displayText';
  payload: {
    content: string;
  };
}

export interface WaitCommand extends Command {
  type: 'wait';
  payload: {
    duration: number;
  };
}

export interface GenerateImageCommand extends Command {
  type: 'generateImage';
  payload: {
    styleModifier: string;
  };
}

export interface PregenerateImageCommand extends Command {
  type: 'pregenerateImage';
  payload: {
    prompt: string;
  };
}

export interface UpdateWorldStateCommand extends Command {
  type: 'updateWorldState';
  payload: Partial<WorldState>;
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

export interface DisplayChoicesCommand extends Command {
  type: 'displayChoices';
  payload: {
    choices: Choice[];
    intrusiveThought?: Choice;
    predictedImagePrompt?: string;
  };
}

export interface GenerateAmbianceCommand extends Command {
  type: 'generateAmbiance';
  payload: {
    description: string;
  };
}
