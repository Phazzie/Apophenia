/**
 * Unraveling Flow
 *
 * Reality collapse phase - the game world begins to break down as the player's
 * psychological state deteriorates. This flow intensifies all horror mechanics
 * and pushes toward the final collapse state.
 */

import {
  UnravelingFlow as IUnravelingFlow,
  FlowResult,
  FlowContext,
  GameState,
  GenreConfig,
  Choice,
  Command,
  BrowserEffect,
  EngineOutput,
  PsychologicalStatus,
  EngineEffects,
  WorldState,
} from '../core/types/seams';
import { useWorldStateStore } from '../core/state/worldStateStore';
import { useHistoryStore } from '../core/state/historyStore';
import { useGameStateStore } from '../core/state/gameStateStore';
import { flowContextBuilder } from './FlowContextBuilder';
import { generateWithSelectedModel } from '../services/ai/unifiedAIService';
import { executeCommandQueue } from '../services/commandExecutor';
import { globalEngineRegistry } from '../core/engines';
import { logger } from '../services/logger';
import {
  UNRAVELING_CONSTANTS,
  FLOW_INIT_CONSTANTS,
  PLAYER_PROFILE_DEFAULTS,
} from './flowConstants';

/**
 * UnravelingFlow Implementation
 *
 * The reality collapse phase where all horror mechanics intensifies
 */
export class UnravelingFlowImpl implements IUnravelingFlow {
  readonly name = 'Unraveling';

  /**
   * Initialize the unraveling phase
   */
  async initialize(genre: GenreConfig): Promise<void> {
    const worldStateStore = useWorldStateStore.getState();
    const gameStateStore = useGameStateStore.getState();

    // Dramatically increase horror and corruption
    worldStateStore.updateWorldState({
      horrorIntensity: Math.min(
        10,
        (worldStateStore.worldState.horrorIntensity || 0) + FLOW_INIT_CONSTANTS.UNRAVELING_HORROR_BOOST
      ),
      psychologicalStatus: PsychologicalStatus.FRAGMENTED,
      systemHealth: Math.max(
        0,
        worldStateStore.worldState.systemHealth - FLOW_INIT_CONSTANTS.UNRAVELING_HEALTH_PENALTY
      ),
    });

    // Update game state
    gameStateStore.setGameState(3); // GameState.PLAYING (will transition to ENDED)
    gameStateStore.setGenerating(true);

    logger.flow('UnravelingFlow', 'Unraveling phase initialized - reality is collapsing');
  }

  /**
   * Process a choice during the unraveling phase
   *
   * All engines are more aggressive, effects are amplified
   */
  async processChoice(choice: Choice): Promise<FlowResult> {
    try {
      // 1. Build context
      const context = flowContextBuilder.buildFlowContext(choice);

      // 2. Execute engines with amplified effects
      const engineOutputs = await this.executeEnginesAmplified(context);

      // 3. Build AI prompt with unraveling instructions
      const aiRequest = this.buildUnravelingAIRequest(context, engineOutputs);

      // 4. Get AI response
      const commands = await this.generateAIResponse(aiRequest);

      // 5. Apply amplified engine effects
      const effects = this.aggregateAndAmplifyEffects(engineOutputs);
      this.applyEngineEffects(effects);

      // 6. Add browser manipulation effects
      const browserEffects = this.generateCollapseEffect();
      this.applyBrowserEffects(browserEffects);

      // 7. Check if we should fully collapse
      const nextState = this.shouldTransition(context);

      // 8. Execute commands
      await executeCommandQueue(commands);

      return {
        commands,
        worldUpdates: effects.worldUpdates || {},
        nextState: nextState || undefined,
      };
    } catch (error) {
      logger.error('UnravelingFlow.processChoice failed', error);
      return {
        commands: [],
        worldUpdates: {},
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Calculate unraveling level (0-100)
   * Higher values mean closer to complete collapse
   */
  calculateUnravelingLevel(): number {
    const worldState = useWorldStateStore.getState().worldState;
    const segments = useHistoryStore.getState().segments;

    const horrorIntensity = worldState.horrorIntensity || 0;
    const systemHealth = worldState.systemHealth || 100;
    const corruptionLevel = this.getCorruptionLevel(worldState);

    // Multiple factors contribute to unraveling
    const horrorFactor = (horrorIntensity / 10) * UNRAVELING_CONSTANTS.HORROR_FACTOR_WEIGHT * 100;
    const healthFactor = ((100 - systemHealth) / 100) * UNRAVELING_CONSTANTS.HEALTH_FACTOR_WEIGHT * 100;
    const corruptionFactor = corruptionLevel * UNRAVELING_CONSTANTS.CORRUPTION_FACTOR_WEIGHT;

    return Math.min(100, horrorFactor + healthFactor + corruptionFactor);
  }

  /**
   * Determine if reality should completely collapse
   * Triggers when unraveling exceeds threshold
   */
  shouldCollapse(): boolean {
    return this.calculateUnravelingLevel() > UNRAVELING_CONSTANTS.COLLAPSE_THRESHOLD;
  }

  /**
   * Generate browser manipulation effects for reality collapse
   */
  generateCollapseEffect(): BrowserEffect[] {
    const unravelingLevel = this.calculateUnravelingLevel();
    const effects: BrowserEffect[] = [];

    if (unravelingLevel > UNRAVELING_CONSTANTS.TITLE_CHANGE_THRESHOLD) {
      // Change page title to something disturbing
      effects.push({
        type: 'changeTitle',
        value: '҉ ҉T҉H҉E҉ ҉V҉O҉I҉D҉ ҉S҉E҉E҉S҉ ҉Y҉O҉U҉ ҉҉',
      });
    }

    if (unravelingLevel > UNRAVELING_CONSTANTS.HISTORY_MANIPULATION_THRESHOLD) {
      // Manipulate browser history
      effects.push({
        type: 'manipulateHistory',
        value: 'You have always been here',
      });
    }

    if (unravelingLevel > UNRAVELING_CONSTANTS.VIBRATION_THRESHOLD && typeof navigator.vibrate !== 'undefined') {
      // Vibrate on mobile devices
      effects.push({
        type: 'vibrate',
        value: '200',
      });
    }

    return effects;
  }

  /**
   * Check if we should transition to collapsed state
   */
  shouldTransition(context: FlowContext): GameState | null {
    if (this.shouldCollapse()) {
      logger.flow('UnravelingFlow', 'Reality has completely collapsed - game ending');
      return GameState.COLLAPSED;
    }
    return null;
  }

  /**
   * Execute engines with amplified effects
   * All engines are more aggressive during unraveling
   * Uses the global engine registry to avoid duplicate instances
   */
  private async executeEnginesAmplified(context: FlowContext): Promise<EngineOutput[]> {
    const engineContext = flowContextBuilder.buildEngineContext(context.currentChoice);

    // Get all engines from registry (not just active ones - during unraveling, all engines fire)
    const allEngines = globalEngineRegistry.getAll();
    const outputs: EngineOutput[] = [];

    // Execute all engines during unraveling (even inactive ones)
    for (const engine of allEngines) {
      try {
        const output = await engine.process(engineContext);

        // Amplify effects during unraveling
        if (output.effects.corruptionChanges) {
          output.effects.corruptionChanges *= UNRAVELING_CONSTANTS.EFFECT_AMPLIFICATION_MULTIPLIER;
        }

        // Add unraveling-specific instructions
        output.instructions.push('Reality is collapsing. Increase narrative chaos and horror.');

        // Mark as amplified
        output.metadata = { ...output.metadata, amplified: true };

        outputs.push(output);
      } catch (error) {
        logger.error(`Engine ${engine.name || 'Unknown'} failed`, error);
      }
    }

    return outputs;
  }

  /**
   * Build AI request with unraveling-specific instructions
   */
  private buildUnravelingAIRequest(
    context: FlowContext,
    engineOutputs: EngineOutput[]
  ): { systemInstruction: string; prompt: string } {
    const { worldState, currentChoice } = context;

    // Collect all engine instructions
    const engineInstructions = engineOutputs.flatMap((output) => output.instructions);

    // Add unraveling-specific instructions
    engineInstructions.push('REALITY IS UNRAVELING. Increase horror, chaos, and meta-awareness.');
    engineInstructions.push('The fourth wall is breaking. The game knows it is a game.');
    engineInstructions.push('Visual corruption should be intense. Narrative should be unstable.');

    // Build system prompt
    const systemInstruction = this.buildSystemPrompt(
      worldState.genreConfig.systemPrompt,
      engineInstructions
    );

    // Build choice prompt
    const prompt = this.buildChoicePrompt(currentChoice.text);

    return { systemInstruction, prompt };
  }

  /**
   * Build system prompt
   */
  private buildSystemPrompt(genrePrompt: string, engineInstructions: string[]): string {
    let prompt = genrePrompt;

    prompt += '\n\n## UNRAVELING PHASE:\n';
    prompt += 'Reality is collapsing. All horror mechanics are amplified. The narrative should be chaotic, meta-aware, and disturbing.\n';

    if (engineInstructions.length > 0) {
      prompt += '\n## Engine Instructions:\n';
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
    return `Player chose: "${choiceText}"\n\nGenerate a reality-breaking story segment. Push toward complete collapse.`;
  }

  /**
   * Generate AI response
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
        recentHistory: segments.slice(-UNRAVELING_CONSTANTS.RECENT_HISTORY_COUNT),
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
   * Aggregate effects from engine outputs
   * Note: Amplification is already applied in executeEnginesAmplified, no need to amplify again
   */
  private aggregateAndAmplifyEffects(engineOutputs: EngineOutput[]): EngineEffects {
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

    // Effects are already amplified in executeEnginesAmplified (1.5x)
    // No need to amplify again to avoid double amplification (2.25x)

    return aggregated;
  }

  /**
   * Apply engine effects
   */
  private applyEngineEffects(effects: EngineEffects): void {
    const worldStateStore = useWorldStateStore.getState();

    if (effects.worldUpdates && Object.keys(effects.worldUpdates).length > 0) {
      worldStateStore.updateWorldState(effects.worldUpdates);
    }

    if (effects.corruptionChanges !== undefined && effects.corruptionChanges !== 0) {
      const currentCorruption = this.getCorruptionLevel(worldStateStore.worldState);
      const newCorruption = Math.max(0, Math.min(100, currentCorruption + effects.corruptionChanges));

      // Update corruption level in world state (UI distortion is handled by UI layer)
      worldStateStore.updateWorldState({
        corruptionLevel: newCorruption,
      });
    }

    // Decrease system health during unraveling
    const newHealth = Math.max(
      0,
      worldStateStore.worldState.systemHealth - UNRAVELING_CONSTANTS.SYSTEM_HEALTH_DECAY
    );
    worldStateStore.updateWorldState({ systemHealth: newHealth });
  }

  /**
   * Apply browser effects for reality collapse
   */
  private applyBrowserEffects(effects: BrowserEffect[]): void {
    for (const effect of effects) {
      try {
        switch (effect.type) {
          case 'changeTitle':
            if (typeof document !== 'undefined') {
              document.title = effect.value || 'ERROR';
            }
            break;

          case 'vibrate':
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([200, 100, 200]);
            }
            break;

          case 'manipulateHistory':
            // Safely manipulate history without breaking navigation
            if (typeof history !== 'undefined' && history.pushState) {
              history.pushState({}, '', window.location.href);
            }
            break;
        }
      } catch (error) {
        logger.error('Browser effect failed', error);
      }
    }
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
export const unravelingFlow = new UnravelingFlowImpl();
