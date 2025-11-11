import { StorySegment, WorldState } from '../../../types';
import { REVOLUTIONARY_FEATURES } from '../../config';
import { generateWithSelectedModel } from '../unifiedAIService';
import { StorageManager } from '../../../utils/storageUtils';
import { isFeatureEnabled } from '../../../utils/featureFlagMiddleware';
import { buildFearAnalysisRequest, buildPersonalizedHorrorRequest } from '../promptTemplates';

/**
 * ADAPTIVE HORROR ENGINE
 * Learns from player choice patterns to craft personalized psychological horror
 * Persists player profile across sessions using localStorage
 */

interface PlayerProfile {
  preferredChoices: string[];
  fearTriggers: string[];
  decisionPatterns: string[];
  psychologicalVulnerabilities: string[];
  lastUpdated: number;
}

const STORAGE_KEY = 'apophenia_player_profile';
const MAX_PROFILE_ITEMS = 15; // Increased from 10 for better profiling

const DEFAULT_PROFILE: PlayerProfile = {
  preferredChoices: [],
  fearTriggers: [],
  decisionPatterns: [],
  psychologicalVulnerabilities: [],
  lastUpdated: Date.now(),
};

export class AdaptiveHorrorEngine {
  private playerProfile: PlayerProfile;
  private storage: StorageManager<PlayerProfile>;

  constructor() {
    this.storage = new StorageManager(STORAGE_KEY, DEFAULT_PROFILE, false, true);
    this.playerProfile = this.loadProfileFromStorage();
  }

  /**
   * Load player profile from localStorage
   */
  private loadProfileFromStorage(): PlayerProfile {
    const profile = this.storage.load();

    if (profile.preferredChoices.length > 0 || profile.fearTriggers.length > 0) {
      console.log('📊 Loaded player profile from storage:', {
        fearTriggers: profile.fearTriggers.length,
        choices: profile.preferredChoices.length,
      });
    }

    return profile;
  }

  /**
   * Save player profile to localStorage
   */
  private saveProfileToStorage(): void {
    this.playerProfile.lastUpdated = Date.now();
    const success = this.storage.save(this.playerProfile);

    if (success) {
      console.log('💾 Saved player profile to storage');
    }
  }

  async analyzePlayerChoice(
    choice: string,
    context: string,
    worldState: WorldState,
    storyHistory: StorySegment[]
  ): Promise<void> {
    // Feature gate: Only analyze if ADAPTIVE_HORROR is enabled
    if (!isFeatureEnabled('ADAPTIVE_HORROR')) {
      console.log('🚫 Adaptive horror feature is disabled');
      return;
    }

    console.log('🧠 Analyzing player choice for fear profiling...');
    this.playerProfile.preferredChoices.push(choice);

    const previousChoices = this.playerProfile.preferredChoices.slice(-5);
    const { systemInstruction, prompt } = buildFearAnalysisRequest(
      choice,
      context,
      previousChoices
    );

    try {
      const response = await generateWithSelectedModel({
        prompt: systemInstruction + '\n\n' + prompt,
        context: {
          worldState: worldState as any,
          recentHistory: storyHistory as any,
          playerProfile: {} as any,
          genrePrompts: [],
          engineInstructions: [],
        },
      });

      if (response.commands[0]?.type === 'displayText') {
        const triggers = response.commands[0].payload.content
          .split(',')
          .map((t: string) => t.trim().toLowerCase())
          .filter((t: string) => t.length > 0);

        this.playerProfile.fearTriggers.push(...triggers);
        console.log('🎯 Identified fear triggers:', triggers);
      }
    } catch (error) {
      console.error('Player choice analysis failed:', error);
    }

    // Trim to most recent items for relevance
    if (this.playerProfile.preferredChoices.length > MAX_PROFILE_ITEMS) {
      this.playerProfile.preferredChoices = this.playerProfile.preferredChoices.slice(-MAX_PROFILE_ITEMS);
    }
    if (this.playerProfile.fearTriggers.length > MAX_PROFILE_ITEMS) {
      this.playerProfile.fearTriggers = this.playerProfile.fearTriggers.slice(-MAX_PROFILE_ITEMS);
    }

    // Save to localStorage after each analysis
    this.saveProfileToStorage();
  }

  async generatePersonalizedHorror(
    basePrompt: string,
    worldState: WorldState,
    storyHistory: StorySegment[]
  ): Promise<string> {
    const fearTriggers = this.getTopFearTriggers(3);

    if (fearTriggers.length === 0) {
      console.log('📝 No fear triggers yet, using base prompt');
      return basePrompt;
    }

    console.log('😱 Personalizing horror with triggers:', fearTriggers);

    const { systemInstruction, prompt } = buildPersonalizedHorrorRequest(
      basePrompt,
      fearTriggers,
      worldState.horrorIntensity || 5
    );

    try {
      const response = await generateWithSelectedModel({
        prompt: systemInstruction + '\n\n' + prompt,
        context: {
          worldState: worldState as any,
          recentHistory: storyHistory as any,
          playerProfile: {} as any,
          genrePrompts: [],
          engineInstructions: [],
        },
      });

      if (response.commands[0]?.type === 'displayText') {
        const enhanced = response.commands[0].payload.content;
        console.log('✨ Generated personalized horror prompt');
        return enhanced;
      }
    } catch (error) {
      console.error('Personalized horror generation failed:', error);
    }

    return basePrompt;
  }

  /**
   * Get the most common fear triggers
   */
  private getTopFearTriggers(count: number = 3): string[] {
    const triggerCounts = new Map<string, number>();
    
    this.playerProfile.fearTriggers.forEach(trigger => {
      triggerCounts.set(trigger, (triggerCounts.get(trigger) || 0) + 1);
    });
    
    return Array.from(triggerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([trigger]) => trigger);
  }

  getPlayerPsychProfile(): string {
    const topFears = this.getTopFearTriggers(3);
    const dominantFears = topFears.join(', ') || 'unknown fears';
    const choiceCount = this.playerProfile.preferredChoices.length;

    return `Player profile (${choiceCount} choices analyzed): Primary vulnerabilities to ${dominantFears}`;
  }

  /**
   * Get player profile for UI display
   */
  getProfileSummary(): {
    totalChoices: number;
    topFears: string[];
    lastUpdated: Date;
  } {
    return {
      totalChoices: this.playerProfile.preferredChoices.length,
      topFears: this.getTopFearTriggers(5),
      lastUpdated: new Date(this.playerProfile.lastUpdated),
    };
  }

  /**
   * Reset player profile (for testing or new game)
   */
  resetProfile(): void {
    this.playerProfile = {
      preferredChoices: [],
      fearTriggers: [],
      decisionPatterns: [],
      psychologicalVulnerabilities: [],
      lastUpdated: Date.now(),
    };
    this.saveProfileToStorage();
    console.log('🔄 Player profile reset');
  }
}