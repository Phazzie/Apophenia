/**
 * Flow Context Builder
 *
 * Builds FlowContext from Zustand stores for engine and AI processing.
 * This is the bridge between stateful stores and stateless flow processing.
 */

import { useGameStateStore } from '../core/state/gameStateStore';
import { useWorldStateStore } from '../core/state/worldStateStore';
import { useHistoryStore } from '../core/state/historyStore';
import { useUserStore } from '../core/state/userStore';
import { Choice, StorySegment, WorldState } from '../types';
import { FlowContext, EngineContext, PlayerProfile, PsychologicalStatus } from '../core/types/seams';

/**
 * Builds a FlowContext from current store state
 */
export class FlowContextBuilder {
  /**
   * Build FlowContext for flow processing
   */
  buildFlowContext(currentChoice: Choice): FlowContext {
    const worldState = useWorldStateStore.getState().worldState;
    const segments = useHistoryStore.getState().segments;
    const playerProfile = this.buildPlayerProfile();

    return {
      worldState: this.mapWorldState(worldState),
      recentHistory: this.getRecentHistory(segments, 10),
      playerProfile,
      currentChoice,
    };
  }

  /**
   * Build EngineContext for engine processing
   */
  buildEngineContext(currentChoice?: Choice): EngineContext {
    const worldState = useWorldStateStore.getState().worldState;
    const segments = useHistoryStore.getState().segments;
    const playerProfile = this.buildPlayerProfile();

    return {
      worldState: this.mapWorldState(worldState),
      recentHistory: this.getRecentHistory(segments, 10),
      playerProfile,
      currentChoice,
    };
  }

  /**
   * Get the most recent N segments from history
   */
  private getRecentHistory(history: StorySegment[], count: number): StorySegment[] {
    return history.slice(-count);
  }

  /**
   * Build player profile from user store
   *
   * Note: This creates a basic profile. A dedicated PlayerProfileStore
   * should be created by Agent 2 for full psychological profiling.
   */
  private buildPlayerProfile(): PlayerProfile {
    // Note: UserStore doesn't have a profile property yet - using default values
    // TODO: Create PlayerProfileStore as per SEAMS architecture
    const segments = useHistoryStore.getState().segments;
    const gameState = useGameStateStore.getState();

    // Extract choice count and basic metrics
    const choiceCount = segments.filter(seg => seg.text.includes('>')).length;

    // Get first segment timestamp (with fallback for legacy segments without timestamp)
    const firstSegment = segments[0];
    const firstSegmentTime = firstSegment && 'timestamp' in firstSegment && typeof firstSegment.timestamp === 'number'
      ? firstSegment.timestamp
      : Date.now();

    return {
      fearProfile: {
        claustrophobia: 0.5,
        isolation: 0.5,
        bodyHorror: 0.5,
        cosmicInsignificance: 0.5,
        lossOfControl: 0.5,
        madness: 0.5,
      },
      choicePatterns: {
        riskTaking: 0.5,
        curiosity: 0.5,
        aggression: 0.5,
        avoidance: 0.5,
      },
      engagementMetrics: {
        totalChoices: choiceCount,
        averageResponseTime: 0,
        sessionDuration: Date.now() - firstSegmentTime,
      },
    };
  }

  /**
   * Map existing WorldState to seams WorldState
   * Bridges the gap between current implementation and architectural seams
   */
  private mapWorldState(worldState: WorldState): import('../core/types/seams').WorldState {
    return {
      protagonist: worldState.protagonist,
      setting: worldState.setting,
      dilemma: worldState.dilemma,
      psychologicalStatus: this.mapPsychologicalStatus(worldState.psychologicalStatus),
      systemHealth: worldState.systemHealth,
      horrorIntensity: worldState.horrorIntensity,
      corruptionLevel: this.calculateCorruptionLevel(worldState),
      genreConfig: worldState.genreConfig, // GenreConfig is now canonical, pass through directly
      summary: worldState.summary ?? '',
    };
  }

  /**
   * Map current psychological status to seams enum
   */
  private mapPsychologicalStatus(
    status: 'stable' | 'uneasy' | 'paranoid' | 'fragmented' | 'shattered'
  ): PsychologicalStatus {
    // The status strings already match the enum values exactly
    // Return directly without unnecessary type assertion
    switch (status) {
      case 'stable':
        return PsychologicalStatus.STABLE;
      case 'uneasy':
        return PsychologicalStatus.UNEASY;
      case 'paranoid':
        return PsychologicalStatus.PARANOID;
      case 'fragmented':
        return PsychologicalStatus.FRAGMENTED;
      case 'shattered':
        return PsychologicalStatus.SHATTERED;
      default:
        return PsychologicalStatus.STABLE;
    }
  }

  /**
   * Get corruption level from world state
   * Returns corruptionLevel directly or defaults to 0
   */
  private calculateCorruptionLevel(worldState: WorldState): number {
    // Corruption level is now a first-class property
    return worldState.corruptionLevel || 0;
  }
}

/**
 * Singleton instance for convenience
 */
export const flowContextBuilder = new FlowContextBuilder();
