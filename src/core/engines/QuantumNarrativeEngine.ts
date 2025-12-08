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

  isActive(context: EngineContext): boolean {
    // Activate when horror intensity is high and system health is degrading
    return (
      this.isHorrorIntenseEnough(context, 5) &&
      this.isSystemHealthLowEnough(context, 70) &&
      this.getChoiceCount(context) > 3
    );
  }

  async process(context: EngineContext): Promise<EngineOutput> {
    try {
      // Validate context first
      this.validateContext(context);

      // Get timelines from metadata (stateless pattern)
      const previousTimelines = this.getTimelinesFromContext(context);

      // Store current timeline if not already stored
      let currentTimelines = { ...previousTimelines };
      if (Object.keys(currentTimelines).length === 0) {
        currentTimelines['alpha'] = { ...context.worldState };
      }

      // Determine if we should shift timelines
      const shouldShift = Math.random() < (context.worldState.horrorIntensity / 15);

      if (shouldShift && Object.keys(currentTimelines).length < 3) {
        const { newTimelineId, updatedTimelines } = this.shiftTimeline(context, currentTimelines);

        return {
          engineName: this.name,
          instructions: this.generateInstructions(context),
          effects: {
            worldUpdates: {
              summary: `[QUANTUM SHIFT: Timeline ${newTimelineId}] ${context.worldState.summary || ''}`
            }
          },
          metadata: {
            timelines: updatedTimelines,
            timelineShifted: true,
            newTimeline: newTimelineId,
            totalTimelines: Object.keys(updatedTimelines).length
          }
        };
      }

      // Occasionally merge timelines to create paradoxes
      if (Object.keys(currentTimelines).length >= 2 && Math.random() < 0.2) {
        const timelineIds = Object.keys(currentTimelines);
        const timeline1 = timelineIds[0];
        const timeline2 = timelineIds[1];
        const { mergedState, updatedTimelines } = this.mergeTimelines(timeline1, timeline2, currentTimelines);

        // Handle graceful degradation if merge fails
        if (!mergedState) {
          return {
            engineName: this.name,
            instructions: this.generateInstructions(context),
            effects: {},
            metadata: {
              timelines: currentTimelines,
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
            timelines: updatedTimelines,
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
          timelines: currentTimelines,
          activeTimelines: Object.keys(currentTimelines).length
        }
      };
    } catch (error) {
      console.error(`[${this.name}] Processing failed:`, error);

      // Return safe fallback instead of crashing
      return {
        engineName: this.name,
        instructions: [],
        effects: {},
        metadata: {
          error: true,
          errorMessage: error instanceof Error ? error.message : String(error),
          timestamp: Date.now(),
        },
      };
    }
  }

  generateInstructions(context: EngineContext): string[] {
    // Get timelines from context (stateless)
    const timelines = this.getTimelinesFromContext(context);
    const timelineCount = Object.keys(timelines).length;

    const instructions = [
      'Hint at parallel realities or alternate versions of events',
      'Create ambiguity about which timeline is "real"'
    ];

    if (timelineCount >= 2) {
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

  /**
   * Get timelines from context metadata (stateless pattern)
   */
  private getTimelinesFromContext(context: EngineContext): Record<string, WorldState> {
    const previousOutput = context.previousOutput;
    if (previousOutput?.metadata?.timelines && typeof previousOutput.metadata.timelines === 'object') {
      return previousOutput.metadata.timelines as Record<string, WorldState>;
    }
    return {};
  }

  /**
   * Shift to a new timeline (pure function - returns new state)
   */
  private shiftTimeline(
    context: EngineContext,
    currentTimelines: Record<string, WorldState>
  ): { newTimelineId: string; updatedTimelines: Record<string, WorldState> } {
    const timelineNames = ['beta', 'gamma', 'delta', 'epsilon', 'zeta'];
    const unusedNames = timelineNames.filter(name => !currentTimelines[name]);

    if (unusedNames.length === 0) {
      return { newTimelineId: 'alpha', updatedTimelines: currentTimelines };
    }

    const newTimelineId = unusedNames[0];

    // Create a divergent timeline with subtle differences
    const divergentState: WorldState = {
      ...context.worldState,
      systemHealth: Math.max(0, context.worldState.systemHealth - 10),
      corruptionLevel: Math.min(100, context.worldState.corruptionLevel + 15),
      summary: `[Timeline ${newTimelineId}] ${context.worldState.summary || ''}`
    };

    // Return new timelines object (immutable update)
    const updatedTimelines = {
      ...currentTimelines,
      [newTimelineId]: divergentState
    };

    // Limit to 3 timelines (prevent memory leak)
    const timelineArray = Object.entries(updatedTimelines);
    if (timelineArray.length > 3) {
      timelineArray.shift(); // Remove oldest
    }
    const finalTimelines = Object.fromEntries(timelineArray);

    return { newTimelineId, updatedTimelines: finalTimelines };
  }

  /**
   * Merge timelines (pure function - returns new state)
   */
  private mergeTimelines(
    timeline1: string,
    timeline2: string,
    currentTimelines: Record<string, WorldState>
  ): { mergedState: WorldState | null; updatedTimelines: Record<string, WorldState> } {
    const state1 = currentTimelines[timeline1];
    const state2 = currentTimelines[timeline2];

    // Graceful degradation: return null if timelines not found
    if (!state1 || !state2) {
      console.warn(`Cannot merge timelines: ${timeline1} or ${timeline2} not found`);
      return { mergedState: null, updatedTimelines: currentTimelines };
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

    // Create new timelines object without the merged ones
    const updatedTimelines = { ...currentTimelines };
    delete updatedTimelines[timeline1];
    delete updatedTimelines[timeline2];

    // Add merged timeline
    updatedTimelines[`${timeline1}-${timeline2}`] = mergedState;

    return { mergedState, updatedTimelines };
  }
}
