// This file is intended to house the actual Genkit AI logic.
// You will need to have a Google Cloud project with the AI Platform API enabled.
// For more information, see the Genkit documentation: [https://firebase.google.com/docs/genkit]

import { genkit, defineFlow, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import {
  commandArraySchema,
  genreConfigSchema,
  storySegmentSchema,
  worldStateSchema,
} from '../../types';

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
      - \`createSegment\`: Creates a new, empty story segment. MUST be called before any \`displayText\` or \`generateImage\` for a new scene.
      - \`displayText\`: Shows text to the user. Must target a \`segmentId\`.
      - \`displayChoices\`: Presents the player with choices. This should always be the last command.
      - \`updateWorldState\`: Changes the internal state of the world (e.g., psychologicalStatus).
      - \`generateImage\`: Triggers an image generation. The payload must include a detailed visual \`prompt\` and a \`segmentId\`.
      - \`generateAmbiance\`: Describes an ambient sound to be played.
      - \`wait\`: Pauses the game for a specified duration in milliseconds.

      **Instructions:**
      1. **Always start a new scene by calling `createSegment` first.** Get the new ID for the segment.
      2. Narrate the outcome of the player's choice using \`displayText\`, targeting the new segment's ID.
      3. If the scene needs an image, call \`generateImage\` with a detailed prompt, targeting the new segment's ID.
      4. Update the world state if necessary to reflect changes.
      5. Create a new situation for the player.
      6. End by presenting 2-3 new choices for the player to make using \`displayChoices\`.
      7. One of the choices can be an "intrusive thought" which is more dangerous or irrational.

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
