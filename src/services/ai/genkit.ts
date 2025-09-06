// This file is intended to house the actual Genkit AI logic.
// You will need to have a Google Cloud project with the AI Platform API enabled.
// For more information, see the Genkit documentation: [https://firebase.google.com/docs/genkit]

import { genkit, defineFlow, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize Genkit
// This should be done once in your application's entry point.
// You will need to provide your Google Cloud project ID and credentials.
const ai = genkit({
  plugins: [
    googleAI(),
  ],
  enableTracingAndMetrics: true,
});

// Define the schema for the haunting flow input (none in this case)
const HauntingInputSchema = z.object({});

// Define the schema for the haunting flow output
const HauntingOutputSchema = z.string();

/**
 * A Genkit flow that generates a "haunting whisper" for the game.
 * This is a simple example of a generative AI call.
 */
export const hauntingFlow = defineFlow(
  {
    name: 'hauntingFlow',
    inputSchema: HauntingInputSchema,
    outputSchema: HauntingOutputSchema,
  },
  async () => {
    const llmResponse = await ai.generate({
      model: 'gemini-pro', // Or another suitable model
      prompt: 'Generate a short, unsettling, and atmospheric whisper, in the style of a cosmic horror story. It should be a single sentence. Examples: "It sees you.", "The stars are wrong.", "That is not dead which can eternal lie."',
      output: {
        format: 'text',
      },
    });

    return llmResponse.text();
  }
);

// To run this flow, you would typically deploy it as a cloud function
// and call it from your client-side code.
// Alternatively, you can use the Genkit Firebase plugin to call it directly.

//================================================================================
// Generate Concept Flow
//================================================================================

// Define the input schema for the concept generation flow
const ConceptInputSchema = z.object({
  name: z.string(),
  description: z.string(),
  style: z.string(),
});

// Define the output schema for the concept generation flow
const ConceptOutputSchema = z.object({
  protagonist: z.string(),
  setting: z.string(),
  dilemma: z.string(),
});

/**
 * A Genkit flow that generates the initial game concept.
 */
export const generateConceptFlow = defineFlow(
  {
    name: 'generateConceptFlow',
    inputSchema: ConceptInputSchema,
    outputSchema: ConceptOutputSchema,
  },
  async (genreConfig) => {
    const llmResponse = await ai.generate({
      model: 'gemini-pro',
      prompt: `Generate a starting concept for a narrative game based on the following genre.

      Genre: ${genreConfig.name}
      Description: ${genreConfig.description}
      Style: ${genreConfig.style}

      Your response should be a JSON object with three keys: "protagonist", "setting", and "dilemma".
      - "protagonist": A short description of the main character.
      - "setting": A brief description of the game's setting.
      - "dilemma": The central conflict or problem the protagonist faces.
      `,
      output: {
        format: 'json',
        schema: ConceptOutputSchema,
      },
    });

    return llmResponse.output()!;
  }
);

//================================================================================
// Generate Image Flow
//================================================================================

// Define the input schema for the image generation flow
const ImageInputSchema = z.string();

// Define the output schema for the image generation flow
const ImageOutputSchema = z.string(); // URL of the generated image

/**
 * A Genkit flow that generates an image based on a prompt.
 */
export const generateImageFlow = defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: ImageInputSchema,
    outputSchema: ImageOutputSchema,
  },
  async (prompt) => {
    // Note: The model name 'imagen-2' is a placeholder.
    // You should replace it with the actual model identifier available in your Google Cloud project.
    const llmResponse = await ai.generate({
      model: 'google-ai/imagen-2',
      prompt: prompt,
      output: {
        format: 'media', // Requesting media output
      },
    });

    const media = llmResponse.media();

    // Assuming the first piece of media is the generated image and has a URL.
    // The actual structure may vary based on the model and Genkit version.
    if (media && media.length > 0 && media[0].url) {
      return media[0].url;
    }

    throw new Error('Image generation failed or did not return a valid URL.');
  }
);

//================================================================================
// Next Step Flow (Core Game Loop)
//================================================================================

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

// Discriminated union for all command types
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
  uiDistortion: z.object({
    transform: z.string(),
    filter: z.string(),
    transition: z.string(),
  }),
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

/**
 * A Genkit flow that determines the next sequence of events in the game.
 */
export const nextStepFlow = defineFlow(
  {
    name: 'nextStepFlow',
    inputSchema: nextStepInputSchema,
    outputSchema: commandArraySchema,
  },
  async ({ playerChoice, worldState, history, genreConfig }) => {
    const llmResponse = await ai.generate({
      model: 'gemini-pro',
      prompt: `You are the game master for an interactive narrative game.

      **Game Genre:** ${genreConfig.name} (${genreConfig.style})
      **Game Master Persona:** ${genreConfig.aiSystemInstruction}

      **Current World State:**
      ${JSON.stringify(worldState, null, 2)}

      **Recent Story Events (summary):**
      ${worldState.summary}

      **Player's recent action:** "${playerChoice}"

      Your task is to generate the next sequence of events as an array of commands.
      The response must be a valid JSON array matching the provided schema.

      **Available Commands:**
      - \`displayText\`: Shows a piece of text to the user. Use this for narration.
      - \`displayChoices\`: Presents the player with choices. This should always be the last command.
      - \`updateWorldState\`: Changes the internal state of the world (e.g., psychologicalStatus).
      - \`generateImage\`: Triggers an image generation based on the current context. Use a style modifier.
      - \`generateAmbiance\`: Describes an ambient sound to be played.
      - \`wait\`: Pauses the game for a specified duration in milliseconds.

      **Instructions:**
      1. Narrate the outcome of the player's choice.
      2. Update the world state if necessary to reflect changes.
      3. Create a new situation for the player.
      4. End by presenting 2-3 new choices for the player to make.
      5. One of the choices can be an "intrusive thought" which is more dangerous or irrational.

      Generate the next command sequence now.
      `,
      output: {
        format: 'json',
        schema: commandArraySchema,
      },
    });

    return llmResponse.output()!;
  }
);
