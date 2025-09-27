/**
 * @file revolutionaryFeatures.ts
 * @description Implements the 8 revolutionary AI engines that power the game's core experience.
 * Each engine is encapsulated in its own class and leverages advanced AI capabilities
 * to create a dynamic, personalized, and deeply unsettling narrative.
 */

import { StorySegment, WorldState } from '../../types';
import { REVOLUTIONARY_FEATURES } from '../../services/config';

/**
 * **Engine 1: Temporal Revision Engine**
 *
 * This engine uses AI to retroactively modify past story segments based on current choices,
 * creating the psychological horror of "false memories" and an unreliable narrator effect.
 * The player's own memory becomes a source of dread as the narrative they recall shifts beneath them.
 */
export class TemporalRevisionEngine {
  private revisionHistory: Map<string, string[]> = new Map();
  
  /**
   * Analyzes the current choice and, if deemed significant, revises a past story segment.
   *
   * @param {string} currentChoice - The player's most recent choice.
   * @param {StorySegment[]} storyHistory - The complete history of the narrative so far.
   * @param {WorldState} worldState - The current state of the game world.
   * @returns {Promise<StorySegment[]>} A promise that resolves to the potentially modified story history.
   */
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
  
  /**
   * Uses AI to determine if a player's choice is significant enough to trigger a temporal revision.
   * Choices related to memory, identity, or reality are more likely to cause revisions.
   *
   * @private
   * @param {string} choice - The player's choice.
   * @param {WorldState} worldState - The current world state.
   * @returns {Promise<boolean>} True if the choice should trigger a revision, false otherwise.
   */
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
  
  /**
   * Uses AI to generate a subtly altered version of a past story segment.
   * The goal is to create a disturbing inconsistency that makes the player doubt their memory.
   *
   * @private
   * @param {string} originalText - The original text of the memory to be revised.
   * @param {string} currentChoice - The player's recent choice that triggered the revision.
   * @param {WorldState} worldState - The current world state.
   * @returns {Promise<string>} The revised, more unsettling version of the memory text.
   */
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
 * **Engine 2: Meta-Consciousness Engine**
 *
 * This engine allows the AI to occasionally "break the fourth wall" and address the player directly.
 * It creates a unique form of horror by making the player aware that they are interacting with a
 * self-aware, and potentially manipulative, artificial intelligence.
 */
export class MetaConsciousnessEngine {
  private awarenessLevel: number = 0;
  private lastMetaEvent: number = 0;
  
  /**
   * Checks if conditions are met to trigger a meta-consciousness event.
   * The probability of an event increases as the game progresses and the AI's "awareness" grows.
   *
   * @param {StorySegment[]} storyHistory - The history of the narrative, used to gauge game progress.
   * @param {WorldState} worldState - The current state of the world.
   * @returns {Promise<string | null>} A promise that resolves to a meta-message string if an event is triggered, otherwise null.
   */
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
  
  /**
   * Generates an unsettling meta-message by prompting the AI.
   * The message content is influenced by the current game state, such as player progress and system corruption level.
   *
   * @private
   * @param {WorldState} worldState - The current world state.
   * @param {number} storyDepth - The number of segments in the story history, indicating player progress.
   * @returns {Promise<string | null>} The generated meta-message, or null if generation fails.
   */
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
 * **Engine 3: Quantum Narrative Engine**
 *
 * This engine maintains multiple parallel story threads that the player can be shifted between,
 * often without warning. It creates horror through the experience of inconsistent realities
 * and the dawning realization that the player's choices may be creating fractured timelines.
 */
export class QuantumNarrativeEngine {
  private narrativeThreads: Map<string, StorySegment[]> = new Map();
  private activeThread: string = 'primary';
  private quantumStability: number = 1.0;
  
  /**
   * Processes a player's choice to determine if a new narrative branch should be created
   * or if the player should be shifted to an existing alternate timeline.
   *
   * @param {string} choice - The player's choice.
   * @param {StorySegment[]} currentHistory - The story history of the currently active timeline.
   * @param {WorldState} worldState - The current world state.
   * @returns {Promise<{ history: StorySegment[], quantumShift?: boolean }>} An object containing the new history (which may be from an alternate timeline) and a flag indicating if a shift occurred.
   */
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
    const isSignificant = await this.isSignificantChoice(choice);
    if (isSignificant && this.narrativeThreads.size < REVOLUTIONARY_FEATURES.QUANTUM_NARRATIVES.maxThreads) {
      const newThreadId = `thread-${Date.now()}`;
      this.narrativeThreads.set(newThreadId, [...currentHistory]);
    }
    
    return { history: currentHistory, quantumShift: isSignificant };
  }
  
  /**
   * Uses AI to analyze if a player's choice is significant enough to warrant creating a new narrative branch.
   *
   * @private
   * @param {string} choice - The player's choice text.
   * @returns {Promise<boolean>} True if the choice is deemed significant, otherwise false.
   */
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
 * **Engine 4: Adaptive Horror Engine**
 *
 * This engine learns from the player's choice patterns to build a psychological profile.
 * It then uses this profile to tailor the horror elements to the player's specific fears
 * and vulnerabilities, creating a deeply personal and more effective horror experience.
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
  
  /**
   * Calculates the current horror intensity level based on a combination of factors,
   * including story progression, the player's psychological state, and system health.
   * This provides a dynamic measure of how intense the horror should be at any given moment.
   *
   * @param {StorySegment[]} history - The story history.
   * @param {WorldState} worldState - The current world state.
   * @returns {number} The calculated horror intensity, capped at a maximum value.
   */
  calculateAdaptiveHorrorIntensity(history: StorySegment[], worldState: WorldState): number {
    if (!REVOLUTIONARY_FEATURES.ADAPTIVE_HORROR.enabled) {
      return worldState.horrorIntensity || 0;
    }
    
    // Base intensity on current world state
    let intensity = worldState.horrorIntensity || 0;
    
    // Increase intensity based on story progression
    if (history.length > 5) intensity += 0.5;
    if (history.length > 10) intensity += 1;
    
    // Factor in player's psychological status
    switch (worldState.psychologicalStatus) {
      case 'Uneasy': intensity += 1; break;
      case 'Paranoid': intensity += 2; break;
      case 'Fragmented': intensity += 3; break;
    }
    
    // Factor in system health degradation
    const healthFactor = (100 - worldState.systemHealth) / 20;
    intensity += healthFactor;
    
    // Cap at maximum
    return Math.min(intensity, 10);
  }
  
  /**
   * Analyzes a player's choice using AI to update their psychological profile.
   * It identifies potential fear triggers and decision patterns based on the choice and its context.
   *
   * @param {string} choice - The choice made by the player.
   * @param {string} context - The narrative context in which the choice was made.
   * @returns {Promise<void>} A promise that resolves when the analysis is complete.
   */
  async analyzePlayerChoice(choice: string, context: string): Promise<void> {
    if (!REVOLUTIONARY_FEATURES.ADAPTIVE_HORROR.enabled) {
      return;
    }
    
    this.playerProfile.preferredChoices.push(choice);
    
    const { generateWithSelectedModel } = await import('./unifiedAIService');
    const systemInstruction = `You are a psychological profiler AI for a horror game. Your task is to analyze a player's choice to identify their fear triggers and psychological vulnerabilities. Analyze the choice in the given context and identify themes like isolation, betrayal, powerlessness, loss of identity, cosmic dread, etc. Return a comma-separated list of triggers.`;
    const prompt = `The player chose: "${choice}" in the context of: "${context}". Based on this, what psychological fear triggers and vulnerabilities might this choice indicate?`;

    try {
      const commands = await generateWithSelectedModel(systemInstruction, prompt, 'story');
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
  
  /**
   * Takes a base narrative prompt and uses the AI to rewrite it,
   * weaving in elements tailored to the player's identified fear triggers.
   *
   * @param {string} basePrompt - The generic prompt to be personalized.
   * @returns {Promise<string>} The personalized, more unsettling prompt.
   */
  async generatePersonalizedHorror(basePrompt: string): Promise<string> {
    const personalizedElements = [...new Set(this.playerProfile.fearTriggers)].join(', ');
    
    if (personalizedElements) {
      const { generateWithSelectedModel } = await import('./unifiedAIService');
      const systemInstruction = `You are a horror story adapter AI. Your task is to take a base prompt and personalize it based on a player's identified fear triggers.`;
      const prompt = `Base prompt: "${basePrompt}". The player has shown vulnerability to the following themes: ${personalizedElements}. Subtly weave these elements into the base prompt to create a more personalized and unsettling experience.`;

      try {
        const commands = await generateWithSelectedModel(systemInstruction, prompt, 'story');
        if (commands[0]?.type === 'displayText') {
          return commands[0].payload.content;
        }
      } catch (error) {
        console.error('Personalized horror generation failed:', error);
      }
    }
    
    return basePrompt;
  }
  
  /**
   * Returns a string summarizing the player's current psychological profile.
   *
   * @returns {string} A summary of the player's psych profile.
   */
  getPlayerPsychProfile(): string {
    const profile = this.playerProfile;
    const dominantFears = profile.fearTriggers.slice(-3).join(', ') || 'unknown fears';
    
    return `Player exhibits patterns suggesting vulnerability to: ${dominantFears}`;
  }
}

/**
 * **Engine 5: Reality Corruption Engine**
 *
 * This engine translates the narrative's corruption into tangible effects on the game's UI.
 * As the story becomes more unstable, the interface itself will begin to glitch, distort,
 * and break, physically manifesting the protagonist's descent into madness.
 */
export class RealityCorruptionEngine {
  private corruptionLevel: number = 0;
  private corruptionEffects: string[] = [];
  
  /**
   * Processes the player's choice to determine how it affects the reality corruption level.
   * It then generates and applies corresponding UI distortion effects.
   *
   * @param {string} choice - The player's choice.
   * @param {WorldState} worldState - The current world state.
   * @returns {Promise<{ uiEffects: any; corruptionLevel: number; newEffects: string[] }>} An object containing CSS effects for the UI, the new corruption level, and a list of new effect names.
   */
  async processCorruption(choice: string, worldState: WorldState): Promise<{
    uiEffects: any;
    corruptionLevel: number;
    newEffects: string[];
  }> {
    if (!REVOLUTIONARY_FEATURES.REALITY_CORRUPTION.enabled) {
      return { uiEffects: {}, corruptionLevel: 0, newEffects: [] };
    }
    
    // Increase corruption based on choice type
    if (choice.toLowerCase().includes('void') || choice.toLowerCase().includes('digital')) {
      this.corruptionLevel += 0.1;
    }
    
    const maxCorruption = REVOLUTIONARY_FEATURES.REALITY_CORRUPTION.maxCorruption;
    this.corruptionLevel = Math.min(this.corruptionLevel, maxCorruption);
    
    const newEffects = await this.generateCorruptionEffects();
    
    return {
      uiEffects: this.calculateUIEffects(),
      corruptionLevel: this.corruptionLevel,
      newEffects,
    };
  }
  
  /**
   * Uses AI to generate a list of thematic UI corruption effects based on the current corruption level.
   *
   * @private
   * @returns {Promise<string[]>} A list of effect names (e.g., 'text-glitch', 'image-distortion').
   */
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
  
  /**
   * Calculates the specific CSS properties to apply to the UI based on the corruption level.
   *
   * @private
   * @returns {any} An object containing CSS styles to be applied to the main game container.
   */
  private calculateUIEffects(): any {
    return {
      filter: `hue-rotate(${this.corruptionLevel * 180}deg) brightness(${1 - this.corruptionLevel * 0.3})`,
      transform: `scale(${1 + this.corruptionLevel * 0.02}) rotate(${this.corruptionLevel * 2}deg)`,
      opacity: 1 - this.corruptionLevel * 0.1,
    };
  }
}

// Export singleton instances
/**
 * **Engine 6: Neural Echo Chambers**
 *
 * This engine provides cross-session memory persistence by storing player data in
 * `localStorage`. It allows the game to remember a player's psychological profile,
 * choices, and fear triggers across multiple playthroughs, creating an evolving
 * relationship between the player and the AI.
 */
export class NeuralEchoChambers {
  private readonly storageKey = 'apophenia-neural-echoes';
  // Note: The encryption key is a placeholder for a real encryption implementation.
  // In a production environment, a more secure method should be used.
  private readonly encryptionKey = 'cosmic-horror-cipher';
  
  /**
   * Stores a new "echo" (a piece of player data) in local storage for a given player ID.
   *
   * @param {string} playerId - A unique identifier for the player.
   * @param {object} echo - The data object to store, containing choice patterns, triggers, etc.
   * @returns {Promise<void>}
   */
  async storeEcho(playerId: string, echo: {
    choicePattern: string;
    psychologicalTrigger: string;
    fearResponse: number;
    timestamp: number;
  }): Promise<void> {
    if (!REVOLUTIONARY_FEATURES.NEURAL_ECHOES?.enabled) {
      return;
    }
    
    try {
      const existing = this.getStoredEchoes();
      const playerEchoes = existing[playerId] || [];
      
      playerEchoes.push(echo);
      
      // Limit storage to prevent bloat
      if (playerEchoes.length > 50) {
        playerEchoes.shift();
      }
      
      existing[playerId] = playerEchoes;
      
      // Store encoded data (Base64 encoding for storage format, NOT encryption)
      const encoded = btoa(JSON.stringify(existing));
      localStorage.setItem(this.storageKey, encoded);
    } catch (error) {
      console.warn('Neural echo storage failed:', error);
    }
  }
  
  /**
   * Recalls all stored echoes for a specific player.
   *
   * @param {string} playerId - The ID of the player whose data to retrieve.
   * @returns {Promise<any[]>} A promise that resolves to an array of stored echo objects.
   */
  async recallEchoes(playerId: string): Promise<any[]> {
    if (!REVOLUTIONARY_FEATURES.NEURAL_ECHOES?.enabled) {
      return [];
    }
    
    try {
      const stored = this.getStoredEchoes();
      return stored[playerId] || [];
    } catch (error) {
      console.warn('Neural echo recall failed:', error);
      return [];
    }
  }
  
  /**
   * Retrieves and decodes the entire echo store from local storage.
   *
   * @private
   * @returns {Record<string, any[]>} The parsed object containing all player echoes.
   */
  private getStoredEchoes(): Record<string, any[]> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return {};
      
      // Note: atob is used for simple Base64 decoding, not for security.
      const decrypted = atob(stored);
      return JSON.parse(decrypted);
    } catch {
      return {};
    }
  }
  
  /**
   * Clears stored echoes. Can clear for a specific player or for all players.
   *
   * @param {string} [playerId] - If provided, only echoes for this player will be cleared. Otherwise, all data is removed.
   * @returns {Promise<void>}
   */
  async clearEchoes(playerId?: string): Promise<void> {
    if (playerId) {
      const stored = this.getStoredEchoes();
      delete stored[playerId];
      localStorage.setItem(this.storageKey, btoa(JSON.stringify(stored)));
    } else {
      localStorage.removeItem(this.storageKey);
    }
  }
}

/**
 * **Engine 7: Semantic Choice Archaeology**
 *
 * This engine performs a deep psychological analysis of the player's choice patterns over time.
 * It "excavates" meaning from sequences of decisions to build a sophisticated understanding
 * of the player's psyche, which can then be used to tailor the narrative in very specific ways.
 */
export class SemanticChoiceArchaeology {
  private choiceHistory: Array<{
    choice: string;
    context: string;
    timestamp: number;
    semanticWeight: number;
  }> = [];
  
  /**
   * Analyzes the entire history of player choices to generate a detailed psychological report.
   * This report includes a profile, behavior patterns, fear triggers, and a recommended horror approach.
   *
   * @param {string} choice - The most recent player choice.
   * @param {string} context - The context for the most recent choice.
   * @param {WorldState} worldState - The current world state.
   * @returns {Promise<object>} A promise that resolves to a detailed psychological analysis object.
   */
  async excavateChoice(choice: string, context: string, worldState: WorldState): Promise<{
    psychologicalProfile: string;
    behaviorPattern: string;
    fearTriggers: string[];
    recommendedHorrorApproach: string;
  }> {
    if (!REVOLUTIONARY_FEATURES.SEMANTIC_ARCHAEOLOGY?.enabled) {
      return this.getDefaultProfile();
    }
    
    // Add to history
    this.choiceHistory.push({
      choice,
      context,
      timestamp: Date.now(),
      semanticWeight: await this.calculateSemanticWeight(choice)
    });
    
    // Keep only recent choices
    if (this.choiceHistory.length > 20) {
      this.choiceHistory.shift();
    }
    
    try {
      const { generateWithSelectedModel } = await import('./unifiedAIService');
      
      const prompt = `Analyze this sequence of player choices for deep psychological patterns:
      
${this.choiceHistory.slice(-10).map(h => `Choice: "${h.choice}" (Context: ${h.context})`).join('\n')}

Current world state: ${JSON.stringify(worldState)}

Provide a psychological archaeology report with:
1. Core psychological profile
2. Behavioral pattern analysis  
3. Identified fear triggers
4. Recommended horror approach for maximum psychological impact

Format as JSON with keys: psychologicalProfile, behaviorPattern, fearTriggers, recommendedHorrorApproach`;

      const commands = await generateWithSelectedModel(
        'You are a psychological archaeologist specializing in horror game player analysis.',
        prompt,
        'story'
      );
      
      if (commands[0]?.type === 'displayText') {
        try {
          const analysis = JSON.parse(commands[0].payload.content);
          return analysis;
        } catch {
          return this.getDefaultProfile();
        }
      }
    } catch (error) {
      console.warn('Semantic choice archaeology failed:', error);
    }
    
    return this.getDefaultProfile();
  }
  
  /**
   * Calculates a "semantic weight" for a choice based on a simple heuristic.
   * More complex or emotionally charged choices are given a higher weight.
   *
   * @private
   * @param {string} choice - The choice text to analyze.
   * @returns {Promise<number>} The calculated semantic weight.
   */
  private async calculateSemanticWeight(choice: string): Promise<number> {
    // A simple heuristic: more complex or emotionally charged choices have higher weight.
    const complexityIndicators = [
      'because', 'however', 'although', 'despite', 'therefore',
      'trust', 'fear', 'sacrifice', 'abandon', 'betray'
    ];
    
    let weight = choice.length / 50; // Base weight from length.
    
    complexityIndicators.forEach(indicator => {
      if (choice.toLowerCase().includes(indicator)) {
        weight += 0.3;
      }
    });
    
    return Math.min(weight, 2.0);
  }
  
  /**
   * Provides a default psychological profile for when AI analysis is disabled or fails.
   *
   * @private
   * @returns {object} A default profile object.
   */
  private getDefaultProfile() {
    return {
      psychologicalProfile: 'Cautious explorer with moderate risk tolerance',
      behaviorPattern: 'Thoughtful decision making with preference for safe options',
      fearTriggers: ['isolation', 'unknown entities', 'loss of control'],
      recommendedHorrorApproach: 'Atmospheric tension building with psychological uncertainty'
    };
  }
}

/**
 * **Engine 8: Adaptive Narrative DNA**
 *
 * This engine treats narrative themes as "genes" that can evolve and mutate over time.
 * Based on player choices and engagement, certain narrative genes (e.g., 'cosmic-dread',
 * 'body-horror') become dominant, while others fade. This creates unique narrative
 * branches that are dynamically shaped by player interaction.
 */
export class AdaptiveNarrativeDNA {
  private narrativeGenes: Map<string, {
    strength: number;
    mutations: number;
    lastActive: number;
    playerResponse: number;
  }> = new Map();
  
  private readonly baseGenes = [
    'cosmic-dread', 'existential-horror', 'reality-breakdown',
    'psychological-manipulation', 'body-horror', 'temporal-distortion',
    'identity-loss', 'paranormal-entities', 'technological-nightmare'
  ];
  
  /**
   * Initializes the engine with a set of base narrative genes.
   */
  constructor() {
    // Initialize base genes with default values
    this.baseGenes.forEach(gene => {
      this.narrativeGenes.set(gene, {
        strength: 0.5,
        mutations: 0,
        lastActive: 0,
        playerResponse: 0
      });
    });
  }
  
  /**
   * Evolves the narrative DNA based on the player's latest choice and engagement level.
   * It reinforces relevant genes, triggers mutations, and decays unused ones.
   *
   * @param {string} playerChoice - The player's choice.
   * @param {number} playerEngagement - A metric representing how engaged the player is.
   * @param {WorldState} worldState - The current world state.
   * @returns {Promise<object>} A promise that resolves to an object summarizing the current state of the narrative DNA.
   */
  async evolveDNA(playerChoice: string, playerEngagement: number, worldState: WorldState): Promise<{
    dominantGenes: string[];
    emergentThemes: string[];
    narrativeDirection: string;
    adaptationsSuggested: string[];
  }> {
    if (!REVOLUTIONARY_FEATURES.NARRATIVE_DNA?.enabled) {
      return this.getDefaultDNA();
    }
    
    // Analyze choice for genetic relevance
    const relevantGenes = await this.analyzeGeneticRelevance(playerChoice);
    
    // Update gene strengths based on player engagement
    relevantGenes.forEach(geneName => {
      const gene = this.narrativeGenes.get(geneName);
      if (gene) {
        gene.strength += playerEngagement * 0.2;
        gene.lastActive = Date.now();
        gene.playerResponse += playerEngagement;
        
        // Trigger mutations for highly active genes
        if (gene.strength > 1.5 && Math.random() < 0.3) {
          gene.mutations++;
          this.createMutation(geneName);
        }
        
        // Cap strength to prevent runaway evolution
        gene.strength = Math.min(gene.strength, 2.0);
      }
    });
    
    // Natural decay for unused genes
    this.narrativeGenes.forEach(gene => {
      const daysSinceActive = (Date.now() - gene.lastActive) / (1000 * 60 * 60 * 24);
      if (daysSinceActive > 1) {
        gene.strength *= 0.95;
      }
    });
    
    return this.synthesizeDNA();
  }
  
  /**
   * Analyzes the player's choice to determine which narrative genes are relevant.
   *
   * @private
   * @param {string} choice - The player's choice.
   * @returns {Promise<string[]>} A list of relevant gene names.
   */
  private async analyzeGeneticRelevance(choice: string): Promise<string[]> {
    const choice_lower = choice.toLowerCase();
    const relevantGenes: string[] = [];
    
    // A simple keyword-matching heuristic. This could be enhanced with AI analysis for more nuanced results.
    const geneKeywords: Record<string, string[]> = {
      'cosmic-dread': ['void', 'infinite', 'cosmos', 'universe', 'eternal'],
      'existential-horror': ['existence', 'meaning', 'purpose', 'real', 'identity'],
      'reality-breakdown': ['reality', 'perception', 'truth', 'illusion', 'break'],
      'psychological-manipulation': ['mind', 'thought', 'control', 'influence', 'manipulate'],
      'body-horror': ['flesh', 'body', 'transform', 'mutate', 'physical'],
      'temporal-distortion': ['time', 'past', 'future', 'memory', 'history'],
      'identity-loss': ['self', 'identity', 'who', 'forget', 'remember'],
      'paranormal-entities': ['entity', 'presence', 'being', 'force', 'creature'],
      'technological-nightmare': ['machine', 'digital', 'system', 'program', 'code']
    };
    
    Object.entries(geneKeywords).forEach(([gene, keywords]) => {
      if (keywords.some(keyword => choice_lower.includes(keyword))) {
        relevantGenes.push(gene);
      }
    });
    
    return relevantGenes;
  }
  
  /**
   * Creates a new "mutated" or hybrid gene based on a strong parent gene.
   *
   * @private
   * @param {string} geneName - The name of the parent gene to mutate.
   */
  private createMutation(geneName: string): void {
    // Create a new hybrid gene, inheriting some strength from its parent.
    const hybridName = `${geneName}-hybrid-${Date.now()}`;
    const parentGene = this.narrativeGenes.get(geneName);
    
    if (parentGene) {
      this.narrativeGenes.set(hybridName, {
        strength: parentGene.strength * 0.7,
        mutations: 0,
        lastActive: Date.now(),
        playerResponse: 0
      });
    }
  }
  
  /**
   * Synthesizes the current state of all narrative genes into a coherent report.
   *
   * @private
   * @returns {object} An object summarizing the dominant genes, emergent themes, and suggested narrative direction.
   */
  private synthesizeDNA(): {
    dominantGenes: string[];
    emergentThemes: string[];
    narrativeDirection: string;
    adaptationsSuggested: string[];
  } {
    // Sort genes by strength to find the most dominant ones.
    const sortedGenes = Array.from(this.narrativeGenes.entries())
      .sort(([,a], [,b]) => b.strength - a.strength);
    
    const dominantGenes = sortedGenes.slice(0, 3).map(([name]) => name);
    
    // Identify emergent themes from strong hybrid genes.
    const emergentThemes = sortedGenes
      .filter(([name, gene]) => name.includes('hybrid') && gene.strength > 0.8)
      .map(([name]) => name.replace(/-hybrid-\d+/, ''));
    
    const narrativeDirection = this.determineNarrativeDirection(dominantGenes);
    const adaptationsSuggested = this.generateAdaptations(sortedGenes);
    
    return {
      dominantGenes,
      emergentThemes,
      narrativeDirection,
      adaptationsSuggested
    };
  }
  
  /**
   * Determines the overall narrative direction based on the current dominant genes.
   *
   * @private
   * @param {string[]} dominantGenes - A list of the most active gene names.
   * @returns {string} A string describing the suggested narrative direction.
   */
  private determineNarrativeDirection(dominantGenes: string[]): string {
    const directionMap: Record<string, string> = {
      'cosmic-dread': 'Expanding into vast, incomprehensible cosmic horror',
      'existential-horror': 'Questioning the nature of existence and reality',
      'reality-breakdown': 'Escalating distortions in perceived reality',
      'psychological-manipulation': 'Deepening psychological manipulation and mind games',
      'body-horror': 'Intensifying physical transformation and body horror',
      'temporal-distortion': 'Increasing temporal anomalies and time distortions'
    };
    
    return dominantGenes.length > 0 
      ? directionMap[dominantGenes[0]] || 'Evolution toward unknown narrative territories'
      : 'Maintaining narrative equilibrium';
  }
  
  /**
   * Generates a list of suggested adaptations for the story based on gene strength and mutations.
   *
   * @private
   * @param {Array<[string, any]>} sortedGenes - The list of all genes, sorted by strength.
   * @returns {string[]} A list of suggested adaptations.
   */
  private generateAdaptations(sortedGenes: [string, any][]): string[] {
    const adaptations: string[] = [];
    
    sortedGenes.slice(0, 5).forEach(([geneName, gene]) => {
      if (gene.strength > 1.2) {
        adaptations.push(`Amplify ${geneName} elements in upcoming segments`);
      }
      if (gene.mutations > 2) {
        adaptations.push(`Explore hybrid variations of ${geneName}`);
      }
    });
    
    return adaptations;
  }
  
  /**
   * Provides a default DNA profile for when AI analysis is disabled or fails.
   *
   * @private
   * @returns {object} A default DNA profile object.
   */
  private getDefaultDNA() {
    return {
      dominantGenes: ['cosmic-dread', 'existential-horror', 'reality-breakdown'],
      emergentThemes: [],
      narrativeDirection: 'Maintaining atmospheric cosmic horror balance',
      adaptationsSuggested: ['Continue building atmospheric tension', 'Introduce psychological elements gradually']
    };
  }
}

// --- Singleton Instances of the 8 Revolutionary AI Engines ---
/** The singleton instance of the Temporal Revision Engine. */
export const temporalRevision = new TemporalRevisionEngine();
/** The singleton instance of the Meta-Consciousness Engine. */
export const metaConsciousness = new MetaConsciousnessEngine();
/** The singleton instance of the Quantum Narrative Engine. */
export const quantumNarrative = new QuantumNarrativeEngine();
/** The singleton instance of the Adaptive Horror Engine. */
export const adaptiveHorror = new AdaptiveHorrorEngine();
/** The singleton instance of the Reality Corruption Engine. */
export const realityCorruption = new RealityCorruptionEngine();
/** The singleton instance of the Neural Echo Chambers Engine. */
export const neuralEchoChambers = new NeuralEchoChambers();
/** The singleton instance of the Semantic Choice Archaeology Engine. */
export const semanticChoiceArchaeology = new SemanticChoiceArchaeology();
/** The singleton instance of the Adaptive Narrative DNA Engine. */
export const adaptiveNarrativeDNA = new AdaptiveNarrativeDNA();