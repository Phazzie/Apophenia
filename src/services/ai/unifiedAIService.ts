/**
 * Unified AI Service
 *
 * This service acts as a single, simplified interface for the rest of the application
 * to interact with the AI system. It abstracts away the details of the backend API calls,
 * routing all requests through the secure backend flows.
 */

import { nextStepFlow, generateConceptFlow } from './genkit';
import { GameCommand, GenreConfig, WorldState, StorySegment } from '../../types';

/**
 * Generates a new story concept by calling the backend service.
 * @param genreConfig - The configuration for the selected genre.
 * @returns A promise that resolves to the generated story concept.
 */
export async function generateConcept(
  genreConfig: GenreConfig
): Promise<{ protagonist: string; setting: string; dilemma: string }> {
  console.log('Unified Service: Requesting concept generation.');
  // All AI logic is now handled by the backend via this flow.
  return await generateConceptFlow(genreConfig);
}

/**
 * Generates the next step in the story by calling the backend service.
 * @param playerChoice - The choice the player made.
 * @param worldState - The current state of the game world.
 * @param storyHistory - The history of the story so far.
 * @param genreConfig - The configuration for the selected genre.
 * @returns A promise that resolves to an array of game commands.
 */
export async function generateNextStep(
  playerChoice: string,
  worldState: WorldState,
  storyHistory: StorySegment[],
  genreConfig: GenreConfig
): Promise<GameCommand[]> {
  console.log('Unified Service: Requesting next story step.');
  // The nextStepFlow now encapsulates the call to the secure backend.
  return await nextStepFlow({
    playerChoice,
    worldState,
    history: storyHistory,
    genreConfig,
  });
}