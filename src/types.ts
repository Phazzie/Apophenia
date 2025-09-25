import { z } from 'zod';

// Enums
export enum GameState {
  MENU,
  GENERATING_CONCEPT,
  LOADING,
  PLAYING,
  ENDED,
}

// Zod Schemas as the Single Source of Truth

// Core Game Types
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

export const worldStateSchema = z.object({
  protagonist: z.string(),
  setting: z.string(),
  dilemma: z.string(),
  summary: z.string(),
  psychologicalStatus: z.enum(['Stable', 'Uneasy', 'Paranoid', 'Fragmented']),
  systemHealth: z.number(),
  uiDistortion: z.object({
    transform: z.string(),
    filter: z.string(),
    transition: z.string(),
  }),
  genreConfig: genreConfigSchema,
});

export const storySegmentSchema = z.object({
  id: z.string(),
  text: z.string(),
  images: z.object({
    main: z.string().optional(),
    inset: z.array(z.string()).optional(),
    mainStatus: z.enum(['loading', 'loaded']).optional(),
  }),
  // Revolutionary features
  isRevised: z.boolean().optional(),
  originalText: z.string().optional(),
  isQuantumShift: z.boolean().optional(),
  isMetaEvent: z.boolean().optional(),
  corruptionLevel: z.number().optional(),
});

export const choiceSchema = z.object({
  text: z.string(),
  isIntrusive: z.boolean(),
  // Optional segment identifier for command routing (e.g., retry-last-action)
  segmentId: z.string().optional(),
});

// Command Payloads Schemas
// Implementing Phase 2 & 3 changes now for a unified type system from the start.
export const createSegmentPayloadSchema = z.object({ id: z.string() });
export const displayTextPayloadSchema = z.object({ content: z.string(), segmentId: z.string() });
export const waitPayloadSchema = z.object({ duration: z.number() });
export const generateAmbiancePayloadSchema = z.object({ description: z.string() });
export const generateImagePayloadSchema = z.object({ prompt: z.string(), segmentId: z.string() });
export const updateWorldStatePayloadSchema = z.object({
  protagonist: z.string().optional(),
  setting: z.string().optional(),
  dilemma: z.string().optional(),
  summary: z.string().optional(),
  psychologicalStatus: z.enum(['Stable', 'Uneasy', 'Paranoid', 'Fragmented']).optional(),
  systemHealth: z.number().optional(),
});
export const displayChoicesPayloadSchema = z.object({
  choices: z.array(choiceSchema),
  intrusiveThought: choiceSchema.optional(),
  predictedImagePrompt: z.string().optional(),
});
export const pregenerateImagePayloadSchema = z.object({ prompt: z.string() });

// Discriminated Union for Commands
export const browserEffectPayloadSchema = z.object({
    effect: z.enum(['changeTitle', 'openTab', 'manipulateHistory']),
    value: z.string().optional(),
});

export const commandSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('createSegment'), payload: createSegmentPayloadSchema }),
  z.object({ type: z.literal('displayText'), payload: displayTextPayloadSchema }),
  z.object({ type: z.literal('wait'), payload: waitPayloadSchema }),
  z.object({ type: z.literal('generateAmbiance'), payload: generateAmbiancePayloadSchema }),
  z.object({ type: z.literal('generateImage'), payload: generateImagePayloadSchema }),
  z.object({ type: z.literal('updateWorldState'), payload: updateWorldStatePayloadSchema }),
  z.object({ type: z.literal('displayChoices'), payload: displayChoicesPayloadSchema }),
  z.object({
    type: z.literal('pregenerateImage'),
    payload: pregenerateImagePayloadSchema,
  }),
  z.object({ type: z.literal('browserEffect'), payload: browserEffectPayloadSchema }),
]);

export const commandArraySchema = z.array(commandSchema);

// AI Model Selector Types
export const aiModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.string(),
  contextWindow: z.number(),
  supportsThinking: z.boolean(),
  supportsImages: z.boolean(),
  isDefault: z.boolean(),
});

export const modelTestResultSchema = z.object({
  success: z.boolean(),
  model: z.string(),
  contextWindow: z.number(),
  testType: z.string().optional(),
  responseTime: z.number().optional(),
  error: z.string().optional(),
});

// Inferred TypeScript Types from Zod Schemas
export type WorldState = z.infer<typeof worldStateSchema>;
export type StorySegment = z.infer<typeof storySegmentSchema>;
export type GenreConfig = z.infer<typeof genreConfigSchema>;
export type Choice = z.infer<typeof choiceSchema>;
export type Command = z.infer<typeof commandSchema>;
export type GameCommand = Command; // Alias for backward compatibility
export type AIModel = z.infer<typeof aiModelSchema>;
export type ModelTestResult = z.infer<typeof modelTestResultSchema>;
