import { StorySegment, WorldState } from '../../../types';
import { generateWithSelectedModel } from '../unifiedAIService';

/**
 * QUANTUM NARRATIVE ENGINE
 * Maintains multiple parallel story threads that can be switched between
 * Creates horror through inconsistent realities
 * 
 * FIXED: Critical Issue #1 - Missing AI Call Timeouts
 * All generateWithSelectedModel calls now include proper timeout protection via the unified service
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
    // Check if feature is enabled (mock check)
    const REVOLUTIONARY_FEATURES = { QUANTUM_NARRATIVES: { enabled: true, maxThreads: 3 } };
    
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

  /**
   * FIXED: Critical Issue #1 - Missing AI Call Timeouts
   * This method now uses generateWithSelectedModel which includes proper timeout protection
   * The unifiedAIService handles the 6000ms timeout with graceful fallback
   */
  private async isSignificantChoice(choice: string): Promise<boolean> {
    const systemInstruction = `You are a narrative analyst AI. Your task is to determine if a player's choice is significant enough to branch the narrative. Respond with "yes" or "no".`;
    const prompt = `The player chose: "${choice}". Is this choice significant enough to create a new narrative branch?`;

    try {
      // This call now includes timeout protection via unifiedAIService
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