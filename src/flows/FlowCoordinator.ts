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
import { useGameStateStore } from '../core/state/gameStateStore';
import { descentFlow } from './DescentFlow';
import { unravelingFlow } from './UnravelingFlow';
import { flowContextBuilder } from './FlowContextBuilder';
import { executeCommandQueue } from '../services/commandExecutor';
import { globalEngineRegistry } from '../core/engines';
import { logger } from '../services/logger';
import { DESCENT_CONSTANTS } from './flowConstants';

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

    // gameState is already the seams GameState enum (MENU, GENERATING, DESCENDING, UNRAVELING, COLLAPSED)
    switch (gameState) {
      case GameState.DESCENDING:
        // Check if we should be in unraveling based on descent level
        const descentLevel = descentFlow.calculateDescentLevel();
        if (descentLevel > DESCENT_CONSTANTS.UNRAVELING_THRESHOLD) {
          return unravelingFlow;
        }
        return descentFlow;

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

    // Update game state with the seams GameState enum value directly
    gameStateStore.setGameState(state);

    // Get the new flow
    this.currentFlow = this.getCurrentFlow();

    logger.flow('FlowCoordinator', `Transition to ${this.currentFlow.name} (state: ${state})`);
  }

  /**
   * Execute all active engines for a given context
   * Uses the global engine registry to avoid duplicate instances
   */
  async executeEngines(context: FlowContext): Promise<EngineOutput[]> {
    const engineContext = flowContextBuilder.buildEngineContext(context.currentChoice);

    // Use the global engine registry's executeAll method
    const outputs = await globalEngineRegistry.executeAll(engineContext);

    logger.info(`Executed ${outputs.length} engines`);
    return outputs;
  }

  /**
   * Execute a queue of commands
   */
  async executeCommands(commands: Command[]): Promise<ExecutionResult[]> {
    logger.info(`Executing ${commands.length} commands`);

    try {
      // Use existing command executor
      // Command[] from seams.ts is compatible with executeCommandQueue's expected type
      await executeCommandQueue(commands);

      // Convert to ExecutionResults
      return commands.map((command) => ({
        success: true,
        command,
      }));
    } catch (error) {
      logger.error('Command execution failed', error);

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
        return descentLevel > DESCENT_CONSTANTS.UNRAVELING_THRESHOLD
          ? GameState.UNRAVELING
          : GameState.DESCENDING;
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
