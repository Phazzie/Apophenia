import { z } from 'zod';
import type React from 'react';

// #TODO DEPRECATION: This file is DEPRECATED and conflicts with src/core/types/seams.ts
// Specifically, GameState enum here is numeric, while seams.ts is string-based.
// All code should eventually migrate to using src/core/types/seams.ts.
// See #TODO.md.

// Enums (aligned with seams.ts)
export enum GameState {
  MENU,
  GENERATING_CONCEPT,
  LOADING,
  PLAYING,
  ENDED,
}

export enum PsychologicalStatus {
  STABLE = 'stable',
  UNEASY = 'uneasy',
  PARANOID = 'paranoid',
  FRAGMENTED = 'fragmented',
  SHATTERED = 'shattered'
}

// Zod Schemas as the Single Source of Truth

// Core Game Types (aligned with seams.ts canonical definitions)
export const visualStyleSchema = z.object({
  primaryColor: z.string(),
  secondaryColor: z.string(),
  accentColor: z.string(),
  fontFamily: z.string(),
  atmosphere: z.enum(['dark', 'ethereal', 'oppressive', 'fragmented']),
});

export const genreConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  systemPrompt: z.string(),
  themes: z.array(z.string()),
  fearCategories: z.array(z.string()),
  visualStyle: visualStyleSchema,
});

export const worldStateSchema = z.object({
  protagonist: z.string(),
  setting: z.string(),
  dilemma: z.string(),
  summary: z.string().optional(),
  psychologicalStatus: z.nativeEnum(PsychologicalStatus),
  systemHealth: z.number(),
  // The horrorIntensity score (0-10) dynamically adjusts the game's difficulty and tone.
  // It is calculated based on player choices and narrative events.
  horrorIntensity: z.number().min(0).max(10).default(0),
  corruptionLevel: z.number().min(0).max(100).default(0),
  genreConfig: genreConfigSchema,
});

export const storySegmentSchema = z.object({
  id: z.string(),
  text: z.string(),
  timestamp: z.number(),
  images: z.object({
    main: z.string().optional(),
    inset: z.array(z.string()).optional(),
    mainStatus: z.enum(['loading', 'loaded', 'failed', 'retrying']).optional(),
  }).optional(),
  // Revolutionary features
  isRevised: z.boolean().optional(),
  originalText: z.string().optional(),
  isQuantumShift: z.boolean().optional(),
  isMetaEvent: z.boolean().optional(),
  corruptionLevel: z.number().optional(),
});

export const choiceSchema = z.object({
  id: z.string(),
  text: z.string(),
  isIntrusive: z.boolean(),
  // Optional segment identifier for command routing (e.g., retry-last-action)
  segmentId: z.string().optional(),
  consequence: z.string().optional(),
  psychologicalWeight: z.number().optional(),
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
  psychologicalStatus: z.nativeEnum(PsychologicalStatus).optional(),
  systemHealth: z.number().optional(),
});
export const displayChoicesPayloadSchema = z.object({
  choices: z.array(choiceSchema),
  intrusiveThought: choiceSchema.optional(),
  predictedImagePrompt: z.string().optional(),
});
export const pregenerateImagePayloadSchema = z.object({ prompt: z.string() });

export const aiDirectorAnalysisPayloadSchema = z.object({
  psychologicalProfile: z.string(),
  narrativeRecommendations: z.array(z.string()),
  horrorIntensityAnalysis: z.string(),
  playerEngagementLevel: z.string(),
});

// Discriminated Union for Commands (aligned with seams.ts)
export const browserEffectPayloadSchema = z.object({
    type: z.enum(['changeTitle', 'openTab', 'manipulateHistory', 'vibrate']),
    value: z.string().optional(),
});

export const applyCorruptionPayloadSchema = z.object({
  level: z.number(),
  effects: z.array(z.string()),
});

export const reviseHistoryPayloadSchema = z.object({
  segmentId: z.string(),
  newText: z.string(),
});

export const quantumShiftPayloadSchema = z.object({
  timeline: z.string(),
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
  z.object({ type: z.literal('applyCorruption'), payload: applyCorruptionPayloadSchema }),
  z.object({ type: z.literal('reviseHistory'), payload: reviseHistoryPayloadSchema }),
  z.object({ type: z.literal('quantumShift'), payload: quantumShiftPayloadSchema }),
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
export type VisualStyle = z.infer<typeof visualStyleSchema>;
export type GenreConfig = z.infer<typeof genreConfigSchema>;
export type Choice = z.infer<typeof choiceSchema>;
export type Command = z.infer<typeof commandSchema>;
export type GameCommand = Command; // Alias for backward compatibility
export type BrowserEffect = z.infer<typeof browserEffectPayloadSchema>;
export type AIModel = z.infer<typeof aiModelSchema>;
export type ModelTestResult = z.infer<typeof modelTestResultSchema>;
export type AIDirectorAnalysisPayload = z.infer<typeof aiDirectorAnalysisPayloadSchema>;

// Game Step Result Type for Revolutionary Features
export interface GameStepResult {
  storySegment?: StorySegment;
  worldStateUpdate?: Partial<WorldState>;
  choices?: Choice[];
  // Revolutionary features
  quantumShift?: boolean;
  metaMessage?: string;
  corruptionEffect?: {
    level: number;
    visualEffect: React.CSSProperties;
  };
  temporalRevision?: {
    segmentId: string;
    newText: string;
  };
}
