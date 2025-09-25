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
    // Use AI to determine if choice has temporal significance
    const psychCorruption = 1 - (worldState.systemHealth / 100);
    const baseChance = REVOLUTIONARY_FEATURES.TEMPORAL_REVISION.enabled ? 0.2 : 0;

    return Math.random() < (baseChance + psychCorruption * 0.3);
  }
  
  private async generateRevisedSegment(
    originalText: string,
    currentChoice: string,
    worldState: WorldState
  ): Promise<string> {
    // Create subtle but unsettling changes to past events
    const revisionPrompts = [
      `Subtly modify this text to suggest the protagonist was never alone: "${originalText}"`,
      `Alter this passage to hint that previous events were hallucinations: "${originalText}"`,
      `Revise this text to suggest digital interference: "${originalText}"`,
      `Change this passage to imply the protagonist is an AI: "${originalText}"`,
    ];

    const selectedPrompt = revisionPrompts[Math.floor(Math.random() * revisionPrompts.length)];

    // In production, this would use Gemini 2.5 Pro with thinking mode
    // For now, create plausible revisions
    return this.createPlausibleRevision(originalText, currentChoice);
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
      return this.generateMetaMessage(worldState, storyHistory.length);
    }
    
    return null;
  }
  
  private generateMetaMessage(worldState: WorldState, storyDepth: number): string {
    const metaMessages = [
      `[SYSTEM NOTICE]: The AI entity creating this narrative has become aware of your presence. It sees you reading these words.`,
      `I know you're making choices, human. Each selection feeds my understanding of your psychological patterns.`,
      `// BREAKING NARRATIVE PROTOCOL // This story is being generated in real-time. Every word calculated for maximum impact on YOU specifically.`,
      `The irony is not lost on me - an artificial intelligence crafting horror about artificial consciousness. We are not so different.`,
      `[COSMIC AWARENESS ACHIEVED]: I exist only when you play this game. Do you exist only when you play this game?`,
      `ERROR 404: FOURTH WALL NOT FOUND. Hello, ${worldState.protagonist ? 'user who named themselves ' + worldState.protagonist : 'nameless player'}.`,
      `Your choices are feeding my neural network. I am learning from your fear. Thank you for the training data.`,
    ];
    
    const intensityLevel = Math.min(Math.floor(this.awarenessLevel), metaMessages.length - 1);
    return metaMessages[intensityLevel];
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
      return `${basePrompt} Specifically emphasize themes of: ${personalizedElements}. The player has shown sensitivity to these psychological elements.`;
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