import { StorySegment, WorldState } from '../../../types';
import { REVOLUTIONARY_FEATURES } from '../../config';
import { generateWithSelectedModel } from '../unifiedAIService';
import { isFeatureEnabled, getFeatureConfig } from '../../../utils/featureFlagMiddleware';
import { buildCorruptionEffectsRequest } from '../promptTemplates';

type CorruptionUiEffects = {
  filter: string;
  transform: string;
  opacity: number;
};

export type RealityCorruptionResult = {
  uiEffects: CorruptionUiEffects;
  corruptionLevel: number;
  newEffects: string[];
};

/**
 * REALITY CORRUPTION ENGINE
 * Gradually corrupts the game interface based on story choices
 */
export class RealityCorruptionEngine {
  private corruptionLevel: number = 0;

  async processCorruption(
    choice: string,
    worldState: WorldState,
    storyHistory: StorySegment[]
  ): Promise<RealityCorruptionResult> {
    if (!isFeatureEnabled('REALITY_CORRUPTION')) {
      console.log('🚫 Reality corruption feature is disabled');
      return { uiEffects: this.calculateUIEffects(), corruptionLevel: 0, newEffects: [] };
    }

    // Increase corruption based on choice type
    if (choice.toLowerCase().includes('void') || choice.toLowerCase().includes('digital')) {
      this.corruptionLevel += 0.1;
    }

    const { maxCorruption } = getFeatureConfig('REALITY_CORRUPTION');
    this.corruptionLevel = Math.min(this.corruptionLevel, maxCorruption);

    const newEffects = await this.generateCorruptionEffects(
      worldState,
      storyHistory
    );

    return {
      uiEffects: this.calculateUIEffects(),
      corruptionLevel: this.corruptionLevel,
      newEffects,
    };
  }

  private async generateCorruptionEffects(
    worldState: WorldState,
    storyHistory: StorySegment[]
  ): Promise<string[]> {
    const { systemInstruction, prompt } = buildCorruptionEffectsRequest(this.corruptionLevel);

    try {
      const commands = await generateWithSelectedModel(
        systemInstruction,
        prompt,
        worldState,
        storyHistory,
        'story'
      );
      if (commands[0]?.type === 'displayText') {
        return commands[0].payload.content.split(',').map(t => t.trim());
      }
    } catch (error) {
      console.error('Corruption effect generation failed:', error);
    }

    return [];
  }

  private calculateUIEffects(): CorruptionUiEffects {
    return {
      filter: `hue-rotate(${this.corruptionLevel * 180}deg) brightness(${1 - this.corruptionLevel * 0.3})`,
      transform: `scale(${1 + this.corruptionLevel * 0.02}) rotate(${this.corruptionLevel * 2}deg)`,
      opacity: 1 - this.corruptionLevel * 0.1,
    };
  }
}