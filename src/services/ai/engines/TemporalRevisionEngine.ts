import { StorySegment, WorldState } from '../../../types';
import { REVOLUTIONARY_FEATURES } from '../../config';
import { generateWithSelectedModel } from '../unifiedAIService';

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

  async reviseHistory(
    currentChoice: string,
    storyHistory: StorySegment[],
    worldState: WorldState
  ): Promise<StorySegment[]> {
    if (!REVOLUTIONARY_FEATURES.TEMPORAL_REVISION.enabled) {
      return storyHistory;
    }

    if (this.isServerSide()) {
      return storyHistory;
    }

    // AI analyzes if current choice should alter past events
    const shouldRevise = await this.analyzeTemporalImpact(currentChoice, worldState);

    if (shouldRevise && storyHistory.length > 2) {
      const targetSegmentIndex = Math.floor(Math.random() * (storyHistory.length - 1));
      const targetSegment = storyHistory[targetSegmentIndex];

      // Store original text for player confusion
      if (!this.revisionHistory.has(targetSegment.id)) {
        this.revisionHistory.set(targetSegment.id, [targetSegment.text]);
      }

      // AI generates revised version that creates horror through inconsistency
      try {
        const revisedText = await this.generateRevisedSegment(
          targetSegment.text,
          currentChoice
        );

        // Update the segment
        const revisedHistory = [...storyHistory];
        revisedHistory[targetSegmentIndex] = {
          ...targetSegment,
          text: revisedText,
          isRevised: true,
          originalText: targetSegment.text,
        };

        return revisedHistory;
      } catch (error) {
          console.error('Temporal revision failed, creating corrupted segment:', error);
          const revisedHistory = [...storyHistory];
          revisedHistory[targetSegmentIndex] = {
              ...targetSegment,
              text: `[MEMORY FRAGMENT CORRUPTED: ${targetSegment.text}]`,
              isRevised: true,
              originalText: targetSegment.text,
          };
          return revisedHistory;
      }
    }

    return storyHistory;
  }

  private async analyzeTemporalImpact(choice: string, worldState: WorldState): Promise<boolean> {
    // Use AI to determine if choice has temporal significance
    const psychCorruption = 1 - (worldState.systemHealth / 100);
    const baseChance = REVOLUTIONARY_FEATURES.TEMPORAL_REVISION.enabled ? 0.2 : 0;

    return Math.random() < (baseChance + psychCorruption * 0.3);
  }

  private async generateRevisedSegment(
    originalText: string,
    currentChoice: string
  ): Promise<string> {
    // Create subtle but unsettling changes to past events
    const revisionPrompts = [
      `Subtly modify this text to suggest the protagonist was never alone: "${originalText}"`,
      `Alter this passage to hint that previous events were hallucinations: "${originalText}"`,
      `Revise this text to suggest digital interference: "${originalText}"`,
      `Change this passage to imply the protagonist is an AI: "${originalText}"`,
    ];

    const selectedPrompt = revisionPrompts[Math.floor(Math.random() * revisionPrompts.length)];

    // Use AI to generate actual revisions
    try {
      const systemInstruction = `You are a narrative revision AI. Your task is to subtly alter story text to create unsettling inconsistencies and false memories. Be subtle but impactful.`;

      const commands = await generateWithSelectedModel(
        systemInstruction,
        selectedPrompt,
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