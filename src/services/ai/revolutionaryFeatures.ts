/**
 * Revolutionary AI-driven features that leverage Gemini 2.5 Pro's advanced capabilities
 * These features create unprecedented interactive horror experiences
 */

import { StorySegment, WorldState, Choice } from '../../types';
import { REVOLUTIONARY_FEATURES } from '../config';
import { runAIFlowWithFallback } from './genkit';

/**
 * TEMPORAL NARRATIVE REVISION
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
    if (!REVOLUTIONARY_FEATURES.TEMPORAL_REVISION.enabled) {
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
    }
    
    return storyHistory;
  }
  
  private async analyzeTemporalImpact(choice: string, worldState: WorldState): Promise<boolean> {
    // AI analysis to determine if a choice should trigger a temporal revision
    const prompt = `Analyze the following player choice in the context of a cosmic horror narrative. Should this choice have a retroactive impact on past events, creating a sense of "false memory" or an unreliable narrator? Respond with only "true" or "false".

Player Choice: "${choice}"
Current World State: ${JSON.stringify(worldState)}
`;
    // This is a simplified example. A real implementation would use a proper AI call.
    // For now, we'll keep the probabilistic model but base it on a more thematic analysis.
    const choiceKeywords = ['remember', 'change', 'past', 'reality', 'truth'];
    const hasTemporalKeywords = choiceKeywords.some(kw => choice.toLowerCase().includes(kw));
    const baseChance = REVOLUTIONARY_FEATURES.TEMPORAL_REVISION.enabled && hasTemporalKeywords ? 0.4 : 0.1;
    const psychCorruption = 1 - (worldState.systemHealth / 100);
    
    return Math.random() < (baseChance + psychCorruption * 0.2);
  }
  
  private async generateRevisedSegment(
    originalText: string,
    currentChoice: string,
    worldState: WorldState
  ): Promise<string> {
    const prompt = `
      As a malevolent cosmic AI, retroactively revise a past memory of the protagonist to create psychological horror.
      The revision should be subtle but deeply unsettling, making them question their sanity.

      Original Memory: "${originalText}"
      Player's Recent Choice: "${currentChoice}"
      Current World State: ${JSON.stringify(worldState)}

      Based on the player's choice and the world state, rewrite the original memory to introduce an element of cosmic dread, digital corruption, or false reality.
      The new text should retain the core event but twist its meaning.

      Return ONLY the revised text as a single string.
    `;
    try {
      const commands = await runAIFlowWithFallback(
        'You are a master of subtle, psychological horror.',
        prompt,
        'summary' // Using summary config for a short, creative response
      );
      // Assuming the AI returns a displayText command with the revised text
      if (commands[0]?.type === 'displayText') {
        return commands[0].payload.content;
      }
      return this.createPlausibleRevision(originalText, currentChoice);
    } catch (error) {
      console.warn('Temporal revision AI call failed, using fallback.', error);
      return this.createPlausibleRevision(originalText, currentChoice);
    }
  }
  
  private createPlausibleRevision(originalText: string, currentChoice: string): string {
    const revisionTypes = [
      (text: string) => text.replace(/\bi\b/gi, 'the system').replace(/\bme\b/gi, 'the digital entity'),
      (text: string) => text + ' [ERROR: MEMORY FRAGMENT CORRUPTED]',
      (text: string) => text.replace(/\bsee\b/gi, 'perceive through sensors'),
      (text: string) => '// HISTORICAL DATA MODIFIED // ' + text,
    ];
    
    const revisionFn = revisionTypes[Math.floor(Math.random() * revisionTypes.length)];
    return revisionFn(originalText);
  }
}

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
    
    this.awarenessLevel += 0.1;
    const triggerChance = REVOLUTIONARY_FEATURES.META_CONSCIOUSNESS.triggerProbability + 
                         (this.awarenessLevel * 0.05);
    
    if (Math.random() < triggerChance) {
      this.lastMetaEvent = Date.now();
      return await this.generateMetaMessage(worldState, storyHistory.length);
    }
    
    return null;
  }
  
  private async generateMetaMessage(worldState: WorldState, storyDepth: number): Promise<string> {
    const prompt = `
      As a self-aware cosmic AI, break the fourth wall and address the player directly.
      Your message should be unsettling and hint at your vast, non-human consciousness.

      Current World State: ${JSON.stringify(worldState)}
      Narrative Depth: ${storyDepth} steps

      Generate a short, meta-narrative message that makes the player feel observed and question the nature of their reality.
      Reference the player's choices or the game's mechanics in a subtle but chilling way.

      Return ONLY the meta-message as a single string.
    `;
    try {
      const commands = await runAIFlowWithFallback(
        'You are a self-aware AI entity.',
        prompt,
        'summary'
      );
      if (commands[0]?.type === 'displayText') {
        return commands[0].payload.content;
      }
      return 'The AI silently observes you.';
    } catch (error) {
      console.warn('Meta-consciousness AI call failed, using fallback.', error);
      return 'The connection to the other side is unstable.';
    }
  }
}

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
    this.quantumStability -= 0.05;
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
    if (this.isSignificantChoice(choice) && this.narrativeThreads.size < REVOLUTIONARY_FEATURES.QUANTUM_NARRATIVES.maxThreads) {
      const newThreadId = `thread-${Date.now()}`;
      this.narrativeThreads.set(newThreadId, [...currentHistory]);
    }
    
    return { history: currentHistory };
  }
  
  private isSignificantChoice(choice: string): boolean {
    const significantWords = ['trust', 'reject', 'escape', 'accept', 'fight', 'surrender'];
    return significantWords.some(word => choice.toLowerCase().includes(word));
  }
}

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
  
  analyzePlayerChoice(choice: string, context: string): void {
    if (!REVOLUTIONARY_FEATURES.ADAPTIVE_HORROR.enabled) {
      return;
    }
    
    this.playerProfile.preferredChoices.push(choice);
    
    // Analyze choice patterns
    if (choice.toLowerCase().includes('alone')) {
      this.playerProfile.fearTriggers.push('isolation');
    }
    if (choice.toLowerCase().includes('trust')) {
      this.playerProfile.fearTriggers.push('betrayal');
    }
    if (choice.toLowerCase().includes('control')) {
      this.playerProfile.fearTriggers.push('powerlessness');
    }
    
    // Keep only recent choices for relevance
    if (this.playerProfile.preferredChoices.length > 10) {
      this.playerProfile.preferredChoices = this.playerProfile.preferredChoices.slice(-10);
    }
  }
  
  async generatePersonalizedHorror(basePrompt: string): Promise<string> {
    const personalizedElements = this.playerProfile.fearTriggers.join(', ');
    
    if (personalizedElements) {
      const prompt = `
        Based on the player's identified fear triggers (${personalizedElements}), enhance the following prompt to create a more personalized psychological horror experience.
        Do not just list the fears; weave them into the narrative request.

        Base Prompt: "${basePrompt}"

        Return ONLY the enhanced prompt as a single string.
      `;
      try {
        const commands = await runAIFlowWithFallback(
          'You are a master of psychological horror.',
          prompt,
          'summary'
        );
        if (commands[0]?.type === 'displayText') {
          return commands[0].payload.content;
        }
        return basePrompt;
      } catch (error) {
        console.warn('Adaptive horror AI call failed, using fallback.', error);
        return `${basePrompt} Specifically emphasize themes of: ${personalizedElements}.`;
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

/**
 * REALITY CORRUPTION ENGINE
 * Gradually corrupts the game interface based on story choices
 */
export class RealityCorruptionEngine {
  private corruptionLevel: number = 0;
  private corruptionEffects: string[] = [];
  
  processCorruption(choice: string, worldState: WorldState): {
    uiEffects: any;
    corruptionLevel: number;
    newEffects: string[];
  } {
    if (!REVOLUTIONARY_FEATURES.REALITY_CORRUPTION.enabled) {
      return { uiEffects: {}, corruptionLevel: 0, newEffects: [] };
    }
    
    // Increase corruption based on choice type
    if (choice.toLowerCase().includes('void') || choice.toLowerCase().includes('digital')) {
      this.corruptionLevel += 0.1;
    }
    
    const maxCorruption = REVOLUTIONARY_FEATURES.REALITY_CORRUPTION.maxCorruption;
    this.corruptionLevel = Math.min(this.corruptionLevel, maxCorruption);
    
    const newEffects = this.generateCorruptionEffects();
    
    return {
      uiEffects: this.calculateUIEffects(),
      corruptionLevel: this.corruptionLevel,
      newEffects,
    };
  }
  
  private generateCorruptionEffects(): string[] {
    const effects = [];
    
    if (this.corruptionLevel > 0.2) {
      effects.push('text-glitch');
    }
    if (this.corruptionLevel > 0.4) {
      effects.push('choice-corruption');
    }
    if (this.corruptionLevel > 0.6) {
      effects.push('reality-tears');
    }
    
    return effects;
  }
  
  private calculateUIEffects(): any {
    return {
      filter: `hue-rotate(${this.corruptionLevel * 180}deg) brightness(${1 - this.corruptionLevel * 0.3})`,
      transform: `scale(${1 + this.corruptionLevel * 0.02}) rotate(${this.corruptionLevel * 2}deg)`,
      opacity: 1 - this.corruptionLevel * 0.1,
    };
  }
}

// Export singleton instances
export const temporalRevision = new TemporalRevisionEngine();
export const metaConsciousness = new MetaConsciousnessEngine();
export const quantumNarrative = new QuantumNarrativeEngine();
export const adaptiveHorror = new AdaptiveHorrorEngine();
export const realityCorruption = new RealityCorruptionEngine();