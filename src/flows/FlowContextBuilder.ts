/**
 * Flow Context Builder
 *
 * Builds FlowContext from Zustand stores for engine and AI processing.
 * This is the bridge between stateful stores and stateless flow processing.
 */

import { useGameStateStore } from '../stores/gameStateStore';
import { useWorldStateStore } from '../stores/worldStateStore';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { useUserStore } from '../stores/userStore';
import { Choice, StorySegment, WorldState } from '../types';
import { FlowContext, EngineContext, PlayerProfile } from '../core/types/seams';

/**
 * Builds a FlowContext from current store state
 */
export class FlowContextBuilder {
  /**
   * Build FlowContext for flow processing
   */
  buildFlowContext(currentChoice: Choice): FlowContext {
    const worldState = useWorldStateStore.getState().worldState;
    const storyHistory = useStoryHistoryStore.getState().storyHistory;
    const playerProfile = this.buildPlayerProfile();

    return {
      worldState: this.mapWorldState(worldState),
      recentHistory: this.getRecentHistory(storyHistory, 10),
      playerProfile,
      currentChoice,
    };
  }

  /**
   * Build EngineContext for engine processing
   */
  buildEngineContext(currentChoice?: Choice): EngineContext {
    const worldState = useWorldStateStore.getState().worldState;
    const storyHistory = useStoryHistoryStore.getState().storyHistory;
    const playerProfile = this.buildPlayerProfile();

    return {
      worldState: this.mapWorldState(worldState),
      recentHistory: this.getRecentHistory(storyHistory, 10),
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
    const userProfile = useUserStore.getState().profile;
    const storyHistory = useStoryHistoryStore.getState().storyHistory;
    const gameState = useGameStateStore.getState();

    // Extract choice count and basic metrics
    const choiceCount = storyHistory.filter(seg => seg.text.includes('>')).length;

    return {
      fearProfile: {
        claustrophobia: userProfile?.fearProfile?.claustrophobia ?? 0.5,
        isolation: userProfile?.fearProfile?.isolation ?? 0.5,
        bodyHorror: userProfile?.fearProfile?.bodyHorror ?? 0.5,
        cosmicInsignificance: userProfile?.fearProfile?.cosmicInsignificance ?? 0.5,
        lossOfControl: userProfile?.fearProfile?.lossOfControl ?? 0.5,
        madness: userProfile?.fearProfile?.madness ?? 0.5,
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
        sessionDuration: Date.now() - (storyHistory[0]?.timestamp ?? Date.now()),
      },
      crossSessionData: userProfile?.crossSessionData,
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
      genreConfig: {
        id: worldState.genreConfig.id,
        name: worldState.genreConfig.name,
        description: worldState.genreConfig.description,
        systemPrompt: worldState.genreConfig.aiSystemInstruction,
        themes: [worldState.genreConfig.theme['--background-color'], worldState.genreConfig.theme['--accent-color']],
        fearCategories: ['cosmic', 'existential', 'psychological'],
        visualStyle: {
          primaryColor: worldState.genreConfig.theme['--background-color'],
          secondaryColor: worldState.genreConfig.theme['--text-color'],
          accentColor: worldState.genreConfig.theme['--accent-color'],
          fontFamily: worldState.genreConfig.theme['--font-family'],
          atmosphere: 'dark' as const,
        },
      },
      summary: worldState.summary,
    };
  }

  /**
   * Map current psychological status to seams enum
   */
  private mapPsychologicalStatus(
    status: 'Stable' | 'Uneasy' | 'Paranoid' | 'Fragmented'
  ): import('../core/types/seams').PsychologicalStatus {
    // Import at top of file, but use type assertion here for mapping
    // to avoid circular dependencies
    const PsychologicalStatus = {
      STABLE: 'stable' as const,
      UNEASY: 'uneasy' as const,
      PARANOID: 'paranoid' as const,
      FRAGMENTED: 'fragmented' as const,
      SHATTERED: 'shattered' as const,
    };

    switch (status) {
      case 'Stable':
        return PsychologicalStatus.STABLE as any;
      case 'Uneasy':
        return PsychologicalStatus.UNEASY as any;
      case 'Paranoid':
        return PsychologicalStatus.PARANOID as any;
      case 'Fragmented':
        return PsychologicalStatus.FRAGMENTED as any;
      default:
        return PsychologicalStatus.STABLE as any;
    }
  }

  /**
   * Calculate corruption level from UI distortion
   * Converts visual distortion to 0-100 corruption level
   */
  private calculateCorruptionLevel(worldState: WorldState): number {
    // Extract rotation from transform string
    const transform = worldState.uiDistortion?.transform || '';
    const rotationMatch = transform.match(/rotate\(([0-9.]+)deg\)/);
    const rotation = rotationMatch ? parseFloat(rotationMatch[1]) : 0;

    // Map rotation (0-20 degrees) to corruption (0-100)
    return Math.min(100, (rotation / 20) * 100);
  }
}

/**
 * Singleton instance for convenience
 */
export const flowContextBuilder = new FlowContextBuilder();
