/**
 * Flow Coordinator
 *
 * Central orchestrator that manages game flow transitions and coordinates
 * the execution of engines, AI services, and commands.
 *
 * Responsibilities:
 * - Determine which flow is active based on game state
 * - Manage transitions between flows (Descent → Unraveling → Collapsed)
 * - Coordinate engine execution
 * - Execute command queues
 * - Provide a unified interface for game service layer
 */

import {
  FlowCoordinator as IFlowCoordinator,
  GameFlow,
  GameState,
  FlowContext,
  EngineOutput,
  ExecutionResult,
  Command,
} from '../core/types/seams';
import { useGameStateStore } from '../stores/gameStateStore';
import { descentFlow } from './DescentFlow';
import { unravelingFlow } from './UnravelingFlow';
import { flowContextBuilder } from './FlowContextBuilder';
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
 * FlowCoordinator Implementation
 */
export class FlowCoordinatorImpl implements IFlowCoordinator {
  private currentFlow: GameFlow | null = null;

  /**
   * Get the currently active flow based on game state
   */
  getCurrentFlow(): GameFlow {
    const gameState = useGameStateStore.getState().gameState;

    // Map current GameState enum (MENU, GENERATING_CONCEPT, LOADING, PLAYING, ENDED)
    // to seams GameState (MENU, GENERATING, DESCENDING, UNRAVELING, COLLAPSED)
    const mappedState = this.mapGameStateToSeamsState(gameState);

    switch (mappedState) {
      case GameState.DESCENDING:
      case GameState.GENERATING:
        return descentFlow;

      case GameState.UNRAVELING:
        return unravelingFlow;

      case GameState.MENU:
      case GameState.COLLAPSED:
      default:
        // Return descent flow as default
        return descentFlow;
    }
  }

  /**
   * Transition to a new game state and activate the corresponding flow
   */
  async transitionTo(state: GameState): Promise<void> {
    const gameStateStore = useGameStateStore.getState();

    // Map seams GameState to current GameState enum
    const currentGameState = this.mapSeamsStateToGameState(state);

    // Update game state
    gameStateStore.setGameState(currentGameState);

    // Get the new flow
    this.currentFlow = this.getCurrentFlow();

    console.log(`🔄 Flow transition: ${this.currentFlow.name} (state: ${state})`);
  }

  /**
   * Execute all active engines for a given context
   */
  async executeEngines(context: FlowContext): Promise<EngineOutput[]> {
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

    // Execute engines in priority order
    for (const engine of engines) {
      try {
        // Check if engine is active
        if (typeof engine.isActive === 'function' && !engine.isActive(engineContext)) {
          continue;
        }

        // Process engine
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

    console.log(`⚙️  Executed ${outputs.length} engines`);
    return outputs;
  }

  /**
   * Execute a queue of commands
   */
  async executeCommands(commands: Command[]): Promise<ExecutionResult[]> {
    console.log(`🎯 Executing ${commands.length} commands`);

    try {
      // Use existing command executor
      // Commands are compatible with GameCommand[] expected by executeCommandQueue
      await executeCommandQueue(commands as unknown as import('../types').GameCommand[]);

      // Convert to ExecutionResults
      return commands.map((command) => ({
        success: true,
        command,
      }));
    } catch (error) {
      console.error('Command execution failed:', error);

      return commands.map((command) => ({
        success: false,
        command,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }

  /**
   * Map current GameState enum to seams GameState
   */
  private mapGameStateToSeamsState(gameState: number): GameState {
    // Current: MENU = 0, GENERATING_CONCEPT = 1, LOADING = 2, PLAYING = 3, ENDED = 4
    // Seams: MENU, GENERATING, DESCENDING, UNRAVELING, COLLAPSED

    switch (gameState) {
      case 0: // MENU
        return GameState.MENU;
      case 1: // GENERATING_CONCEPT
        return GameState.GENERATING;
      case 2: // LOADING
        return GameState.GENERATING;
      case 3: // PLAYING
        // Check if we should be in unraveling based on horror level
        const descentLevel = descentFlow.calculateDescentLevel();
        return descentLevel > 70 ? GameState.UNRAVELING : GameState.DESCENDING;
      case 4: // ENDED
        return GameState.COLLAPSED;
      default:
        return GameState.MENU;
    }
  }

  /**
   * Map seams GameState to current GameState enum
   */
  private mapSeamsStateToGameState(state: GameState): number {
    switch (state) {
      case GameState.MENU:
        return 0;
      case GameState.GENERATING:
        return 1;
      case GameState.DESCENDING:
        return 3; // PLAYING
      case GameState.UNRAVELING:
        return 3; // PLAYING (unraveling is a sub-state)
      case GameState.COLLAPSED:
        return 4; // ENDED
      default:
        return 0;
    }
  }
}

/**
 * Singleton instance for convenience
 */
export const flowCoordinator = new FlowCoordinatorImpl();
