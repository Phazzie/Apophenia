/**
 * TYPE CONVERTERS
 *
 * Utilities to convert between legacy types (types.ts) and seams types (seams.ts)
 * Eliminates the need for `as any` type escapes when bridging type systems.
 */

import {
  WorldState as SeamsWorldState,
  StorySegment as SeamsStorySegment,
  PlayerProfile as SeamsPlayerProfile,
  AIContext as SeamsAIContext,
  PsychologicalStatus,
} from '../core/types/seams';
import {
  WorldState as LegacyWorldState,
  StorySegment as LegacyStorySegment,
} from '../types';

/**
 * Convert legacy WorldState to seams WorldState
 */
export function convertWorldState(legacy: LegacyWorldState): SeamsWorldState {
  return {
    protagonist: legacy.protagonist,
    setting: legacy.setting,
    dilemma: legacy.dilemma,
    psychologicalStatus: legacy.psychologicalStatus as PsychologicalStatus,
    systemHealth: legacy.systemHealth,
    horrorIntensity: legacy.horrorIntensity,
    corruptionLevel: calculateCorruptionLevel(legacy),
    genreConfig: {
      id: legacy.genreConfig.id,
      name: legacy.genreConfig.name,
      description: legacy.genreConfig.description,
      systemPrompt: legacy.genreConfig.aiSystemInstruction,
      themes: [
        legacy.genreConfig.theme['--background-color'],
        legacy.genreConfig.theme['--accent-color'],
      ],
      fearCategories: ['cosmic', 'existential', 'psychological'],
      visualStyle: {
        primaryColor: legacy.genreConfig.theme['--background-color'],
        secondaryColor: legacy.genreConfig.theme['--text-color'],
        accentColor: legacy.genreConfig.theme['--accent-color'],
        fontFamily: legacy.genreConfig.theme['--font-family'],
        atmosphere: 'dark' as const,
      },
    },
    summary: legacy.summary,
  };
}

/**
 * Convert legacy StorySegment array to seams StorySegment array
 */
export function convertStoryHistory(legacy: LegacyStorySegment[]): SeamsStorySegment[] {
  return legacy.map((segment) => ({
    id: segment.id,
    text: segment.text,
    images: segment.images,
    timestamp: 'timestamp' in segment && typeof segment.timestamp === 'number'
      ? segment.timestamp
      : Date.now(),
    isRevised: 'isRevised' in segment ? segment.isRevised : undefined,
    originalText: 'originalText' in segment ? segment.originalText : undefined,
    isQuantumShift: 'isQuantumShift' in segment ? segment.isQuantumShift : undefined,
    isMetaEvent: 'isMetaEvent' in segment ? segment.isMetaEvent : undefined,
    corruptionLevel: 'corruptionLevel' in segment ? segment.corruptionLevel : undefined,
  }));
}

/**
 * Create a default PlayerProfile for AI context
 * Used when no profile is available yet
 */
export function createDefaultPlayerProfile(): SeamsPlayerProfile {
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
      totalChoices: 0,
      averageResponseTime: 0,
      sessionDuration: 0,
    },
  };
}

/**
 * Build a complete AIContext from legacy types
 */
export function buildAIContext(params: {
  worldState: LegacyWorldState;
  storyHistory: LegacyStorySegment[];
  playerProfile?: SeamsPlayerProfile;
  genrePrompts?: string[];
  engineInstructions?: string[];
}): SeamsAIContext {
  return {
    worldState: convertWorldState(params.worldState),
    recentHistory: convertStoryHistory(params.storyHistory.slice(-10)), // Last 10 segments
    playerProfile: params.playerProfile || createDefaultPlayerProfile(),
    genrePrompts: params.genrePrompts || [],
    engineInstructions: params.engineInstructions || [],
  };
}

/**
 * Calculate corruption level from world state
 * Returns corruptionLevel directly or defaults to 0
 */
function calculateCorruptionLevel(worldState: LegacyWorldState): number {
  // Corruption level is now a first-class property
  return worldState.corruptionLevel || 0;
}
