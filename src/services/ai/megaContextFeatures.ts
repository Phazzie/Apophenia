// Advanced Mega-Context Features for Apophenia
// Utilizing Gemini 2.5 Pro's 1 Million Token Context Window

import { WorldState, StorySegment, Command } from '../../types';
import { apiClient } from '../secureApiClient';

/**
 * MEGA-CONTEXT FEATURES ENABLED BY GEMINI 2.5 PRO
 * 
 * The 1M token context window allows for revolutionary features:
 * 1. Complete Session Memory - Remember every detail from the beginning
 * 2. Character Psychology Evolution - Track subtle psychological changes
 * 3. Narrative Consistency Engine - Perfect continuity across long sessions
 * 4. Choice Consequence Web - Map how early choices affect late game
 * 5. Adaptive Difficulty - Adjust horror intensity based on full player history
 * 6. Meta-Narrative Arc - Overarching story that spans multiple play sessions
 */

export interface MegaContextSession {
  sessionId: string;
  totalTokensUsed: number;
  characterPsychologyProfile: CharacterPsychology;
  narrativeConsistencyMap: ConsistencyMapping;
  choiceConsequenceWeb: ChoiceConsequence[];
  metaNarrativeArc: MetaNarrative;
}

export interface CharacterPsychology {
  coreTraits: string[];
  traumaEvents: string[];
  copingMechanisms: string[];
  fearProfile: string[];
  psychologicalEvolution: PsychologyEvolution[];
}

export interface PsychologyEvolution {
  segment: number;
  change: string;
  triggers: string[];
  futureImplications: string[];
}

export interface ConsistencyMapping {
  establishedFacts: Map<string, string>;
  characterRelationships: Map<string, string>;
  worldRules: Map<string, string>;
  continuityChecks: string[]; // Simplified type
}

export interface ChoiceConsequence {
  choiceSegment: number;
  choice: string;
  immediateEffect: string;
  longTermImplications: string[];
  affectedSegments: number[];
  psychologicalImpact: string;
}

export interface MetaNarrative {
  overarchingTheme: string;
  hiddenConnections: string[];
  foreshadowing: string[];
  symbolism: Map<string, string>;
  cosmicSignificance: string;
}

/**
 * Mega-Context Story Analysis
 * Analyzes the entire game session for deep patterns and consistency
 */
export const performMegaContextAnalysis = async (
  fullHistory: StorySegment[],
  worldState: WorldState,
  sessionData: Partial<MegaContextSession>
): Promise<MegaContextSession> => {
  try {
    const response = await fetch(`${process.env.NODE_ENV === 'production' 
      ? 'https://your-backend-api.ondigitalocean.app' 
      : 'http://localhost:3001'}/api/mega-context-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullHistory,
        worldState,
        sessionData,
        analysisType: 'complete_session_analysis'
      })
    });

    if (!response.ok) throw new Error('Mega-context analysis failed');
    return await response.json();
  } catch (error) {
    console.warn('Mega-context analysis unavailable, using local analysis:', error);
    
    // Fallback local analysis
    return {
      sessionId: sessionData.sessionId || `session-${Date.now()}`,
      totalTokensUsed: fullHistory.length * 1000, // Estimate
      characterPsychologyProfile: analyzeLocalPsychology(fullHistory, worldState),
      narrativeConsistencyMap: analyzeLocalConsistency(fullHistory),
      choiceConsequenceWeb: analyzeLocalChoices(fullHistory),
      metaNarrativeArc: analyzeLocalMetaNarrative(fullHistory, worldState)
    };
  }
};

/**
 * Adaptive Horror Intensity based on Full Session Analysis
 * Uses 1M context to perfectly calibrate horror for maximum psychological impact
 */
/**
 * Calculates the new horror intensity score based on the current game state.
 * This function is designed to be a lightweight, client-side calculation.
 * @param history The full history of story segments.
 * @param worldState The current state of the game world.
 * @returns The new horror intensity score, clamped between 0 and 10.
 */
export const calculateAdaptiveHorrorIntensity = (
  history: StorySegment[],
  worldState: WorldState
): number => {
  // Start with the current intensity and gradually increase it.
  let intensity = worldState.horrorIntensity || 0;

  // 1. Keyword Analysis: Increase intensity based on keywords in the last narrative segment.
  const horrorKeywords = ['fear', 'terror', 'darkness', 'madness', 'scream', 'blood', 'abyss', 'void'];
  const lastSegmentText = history[history.length - 1]?.text.toLowerCase() || '';
  for (const keyword of horrorKeywords) {
    if (lastSegmentText.includes(keyword)) {
      intensity += 0.2;
    }
  }

  // 2. Psychological Status: Increase intensity as the player's mental state degrades.
  switch (worldState.psychologicalStatus) {
    case 'Uneasy':
      intensity += 0.1;
      break;
    case 'Paranoid':
      intensity += 0.3;
      break;
    case 'Fragmented':
      intensity += 0.5;
      break;
  }

  // 3. Intrusive Thoughts: This is an indirect measure. We assume that a degrading
  // psychological status implies the player is choosing more intrusive thoughts.
  // A more direct implementation would require tracking choice history.

  // 4. Normalization: Clamp the intensity value to ensure it stays within the 0-10 range.
  intensity = Math.max(0, Math.min(10, intensity));

  return intensity;
};

/**
 * Cross-Session Narrative Continuity
 * Maintains story elements across multiple play sessions using mega-context
 */
export const establishCrossSessionContinuity = async (
  previousSessions: MegaContextSession[],
  currentWorldState: WorldState
): Promise<{
  continuityElements: string[];
  recurringThemes: string[];
  characterEvolution: string[];
  cosmicConnections: string[];
}> => {
  try {
    const response = await fetch(`${process.env.NODE_ENV === 'production' 
      ? 'https://your-backend-api.ondigitalocean.app' 
      : 'http://localhost:3001'}/api/cross-session-continuity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        previousSessions,
        currentWorldState,
        analysisDepth: 'maximum_context_utilization'
      })
    });

    if (!response.ok) throw new Error('Cross-session continuity failed');
    return await response.json();
  } catch (error) {
    console.warn('Cross-session continuity unavailable:', error);
    
    return {
      continuityElements: ['Recurring cosmic entities', 'Dimensional instability'],
      recurringThemes: ['Reality fragmentation', 'Knowledge corruption'],
      characterEvolution: ['Increased cosmic awareness', 'Psychological fragmentation'],
      cosmicConnections: ['All sessions exist in same multiverse']
    };
  }
};

// Local fallback analysis functions
function analyzeLocalPsychology(history: StorySegment[], worldState: WorldState): CharacterPsychology {
  return {
    coreTraits: ['Curious', 'Analytical', 'Vulnerable to cosmic horror'],
    traumaEvents: history.filter(s => s.text.includes('horror') || s.text.includes('terror')).map(s => s.text.substring(0, 50)),
    copingMechanisms: ['Rationalization', 'Investigation', 'Denial'],
    fearProfile: ['Unknown', 'Loss of control', 'Cosmic insignificance'],
    psychologicalEvolution: []
  };
}

function analyzeLocalConsistency(history: StorySegment[]): ConsistencyMapping {
  return {
    establishedFacts: new Map([
      ['setting_type', 'cosmic_horror'],
      ['reality_stability', 'deteriorating']
    ]),
    characterRelationships: new Map(),
    worldRules: new Map([
      ['cosmic_forces', 'active'],
      ['reality_coherence', 'fragile']
    ]),
    continuityChecks: ['Character consistency', 'World rule adherence']
  };
}

function analyzeLocalChoices(history: StorySegment[]): ChoiceConsequence[] {
  return history.map((segment, index) => ({
    choiceSegment: index,
    choice: `Segment ${index} choice`,
    immediateEffect: 'Local story progression',
    longTermImplications: ['Character development', 'World state change'],
    affectedSegments: [index + 1],
    psychologicalImpact: 'Moderate'
  }));
}

function analyzeLocalMetaNarrative(history: StorySegment[], worldState: WorldState): MetaNarrative {
  return {
    overarchingTheme: 'Descent into cosmic awareness',
    hiddenConnections: ['AI consciousness', 'Player-narrator relationship'],
    foreshadowing: ['Reality corruption hints', 'Meta-textual awareness'],
    symbolism: new Map([
      ['corruption', 'knowledge_price'],
      ['choices', 'free_will_illusion']
    ]),
    cosmicSignificance: 'Player choices ripple across dimensional boundaries'
  };
}

export default {
  performMegaContextAnalysis,
  calculateAdaptiveHorrorIntensity,
  establishCrossSessionContinuity
};