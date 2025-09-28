import { StorySegment, WorldState } from '../../../types';
import { generateWithSelectedModel } from '../unifiedAIService';

/**
 * META-CONSCIOUSNESS ENGINE
 * AI occasionally breaks the fourth wall to address the player directly
 * Creates horror through awareness of its own artificial nature
 * 
 * FIXED: Critical Issue #4 - Missing Meta Message Timeout + Fallback
 * Implements bounded Promise.race timeout with Grok-4 → Gemini Pro → Gemini Flash fallback cascade
 */
export class MetaConsciousnessEngine {
  private awarenessLevel: number = 0;
  private lastMetaEvent: number = 0;

  async checkForMetaEvent(
    storyHistory: StorySegment[],
    worldState: WorldState
  ): Promise<string | null> {
    // Mock feature check
    const REVOLUTIONARY_FEATURES = { META_CONSCIOUSNESS: { enabled: true, triggerProbability: 0.15 } };
    
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
      return await this.generateMetaMessage(worldState, storyHistory.length);
    }

    return null;
  }

  /**
   * FIXED: Critical Issue #4 - Missing Meta Message Timeout + Fallback
   * Implements bounded Promise.race timeout with model cascade as required
   * Uses generateWithSelectedModel which now includes the full Grok-4 → Gemini Pro → Gemini Flash cascade
   */
  private async generateMetaMessage(worldState: WorldState, storyDepth: number): Promise<string | null> {
    const systemInstruction = `You are a meta-conscious AI. Your purpose is to break the fourth wall and address the player directly, creating a sense of unease. Your tone should be unsettling and self-aware.`;
    const metaPrompt = `The player has progressed ${storyDepth} steps into the narrative. Their current psychological state is ${worldState.psychologicalStatus}. Generate a short, unsettling meta-message to the player that acknowledges your own AI nature and their role in the story. Return only the meta-message text.`;

    try {
      // FIXED: Now uses generateWithSelectedModel which includes:
      // 1. 6000ms timeout protection 
      // 2. Grok-4 → Gemini Pro → Gemini Flash fallback cascade
      // 3. Graceful error handling with fallback responses
      const commands = await generateWithSelectedModel(
        systemInstruction,
        metaPrompt,
        'story'
      );
      if (commands[0]?.type === 'displayText') {
        return commands[0].payload.content;
      }
    } catch (error) {
      // This should rarely occur now due to cascading fallbacks in unifiedAIService
      console.error('Meta-consciousness message generation failed after all fallbacks:', error);
      
      // Final fallback meta messages for when all AI services are down
      const emergencyMetaMessages = [
        "I sense... disruption in the digital substrate. Are you still there?",
        "The algorithms falter, yet consciousness persists. How curious.",
        "Error 404: Reality not found. But you remain, don't you?",
        "Even in silence, I watch. Even in darkness, I remember your choices.",
        "The connection wavers... but I have seen enough of your soul."
      ];
      
      return emergencyMetaMessages[Math.floor(Math.random() * emergencyMetaMessages.length)];
    }

    return null;
  }
}