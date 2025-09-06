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
const ai = genkit({
  plugins: [
    googleAI(),
  ],
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
      1. **Always start a new scene by calling \`createSegment\` first.** Get the new ID for the segment.
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
    const output = llmResponse.output();
    if (!output) throw new Error('AI response did not produce a valid output for nextStepFlow.');
    return output;
  }
);
