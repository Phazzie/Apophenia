/**
 * Descent Flow
 *
 * Main gameplay loop - orchestrates the core game experience where players
 * descend into psychological horror. Coordinates engines, AI, and commands
 * without implementing engine logic itself.
 */

import {
  DescentFlow as IDescentFlow,
  FlowResult,
  FlowContext,
  GameState,
  GenreConfig,
  Choice,
  Command,
  EngineOutput,
  EngineEffects,
  WorldState,
} from '../core/types/seams';
import { useWorldStateStore } from '../core/state/worldStateStore';
import { useGameStateStore } from '../core/state/gameStateStore';
import { useHistoryStore } from '../core/state/historyStore';
import { flowContextBuilder } from './FlowContextBuilder';
import { generateWithSelectedModel } from '../services/ai/unifiedAIService';
import { executeCommandQueue } from '../services/commandExecutor';
import { globalEngineRegistry } from '../core/engines';
import { logger } from '../services/logger';
import { DESCENT_CONSTANTS, PLAYER_PROFILE_DEFAULTS } from './flowConstants';

/**
 * DescentFlow Implementation
 *
 * Orchestrates: Engines → AI → Commands → State
 */
export class DescentFlowImpl implements IDescentFlow {
  readonly name = 'Descent';

  /**
   * Initialize the descent phase with a selected genre
   */
  async initialize(genre: GenreConfig): Promise<void> {
    const worldStateStore = useWorldStateStore.getState();
    const gameStateStore = useGameStateStore.getState();

    // Initialize world state with genre
    worldStateStore.updateWorldState({
      genreConfig: genre, // Use the canonical GenreConfig directly
      horrorIntensity: 1,
      systemHealth: 100,
    });

    // Set game state to playing (descent)
    gameStateStore.setGameState(1); // GameState.GENERATING_CONCEPT - will transition to PLAYING
  }

  /**
   * Process a player choice through the descent flow
   *
   * Flow: Build Context → Execute Engines → Build AI Prompt → Generate Response →
   *       Extract Commands → Apply Engine Effects → Check Transitions → Return Result
   */
  async processChoice(choice: Choice): Promise<FlowResult> {
    try {
      // 1. Build context from stores
      const context = flowContextBuilder.buildFlowContext(choice);

      // 2. Execute engines (get instructions and effects)
      const engineOutputs = await this.executeEngines(context);

      // 3. Build AI prompt with engine instructions
      const aiRequest = this.buildAIRequest(context, engineOutputs);

      // 4. Get AI response with commands
      const commands = await this.generateAIResponse(aiRequest);

      // 5. Apply engine effects to state
      const effects = this.aggregateEffects(engineOutputs);
      this.applyEngineEffects(effects);

      // 6. Check if we should transition to unraveling
      const nextState = this.shouldTransition(context);

      // 7. Execute commands (async, non-blocking for images)
      await executeCommandQueue(commands);

      return {
        commands,
        worldUpdates: effects.worldUpdates || {},
        nextState: nextState || undefined,
      };
    } catch (error) {
      logger.error('DescentFlow.processChoice failed', error);
      return {
        commands: [],
        worldUpdates: {},
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Calculate how far the player has descended into horror (0-100)
   * Based on horror intensity and corruption level
   */
  calculateDescentLevel(): number {
    const worldState = useWorldStateStore.getState().worldState;
    const horrorIntensity = worldState.horrorIntensity || 0;
    const corruptionLevel = this.getCorruptionLevel(worldState);

    // Combine horror (0-10) and corruption (0-100) for descent level
    const descentFromHorror = (horrorIntensity / 10) * DESCENT_CONSTANTS.HORROR_WEIGHT * 100;
    const descentFromCorruption = corruptionLevel * DESCENT_CONSTANTS.CORRUPTION_WEIGHT;

    return Math.min(100, descentFromHorror + descentFromCorruption);
  }

  /**
   * Determine if we should transition to unraveling phase
   * Triggers when descent level exceeds threshold
   */
  shouldBeginUnraveling(): boolean {
    return this.calculateDescentLevel() > DESCENT_CONSTANTS.UNRAVELING_THRESHOLD;
  }

  /**
   * Check if we should transition to a different game state
   */
  shouldTransition(context: FlowContext): GameState | null {
    if (this.shouldBeginUnraveling()) {
      logger.flow('DescentFlow', 'Descent level critical - beginning unraveling phase');
      return GameState.UNRAVELING;
    }
    return null;
  }

  /**
   * Execute all active engines in priority order
   * Uses the global engine registry to avoid duplicate instances
   */
  private async executeEngines(context: FlowContext): Promise<EngineOutput[]> {
    const engineContext = flowContextBuilder.buildEngineContext(context.currentChoice);

    // Use the global engine registry's executeAll method
    return await globalEngineRegistry.executeAll(engineContext);
  }

  /**
   * Build AI request with system prompt and engine instructions
   */
  private buildAIRequest(
    context: FlowContext,
    engineOutputs: EngineOutput[]
  ): { systemInstruction: string; prompt: string } {
    const { worldState, currentChoice } = context;

    // Collect all engine instructions
    const engineInstructions = engineOutputs.flatMap((output) => output.instructions);

    // Build system instruction with genre and engine guidance
    const systemInstruction = this.buildSystemPrompt(
      worldState.genreConfig.systemPrompt,
      engineInstructions
    );

    // Build user prompt with choice
    const prompt = this.buildChoicePrompt(currentChoice.text);

    return { systemInstruction, prompt };
  }

  /**
   * Build system prompt with engine instructions
   */
  private buildSystemPrompt(genrePrompt: string, engineInstructions: string[]): string {
    let prompt = genrePrompt;

    if (engineInstructions.length > 0) {
      prompt += '\n\n## Engine Instructions:\n';
      engineInstructions.forEach((instruction, i) => {
        prompt += `${i + 1}. ${instruction}\n`;
      });
    }

    prompt += '\n\nReturn your response as a JSON array of commands.';
    return prompt;
  }

  /**
   * Build choice prompt
   */
  private buildChoicePrompt(choiceText: string): string {
    return `Player chose: "${choiceText}"\n\nGenerate the next story segment with appropriate commands.`;
  }

  /**
   * Generate AI response and extract commands
   */
  private async generateAIResponse(request: {
    systemInstruction: string;
    prompt: string;
  }): Promise<Command[]> {
    const worldState = useWorldStateStore.getState().worldState;
    const segments = useHistoryStore.getState().segments;

    // Call unified AI service with proper AIRequest format
    const response = await generateWithSelectedModel({
      prompt: request.prompt,
      context: {
        worldState,
        recentHistory: segments.slice(-DESCENT_CONSTANTS.RECENT_HISTORY_COUNT),
        playerProfile: {
          fearProfile: {},
          choicePatterns: PLAYER_PROFILE_DEFAULTS.choicePatterns,
          engagementMetrics: PLAYER_PROFILE_DEFAULTS.engagementMetrics,
        },
        genrePrompts: [worldState.genreConfig.systemPrompt],
        engineInstructions: [], // Engines already processed, instructions in prompt
      },
    });

    // Extract commands from response
    return response.commands || [];
  }

  /**
   * Aggregate effects from all engine outputs
   */
  private aggregateEffects(engineOutputs: EngineOutput[]): EngineEffects {
    const aggregated: EngineEffects = {
      worldUpdates: {},
      historyRevisions: [],
      profileUpdates: {},
      corruptionChanges: 0,
    };

    for (const output of engineOutputs) {
      if (output.effects.worldUpdates && aggregated.worldUpdates) {
        Object.assign(aggregated.worldUpdates, output.effects.worldUpdates);
      }
      if (output.effects.historyRevisions && aggregated.historyRevisions) {
        aggregated.historyRevisions.push(...output.effects.historyRevisions);
      }
      if (output.effects.profileUpdates && aggregated.profileUpdates) {
        Object.assign(aggregated.profileUpdates, output.effects.profileUpdates);
      }
      if (output.effects.corruptionChanges !== undefined && aggregated.corruptionChanges !== undefined) {
        aggregated.corruptionChanges += output.effects.corruptionChanges;
      }
    }

    return aggregated;
  }

  /**
   * Apply engine effects to stores
   */
  private applyEngineEffects(effects: EngineEffects): void {
    const worldStateStore = useWorldStateStore.getState();

    // Apply world updates
    if (effects.worldUpdates && Object.keys(effects.worldUpdates).length > 0) {
      worldStateStore.updateWorldState(effects.worldUpdates);
    }

    // Apply corruption changes
    if (effects.corruptionChanges !== undefined && effects.corruptionChanges !== 0) {
      const currentCorruption = this.getCorruptionLevel(worldStateStore.worldState);
      const newCorruption = Math.max(0, Math.min(100, currentCorruption + effects.corruptionChanges));

      // Update corruption level in world state (UI distortion is handled by UI layer)
      worldStateStore.updateWorldState({
        corruptionLevel: newCorruption,
      });
    }

    // History revisions and profile updates would be applied here
    // when those stores are fully implemented
  }

  /**
   * Get corruption level from world state
   */
  private getCorruptionLevel(worldState: WorldState): number {
    // Return corruption level directly from world state
    return worldState.corruptionLevel;
  }
}

/**
 * Singleton instance for convenience
 */
export const descentFlow = new DescentFlowImpl();
