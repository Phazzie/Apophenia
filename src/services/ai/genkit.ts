// This file is intended to house the actual Genkit AI logic.
// You will need to have a Google Cloud project with the AI Platform API enabled.
// For more information, see the Genkit documentation: [https://firebase.google.com/docs/genkit]

import { genkit, defineFlow, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize Genkit
const ai = genkit({
  plugins: [
    googleAI(),
  ],
  logSinks: [ 'firebase' ],
  enableTracingAndMetrics: true,
});

// --- Haunting Flow ---
export const hauntingFlow = defineFlow(
  {
    name: 'hauntingFlow',
    inputSchema: z.object({}),
    outputSchema: z.string(),
  },
  async () => {
    const llmResponse = await ai.generate({
      model: 'gemini-pro',
      prompt: 'Generate a short, unsettling, and atmospheric whisper, in the style of a cosmic horror story. It should be a single sentence. Examples: "It sees you.", "The stars are wrong.", "That is not dead which can eternal lie."',
      output: { format: 'text' },
    });
    return llmResponse.text();
  }
);

// --- Generate Concept Flow ---
const ConceptOutputSchema = z.object({
  protagonist: z.string(),
  setting: z.string(),
  dilemma: z.string(),
});
export const generateConceptFlow = defineFlow(
  {
    name: 'generateConceptFlow',
    inputSchema: z.object({ name: z.string(), description: z.string(), style: z.string() }),
    outputSchema: ConceptOutputSchema,
  },
  async (genreConfig) => {
    const llmResponse = await ai.generate({
      model: 'gemini-pro',
      prompt: `Generate a starting concept for a narrative game based on the following genre...\n`, // Truncated for brevity
      output: { format: 'json', schema: ConceptOutputSchema },
    });
    const output = llmResponse.output();
    if (!output) throw new Error('AI response did not produce a valid output for generateConceptFlow.');
    return output;
  }
);

// --- Generate Image Flow ---
export const generateImageFlow = defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (prompt) => {
    const llmResponse = await ai.generate({
      model: 'google-ai/imagen-2',
      prompt: prompt,
      output: { format: 'media' },
    });
    const mediaItems = llmResponse.media();
    if (mediaItems.length > 0) return mediaItems[0];
    throw new Error('Image generation failed or did not return a valid data URL.');
  }
);

// --- Next Step Flow (Core Game Loop) ---

// Schemas for Commands
const displayTextPayloadSchema = z.object({ content: z.string() });
const waitPayloadSchema = z.object({ duration: z.number() });
const generateAmbiancePayloadSchema = z.object({ description: z.string() });
const generateImagePayloadSchema = z.object({ styleModifier: z.string() });
const updateWorldStatePayloadSchema = z.object({
  protagonist: z.string().optional(),
  setting: z.string().optional(),
  dilemma: z.string().optional(),
  summary: z.string().optional(),
  psychologicalStatus: z.enum(['Stable', 'Uneasy', 'Paranoid', 'Fragmented']).optional(),
  systemHealth: z.number().optional(),
});
const choiceSchema = z.object({ text: z.string(), isIntrusive: z.boolean() });
const displayChoicesPayloadSchema = z.object({
  choices: z.array(choiceSchema),
  intrusiveThought: choiceSchema.optional(),
  predictedImagePrompt: z.string().optional(),
});
const commandSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('displayText'), payload: displayTextPayloadSchema }),
  z.object({ type: z.literal('wait'), payload: waitPayloadSchema }),
  z.object({ type: z.literal('generateAmbiance'), payload: generateAmbiancePayloadSchema }),
  z.object({ type: z.literal('generateImage'), payload: generateImagePayloadSchema }),
  z.object({ type: z.literal('updateWorldState'), payload: updateWorldStatePayloadSchema }),
  z.object({ type: z.literal('displayChoices'), payload: displayChoicesPayloadSchema }),
]);
const commandArraySchema = z.array(commandSchema);

// Schemas for Core Game Types
const worldStateSchema = z.object({
  protagonist: z.string(),
  setting: z.string(),
  dilemma: z.string(),
  summary: z.string(),
  psychologicalStatus: z.enum(['Stable', 'Uneasy', 'Paranoid', 'Fragmented']),
  systemHealth: z.number(),
  uiDistortion: z.object({ transform: z.string(), filter: z.string(), transition: z.string() }),
});
const storySegmentSchema = z.object({
  id: z.string(),
  text: z.string(),
  images: z.object({
    main: z.string().optional(),
    inset: z.array(z.string()).optional(),
    mainStatus: z.enum(['loading', 'loaded']).optional(),
  }),
});
const genreConfigSchema = z.object({
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

// Schema for the Next Step Flow input
const nextStepInputSchema = z.object({
  playerChoice: z.string(),
  worldState: worldStateSchema,
  history: z.array(storySegmentSchema),
  genreConfig: genreConfigSchema,
});

export const nextStepFlow = defineFlow(
  {
    name: 'nextStepFlow',
    inputSchema: nextStepInputSchema,
    outputSchema: commandArraySchema,
  },
  async ({ playerChoice, worldState, history, genreConfig }) => {
    const llmResponse = await ai.generate({
      model: 'gemini-pro',
      prompt: `You are the game master for an interactive narrative game...\n`, // Truncated for brevity
      output: { format: 'json', schema: commandArraySchema },
    });
    const output = llmResponse.output();
    if (!output) throw new Error('AI response did not produce a valid output for nextStepFlow.');
    return output;
  }
);
