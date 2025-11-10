import { StorySegment, WorldState } from '../../../types';
import { generateWithSelectedModel } from '../unifiedAIService';
import { isFeatureEnabled, getFeatureConfig } from '../../../utils/featureFlagMiddleware';
import { buildChoiceSignificanceRequest } from '../promptTemplates';

/**
 * QUANTUM NARRATIVE ENGINE
 * Maintains multiple parallel story threads that can be switched between
 * Creates horror through inconsistent realities
 */
export class QuantumNarrativeEngine {
  private narrativeThreads: Map<string, StorySegment[]> = new Map();
  private activeThread: string = 'primary';
  private quantumStability: number = 1.0;

  async processQuantumChoice(
    choice: string,
    currentHistory: StorySegment[],
    worldState: WorldState
  ): Promise<{ history: StorySegment[], quantumShift?: boolean }> {
    // Feature gate with proper fallback that preserves current history
    if (!isFeatureEnabled('QUANTUM_NARRATIVES')) {
      console.log('🚫 Quantum narratives feature is disabled. Returning current history.');
      return { history: currentHistory };
    }

    // Store current thread
    this.narrativeThreads.set(this.activeThread, currentHistory);

    // Check for quantum instability
    this.quantumStability = Math.max(0, this.quantumStability - 0.05);
    const shouldShift = this.quantumStability < 0.7 && Math.random() < 0.3;

    if (shouldShift && this.narrativeThreads.size > 1) {
      // Switch to different narrative thread
      const availableThreads = Array.from(this.narrativeThreads.keys())
        .filter(thread => thread !== this.activeThread);

      if (availableThreads.length > 0) {
        this.activeThread = availableThreads[Math.floor(Math.random() * availableThreads.length)];
        const alternateHistory = this.narrativeThreads.get(this.activeThread) || currentHistory;

        // Add quantum shift notification
        const shiftSegment: StorySegment = {
          id: `quantum-shift-${Date.now()}`,
          text: '// QUANTUM NARRATIVE COLLAPSE // Reality shifts... you remember events differently now.',
          images: {},
          isQuantumShift: true,
        };

        return {
          history: [...alternateHistory, shiftSegment],
          quantumShift: true,
        };
      }
    }

    // Create new thread branch based on choice significance
    const maxThreads = getFeatureConfig('QUANTUM_NARRATIVES').maxThreads;
    if (await this.isSignificantChoice(choice, worldState, currentHistory) && this.narrativeThreads.size < maxThreads) {
      const newThreadId = `thread-${Date.now()}`;
      this.narrativeThreads.set(newThreadId, [...currentHistory]);
    }

    return { history: currentHistory };
  }

  private async isSignificantChoice(choice: string, worldState: WorldState, storyHistory: StorySegment[]): Promise<boolean> {
    const { systemInstruction, prompt } = buildChoiceSignificanceRequest(choice);

    try {
      const commands = await generateWithSelectedModel(
        systemInstruction,
        prompt,
        worldState,
        storyHistory,
        'story'
      );
      if (commands[0]?.type === 'displayText') {
        return commands[0].payload.content.toLowerCase().includes('yes');
      }
    } catch (error) {
      console.error('Significance analysis failed:', error);
    }

    return false;
  }
}