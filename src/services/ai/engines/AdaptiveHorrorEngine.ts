import { StorySegment, WorldState } from '../../../types';
import { REVOLUTIONARY_FEATURES } from '../../config';
import { generateWithSelectedModel } from '../unifiedAIService';

/**
 * ADAPTIVE HORROR ENGINE
 * Learns from player choice patterns to craft personalized psychological horror
 */
export class AdaptiveHorrorEngine {
  private playerProfile: {
    preferredChoices: string[];
    fearTriggers: string[];
    decisionPatterns: string[];
    psychologicalVulnerabilities: string[];
  } = {
    preferredChoices: [],
    fearTriggers: [],
    decisionPatterns: [],
    psychologicalVulnerabilities: [],
  };

  async analyzePlayerChoice(
    choice: string,
    context: string,
    worldState: WorldState,
    storyHistory: StorySegment[]
  ): Promise<void> {
    if (!REVOLUTIONARY_FEATURES.ADAPTIVE_HORROR.enabled) {
      return;
    }

    this.playerProfile.preferredChoices.push(choice);

    const systemInstruction = `You are a psychological profiler AI. Your task is to analyze a player's choice in a horror game and identify their potential fear triggers.`;
    const prompt = `The player chose: "${choice}" in the context of: "${context}". Based on this, what psychological fear triggers might this choice indicate? Examples: isolation, betrayal, powerlessness, loss of identity, cosmic dread. Return a comma-separated list of triggers.`;

    try {
      const commands = await generateWithSelectedModel(
        systemInstruction,
        prompt,
        worldState,
        storyHistory,
        'story'
      );
      if (commands[0]?.type === 'displayText') {
        const triggers = commands[0].payload.content.split(',').map(t => t.trim());
        this.playerProfile.fearTriggers.push(...triggers);
      }
    } catch (error) {
      console.error('Player choice analysis failed:', error);
    }

    // Keep only recent choices for relevance
    if (this.playerProfile.preferredChoices.length > 10) {
      this.playerProfile.preferredChoices = this.playerProfile.preferredChoices.slice(-10);
    }
    if (this.playerProfile.fearTriggers.length > 10) {
      this.playerProfile.fearTriggers = this.playerProfile.fearTriggers.slice(-10);
    }
  }

  async generatePersonalizedHorror(
    basePrompt: string,
    worldState: WorldState,
    storyHistory: StorySegment[]
  ): Promise<string> {
    const personalizedElements = this.playerProfile.fearTriggers.join(', ');

    if (personalizedElements) {
      const systemInstruction = `You are a horror story adapter AI. Your task is to take a base prompt and personalize it based on a player's fear triggers.`;
      const prompt = `Base prompt: "${basePrompt}". Player's fear triggers: ${personalizedElements}. Enhance the base prompt to incorporate these fears.`;

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
        console.error('Personalized horror generation failed:', error);
      }
    }

    return basePrompt;
  }

  getPlayerPsychProfile(): string {
    const profile = this.playerProfile;
    const dominantFears = profile.fearTriggers.slice(-3).join(', ') || 'unknown fears';

    return `Player exhibits patterns suggesting vulnerability to: ${dominantFears}`;
  }
}