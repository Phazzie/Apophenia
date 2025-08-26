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
}

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
