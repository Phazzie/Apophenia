/**
 * @file types.ts
 * @description This file is the single source of truth for all data structures in the application.
 * It uses the Zod library to define schemas, which provide both runtime validation and
 * compile-time TypeScript types from a single definition. This ensures that data structures
 * are consistent across the entire application.
 */

import { z } from 'zod';

/**
 * @enum GameState
 * @description Represents the high-level state of the application, determining which UI screen to display.
 */
export enum GameState {
  MENU,
  GENERATING_CONCEPT,
  LOADING,
  PLAYING,
  ENDED,
}

// --- Zod Schemas: The Single Source of Truth for Data Structures ---

/**
 * @description Defines the configuration for a narrative genre, including its theme, style, and initial prompts.
 */
export const genreConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  style: z.string(),
  theme: z.object({
    '--background-color': z.string(),
    '--text-color': z.string(),
    '--accent-color': z.string(),
    '--font-family': z.string(),
  }),
  startScreenImagePrompt: z.string(),
  conceptPrompt: z.string(),
  aiSystemInstruction: z.string(),
});

/**
 * @description Represents the entire state of the game's world and narrative context.
 * This object is passed to the AI on each turn to provide full context.
 */
export const worldStateSchema = z.object({
  protagonist: z.string(),
  setting: z.string(),
  dilemma: z.string(),
  summary: z.string().describe('A running summary of the story so far, used to manage AI context.'),
  psychologicalStatus: z.enum(['Stable', 'Uneasy', 'Paranoid', 'Fragmented']),
  systemHealth: z.number().describe('A measure of reality\'s stability, from 100 (stable) to 0 (corrupted).'),
  /** The horrorIntensity score (0-10) dynamically adjusts the game's difficulty and tone, calculated based on player choices and narrative events. */
  horrorIntensity: z.number().min(0).max(10).default(0),
  uiDistortion: z.object({
    transform: z.string(),
    filter: z.string(),
    transition: z.string(),
  }).describe('CSS properties for the Reality Corruption engine.'),
  genreConfig: genreConfigSchema,
});

/**
 * @description Represents a single segment or "beat" of the story, containing text and associated images.
 */
export const storySegmentSchema = z.object({
  id: z.string().describe('A unique identifier for the story segment.'),
  text: z.string(),
  images: z.object({
    main: z.string().optional(),
    inset: z.array(z.string()).optional(),
    mainStatus: z.enum(['loading', 'loaded']).optional(),
  }),
  // Flags for the revolutionary features
  isRevised: z.boolean().optional().describe('True if this segment was altered by the Temporal Revision Engine.'),
  originalText: z.string().optional().describe('The original text before a temporal revision.'),
  isQuantumShift: z.boolean().optional().describe('True if this segment represents a shift to an alternate timeline.'),
  isMetaEvent: z.boolean().optional().describe('True if this segment contains a meta-consciousness event.'),
  corruptionLevel: z.number().optional().describe('The level of reality corruption at the time of this segment.'),
});

/**
 * @description Represents a single choice presented to the player.
 */
export const choiceSchema = z.object({
  text: z.string(),
  isIntrusive: z.boolean().describe('True if this is a special "intrusive thought" choice.'),
  segmentId: z.string().optional().describe('An optional identifier for routing special commands (e.g., retry-last-action).'),
});

// --- Command System Schemas ---

/** @description Payload for the `createSegment` command. */
export const createSegmentPayloadSchema = z.object({ id: z.string() });
/** @description Payload for the `displayText` command. */
export const displayTextPayloadSchema = z.object({ content: z.string(), segmentId: z.string() });
/** @description Payload for the `wait` command. */
export const waitPayloadSchema = z.object({ duration: z.number() });
/** @description Payload for the `generateAmbiance` command. */
export const generateAmbiancePayloadSchema = z.object({ description: z.string() });
/** @description Payload for the `generateImage` command. */
export const generateImagePayloadSchema = z.object({ prompt: z.string(), segmentId: z.string() });
/** @description Payload for the `updateWorldState` command. */
export const updateWorldStatePayloadSchema = worldStateSchema.partial();
/** @description Payload for the `displayChoices` command. */
export const displayChoicesPayloadSchema = z.object({
  choices: z.array(choiceSchema),
  intrusiveThought: choiceSchema.optional(),
  predictedImagePrompt: z.string().optional().describe('A prompt for an image to pre-generate for the next turn.'),
});
/** @description Payload for the `pregenerateImage` command. */
export const pregenerateImagePayloadSchema = z.object({ prompt: z.string() });
/** @description Payload for the `browserEffect` command. */
export const browserEffectPayloadSchema = z.object({
    effect: z.enum(['changeTitle', 'openTab', 'manipulateHistory']),
    value: z.string().optional(),
});

/**
 * @description A discriminated union of all possible game commands.
 * This is the core of the command-driven architecture. The `type` field is used
 * to determine which executor should process the command.
 */
export const commandSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('createSegment'), payload: createSegmentPayloadSchema }),
  z.object({ type: z.literal('displayText'), payload: displayTextPayloadSchema }),
  z.object({ type: z.literal('wait'), payload: waitPayloadSchema }),
  z.object({ type: z.literal('generateAmbiance'), payload: generateAmbiancePayloadSchema }),
  z.object({ type: z.literal('generateImage'), payload: generateImagePayloadSchema }),
  z.object({ type: z.literal('updateWorldState'), payload: updateWorldStatePayloadSchema }),
  z.object({ type: z.literal('displayChoices'), payload: displayChoicesPayloadSchema }),
  z.object({ type: z.literal('pregenerateImage'), payload: pregenerateImagePayloadSchema }),
  z.object({ type: z.literal('browserEffect'), payload: browserEffectPayloadSchema }),
]);

/** @description A schema for an array of game commands. */
export const commandArraySchema = z.array(commandSchema);

// --- AI Model Selector Schemas ---

/** @description Defines the structure for an available AI model's metadata. */
export const aiModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.string(),
  contextWindow: z.number(),
  supportsThinking: z.boolean(),
  supportsImages: z.boolean(),
  isDefault: z.boolean(),
});

/** @description Defines the structure for the result of an AI model API test. */
export const modelTestResultSchema = z.object({
  success: z.boolean(),
  model: z.string(),
  contextWindow: z.number(),
  testType: z.string().optional(),
  responseTime: z.number().optional(),
  error: z.string().optional(),
});

// --- Inferred TypeScript Types ---
// By using `z.infer`, we create TypeScript types directly from our Zod schemas.
// This ensures that our static types and runtime validators are always perfectly in sync.

export type WorldState = z.infer<typeof worldStateSchema>;
export type StorySegment = z.infer<typeof storySegmentSchema>;
export type GenreConfig = z.infer<typeof genreConfigSchema>;
export type Choice = z.infer<typeof choiceSchema>;
export type Command = z.infer<typeof commandSchema>;
/** An alias for `Command` for potential backward compatibility. */
export type GameCommand = Command;
export type AIModel = z.infer<typeof aiModelSchema>;
export type ModelTestResult = z.infer<typeof modelTestResultSchema>;
