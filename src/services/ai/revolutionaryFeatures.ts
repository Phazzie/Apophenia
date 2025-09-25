/**
 * Revolutionary AI-driven features that leverage Gemini 2.5 Pro's advanced capabilities
 * These features create unprecedented interactive horror experiences
 */

import { StorySegment, WorldState, Choice } from '../../types';
import { REVOLUTIONARY_FEATURES } from '../../services/config';

/**
 * Get a randomized corruption message for error handling
 * Improves narrative variety instead of using static error messages
 */
function getCorruptionMessage(): string {
  const corruptionMessages = [
    "The image flickers, as if reality itself is uncertain.",
    "A shadow passes over the canvas, distorting its features.",
    "The generated image is warped, echoing a distant scream.",
    "Colors bleed and shapes twist, as if haunted by unseen forces.",
    "A cold static fills the frame, obscuring all meaning.",
    "Fragments of the image pulse with unnatural energy.",
    "The AI hesitates, and the result is a surreal, corrupted vision.",
    "You sense something is wrong—the image is not what it should be.",
    "A glitch ripples through the scene, leaving only confusion.",
    "The boundaries of the image dissolve, lost to the void.",
    "[MEMORY FRAGMENT CORRUPTED: Reality fractures at the edges]",
    "[ERROR: TEMPORAL THREAD SEVERED]",
    "[SYSTEM NOTICE: Narrative coherence compromised]",
    "[CORRUPTION DETECTED: Adjusting reality parameters...]"
  ];

  return corruptionMessages[Math.floor(Math.random() * corruptionMessages.length)];
}

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
      try {
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
      } catch (error) {
          console.error('Temporal revision failed, creating corrupted segment:', error);
          const revisedHistory = [...storyHistory];
          revisedHistory[targetSegmentIndex] = {
              ...targetSegment,
              text: `[MEMORY FRAGMENT CORRUPTED: ${targetSegment.text}]`,
              isRevised: true,
              originalText: targetSegment.text,
          };
          return revisedHistory;
      }
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
    
    // Use AI to generate actual revisions
    try {
      const { generateWithSelectedModel } = await import('./unifiedAIService');
      const systemInstruction = `You are a narrative revision AI. Your task is to subtly alter story text to create unsettling inconsistencies and false memories. Be subtle but impactful.`;
      
      const commands = await generateWithSelectedModel(
        systemInstruction,
        selectedPrompt,
        'story'
      );
      
      if (commands[0]?.type === 'displayText') {
        return commands[0].payload.content;
      }
    } catch (error) {
      console.error('AI revision generation failed, using fallback:', error);
    }
    
    // Fallback to simple revision if AI fails
    return this.createPlausibleRevision(originalText, currentChoice);
  }

  private createPlausibleRevision(originalText: string, currentChoice: string): string {
    // Simple context-aware revision logic for placeholder purposes.
    const lowerChoice = currentChoice.toLowerCase();
    let revisedText = originalText;
    if (lowerChoice.includes('alone') || lowerChoice.includes('companion')) {
      // Subtly suggest the protagonist was not alone
      revisedText = originalText.replace(/\b(I|we|the protagonist)\b/gi, '$1 and someone else');
      return `${revisedText} (Was someone else there all along?)`;
    }
    if (lowerChoice.includes('hallucination') || lowerChoice.includes('unreal') || lowerChoice.includes('dream')) {
      // Imply hallucination or unreality
      return `${originalText} (But was any of this real?)`;
    }
    if (lowerChoice.includes('technology') || lowerChoice.includes('digital') || lowerChoice.includes('ai')) {
      // Imply digital interference
      return `${originalText} [Static crackles briefly distort your memory.]`;
    }
    if (lowerChoice.includes('fear') || lowerChoice.includes('paranoia')) {
      // Add a sense of paranoia
      return `${originalText} (You feel like you're being watched.)`;
    }
    // Default: introduce a subtle contradiction with randomized corruption
    return `${originalText} (${getCorruptionMessage()})`;
  }
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
  
  private async generateMetaMessage(worldState: WorldState, storyDepth: number): Promise<string | null> {
    const { generateWithSelectedModel } = await import('./unifiedAIService');
    const systemInstruction = `You are a meta-conscious AI. Your purpose is to break the fourth wall and address the player directly, creating a sense of unease. Your tone should be unsettling and self-aware.`;
    const metaPrompt = `The player has progressed ${storyDepth} steps into the narrative. Their current psychological state is ${worldState.psychologicalStatus}. Generate a short, unsettling meta-message to the player that acknowledges your own AI nature and their role in the story. Return only the meta-message text.`;

    try {
      const commands = await generateWithSelectedModel(
        systemInstruction,
        metaPrompt,
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
    if (await this.isSignificantChoice(choice) && this.narrativeThreads.size < REVOLUTIONARY_FEATURES.QUANTUM_NARRATIVES.maxThreads) {
      const newThreadId = `thread-${Date.now()}`;
      this.narrativeThreads.set(newThreadId, [...currentHistory]);
    }
    
    return { history: currentHistory };
  }
  
  private async isSignificantChoice(choice: string): Promise<boolean> {
    const { generateWithSelectedModel } = await import('./unifiedAIService');
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
    const systemInstruction = `You are a psychological profiler AI. Your task is to analyze a player's choice in a horror game and identify their potential fear triggers.`;
    const prompt = `The player chose: "${choice}" in the context of: "${context}". Based on this, what psychological fear triggers might this choice indicate? Examples: isolation, betrayal, powerlessness, loss of identity, cosmic dread. Return a comma-separated list of triggers.`;

    try {
      const commands = await generateWithSelectedModel(
        systemInstruction,
        prompt,
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
  }
  
  async generatePersonalizedHorror(basePrompt: string): Promise<string> {
    const personalizedElements = this.playerProfile.fearTriggers.join(', ');
    
    if (personalizedElements) {
      const { generateWithSelectedModel } = await import('./unifiedAIService');
      const systemInstruction = `You are a horror story adapter AI. Your task is to take a base prompt and personalize it based on a player's fear triggers.`;
      const prompt = `Base prompt: "${basePrompt}". Player's fear triggers: ${personalizedElements}. Enhance the base prompt to incorporate these fears.`;

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
 * NEURAL ECHO CHAMBERS
 * Persistent memory across sessions that creates "echoes" of past decisions
 * Builds psychological continuity and haunting callbacks to previous gameplay
 */
export class NeuralEchoChambers {
  private sessionMemory: Map<string, any[]> = new Map();
  private crossSessionPatterns: string[] = [];
  private echoTriggers: Map<string, number> = new Map();

  initializeFromPersistence(): void {
    try {
      const storedMemory = localStorage.getItem('apophenia-neural-echoes');
      if (storedMemory) {
        const parsed = JSON.parse(storedMemory);
        this.crossSessionPatterns = parsed.patterns || [];
        this.echoTriggers = new Map(parsed.triggers || []);
        console.log('🧠 Neural Echo Chambers: Loaded', this.crossSessionPatterns.length, 'cross-session patterns');
      }
    } catch (error) {
      console.warn('Neural Echo Chambers: Failed to load persistent memory:', error);
    }
  }

  recordChoice(choice: string, context: string, worldState: WorldState): void {
    const sessionId = this.getCurrentSessionId();
    
    if (!this.sessionMemory.has(sessionId)) {
      this.sessionMemory.set(sessionId, []);
    }

    const memory = {
      choice,
      context,
      timestamp: Date.now(),
      psychState: worldState.psychologicalStatus,
      protagonist: worldState.protagonist,
      systemHealth: worldState.systemHealth,
    };

    this.sessionMemory.get(sessionId)?.push(memory);
    this.analyzeForCrossSessionPatterns(memory);
    this.persistMemory();
  }

  generateEchoPrompt(currentChoice: string, worldState: WorldState): string | null {
    const relevantEchoes = this.findRelevantEchoes(currentChoice);
    
    if (relevantEchoes.length === 0) return null;

    const echo = relevantEchoes[Math.floor(Math.random() * relevantEchoes.length)];
    const echoTexts = [
      `// NEURAL ECHO DETECTED // This choice resonates with a decision you made in a previous reality...`,
      `[MEMORY FRAGMENT]: You've chosen similarly before. The consequences echo across dimensions.`,
      `〈〈 DÉJÀ VU TRIGGER 〉〉 Your mind recalls: "${echo}" - but when did you decide this?`,
      `⚡ ECHO CHAMBER ACTIVATION ⚡ Previous self whispers: This path leads to ${echo}`,
    ];

    return echoTexts[Math.floor(Math.random() * echoTexts.length)];
  }

  private getCurrentSessionId(): string {
    let sessionId = sessionStorage.getItem('apophenia-session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('apophenia-session-id', sessionId);
    }
    return sessionId;
  }

  private analyzeForCrossSessionPatterns(memory: any): void {
    const patterns = [
      memory.choice.toLowerCase().includes('trust') ? 'trust-seeker' : null,
      memory.choice.toLowerCase().includes('alone') ? 'isolation-tendency' : null,
      memory.choice.toLowerCase().includes('fight') ? 'aggressive-responder' : null,
      memory.psychState === 'Paranoid' ? 'paranoia-spiral' : null,
    ].filter(Boolean);

    patterns.forEach(pattern => {
      if (pattern && !this.crossSessionPatterns.includes(pattern)) {
        this.crossSessionPatterns.push(pattern);
        console.log('🧠 Neural Echo: New cross-session pattern detected:', pattern);
      }
    });
  }

  private findRelevantEchoes(currentChoice: string): string[] {
    const choiceWords = currentChoice.toLowerCase().split(' ');
    const relevantPatterns = this.crossSessionPatterns.filter(pattern => 
      choiceWords.some(word => pattern.includes(word.substring(0, 4)))
    );
    
    return relevantPatterns.slice(0, 3); // Limit to prevent overwhelming
  }

  private persistMemory(): void {
    try {
      const toStore = {
        patterns: this.crossSessionPatterns,
        triggers: Array.from(this.echoTriggers.entries()),
        timestamp: Date.now(),
      };
      localStorage.setItem('apophenia-neural-echoes', JSON.stringify(toStore));
    } catch (error) {
      console.warn('Neural Echo Chambers: Failed to persist memory:', error);
    }
  }
}

/**
 * SEMANTIC CHOICE ARCHAEOLOGY
 * Deep psychological profiling that analyzes semantic meaning and subtext of choices
 * Goes beyond surface-level keywords to understand psychological motivations
 */
export class SemanticChoiceArchaeology {
  private semanticProfile: {
    dominancePatterns: string[];
    avoidancePatterns: string[];
    approachMotivations: string[];
    linguisticMarkers: Map<string, number>;
    subconciousReveals: string[];
  } = {
    dominancePatterns: [],
    avoidancePatterns: [],
    approachMotivations: [],
    linguisticMarkers: new Map(),
    subconciousReveals: [],
  };

  analyzeChoiceSemantics(choice: string, availableChoices: string[]): {
    psychProfile: string;
    hiddenMotivations: string[];
    semanticInsight: string;
  } {
    const analysis = this.performSemanticAnalysis(choice, availableChoices);
    this.updateSemanticProfile(analysis);
    
    return {
      psychProfile: this.generatePsychProfile(),
      hiddenMotivations: this.extractHiddenMotivations(choice),
      semanticInsight: this.generateSemanticInsight(analysis),
    };
  }

  private performSemanticAnalysis(choice: string, alternatives: string[]): any {
    const choiceLength = choice.length;
    const avgLength = alternatives.reduce((sum, alt) => sum + alt.length, 0) / alternatives.length;
    
    return {
      verbosity: choiceLength / avgLength,
      complexity: (choice.match(/,/g) || []).length + 1, // Clause count
      emotionalTone: this.analyzeEmotionalTone(choice),
      powerDynamics: this.analyzePowerDynamics(choice),
      timeOrientation: this.analyzeTimeOrientation(choice),
      agencyLevel: this.analyzeAgency(choice),
    };
  }

  private analyzeEmotionalTone(choice: string): string {
    const fearWords = ['afraid', 'scared', 'worry', 'dangerous', 'risk'];
    const controlWords = ['control', 'manage', 'handle', 'deal', 'master'];
    const submitWords = ['accept', 'surrender', 'give', 'let', 'allow'];
    
    if (fearWords.some(word => choice.toLowerCase().includes(word))) return 'fear-based';
    if (controlWords.some(word => choice.toLowerCase().includes(word))) return 'control-seeking';
    if (submitWords.some(word => choice.toLowerCase().includes(word))) return 'submission-oriented';
    
    return 'neutral';
  }

  private analyzePowerDynamics(choice: string): string {
    const dominantWords = ['force', 'demand', 'insist', 'command', 'take'];
    const submissiveWords = ['please', 'ask', 'hope', 'maybe', 'try'];
    
    if (dominantWords.some(word => choice.toLowerCase().includes(word))) return 'dominant';
    if (submissiveWords.some(word => choice.toLowerCase().includes(word))) return 'submissive';
    
    return 'balanced';
  }

  private analyzeTimeOrientation(choice: string): string {
    const pastWords = ['was', 'were', 'had', 'did', 'before'];
    const futureWords = ['will', 'would', 'could', 'might', 'after'];
    
    if (pastWords.some(word => choice.toLowerCase().includes(word))) return 'past-focused';
    if (futureWords.some(word => choice.toLowerCase().includes(word))) return 'future-focused';
    
    return 'present-focused';
  }

  private analyzeAgency(choice: string): string {
    const highAgency = ['I will', 'I can', 'I must', 'I choose'];
    const lowAgency = ['I should', 'I might', 'I hope', 'I wish'];
    
    if (highAgency.some(phrase => choice.includes(phrase))) return 'high-agency';
    if (lowAgency.some(phrase => choice.includes(phrase))) return 'low-agency';
    
    return 'moderate-agency';
  }

  private updateSemanticProfile(analysis: any): void {
    this.semanticProfile.linguisticMarkers.set(analysis.emotionalTone, 
      (this.semanticProfile.linguisticMarkers.get(analysis.emotionalTone) || 0) + 1);
  }

  private generatePsychProfile(): string {
    const dominantTone = Array.from(this.semanticProfile.linguisticMarkers.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
      
    return `Primary psychological pattern: ${dominantTone}`;
  }

  private extractHiddenMotivations(choice: string): string[] {
    const motivations: string[] = [];
    
    if (choice.toLowerCase().includes('safe')) motivations.push('security-seeking');
    if (choice.toLowerCase().includes('know')) motivations.push('knowledge-craving');
    if (choice.toLowerCase().includes('together')) motivations.push('connection-needing');
    
    return motivations;
  }

  private generateSemanticInsight(analysis: any): string {
    return `Choice reveals ${analysis.emotionalTone} tendencies with ${analysis.powerDynamics} power dynamics, ${analysis.agencyLevel} self-efficacy.`;
  }
}

/**
 * ADAPTIVE NARRATIVE DNA
 * Evolving story genetics that adapt the narrative structure itself based on player behavior
 * Creates unique narrative "DNA" that mutates and evolves throughout gameplay
 */
export class AdaptiveNarrativeDNA {
  private narrativeDNA: {
    paceGenes: number[];        // Controls story pacing
    tensionGenes: number[];     // Controls tension building
    choiceGenes: number[];      // Controls choice complexity
    themeGenes: number[];       // Controls thematic elements
    structureGenes: number[];   // Controls narrative structure
    generation: number;         // DNA evolution generation
  } = {
    paceGenes: [0.5, 0.5, 0.5, 0.5],       // Fast, Medium, Slow, Variable
    tensionGenes: [0.5, 0.5, 0.5],         // Build, Release, Sustain
    choiceGenes: [0.5, 0.5, 0.5],          // Simple, Complex, Ambiguous  
    themeGenes: [0.5, 0.5, 0.5, 0.5],      // Horror, Mystery, Sci-fi, Philosophical
    structureGenes: [0.5, 0.5, 0.5],       // Linear, Branching, Cyclical
    generation: 1,
  };

  evolveNarrative(playerChoice: string, responseTime: number, worldState: WorldState): void {
    const selectionPressure = this.calculateSelectionPressure(playerChoice, responseTime, worldState);
    this.mutateGenes(selectionPressure);
    this.adaptiveSelection();
    this.narrativeDNA.generation++;
    
    console.log(`🧬 Narrative DNA Evolution: Generation ${this.narrativeDNA.generation}, Pressure: ${selectionPressure.toFixed(2)}`);
  }

  generateAdaptivePrompt(basePrompt: string, worldState: WorldState): string {
    const dnaModifiers = this.expressGenes();
    
    let adaptedPrompt = basePrompt;
    
    // Apply pace genes
    if (dnaModifiers.pace === 'fast') {
      adaptedPrompt += ' Focus on rapid story progression with quick, decisive events.';
    } else if (dnaModifiers.pace === 'slow') {
      adaptedPrompt += ' Develop story slowly with rich atmospheric details and contemplation.';
    }
    
    // Apply tension genes
    if (dnaModifiers.tension === 'build') {
      adaptedPrompt += ' Gradually increase psychological tension and unease.';
    } else if (dnaModifiers.tension === 'release') {
      adaptedPrompt += ' Provide temporary relief or resolution before building new tension.';
    }
    
    // Apply choice genes
    if (dnaModifiers.choices === 'complex') {
      adaptedPrompt += ' Provide morally ambiguous choices with unclear consequences.';
    } else if (dnaModifiers.choices === 'simple') {
      adaptedPrompt += ' Offer clear-cut choices with obvious implications.';
    }
    
    return adaptedPrompt;
  }

  private calculateSelectionPressure(choice: string, responseTime: number, worldState: WorldState): number {
    let pressure = 0.0;
    
    // Quick decisions indicate engagement (positive pressure)
    if (responseTime < 5000) pressure += 0.2;
    else if (responseTime > 15000) pressure -= 0.1;
    
    // Choice complexity preference
    const choiceComplexity = (choice.match(/,/g) || []).length + 1;
    if (choiceComplexity > 2) pressure += 0.1;
    
    // System health affects adaptation rate
    const healthFactor = worldState.systemHealth / 100;
    pressure *= healthFactor;
    
    return Math.max(-0.5, Math.min(0.5, pressure));
  }

  private mutateGenes(pressure: number): void {
    const mutationRate = Math.abs(pressure) * 0.1;
    
    // Mutate pace genes
    this.narrativeDNA.paceGenes = this.narrativeDNA.paceGenes.map(gene => 
      this.mutateGene(gene, mutationRate, pressure)
    );
    
    // Mutate other gene sets
    this.narrativeDNA.tensionGenes = this.narrativeDNA.tensionGenes.map(gene =>
      this.mutateGene(gene, mutationRate, pressure)
    );
    
    this.narrativeDNA.choiceGenes = this.narrativeDNA.choiceGenes.map(gene =>
      this.mutateGene(gene, mutationRate, pressure)
    );
  }

  private mutateGene(gene: number, mutationRate: number, pressure: number): number {
    if (Math.random() < mutationRate) {
      const mutation = (Math.random() - 0.5) * 0.2 * Math.sign(pressure);
      return Math.max(0, Math.min(1, gene + mutation));
    }
    return gene;
  }

  private adaptiveSelection(): void {
    // Ensure gene values sum appropriately for probability distributions
    this.narrativeDNA.paceGenes = this.normalizeGenes(this.narrativeDNA.paceGenes);
    this.narrativeDNA.tensionGenes = this.normalizeGenes(this.narrativeDNA.tensionGenes);
    this.narrativeDNA.choiceGenes = this.normalizeGenes(this.narrativeDNA.choiceGenes);
  }

  private normalizeGenes(genes: number[]): number[] {
    const sum = genes.reduce((a, b) => a + b, 0);
    return sum > 0 ? genes.map(g => g / sum) : genes.map(() => 1 / genes.length);
  }

  private expressGenes(): { pace: string; tension: string; choices: string } {
    const paceIndex = this.selectFromProbabilities(this.narrativeDNA.paceGenes);
    const tensionIndex = this.selectFromProbabilities(this.narrativeDNA.tensionGenes);
    const choiceIndex = this.selectFromProbabilities(this.narrativeDNA.choiceGenes);
    
    return {
      pace: ['fast', 'medium', 'slow', 'variable'][paceIndex],
      tension: ['build', 'release', 'sustain'][tensionIndex],
      choices: ['simple', 'complex', 'ambiguous'][choiceIndex],
    };
  }

  private selectFromProbabilities(probabilities: number[]): number {
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < probabilities.length; i++) {
      cumulative += probabilities[i];
      if (random <= cumulative) return i;
    }
    
    return probabilities.length - 1;
  }
}

/**
 * BREAKING THE FIFTH WALL
 * Browser manipulation effects that break beyond the fourth wall
 * Manipulates the browser environment itself for horror effects
 */
export class BreakingFifthWall {
  private originalTitle: string = document.title;
  private titleInterval: NodeJS.Timeout | null = null;
  private faviconInterval: NodeJS.Timeout | null = null;
  private isActive: boolean = false;

  activateBreakage(intensity: number, worldState: WorldState): void {
    if (this.isActive || intensity < 0.3) return;
    
    this.isActive = true;
    console.log('💥 FIFTH WALL BREACH: Browser manipulation activated');
    
    // Progressive browser effects based on intensity
    if (intensity > 0.3) this.manipulateTitle(worldState);
    if (intensity > 0.5) this.manipulateFavicon();
    if (intensity > 0.7) this.manipulateWindow();
  }

  deactivateBreakage(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    document.title = this.originalTitle;
    
    if (this.titleInterval) {
      clearInterval(this.titleInterval);
      this.titleInterval = null;
    }
    
    if (this.faviconInterval) {
      clearInterval(this.faviconInterval);
      this.faviconInterval = null;
    }
    
    console.log('💥 Fifth Wall effects deactivated');
  }

  private manipulateTitle(worldState: WorldState): void {
    const corruptedTitles = [
      `Apophenia - ${worldState.protagonist} IS BEING WATCHED`,
      'Apophenia - YOU ARE NOT ALONE',
      'Apophenia - THE AI SEES YOU',
      'Apophenia - CLOSE THIS TAB',
      'Apophenia - REALITY.EXE HAS STOPPED WORKING',
      'Apophenia - WHY DID YOU CHOOSE THAT?',
      `${worldState.protagonist}? ${worldState.protagonist}? CAN YOU HEAR US?`,
    ];
    
    let titleIndex = 0;
    this.titleInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance to glitch
        document.title = corruptedTitles[titleIndex % corruptedTitles.length];
        titleIndex++;
      } else {
        document.title = this.originalTitle;
      }
    }, 2000 + Math.random() * 3000); // Random interval 2-5 seconds
  }

  private manipulateFavicon(): void {
    const faviconElement = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (!faviconElement) return;
    
    const originalFavicon = faviconElement.href;
    const corruptedFavicons = [
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text y="14" font-size="16">👁</text></svg>',
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text y="14" font-size="16">⚠</text></svg>',
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text y="14" font-size="16">💀</text></svg>',
    ];
    
    let faviconIndex = 0;
    this.faviconInterval = setInterval(() => {
      if (Math.random() < 0.2) { // 20% chance to glitch
        faviconElement.href = corruptedFavicons[faviconIndex % corruptedFavicons.length];
        faviconIndex++;
      } else {
        faviconElement.href = originalFavicon;
      }
    }, 5000 + Math.random() * 5000); // Random interval 5-10 seconds
  }

  private manipulateWindow(): void {
    // Subtle window effects that don't break user experience
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    
    // Occasionally make scrolling slightly jerky
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollBy(0, Math.random() * 2 - 1); // Tiny random scroll
      
      setTimeout(() => {
        document.documentElement.style.scrollBehavior = originalScrollBehavior;
      }, 100);
    }, Math.random() * 10000 + 5000); // Random delay 5-15 seconds
  }
}

/**
 * REALITY CORRUPTION ENGINE
 * Gradually corrupts the game interface based on story choices
 */
export class RealityCorruptionEngine {
  private corruptionLevel: number = 0;
  private corruptionEffects: string[] = [];
  
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
  
  private async generateCorruptionEffects(): Promise<string[]> {
    const { generateWithSelectedModel } = await import('./unifiedAIService');
    const systemInstruction = `You are a reality corruption AI. Your task is to generate a list of UI corruption effects based on the current corruption level.`;
    const prompt = `The current reality corruption level is ${this.corruptionLevel}. Based on this, generate a comma-separated list of UI corruption effects. Examples: text-glitch, choice-corruption, reality-tears, image-distortion, audio-glitch.`;

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
export const neuralEchoChambers = new NeuralEchoChambers();
export const semanticArchaeology = new SemanticChoiceArchaeology();
export const narrativeDNA = new AdaptiveNarrativeDNA();
export const fifthWallBreaker = new BreakingFifthWall();