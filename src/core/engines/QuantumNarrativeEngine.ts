/**
 * QUANTUM NARRATIVE ENGINE
 *
 * Manages parallel timelines and quantum superposition of narrative states.
 * Allows the story to exist in multiple contradictory states simultaneously.
 */

import type { QuantumNarrativeEngine as IQuantumNarrativeEngine, EngineContext, EngineOutput, WorldState } from '../types/seams';
import { BaseEngine } from './base/Engine';

export class QuantumNarrativeEngine extends BaseEngine implements IQuantumNarrativeEngine {
  readonly name = 'QuantumNarrative';
  readonly description = 'Manages parallel timelines and quantum narrative superposition';
  readonly priority = 7; // High priority - can dramatically alter narrative

  readonly timelines: Map<string, WorldState> = new Map();

  // #TODO: Implement persistence for quantum timelines.
  // Currently, `timelines` is an in-memory Map and will be lost on page reload.
  // We need to serialize this into the WorldState or a dedicated localStorage key.
  // Reference: #TODO.md Section 3 - Persist Quantum State

  isActive(context: EngineContext): boolean {
    // Activate when horror intensity is high and system health is degrading
    return (
      this.isHorrorIntenseEnough(context, 5) &&
      this.isSystemHealthLowEnough(context, 70) &&
      this.getChoiceCount(context) > 3
    );
  }

  async process(context: EngineContext): Promise<EngineOutput> {
    // Store current timeline if not already stored
    if (this.timelines.size === 0) {
      this.timelines.set('alpha', { ...context.worldState });
    }

    // Determine if we should shift timelines
    const shouldShift = Math.random() < (context.worldState.horrorIntensity / 15);

    if (shouldShift && this.timelines.size < 3) {
      const newTimelineId = this.shiftTimeline(context);

      return {
        engineName: this.name,
        instructions: this.generateInstructions(context),
        effects: {
          worldUpdates: {
            summary: `[QUANTUM SHIFT: Timeline ${newTimelineId}] ${context.worldState.summary || ''}`
          }
        },
        metadata: {
          timelineShifted: true,
          newTimeline: newTimelineId,
          totalTimelines: this.timelines.size
        }
      };
    }

    // Occasionally merge timelines to create paradoxes
    if (this.timelines.size >= 2 && Math.random() < 0.2) {
      const timelineIds = Array.from(this.timelines.keys());
      const timeline1 = timelineIds[0];
      const timeline2 = timelineIds[1];
      const mergedState = this.mergeTimelines(timeline1, timeline2);

      // Handle graceful degradation if merge fails
      if (!mergedState) {
        return {
          engineName: this.name,
          instructions: this.generateInstructions(context),
          effects: {},
          metadata: {
            timelinesMerged: false,
            mergeAttempted: true,
            mergeFailed: true
          }
        };
      }

      return {
        engineName: this.name,
        instructions: [
          ...this.generateInstructions(context),
          'Create a narrative paradox by merging contradictory timelines',
          'The protagonist experiences déjà vu or conflicting memories'
        ],
        effects: {
          worldUpdates: {
            summary: `[TIMELINE MERGE] ${mergedState.summary || ''}`
          }
        },
        metadata: {
          timelinesMerged: true,
          merged: [timeline1, timeline2]
        }
      };
    }

    return {
      engineName: this.name,
      instructions: this.generateInstructions(context),
      effects: {},
      metadata: {
        activeTimelines: this.timelines.size
      }
    };
  }

  generateInstructions(context: EngineContext): string[] {
    const instructions = [
      'Hint at parallel realities or alternate versions of events',
      'Create ambiguity about which timeline is "real"'
    ];

    if (this.timelines.size >= 2) {
      instructions.push(
        'Reference events that may have happened in alternate timelines',
        'The protagonist notices inconsistencies with "memories" they shouldn\'t have'
      );
    }

    if (context.worldState.horrorIntensity >= 7) {
      instructions.push(
        'Create explicit quantum superposition - events both happened and didn\'t happen',
        'Reality becomes increasingly unstable and contradictory'
      );
    }

    return instructions;
  }

  shiftTimeline(context: EngineContext): string {
    const timelineNames = ['beta', 'gamma', 'delta', 'epsilon', 'zeta'];
    const unusedNames = timelineNames.filter(name => !this.timelines.has(name));

    if (unusedNames.length === 0) {
      return 'alpha'; // Fallback to alpha
    }

    const newTimelineId = unusedNames[0];

    // Create a divergent timeline with subtle differences
    const divergentState: WorldState = {
      ...context.worldState,
      systemHealth: Math.max(0, context.worldState.systemHealth - 10),
      corruptionLevel: Math.min(100, context.worldState.corruptionLevel + 15),
      summary: `[Timeline ${newTimelineId}] ${context.worldState.summary || ''}`
    };

    this.timelines.set(newTimelineId, divergentState);

    return newTimelineId;
  }

  mergeTimelines(timeline1: string, timeline2: string): WorldState | null {
    const state1 = this.timelines.get(timeline1);
    const state2 = this.timelines.get(timeline2);

    // Graceful degradation: return null if timelines not found
    if (!state1 || !state2) {
      console.warn(`Cannot merge timelines: ${timeline1} or ${timeline2} not found`);
      return null;
    }

    // Create a merged state that combines properties in paradoxical ways
    const mergedState: WorldState = {
      protagonist: state1.protagonist, // Keep protagonist from timeline 1
      setting: state2.setting, // But setting from timeline 2 (paradox)
      dilemma: `${state1.dilemma} / ${state2.dilemma}`, // Merge dilemmas
      psychologicalStatus: state2.psychologicalStatus, // Use worse psychological status
      systemHealth: Math.min(state1.systemHealth, state2.systemHealth) - 5,
      horrorIntensity: Math.max(state1.horrorIntensity, state2.horrorIntensity) + 1,
      corruptionLevel: Math.max(state1.corruptionLevel, state2.corruptionLevel) + 10,
      genreConfig: state1.genreConfig,
      summary: `[MERGED: ${timeline1}+${timeline2}] Quantum paradox resolved through narrative collapse`
    };

    // Remove merged timelines
    this.timelines.delete(timeline1);
    this.timelines.delete(timeline2);

    // Store merged timeline
    this.timelines.set(`${timeline1}-${timeline2}`, mergedState);

    return mergedState;
  }
}
