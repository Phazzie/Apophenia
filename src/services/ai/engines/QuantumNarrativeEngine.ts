import { StorySegment, WorldState } from '../../../types';
import { REVOLUTIONARY_FEATURES } from '../../config';
import { generateWithSelectedModel } from '../unifiedAIService';

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
    if (!REVOLUTIONARY_FEATURES.QUANTUM_NARRATIVES.enabled) {
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
    if (await this.isSignificantChoice(choice) && this.narrativeThreads.size < REVOLUTIONARY_FEATURES.QUANTUM_NARRATIVES.maxThreads) {
      const newThreadId = `thread-${Date.now()}`;
      this.narrativeThreads.set(newThreadId, [...currentHistory]);
    }

    return { history: currentHistory };
  }

  private async isSignificantChoice(choice: string): Promise<boolean> {
    const systemInstruction = `You are a narrative analyst AI. Your task is to determine if a player's choice is significant enough to branch the narrative. Respond with "yes" or "no".`;
    const prompt = `The player chose: "${choice}". Is this choice significant enough to create a new narrative branch?`;

    try {
      const commands = await generateWithSelectedModel(
        systemInstruction,
        prompt,
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