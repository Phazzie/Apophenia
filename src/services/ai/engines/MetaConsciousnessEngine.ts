import { StorySegment, WorldState } from '../../../types';
import { REVOLUTIONARY_FEATURES } from '../../config';
import { generateWithSelectedModel } from '../unifiedAIService';
import { isFeatureEnabled } from '../../../utils/featureFlagMiddleware';
import { buildMetaConsciousnessRequest } from '../promptTemplates';

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
    // Feature gate: Only check for meta events if META_CONSCIOUSNESS is enabled
    if (!isFeatureEnabled('META_CONSCIOUSNESS')) {
      console.log('🚫 Meta-consciousness feature is disabled');
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
    const { systemInstruction, prompt } = buildMetaConsciousnessRequest(
      storyHistory.length,
      worldState.psychologicalStatus
    );

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
      console.error('Meta-consciousness message generation failed:', error);
    }

    return null;
  }
}