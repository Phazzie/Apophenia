/**
 * GAME SERVICE
 *
 * High-level game orchestration service that wires together:
 * - Flow coordination (descent, unraveling)
 * - Command execution
 * - State updates
 * - Engine processing
 *
 * This is the main entry point for game logic called by App.tsx.
 */

import {
  Choice,
  GameState,
  GenreConfig,
  AIProvider,
  Command,
  FlowResult,
} from '../core/types/seams';
import { flowCoordinator } from '../flows';
import { CommandQueueImpl } from '../core/commands/CommandQueue';
import {
  useGameStateStore,
  useWorldStateStore,
  useHistoryStore,
  usePlayerProfileStore,
} from '../core/state';
import { getDefaultGenre } from '../config/genres';

/**
 * Initialize a new game
 *
 * Sets up initial world state, resets stores, and transitions to GENERATING.
 */
export async function initializeGame(
  genre?: GenreConfig,
  provider: AIProvider = AIProvider.MOCK
): Promise<void> {
  // #TODO: Add more detailed analytics tracking for game start
  console.log('🎮 Initializing new game...', { genre: genre?.id, provider });

  // Reset all stores
  useGameStateStore.getState().reset();
  useWorldStateStore.getState().reset();
  useHistoryStore.getState().reset();
  usePlayerProfileStore.getState().reset();

  // Set genre
  const selectedGenre = genre || getDefaultGenre();

  // Update world state with genre
  useWorldStateStore.getState().updateWorld({
    genreConfig: selectedGenre,
    protagonist: 'Unknown',  // Will be generated
    setting: 'Unknown',      // Will be generated
    dilemma: 'Unknown',      // Will be generated
  });

  // Transition to GENERATING state
  await flowCoordinator.transitionTo(GameState.GENERATING);

  // Set generating flag
  useGameStateStore.getState().setGenerating(true);

  console.log('✅ Game initialized');
}

/**
 * Process a player choice through the game flow
 *
 * This is the main game loop function:
 * 1. Get current flow (descent/unraveling)
 * 2. Process choice through flow
 * 3. Execute resulting commands
 * 4. Handle state transitions
 */
export async function processPlayerChoice(choice: Choice): Promise<void> {
  console.log('🎯 Processing player choice:', choice.text);

  try {
    // Mark as generating
    useGameStateStore.getState().setGenerating(true);

    // Get current flow
    const flow = flowCoordinator.getCurrentFlow();
    console.log(`📋 Using flow: ${flow.name}`);

    // Process choice through flow
    const result: FlowResult = await flow.processChoice(choice);

    // Execute commands
    if (result.commands.length > 0) {
      await executeCommands(result.commands);
    }

    // Apply world updates
    if (result.worldUpdates && Object.keys(result.worldUpdates).length > 0) {
      useWorldStateStore.getState().updateWorld(result.worldUpdates);
    }

    // Handle state transition
    if (result.nextState) {
      console.log(`🔄 Transitioning to: ${result.nextState}`);
      await flowCoordinator.transitionTo(result.nextState);
    }

    // Check if flow determines we should transition
    const flowContext = {
      worldState: useWorldStateStore.getState().worldState,
      recentHistory: useHistoryStore.getState().getRecent(5),
      playerProfile: usePlayerProfileStore.getState().profile,
      currentChoice: choice,
    };

    // #TODO: Log flow context to debug stream or analytics
    // console.debug('Flow Context:', flowContext);

    const shouldTransition = flow.shouldTransition(flowContext);
    if (shouldTransition) {
      console.log(`🔄 Flow-triggered transition to: ${shouldTransition}`);
      await flowCoordinator.transitionTo(shouldTransition);
    }

    console.log('✅ Choice processed successfully');
  } catch (error) {
    console.error('❌ Error processing choice:', error);

    // Show error to player
    useGameStateStore.getState().setChoices([
      {
        id: 'error-retry',
        text: 'Something went wrong. Try again?',
        isIntrusive: false,
      },
    ]);
  } finally {
    // Always clear generating flag
    useGameStateStore.getState().setGenerating(false);
  }
}

/**
 * Execute a queue of commands sequentially
 *
 * Uses CommandQueue to execute all commands in order.
 */
async function executeCommands(commands: Command[]): Promise<void> {
  console.log(`⚙️  Executing ${commands.length} commands...`);

  const queue = new CommandQueueImpl();
  queue.enqueue(commands);

  const results = await queue.executeSequential();

  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    console.warn(`⚠️  ${failures.length} commands failed:`, failures);
  }

  console.log(`✅ Executed ${results.filter(r => r.success).length}/${results.length} commands`);
}

/**
 * Start the initial game generation
 *
 * Called after initializeGame to actually generate the opening.
 */
export async function startGameGeneration(): Promise<void> {
  console.log('🎬 Starting game generation...');

  try {
    // Get current flow and initialize it
    const flow = flowCoordinator.getCurrentFlow();
    const worldState = useWorldStateStore.getState().worldState;

    await flow.initialize(worldState.genreConfig);

    // Transition to DESCENDING
    await flowCoordinator.transitionTo(GameState.DESCENDING);

    console.log('✅ Game generation complete');
  } catch (error) {
    console.error('❌ Game generation failed:', error);

    // Return to menu on failure
    await flowCoordinator.transitionTo(GameState.MENU);
  } finally {
    useGameStateStore.getState().setGenerating(false);
  }
}

/**
 * Save current game state
 *
 * Zustand persist middleware handles this automatically,
 * but this function can trigger manual saves if needed.
 */
export function saveGame(): void {
  console.log('💾 Saving game...');

  // State is auto-saved via persist middleware
  // This is a manual trigger for debugging/testing

  console.log('✅ Game saved');
}

/**
 * Reset game to menu
 */
export async function resetGame(): Promise<void> {
  console.log('🔄 Resetting game...');

  // Reset all stores
  useGameStateStore.getState().reset();
  useWorldStateStore.getState().reset();
  useHistoryStore.getState().reset();
  usePlayerProfileStore.getState().reset();

  // Return to menu
  await flowCoordinator.transitionTo(GameState.MENU);

  console.log('✅ Game reset');
}

/**
 * Get current game statistics
 */
export function getGameStats() {
  const worldState = useWorldStateStore.getState().worldState;
  const segments = useHistoryStore.getState().segments;
  const profile = usePlayerProfileStore.getState().profile;

  return {
    corruptionLevel: worldState.corruptionLevel,
    horrorIntensity: worldState.horrorIntensity,
    systemHealth: worldState.systemHealth,
    psychologicalStatus: worldState.psychologicalStatus,
    totalChoices: profile.engagementMetrics.totalChoices,
    totalSegments: segments.length,
  };
}

/**
 * Generate image (stub for backward compatibility)
 */
export async function generateImage(prompt: string): Promise<string> {
  const { imageGenerationService } = await import('./ai/imageGeneration');
  const result = await imageGenerationService.generateImageVariations(prompt, 1);
  return result.variations[0]?.url || '';
}

/**
 * Generate multiple images (stub for backward compatibility)
 */
export async function generateMultipleImages(prompts: string[]): Promise<string[]> {
  return Promise.all(prompts.map(prompt => generateImage(prompt)));
}

/**
 * Generate concept (re-export)
 */
export { generateConceptFlow as generateConcept } from './ai/genkit';

/**
 * Get next step (stub for backward compatibility)
 */
export async function getNextStep(choice: Choice): Promise<void> {
  // This is handled by processPlayerChoice now
  return processPlayerChoice(choice);
}

/**
 * Summarize history (stub for backward compatibility)
 */
export async function summarizeHistory(): Promise<string> {
  const segments = useHistoryStore.getState().segments;
  return segments.map(s => s.text).join('\n\n');
}
