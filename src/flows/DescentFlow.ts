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
} from '../core/types/seams';
import { useWorldStateStore } from '../stores/worldStateStore';
import { useGameStateStore } from '../stores/gameStateStore';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { flowContextBuilder } from './FlowContextBuilder';
import { generateWithSelectedModel } from '../services/ai/unifiedAIService';
import { executeCommandQueue } from '../services/commandExecutor';
import {
  TemporalRevisionEngine,
  MetaConsciousnessEngine,
  QuantumNarrativeEngine,
  AdaptiveHorrorEngine,
  RealityCorruptionEngine,
  NeuralEchoChamberEngine,
  SemanticChoiceArchaeologyEngine,
  AdaptiveNarrativeDNAEngine,
  FifthWallEngine,
} from '../core/engines';

// Instantiate engine singletons
const temporalRevision = new TemporalRevisionEngine();
const metaConsciousness = new MetaConsciousnessEngine();
const quantumNarrative = new QuantumNarrativeEngine();
const adaptiveHorror = new AdaptiveHorrorEngine();
const realityCorruption = new RealityCorruptionEngine();
const neuralEchoChambers = new NeuralEchoChamberEngine();
const semanticArchaeology = new SemanticChoiceArchaeologyEngine();
const narrativeDNA = new AdaptiveNarrativeDNAEngine();
const fifthWallBreaker = new FifthWallEngine();

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
      console.error('DescentFlow.processChoice error:', error);
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
    const descentFromHorror = (horrorIntensity / 10) * 60; // Max 60% from horror
    const descentFromCorruption = corruptionLevel * 0.4; // Max 40% from corruption

    return Math.min(100, descentFromHorror + descentFromCorruption);
  }

  /**
   * Determine if we should transition to unraveling phase
   * Triggers when descent level exceeds 70%
   */
  shouldBeginUnraveling(): boolean {
    return this.calculateDescentLevel() > 70;
  }

  /**
   * Check if we should transition to a different game state
   */
  shouldTransition(context: FlowContext): GameState | null {
    if (this.shouldBeginUnraveling()) {
      console.log('🌀 Descent level critical - beginning unraveling phase');
      return GameState.UNRAVELING;
    }
    return null;
  }

  /**
   * Execute all active engines in priority order
   */
  private async executeEngines(context: FlowContext): Promise<EngineOutput[]> {
    // Type engines as any[] to avoid TypeScript errors with legacy engine implementations
    // Runtime checks ensure safe access to engine methods
    const engines: any[] = [
      temporalRevision,
      metaConsciousness,
      quantumNarrative,
      adaptiveHorror,
      realityCorruption,
      neuralEchoChambers,
      semanticArchaeology,
      narrativeDNA,
      fifthWallBreaker,
    ];

    const outputs: EngineOutput[] = [];
    const engineContext = flowContextBuilder.buildEngineContext(context.currentChoice);

    for (const engine of engines) {
      try {
        // Check if engine is active for this context
        if (typeof engine.isActive === 'function' && !engine.isActive(engineContext)) {
          continue;
        }

        // Process engine if it has the process method
        if (typeof engine.process === 'function') {
          const output = await engine.process(engineContext);
          outputs.push(output);
        } else if (typeof engine.generateInstructions === 'function') {
          // Fallback for engines that only provide instructions
          const instructions = engine.generateInstructions(engineContext);
          outputs.push({
            engineName: engine.name || 'Unknown',
            instructions,
            effects: {},
            metadata: {},
          });
        }
      } catch (error) {
        console.error(`Engine ${engine.name || 'Unknown'} failed:`, error);
        // Continue with other engines
      }
    }

    return outputs;
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
    const storyHistory = useStoryHistoryStore.getState().storyHistory;

    // Call unified AI service with proper AIRequest format
    const response = await generateWithSelectedModel({
      prompt: request.prompt,
      context: {
        worldState,
        recentHistory: storyHistory.slice(-10), // Last 10 segments
        playerProfile: {
          fearProfile: {},
          choicePatterns: {
            riskTaking: 0.5,
            curiosity: 0.5,
            aggression: 0.3,
            avoidance: 0.4,
          },
          engagementMetrics: {
            totalChoices: 0,
            averageResponseTime: 0,
            sessionDuration: 0,
          },
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
  private aggregateEffects(engineOutputs: EngineOutput[]): any {
    const aggregated: any = {
      worldUpdates: {},
      historyRevisions: [],
      profileUpdates: {},
      corruptionChanges: 0,
    };

    for (const output of engineOutputs) {
      if (output.effects.worldUpdates) {
        Object.assign(aggregated.worldUpdates, output.effects.worldUpdates);
      }
      if (output.effects.historyRevisions) {
        aggregated.historyRevisions.push(...output.effects.historyRevisions);
      }
      if (output.effects.profileUpdates) {
        Object.assign(aggregated.profileUpdates, output.effects.profileUpdates);
      }
      if (output.effects.corruptionChanges) {
        aggregated.corruptionChanges += output.effects.corruptionChanges;
      }
    }

    return aggregated;
  }

  /**
   * Apply engine effects to stores
   */
  private applyEngineEffects(effects: any): void {
    const worldStateStore = useWorldStateStore.getState();

    // Apply world updates
    if (effects.worldUpdates && Object.keys(effects.worldUpdates).length > 0) {
      worldStateStore.updateWorldState(effects.worldUpdates);
    }

    // Apply corruption changes
    if (effects.corruptionChanges !== 0) {
      const currentCorruption = this.getCorruptionLevel(worldStateStore.worldState);
      const newCorruption = Math.max(0, Math.min(100, currentCorruption + effects.corruptionChanges));

      // Update UI distortion based on corruption
      this.updateUIDistortion(newCorruption);
    }

    // History revisions and profile updates would be applied here
    // when those stores are fully implemented
  }

  /**
   * Get corruption level from world state
   */
  private getCorruptionLevel(worldState: any): number {
    // Extract from UI distortion
    const transform = worldState.uiDistortion?.transform || '';
    const rotationMatch = transform.match(/rotate\(([0-9.]+)deg\)/);
    const rotation = rotationMatch ? parseFloat(rotationMatch[1]) : 0;
    return Math.min(100, (rotation / 20) * 100);
  }

  /**
   * Update UI distortion based on corruption level
   */
  private updateUIDistortion(corruptionLevel: number): void {
    const worldStateStore = useWorldStateStore.getState();

    worldStateStore.updateWorldState({
    });
  }
}

/**
 * Singleton instance for convenience
 */
export const descentFlow = new DescentFlowImpl();
