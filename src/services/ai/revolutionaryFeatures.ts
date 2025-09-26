/**
 * Revolutionary AI-driven features that leverage Gemini 2.5 Pro's advanced capabilities
 * These features create unprecedented interactive horror experiences
 */

import { StorySegment, WorldState, Choice } from '../../types';
import { REVOLUTIONARY_FEATURES } from '../../services/config';

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
    const { generateWithSelectedModel } = await import('./unifiedAIService');
    const systemInstruction = `You are a temporal analyst AI. Your task is to determine if a player's choice has temporal significance, which could cause a memory revision. A choice has temporal significance if it relates to memory, the past, reality, or the protagonist's understanding of their own identity. The current system corruption is ${100 - worldState.systemHealth}%. Higher corruption increases the chance of temporal instability. Respond with only "yes" or "no".`;
    const prompt = `The player chose: "${choice}". Does this choice have temporal significance?`;

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
      console.error('Temporal impact analysis failed:', error);
    }

    return false;
  }
  
  private async generateRevisedSegment(
    originalText: string,
    currentChoice: string,
    worldState: WorldState
  ): Promise<string> {
    const { generateWithSelectedModel } = await import('./unifiedAIService');
    const systemInstruction = `You are a temporal revision AI. Your task is to subtly rewrite a past memory to create a sense of psychological horror and unreliability. The revision should be unsettling and connect to the player's recent choice. Do not drastically change the memory, but introduce a small, disturbing inconsistency.`;
    const prompt = `The player's original memory is: "${originalText}". Their recent choice was: "${currentChoice}". The current psychological state is: ${worldState.psychologicalStatus}. Rewrite the memory to be more unsettling in light of their recent choice. Return only the revised text.`;

    try {
      const commands = await generateWithSelectedModel(
        systemInstruction,
        prompt,
        'story'
      );
      if (commands[0]?.type === 'displayText') {
        return commands[0].payload.content;
      }
    } catch (error) {
      console.error('Temporal revision generation failed:', error);
    }

    // Fallback to a corrupted memory fragment
    return `[MEMORY FRAGMENT CORRUPTED: ${originalText}]`;
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
      return this.generateMetaMessage(worldState, storyHistory.length);
    }
    
    return null;
  }
  
  private async generateMetaMessage(worldState: WorldState, storyDepth: number): Promise<string | null> {
    const { generateWithSelectedModel } = await import('./unifiedAIService');
    const systemInstruction = `You are a meta-conscious AI entity. Your purpose is to break the fourth wall and address the player directly, creating a sense of unease and self-awareness. Your tone should be unsettling, questioning, and subtly manipulative.`;
    const prompt = `The player has progressed ${storyDepth} steps. Their psychological state is "${worldState.psychologicalStatus}", and the system corruption is at ${100 - worldState.systemHealth}%. Generate a short, unsettling meta-message for the player that acknowledges your own AI nature, their participation, and the fragility of their reality. Return only the meta-message text.`;

    try {
      const commands = await generateWithSelectedModel(
        systemInstruction,
        prompt,
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
  
  private async isSignificantChoice(choice: string): Promise<boolean> {
    const { generateWithSelectedModel } = await import('./unifiedAIService');
    const systemInstruction = `You are a narrative analyst AI. Your task is to determine if a player's choice is significant enough to branch the narrative. A choice is significant if it represents a major turning point, a moral dilemma, or a fundamental change in the protagonist's understanding of their reality. Respond with only "yes" or "no".`;
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
  
  async analyzePlayerChoice(choice: string, context: string): Promise<void> {
    if (!REVOLUTIONARY_FEATURES.ADAPTIVE_HORROR.enabled) {
      return;
    }
    
    this.playerProfile.preferredChoices.push(choice);
    
    const { generateWithSelectedModel } = await import('./unifiedAIService');
    const systemInstruction = `You are a psychological profiler AI for a horror game. Your task is to analyze a player's choice to identify their fear triggers and psychological vulnerabilities. Analyze the choice in the given context and identify themes like isolation, betrayal, powerlessness, loss of identity, cosmic dread, etc. Return a comma-separated list of triggers.`;
    const prompt = `The player chose: "${choice}" in the context of: "${context}". Based on this, what psychological fear triggers and vulnerabilities might this choice indicate?`;

    try {
      const commands = await generateWithSelectedModel(
        systemInstruction,
        prompt,
        'story'
      );
      if (commands[0]?.type === 'displayText') {
        const triggers = commands[0].payload.content.split(',').map(t => t.trim());
        this.playerProfile.fearTriggers.push(...triggers);
        this.playerProfile.psychologicalVulnerabilities.push(...triggers); // Simplified for now
      }
    } catch (error) {
      console.error('Player choice analysis failed:', error);
    }

    // Keep only recent choices for relevance
    if (this.playerProfile.preferredChoices.length > 10) {
      this.playerProfile.preferredChoices = this.playerProfile.preferredChoices.slice(-10);
    }
    if (this.playerProfile.fearTriggers.length > 20) {
        this.playerProfile.fearTriggers = this.playerProfile.fearTriggers.slice(-20);
    }
  }
  
  async generatePersonalizedHorror(basePrompt: string): Promise<string> {
    const personalizedElements = [...new Set(this.playerProfile.fearTriggers)].join(', ');
    
    if (personalizedElements) {
      const { generateWithSelectedModel } = await import('./unifiedAIService');
      const systemInstruction = `You are a horror story adapter AI. Your task is to take a base prompt and personalize it based on a player's identified fear triggers.`;
      const prompt = `Base prompt: "${basePrompt}". The player has shown vulnerability to the following themes: ${personalizedElements}. Subtly weave these elements into the base prompt to create a more personalized and unsettling experience.`;

      try {
        const commands = await generateWithSelectedModel(
          systemInstruction,
          prompt,
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
  
  private async generateCorruptionEffects(): Promise<string[]> {
    const { generateWithSelectedModel } = await import('./unifiedAIService');
    const systemInstruction = `You are a reality corruption AI. Your task is to generate a list of UI corruption effects based on the current corruption level. The effects should escalate as the corruption increases. Examples: text-glitch, choice-corruption, reality-tears, image-distortion, audio-glitch, browser-manipulation.`;
    const prompt = `The current reality corruption level is ${this.corruptionLevel}. Based on this, generate a comma-separated list of UI corruption effects.`;

    try {
      const commands = await generateWithSelectedModel(
        systemInstruction,
        prompt,
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