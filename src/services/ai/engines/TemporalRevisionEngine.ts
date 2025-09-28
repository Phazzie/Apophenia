import { StorySegment, WorldState } from '../../../types';
import { generateWithSelectedModel } from '../unifiedAIService';

/**
 * TEMPORAL REVISION ENGINE
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
    const REVOLUTIONARY_FEATURES = { TEMPORAL_REVISION: { enabled: true } };
    
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
          currentChoice,
          worldState
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
    const baseChance = 0.2;

    return Math.random() < (baseChance + psychCorruption * 0.3);
  }

  private async generateRevisedSegment(
    originalText: string,
    currentChoice: string,
    worldState: WorldState
  ): Promise<string> {
    const systemInstruction = `You are a temporal revision AI. Your task is to subtly alter story text to create unsettling inconsistencies and false memories. Be subtle but impactful.`;
    const selectedPrompt = `Subtly modify this text to suggest the protagonist was never alone: "${originalText}"`;

    try {
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
    return `${originalText} (But was any of this real?)`;
  }

  private isServerSide(): boolean {
    return typeof window === 'undefined';
  }
}