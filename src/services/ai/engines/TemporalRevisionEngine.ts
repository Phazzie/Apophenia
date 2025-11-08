import { StorySegment, WorldState } from '../../../types';
import { REVOLUTIONARY_FEATURES } from '../../config';
import { generateWithSelectedModel } from '../unifiedAIService';
import { isFeatureEnabled } from '../../../utils/featureFlagMiddleware';
import {
  NARRATIVE_REVISION_SYSTEM,
  buildTemporalRevisionRequest,
  getRandomTemporalRevisionPrompt,
} from '../promptTemplates';

/**
 * Get a randomized corruption message for error handling
 * Improves narrative variety instead of using static error messages
 */
function getCorruptionMessage(): string {
  const corruptionMessages = [
    "The image flickers, as if reality itself is uncertain.",
    "A shadow passes over the canvas, distorting its features.",
    "The generated image is warped, echoing a distant scream.",
    "Colors bleed and shapes twist, as if haunted by unseen forces.",
    "A cold static fills the frame, obscuring all meaning.",
    "Fragments of the image pulse with unnatural energy.",
    "The AI hesitates, and the result is a surreal, corrupted vision.",
    "You sense something is wrong—the image is not what it should be.",
    "A glitch ripples through the scene, leaving only confusion.",
    "The boundaries of the image dissolve, lost to the void.",
    "[MEMORY FRAGMENT CORRUPTED: Reality fractures at the edges]",
    "[ERROR: TEMPORAL THREAD SEVERED]",
    "[SYSTEM NOTICE: Narrative coherence compromised]",
    "[CORRUPTION DETECTED: Adjusting reality parameters...]"
  ];

  return corruptionMessages[Math.floor(Math.random() * corruptionMessages.length)];
}

/**
 * TEMPORAL NARRATIVE REVISION
 * Uses AI to retroactively modify past story segments based on current choices
 * Creates the horror of "false memories" and unreliable narrator effects
 */
export class TemporalRevisionEngine {
  private revisionHistory: Map<string, string[]> = new Map();

  /**
   * Orchestrates the temporal revision process by analyzing choices,
   * determining revision points, generating new narratives, and applying changes.
   *
   * @param currentChoice - The player's current choice that may trigger temporal effects
   * @param storyHistory - The complete story history that may be revised
   * @param worldState - The current world state affecting revision probability and style
   * @returns A new story history array with revisions applied, or the original if no revision occurs
   */
  async reviseHistory(
    currentChoice: string,
    storyHistory: StorySegment[],
    worldState: WorldState
  ): Promise<StorySegment[]> {
    // Determine if we should proceed with temporal revision
    const shouldRevise = await this.analyzeChoiceForTemporalShift(
      currentChoice,
      storyHistory,
      worldState
    );

    if (!shouldRevise) {
      return storyHistory;
    }

    // Select which segment to revise
    const revisionPoint = this.determineRevisionPoints(storyHistory);
    if (!revisionPoint) {
      return storyHistory;
    }

    // Generate the revised narrative
    try {
      const revisedText = await this.generateRevisionNarrative(
        revisionPoint.segment,
        currentChoice,
        worldState,
        storyHistory
      );

      // Apply the revision to the history
      return this.applyRevisionToHistory(
        storyHistory,
        revisionPoint.segmentIndex,
        revisionPoint.segment,
        revisedText
      );
    } catch (error) {
      console.error('Temporal revision failed, creating corrupted segment:', error);

      // Fallback to corruption message on error
      const corruptedText = `[MEMORY FRAGMENT CORRUPTED: ${revisionPoint.segment.text}]`;
      return this.applyRevisionToHistory(
        storyHistory,
        revisionPoint.segmentIndex,
        revisionPoint.segment,
        corruptedText
      );
    }
  }

  /**
   * Analyzes whether the current choice should trigger a temporal shift.
   * Performs early validation checks and evaluates temporal impact probability.
   *
   * @param currentChoice - The player's current choice
   * @param storyHistory - The complete story history
   * @param worldState - Current world state affecting revision probability
   * @returns True if temporal revision should occur, false otherwise
   */
  private async analyzeChoiceForTemporalShift(
    currentChoice: string,
    storyHistory: StorySegment[],
    worldState: WorldState
  ): Promise<boolean> {
    // Early exit: Feature not enabled
    if (!isFeatureEnabled('TEMPORAL_REVISION')) {
      console.log('🚫 Temporal revision feature is disabled');
      return false;
    }

    // Early exit: Server-side rendering
    if (this.isServerSide()) {
      return false;
    }

    // Early exit: Not enough history to revise
    if (storyHistory.length <= 2) {
      return false;
    }

    // Evaluate temporal impact probability
    return await this.analyzeTemporalImpact(currentChoice, worldState);
  }

  /**
   * Determines which segment in the story history should be revised.
   * Randomly selects a segment to create unpredictable temporal inconsistencies.
   *
   * @param storyHistory - The complete story history
   * @returns An object containing the segment index and segment, or null if no valid target
   */
  private determineRevisionPoints(
    storyHistory: StorySegment[]
  ): { segmentIndex: number; segment: StorySegment } | null {
    if (storyHistory.length <= 1) {
      return null;
    }

    // Randomly select a segment (excluding the most recent one)
    const targetSegmentIndex = Math.floor(Math.random() * (storyHistory.length - 1));
    const targetSegment = storyHistory[targetSegmentIndex];

    return {
      segmentIndex: targetSegmentIndex,
      segment: targetSegment,
    };
  }

  /**
   * Generates a revised narrative for a given segment using AI.
   * Creates subtle but unsettling changes to past events that enhance horror.
   *
   * @param targetSegment - The segment to be revised
   * @param currentChoice - The player's current choice that triggered the revision
   * @param worldState - Current world state for context
   * @param storyHistory - Complete story history for context
   * @returns The revised narrative text
   * @throws Error if AI generation fails and no fallback is available
   */
  private async generateRevisionNarrative(
    targetSegment: StorySegment,
    currentChoice: string,
    worldState: WorldState,
    storyHistory: StorySegment[]
  ): Promise<string> {
    // Delegate to existing generation method
    return await this.generateRevisedSegment(
      targetSegment.text,
      currentChoice,
      worldState,
      storyHistory
    );
  }

  /**
   * Applies a revised narrative to the story history, maintaining revision tracking.
   * Creates a new history array with the revised segment and tracks original text.
   *
   * @param storyHistory - The original story history
   * @param targetSegmentIndex - Index of the segment to revise
   * @param targetSegment - The original segment being revised
   * @param revisedText - The new narrative text
   * @returns A new story history array with the revision applied
   */
  private applyRevisionToHistory(
    storyHistory: StorySegment[],
    targetSegmentIndex: number,
    targetSegment: StorySegment,
    revisedText: string
  ): StorySegment[] {
    // Store original text for player confusion tracking
    if (!this.revisionHistory.has(targetSegment.id)) {
      this.revisionHistory.set(targetSegment.id, [targetSegment.text]);
    }

    // Create new history array with the revised segment
    const revisedHistory = [...storyHistory];
    revisedHistory[targetSegmentIndex] = {
      ...targetSegment,
      text: revisedText,
      isRevised: true,
      originalText: targetSegment.text,
    };

    return revisedHistory;
  }

  private async analyzeTemporalImpact(choice: string, worldState: WorldState): Promise<boolean> {
    // Use AI to determine if choice has temporal significance
    const psychCorruption = 1 - (worldState.systemHealth / 100);
    const baseChance = isFeatureEnabled('TEMPORAL_REVISION') ? 0.2 : 0;

    return Math.random() < (baseChance + psychCorruption * 0.3);
  }

  private async generateRevisedSegment(
    originalText: string,
    currentChoice: string,
    worldState: WorldState,
    storyHistory: StorySegment[]
  ): Promise<string> {
    // Use centralized prompt templates for temporal revision
    const { systemInstruction, prompt } = buildTemporalRevisionRequest(originalText);

    // Use AI to generate actual revisions
    try {
      const commands = await generateWithSelectedModel(
        systemInstruction,
        prompt,
        worldState,
        storyHistory,
        'story'
      );

      if (commands[0]?.type === 'displayText') {
        return commands[0].payload.content;
      }
    } catch (error) {
      console.error('AI revision generation failed, propagating error:', error);
      throw error;
    }

    // Fallback to simple revision if AI fails
    return this.createPlausibleRevision(originalText, currentChoice);
  }

  private createPlausibleRevision(originalText: string, currentChoice: string): string {
    // Simple context-aware revision logic for placeholder purposes.
    const lowerChoice = currentChoice.toLowerCase();
    let revisedText = originalText;
    if (lowerChoice.includes('alone') || lowerChoice.includes('companion')) {
      // Subtly suggest the protagonist was not alone
      revisedText = originalText.replace(/\b(I|we|the protagonist)\b/gi, '$1 and someone else');
      return `${revisedText} (Was someone else there all along?)`;
    }
    if (lowerChoice.includes('hallucination') || lowerChoice.includes('unreal') || lowerChoice.includes('dream')) {
      // Imply hallucination or unreality
      return `${originalText} (But was any of this real?)`;
    }
    if (lowerChoice.includes('technology') || lowerChoice.includes('digital') || lowerChoice.includes('ai')) {
      // Imply digital interference
      return `${originalText} [Static crackles briefly distort your memory.]`;
    }
    if (lowerChoice.includes('fear') || lowerChoice.includes('paranoia')) {
      // Add a sense of paranoia
      return `${originalText} (You feel like you're being watched.)`;
    }
    // Default: introduce a subtle contradiction with randomized corruption
    return `${originalText} (${getCorruptionMessage()})`;
  }

  private isServerSide(): boolean {
    return typeof window === 'undefined';
  }
}