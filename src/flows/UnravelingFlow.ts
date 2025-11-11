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
} from '../core/types/seams';
import { useWorldStateStore } from '../stores/worldStateStore';
import { useGameStateStore } from '../stores/gameStateStore';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { flowContextBuilder } from './FlowContextBuilder';
import { generateWithSelectedModel } from '../services/ai/unifiedAIService';
import { executeCommandQueue } from '../services/commandExecutor';
import {
  temporalRevision,
  metaConsciousness,
  quantumNarrative,
  adaptiveHorror,
  realityCorruption,
  neuralEchoChambers,
  semanticArchaeology,
  narrativeDNA,
  fifthWallBreaker,
} from '../services/ai/engines';

/**
 * UnravelingFlow Implementation
 *
 * The reality collapse phase where all horror mechanics intensify
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
      horrorIntensity: Math.min(10, (worldStateStore.worldState.horrorIntensity || 0) + 2),
      psychologicalStatus: 'Fragmented',
      systemHealth: Math.max(0, worldStateStore.worldState.systemHealth - 30),
    });

    // Update game state
    gameStateStore.setGameState(3); // GameState.PLAYING (will transition to ENDED)
    gameStateStore.setIsGenerating(true);

    console.log('🌀 Unraveling phase initialized - reality is collapsing');
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
      console.error('UnravelingFlow.processChoice error:', error);
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
    const storyHistory = useStoryHistoryStore.getState().storyHistory;

    const horrorIntensity = worldState.horrorIntensity || 0;
    const systemHealth = worldState.systemHealth || 100;
    const corruptionLevel = this.getCorruptionLevel(worldState);

    // Multiple factors contribute to unraveling
    const horrorFactor = (horrorIntensity / 10) * 40; // Max 40%
    const healthFactor = ((100 - systemHealth) / 100) * 30; // Max 30%
    const corruptionFactor = corruptionLevel * 0.3; // Max 30%

    return Math.min(100, horrorFactor + healthFactor + corruptionFactor);
  }

  /**
   * Determine if reality should completely collapse
   * Triggers when unraveling exceeds 90%
   */
  shouldCollapse(): boolean {
    return this.calculateUnravelingLevel() > 90;
  }

  /**
   * Generate browser manipulation effects for reality collapse
   */
  generateCollapseEffect(): BrowserEffect[] {
    const unravelingLevel = this.calculateUnravelingLevel();
    const effects: BrowserEffect[] = [];

    if (unravelingLevel > 75) {
      // Change page title to something disturbing
      effects.push({
        type: 'changeTitle',
        value: '҉ ҉T҉H҉E҉ ҉V҉O҉I҉D҉ ҉S҉E҉E҉S҉ ҉Y҉O҉U҉ ҉҉',
      });
    }

    if (unravelingLevel > 85) {
      // Manipulate browser history
      effects.push({
        type: 'manipulateHistory',
        value: 'You have always been here',
      });
    }

    if (unravelingLevel > 95 && typeof navigator.vibrate !== 'undefined') {
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
      console.log('💀 Reality has completely collapsed - game ending');
      return GameState.COLLAPSED;
    }
    return null;
  }

  /**
   * Execute engines with amplified effects
   * All engines are more aggressive during unraveling
   */
  private async executeEnginesAmplified(context: FlowContext): Promise<EngineOutput[]> {
    const engines = [
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

    // During unraveling, even inactive engines might fire
    for (const engine of engines) {
      try {
        // Process engine if it has the process method
        if (typeof engine.process === 'function') {
          const output = await engine.process(engineContext);

          // Amplify effects during unraveling
          if (output.effects.corruptionChanges) {
            output.effects.corruptionChanges *= 1.5;
          }

          outputs.push(output);
        } else if (typeof engine.generateInstructions === 'function') {
          const instructions = engine.generateInstructions(engineContext);

          // Add unraveling-specific instructions
          instructions.push('Reality is collapsing. Increase narrative chaos and horror.');

          outputs.push({
            engineName: engine.name || 'Unknown',
            instructions,
            effects: {},
            metadata: { amplified: true },
          });
        }
      } catch (error) {
        console.error(`Engine ${engine.name || 'Unknown'} failed:`, error);
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
    const storyHistory = [];

    const commands = await generateWithSelectedModel(
      request.systemInstruction,
      request.prompt,
      worldState,
      storyHistory,
      'story'
    );

    return commands as unknown as Command[];
  }

  /**
   * Aggregate and amplify effects
   */
  private aggregateAndAmplifyEffects(engineOutputs: EngineOutput[]): any {
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

    // Amplify corruption during unraveling
    aggregated.corruptionChanges *= 1.5;

    return aggregated;
  }

  /**
   * Apply engine effects
   */
  private applyEngineEffects(effects: any): void {
    const worldStateStore = useWorldStateStore.getState();

    if (effects.worldUpdates && Object.keys(effects.worldUpdates).length > 0) {
      worldStateStore.updateWorldState(effects.worldUpdates);
    }

    if (effects.corruptionChanges !== 0) {
      const currentCorruption = this.getCorruptionLevel(worldStateStore.worldState);
      const newCorruption = Math.max(0, Math.min(100, currentCorruption + effects.corruptionChanges));
      this.updateUIDistortion(newCorruption);
    }

    // Decrease system health during unraveling
    const newHealth = Math.max(0, worldStateStore.worldState.systemHealth - 5);
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
        console.error('Browser effect failed:', error);
      }
    }
  }

  /**
   * Get corruption level from world state
   */
  private getCorruptionLevel(worldState: any): number {
    const transform = worldState.uiDistortion?.transform || '';
    const rotationMatch = transform.match(/rotate\(([0-9.]+)deg\)/);
    const rotation = rotationMatch ? parseFloat(rotationMatch[1]) : 0;
    return Math.min(100, (rotation / 20) * 100);
  }

  /**
   * Update UI distortion (more aggressive during unraveling)
   */
  private updateUIDistortion(corruptionLevel: number): void {
    const worldStateStore = useWorldStateStore.getState();
    const normalized = corruptionLevel / 100;

    // More extreme distortion during unraveling
    worldStateStore.updateWorldState({
      uiDistortion: {
        filter: `hue-rotate(${normalized * 360}deg) brightness(${1 - normalized * 0.5}) contrast(${1 + normalized})`,
        transform: `scale(${1 + normalized * 0.05}) rotate(${normalized * 45}deg) skew(${normalized * 5}deg)`,
        transition: 'all 0.5s ease-in-out',
      },
    });
  }
}

/**
 * Singleton instance for convenience
 */
export const unravelingFlow = new UnravelingFlowImpl();
