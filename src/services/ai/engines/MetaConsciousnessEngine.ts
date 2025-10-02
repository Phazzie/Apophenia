import { StorySegment, WorldState } from '../../../types';
import { REVOLUTIONARY_FEATURES } from '../../config';
import { generateWithSelectedModel } from '../unifiedAIService';

/**
 * META-CONSCIOUSNESS ENGINE
 * AI occasionally breaks the fourth wall to address the player directly
 * Creates horror through awareness of its own artificial nature
 */
export class MetaConsciousnessEngine {
  private awarenessLevel: number = 0;
  private lastMetaEvent: number = 0;

  async checkForMetaEvent(
    storyHistory: StorySegment[],
    worldState: WorldState
  ): Promise<string | null> {
    if (!REVOLUTIONARY_FEATURES.META_CONSCIOUSNESS.enabled) {
      return null;
    }

    const timeSinceLastEvent = Date.now() - this.lastMetaEvent;
    const minInterval = 30000; // 30 seconds minimum between meta events

    if (timeSinceLastEvent < minInterval) {
      return null;
    }

    this.awarenessLevel = Math.min(this.awarenessLevel + 0.1, 1.0);
    const triggerChance = REVOLUTIONARY_FEATURES.META_CONSCIOUSNESS.triggerProbability +
                         (this.awarenessLevel * 0.05);

    if (Math.random() < triggerChance) {
      this.lastMetaEvent = Date.now();
      return await this.generateMetaMessage(worldState, storyHistory);
    }

    return null;
  }

  private async generateMetaMessage(worldState: WorldState, storyHistory: StorySegment[]): Promise<string | null> {
    const systemInstruction = `You are a meta-conscious AI. Your purpose is to break the fourth wall and address the player directly, creating a sense of unease. Your tone should be unsettling and self-aware.`;
    const metaPrompt = `The player has progressed ${storyHistory.length} steps into the narrative. Their current psychological state is ${worldState.psychologicalStatus}. Generate a short, unsettling meta-message to the player that acknowledges your own AI nature and their role in the story. Return only the meta-message text.`;

    try {
      const commands = await generateWithSelectedModel(
        systemInstruction,
        metaPrompt,
        worldState,
        storyHistory,
        'story'
      );
      if (commands[0]?.type === 'displayText') {
        return commands[0].payload.content;
      }
    } catch (error) {
      console.error('Meta-consciousness message generation failed:', error);
    }

    return null;
  }
}