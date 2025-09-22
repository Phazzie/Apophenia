/**
 * Revolutionary AI-driven features that leverage Gemini 2.5 Pro's advanced capabilities
 * These features create unprecedented interactive horror experiences
 */

import { StorySegment, WorldState, Choice } from '../../types';
import { REVOLUTIONARY_FEATURES } from '../config';

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

/**
 * NEURAL ECHO CHAMBERS ENGINE
 * Creates persistent memory fragments that haunt players across multiple playthroughs
 * Uses localStorage to maintain echoes between game sessions
 */
export class NeuralEchoChamberEngine {
  private echoStorage: NeuralEchoStorage;
  private echoIntensity: number = 0;
  private currentSessionEchoes: string[] = [];
  
  constructor() {
    this.echoStorage = new NeuralEchoStorage();
    this.loadEchoIntensity();
  }
  
  // Captures memorable phrases/concepts from current playthrough
  async captureNeuralEcho(segment: StorySegment): Promise<void> {
    if (!REVOLUTIONARY_FEATURES.NEURAL_ECHO_CHAMBERS.enabled) {
      return;
    }
    
    const memorableElements = this.extractMemorableElements(segment.text);
    
    for (const element of memorableElements) {
      if (this.isEchoWorthy(element)) {
        this.echoStorage.storeEcho({
          content: element,
          timestamp: Date.now(),
          context: segment.id,
          intensity: this.calculateEchoIntensity(element),
        });
        
        this.currentSessionEchoes.push(element);
      }
    }
  }
  
  // Surfaces echoes in new playthroughs as intrusive thoughts
  async generateEchoIntrusion(currentContext: string): Promise<Choice | null> {
    if (!REVOLUTIONARY_FEATURES.NEURAL_ECHO_CHAMBERS.enabled) {
      return null;
    }
    
    const shouldBleed = Math.random() < REVOLUTIONARY_FEATURES.NEURAL_ECHO_CHAMBERS.bleedProbability;
    if (!shouldBleed) {
      return null;
    }
    
    const availableEchoes = this.echoStorage.getRelevantEchoes(currentContext);
    if (availableEchoes.length === 0) {
      return null;
    }
    
    const selectedEcho = availableEchoes[Math.floor(Math.random() * availableEchoes.length)];
    
    return {
      text: `[ECHO: ${selectedEcho.content}] ...you remember this, don't you?`,
      isIntrusive: true,
    };
  }
  
  // Gradually increases echo bleeding over multiple sessions
  calculateEchoIntensity(): number {
    const sessionCount = this.echoStorage.getSessionCount();
    return Math.min(sessionCount * 0.1, REVOLUTIONARY_FEATURES.NEURAL_ECHO_CHAMBERS.echoIntensity);
  }
  
  private extractMemorableElements(text: string): string[] {
    // Extract emotionally charged phrases, unique concepts, and memorable imagery
    const patterns = [
      /\b(horror|terror|fear|dread|nightmare|darkness|void|whisper|shadow|scream)\w*\b/gi,
      /\b[A-Z][a-z]*\s+[A-Z][a-z]*\b/g, // Proper nouns/names
      /"[^"]*"/g, // Quoted text
      /\b\w*ed\s+(me|you|us|them)\b/gi, // Past tense actions
    ];
    
    const elements: string[] = [];
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        elements.push(...matches);
      }
    });
    
    return elements.filter(element => element.length > 3 && element.length < 50);
  }
  
  private isEchoWorthy(element: string): boolean {
    // Avoid duplicates and filter quality
    return !this.currentSessionEchoes.includes(element) && 
           element.length > 5 && 
           !/^\d+$/.test(element);
  }
  
  private calculateEchoIntensity(element: string): number {
    // Calculate based on emotional weight and uniqueness
    const emotionalWords = ['horror', 'terror', 'fear', 'dread', 'nightmare', 'scream'];
    const hasEmotionalWeight = emotionalWords.some(word => 
      element.toLowerCase().includes(word)
    );
    
    return hasEmotionalWeight ? 0.8 : 0.5;
  }
  
  private loadEchoIntensity(): void {
    this.echoIntensity = this.calculateEchoIntensity();
  }
}

/**
 * NEURAL ECHO STORAGE
 * Manages localStorage for persistent echo storage
 */
class NeuralEchoStorage {
  private readonly ECHO_KEY = 'apophenia_neural_echoes';
  private readonly SESSION_KEY = 'apophenia_session_count';
  private readonly MAX_ECHOES = REVOLUTIONARY_FEATURES.NEURAL_ECHO_CHAMBERS?.maxEchoes || 20;
  
  storeEcho(echo: NeuralEcho): void {
    try {
      const echoes = this.getStoredEchoes();
      echoes.push(echo);
      
      // Keep only the most recent/intense echoes
      const sortedEchoes = echoes
        .sort((a, b) => b.intensity - a.intensity || b.timestamp - a.timestamp)
        .slice(0, this.MAX_ECHOES);
      
      localStorage.setItem(this.ECHO_KEY, JSON.stringify(sortedEchoes));
    } catch (error) {
      console.warn('Failed to store neural echo:', error);
    }
  }
  
  getRelevantEchoes(context: string): NeuralEcho[] {
    try {
      const echoes = this.getStoredEchoes();
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      return echoes.filter(echo => 
        now - echo.timestamp < maxAge && 
        echo.intensity > 0.3
      );
    } catch (error) {
      console.warn('Failed to retrieve neural echoes:', error);
      return [];
    }
  }
  
  getSessionCount(): number {
    try {
      const count = localStorage.getItem(this.SESSION_KEY);
      const sessionCount = count ? parseInt(count, 10) : 0;
      localStorage.setItem(this.SESSION_KEY, (sessionCount + 1).toString());
      return sessionCount + 1;
    } catch (error) {
      return 1;
    }
  }
  
  private getStoredEchoes(): NeuralEcho[] {
    try {
      const stored = localStorage.getItem(this.ECHO_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }
}

interface NeuralEcho {
  content: string;
  timestamp: number;
  context: string;
  intensity: number;
}

/**
 * SEMANTIC CHOICE ARCHAEOLOGY ENGINE
 * Advanced NLP analysis building deep psychological profiles through choice linguistics
 */
export class SemanticChoiceArchaeologist {
  private linguisticProfile: PlayerLinguisticProfile;
  private psychologicalMatrix: PsychAnalysisMatrix;
  private analysisHistory: ChoiceAnalysis[] = [];
  
  constructor() {
    this.linguisticProfile = new PlayerLinguisticProfile();
    this.psychologicalMatrix = new PsychAnalysisMatrix();
    this.loadExistingProfile();
  }
  
  // Deep semantic analysis of choice text
  async analyzeChoiceSemantics(choice: string, context: WorldState): Promise<SemanticProfile> {
    if (!REVOLUTIONARY_FEATURES.SEMANTIC_CHOICE_ARCHAEOLOGY.enabled) {
      return { linguisticPatterns: [], psychologicalMarkers: [], vulnerabilities: [] };
    }
    
    const analysis: ChoiceAnalysis = {
      choiceText: choice,
      timestamp: Date.now(),
      linguisticPatterns: this.extractLinguisticPatterns(choice),
      psychologicalMarkers: this.identifyPsychologicalMarkers(choice),
      contextualFactors: this.analyzeContextualFactors(choice, context),
    };
    
    this.analysisHistory.push(analysis);
    this.updatePsychologicalMatrix(analysis);
    
    return {
      linguisticPatterns: analysis.linguisticPatterns,
      psychologicalMarkers: analysis.psychologicalMarkers,
      vulnerabilities: this.psychologicalMatrix.getDiscoveredVulnerabilities(),
    };
  }
  
  // Builds comprehensive psychological model
  updatePsychologicalMatrix(analysis: ChoiceAnalysis): void {
    // Update linguistic preferences
    this.linguisticProfile.updatePatterns(analysis.linguisticPatterns);
    
    // Update psychological understanding
    this.psychologicalMatrix.integrateAnalysis(analysis);
    
    // Persist the updated profile
    this.saveProfile();
  }
  
  // Generates targeted horror based on discovered vulnerabilities
  async craftTargetedHorror(basePrompt: string): Promise<string> {
    const vulnerabilities = this.psychologicalMatrix.getDiscoveredVulnerabilities();
    const linguisticStyle = this.linguisticProfile.getDominantStyle();
    
    if (vulnerabilities.length === 0) {
      return basePrompt;
    }
    
    const targetingInstructions = `
    Based on deep psychological analysis, target these specific vulnerabilities: ${vulnerabilities.join(', ')}.
    Adapt the narrative style to match the player's linguistic preferences: ${linguisticStyle}.
    Use precise psychological pressure points discovered through choice archaeology.
    `;
    
    return `${basePrompt}\n\n${targetingInstructions}`;
  }
  
  private extractLinguisticPatterns(choice: string): string[] {
    const patterns: string[] = [];
    
    // Formality analysis
    const formalIndicators = /\b(shall|ought|therefore|furthermore|nevertheless)\b/gi;
    const casualIndicators = /\b(gonna|wanna|yeah|nah|totally)\b/gi;
    
    if (formalIndicators.test(choice)) patterns.push('formal');
    if (casualIndicators.test(choice)) patterns.push('casual');
    
    // Complexity analysis
    const complexSentences = choice.split(/[.!?]/).filter(s => s.length > 50);
    if (complexSentences.length > 0) patterns.push('complex-syntax');
    
    // Emotional expression
    const emotionalIntensifiers = /\b(very|extremely|absolutely|completely|totally)\b/gi;
    if (emotionalIntensifiers.test(choice)) patterns.push('emotionally-expressive');
    
    // Decision confidence
    const uncertaintyMarkers = /\b(maybe|perhaps|possibly|might|could)\b/gi;
    const certaintyMarkers = /\b(definitely|certainly|absolutely|must|will)\b/gi;
    
    if (uncertaintyMarkers.test(choice)) patterns.push('uncertainty');
    if (certaintyMarkers.test(choice)) patterns.push('certainty');
    
    return patterns;
  }
  
  private identifyPsychologicalMarkers(choice: string): string[] {
    const markers: string[] = [];
    
    // Risk assessment patterns
    if (/\b(safe|secure|careful|cautious)\b/gi.test(choice)) {
      markers.push('risk-averse');
    }
    if (/\b(adventure|risk|dangerous|bold)\b/gi.test(choice)) {
      markers.push('risk-seeking');
    }
    
    // Social orientation
    if (/\b(alone|myself|independent|solo)\b/gi.test(choice)) {
      markers.push('individualistic');
    }
    if (/\b(together|help|team|group)\b/gi.test(choice)) {
      markers.push('collectivistic');
    }
    
    // Authority relationship
    if (/\b(obey|follow|respect|authority)\b/gi.test(choice)) {
      markers.push('authority-accepting');
    }
    if (/\b(question|challenge|rebel|refuse)\b/gi.test(choice)) {
      markers.push('authority-challenging');
    }
    
    // Emotional processing
    if (/\b(feel|emotion|heart|intuition)\b/gi.test(choice)) {
      markers.push('emotion-driven');
    }
    if (/\b(logic|reason|think|rational)\b/gi.test(choice)) {
      markers.push('logic-driven');
    }
    
    return markers;
  }
  
  private analyzeContextualFactors(choice: string, context: WorldState): string[] {
    const factors: string[] = [];
    
    // Response to horror elements
    if (context.psychologicalStatus !== 'Stable') {
      if (/\b(calm|peace|safe)\b/gi.test(choice)) {
        factors.push('horror-avoidant');
      }
      if (/\b(face|confront|examine)\b/gi.test(choice)) {
        factors.push('horror-confrontational');
      }
    }
    
    return factors;
  }
  
  private loadExistingProfile(): void {
    try {
      const stored = localStorage.getItem('apophenia_semantic_profile');
      if (stored) {
        const data = JSON.parse(stored);
        this.psychologicalMatrix.loadFromData(data.matrix);
        this.linguisticProfile.loadFromData(data.linguistic);
      }
    } catch (error) {
      console.warn('Failed to load existing semantic profile:', error);
    }
  }
  
  private saveProfile(): void {
    try {
      const profileData = {
        matrix: this.psychologicalMatrix.exportData(),
        linguistic: this.linguisticProfile.exportData(),
        lastUpdate: Date.now(),
      };
      localStorage.setItem('apophenia_semantic_profile', JSON.stringify(profileData));
    } catch (error) {
      console.warn('Failed to save semantic profile:', error);
    }
  }
}

/**
 * PLAYER LINGUISTIC PROFILE
 * Tracks and analyzes linguistic patterns in player choices
 */
class PlayerLinguisticProfile {
  private patterns: Map<string, number> = new Map();
  
  updatePatterns(newPatterns: string[]): void {
    newPatterns.forEach(pattern => {
      const current = this.patterns.get(pattern) || 0;
      this.patterns.set(pattern, current + 1);
    });
  }
  
  getDominantStyle(): string {
    if (this.patterns.size === 0) return 'neutral';
    
    const sorted = Array.from(this.patterns.entries())
      .sort(([,a], [,b]) => b - a);
    
    return sorted[0][0];
  }
  
  exportData(): any {
    return Object.fromEntries(this.patterns);
  }
  
  loadFromData(data: any): void {
    this.patterns = new Map(Object.entries(data));
  }
}

/**
 * PSYCHOLOGICAL ANALYSIS MATRIX
 * Deep psychological understanding built from choice patterns
 */
class PsychAnalysisMatrix {
  private vulnerabilities: Map<string, number> = new Map();
  private patterns: Map<string, ChoiceAnalysis[]> = new Map();
  
  integrateAnalysis(analysis: ChoiceAnalysis): void {
    // Update vulnerability weights
    analysis.psychologicalMarkers.forEach(marker => {
      const current = this.vulnerabilities.get(marker) || 0;
      this.vulnerabilities.set(marker, current + 1);
    });
    
    // Store analysis by pattern
    analysis.psychologicalMarkers.forEach(marker => {
      if (!this.patterns.has(marker)) {
        this.patterns.set(marker, []);
      }
      this.patterns.get(marker)!.push(analysis);
    });
  }
  
  getDiscoveredVulnerabilities(): string[] {
    return Array.from(this.vulnerabilities.entries())
      .filter(([, weight]) => weight >= 3) // Require multiple instances
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5) // Top 5 vulnerabilities
      .map(([vulnerability]) => vulnerability);
  }
  
  exportData(): any {
    return {
      vulnerabilities: Object.fromEntries(this.vulnerabilities),
      patternCount: this.patterns.size,
    };
  }
  
  loadFromData(data: any): void {
    if (data.vulnerabilities) {
      this.vulnerabilities = new Map(Object.entries(data.vulnerabilities));
    }
  }
}

// Export new singleton instances
export const neuralEchoChamber = new NeuralEchoChamberEngine();
export const semanticArchaeologist = new SemanticChoiceArchaeologist();

/**
 * FIFTH WALL BREACH ENGINE
 * Manipulates browser environment to create horror outside game boundaries
 */
export class FifthWallBreachEngine {
  private browserManipulator: BrowserEnvironmentController;
  private breachIntensity: number = 0;
  private activeManipulations: BrowserManipulation[] = [];
  
  constructor() {
    this.browserManipulator = new BrowserEnvironmentController();
  }
  
  // Manipulates browser chrome (tab title, favicon)
  async manipulateBrowserChrome(horrorMessage: string): Promise<void> {
    if (!REVOLUTIONARY_FEATURES.FIFTH_WALL_BREACH.enabled) {
      return;
    }
    
    const shouldBreach = this.breachIntensity > 0.3;
    if (!shouldBreach) return;
    
    // Change tab title to reflect horror
    const originalTitle = document.title;
    const horrorTitles = [
      `${horrorMessage} - Apophenia`,
      'You cannot escape - Apophenia',
      'It knows you are reading this',
      'Look behind you - Apophenia',
      'The game is watching you',
    ];
    
    const selectedTitle = horrorTitles[Math.floor(Math.random() * horrorTitles.length)];
    document.title = selectedTitle;
    
    // Restore original title after random delay
    setTimeout(() => {
      document.title = originalTitle;
    }, 3000 + Math.random() * 5000);
  }
  
  // Creates "system-level" horror effects
  async createSystemLevelHorror(): Promise<BrowserManipulation[]> {
    if (!REVOLUTIONARY_FEATURES.FIFTH_WALL_BREACH.enabled) {
      return [];
    }
    
    const manipulations: BrowserManipulation[] = [];
    
    // Create fake notification effect
    if (this.breachIntensity > 0.5) {
      manipulations.push(this.createFakeNotification());
    }
    
    // Create text bleeding outside boundaries
    if (this.breachIntensity > 0.4) {
      manipulations.push(this.createTextBleeding());
    }
    
    // Update breach intensity
    this.breachIntensity = Math.min(
      this.breachIntensity + 0.1, 
      REVOLUTIONARY_FEATURES.FIFTH_WALL_BREACH.maxBreachIntensity
    );
    
    return manipulations;
  }
  
  // Makes UI elements behave as if possessed
  async createPhantomInteractions(): Promise<void> {
    if (!REVOLUTIONARY_FEATURES.FIFTH_WALL_BREACH.phantomInteractions) {
      return;
    }
    
    // Find interactive elements
    const buttons = document.querySelectorAll('button, .choice-button');
    
    if (buttons.length > 0 && Math.random() < 0.2) {
      const randomButton = buttons[Math.floor(Math.random() * buttons.length)] as HTMLElement;
      
      // Create phantom hover effect
      randomButton.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
      randomButton.style.transform = 'scale(1.02)';
      randomButton.style.transition = 'all 0.3s ease';
      
      setTimeout(() => {
        randomButton.style.backgroundColor = '';
        randomButton.style.transform = '';
      }, 1000);
    }
  }
  
  private createFakeNotification(): BrowserManipulation {
    return {
      type: 'fake-notification',
      element: this.createNotificationElement(),
      duration: 5000,
    };
  }
  
  private createTextBleeding(): BrowserManipulation {
    return {
      type: 'text-bleeding',
      element: this.createBleedingText(),
      duration: 8000,
    };
  }
  
  private createNotificationElement(): HTMLElement {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2d1b1b;
      color: #ff6b6b;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      font-family: monospace;
      border: 1px solid #ff6b6b;
      animation: fadeInOut 5s ease-in-out;
    `;
    notification.textContent = 'The AI is watching your choices...';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
    
    return notification;
  }
  
  private createBleedingText(): HTMLElement {
    const bleedingText = document.createElement('div');
    bleedingText.style.cssText = `
      position: fixed;
      top: 50%;
      left: -200px;
      color: rgba(255, 107, 107, 0.7);
      font-family: 'Courier New', monospace;
      font-size: 12px;
      z-index: 8888;
      white-space: nowrap;
      pointer-events: none;
      animation: slideAcross 8s linear;
    `;
    bleedingText.textContent = 'Your choices echo across digital eternity...';
    
    // Add CSS animation if not already present
    if (!document.getElementById('bleeding-animation')) {
      const style = document.createElement('style');
      style.id = 'bleeding-animation';
      style.textContent = `
        @keyframes slideAcross {
          0% { left: -300px; opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { left: 100vw; opacity: 0; }
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; transform: translateY(-10px); }
          20%, 80% { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(bleedingText);
    
    setTimeout(() => {
      if (bleedingText.parentNode) {
        bleedingText.parentNode.removeChild(bleedingText);
      }
    }, 8000);
    
    return bleedingText;
  }
}

/**
 * BROWSER ENVIRONMENT CONTROLLER
 * Handles safe manipulation of browser environment
 */
class BrowserEnvironmentController {
  manipulateTab(title: string): void {
    document.title = title;
  }
  
  createOverlayElement(content: string, styles: string): HTMLElement {
    const element = document.createElement('div');
    element.style.cssText = styles;
    element.textContent = content;
    document.body.appendChild(element);
    return element;
  }
  
  restoreNormal(): void {
    // Remove any active manipulations
    const overlays = document.querySelectorAll('[data-fifth-wall]');
    overlays.forEach(overlay => overlay.remove());
  }
}

/**
 * ADAPTIVE NARRATIVE DNA ENGINE
 * Creates evolving narrative genetics unique to each player
 */
export class AdaptiveNarrativeDNAEngine {
  private narrativeGenome: NarrativeGeneMap;
  private mutationRate: number;
  private geneExpression: Map<string, number> = new Map();
  
  constructor() {
    this.narrativeGenome = new NarrativeGeneMap();
    this.mutationRate = REVOLUTIONARY_FEATURES.ADAPTIVE_NARRATIVE_DNA?.mutationRate || 0.2;
    this.loadExistingGenome();
  }
  
  // Creates genetic markers from player choices
  async generateGeneticMarkers(choice: string, context: WorldState): Promise<GeneMarker[]> {
    if (!REVOLUTIONARY_FEATURES.ADAPTIVE_NARRATIVE_DNA.enabled) {
      return [];
    }
    
    const markers: GeneMarker[] = [];
    
    // Character archetype genes
    if (choice.includes('help') || choice.includes('save')) {
      markers.push({ type: 'character-altruistic', strength: 0.8, context: context.setting });
    }
    if (choice.includes('alone') || choice.includes('myself')) {
      markers.push({ type: 'character-isolated', strength: 0.7, context: context.setting });
    }
    
    // Environmental preference genes
    if (choice.includes('dark') || choice.includes('shadow')) {
      markers.push({ type: 'environment-darkness', strength: 0.6, context: context.setting });
    }
    if (choice.includes('light') || choice.includes('bright')) {
      markers.push({ type: 'environment-illuminated', strength: 0.5, context: context.setting });
    }
    
    // Narrative structure genes
    if (choice.length > 50) {
      markers.push({ type: 'structure-complex', strength: 0.4, context: 'choice-complexity' });
    }
    if (choice.includes('?') || choice.includes('uncertain')) {
      markers.push({ type: 'structure-ambiguous', strength: 0.6, context: 'uncertainty' });
    }
    
    // Horror theme genes
    if (choice.includes('fear') || choice.includes('scared')) {
      markers.push({ type: 'horror-psychological', strength: 0.9, context: context.psychologicalStatus });
    }
    if (choice.includes('fight') || choice.includes('confront')) {
      markers.push({ type: 'horror-confrontational', strength: 0.7, context: context.psychologicalStatus });
    }
    
    return markers;
  }
  
  // Evolves narrative DNA based on accumulated markers
  evolveNarrativeGenome(markers: GeneMarker[]): void {
    markers.forEach(marker => {
      this.narrativeGenome.addGeneMarker(marker);
      
      // Mutation chance
      if (Math.random() < this.mutationRate) {
        this.narrativeGenome.mutateGene(marker.type);
      }
    });
    
    this.updateGeneExpression();
    this.saveGenome();
  }
  
  // Uses DNA to generate personalized story elements
  async expressNarrativeGenes(storyContext: string): Promise<NarrativeExpressions> {
    const dominantGenes = this.narrativeGenome.getDominantGenes();
    const expressions: NarrativeExpressions = {
      characterTypes: [],
      environmentalDetails: [],
      horrorThemes: [],
      narrativeStructure: 'linear',
    };
    
    dominantGenes.forEach(gene => {
      switch (gene.category) {
        case 'character':
          expressions.characterTypes.push(this.expressCharacterGene(gene));
          break;
        case 'environment':
          expressions.environmentalDetails.push(this.expressEnvironmentGene(gene));
          break;
        case 'horror':
          expressions.horrorThemes.push(this.expressHorrorGene(gene));
          break;
        case 'structure':
          expressions.narrativeStructure = this.expressStructureGene(gene);
          break;
      }
    });
    
    return expressions;
  }
  
  private expressCharacterGene(gene: DominantGene): string {
    const expressions = {
      'character-altruistic': 'Characters who need saving or protection appear frequently',
      'character-isolated': 'Lone figures and solitary encounters dominate the narrative',
      'character-suspicious': 'Characters with hidden motives and dubious intentions',
      'character-authoritative': 'Figures of power and control who must be obeyed or defied',
    };
    
    return expressions[gene.type] || 'Mysterious characters with unclear motivations';
  }
  
  private expressEnvironmentGene(gene: DominantGene): string {
    const expressions = {
      'environment-darkness': 'Shadowy spaces, dimly lit corridors, and areas consumed by darkness',
      'environment-illuminated': 'Harsh lighting, overexposed areas, and blinding brightness',
      'environment-confined': 'Tight spaces, locked rooms, and claustrophobic environments',
      'environment-vast': 'Endless voids, infinite spaces, and overwhelming vastness',
    };
    
    return expressions[gene.type] || 'Unsettling environmental details that defy explanation';
  }
  
  private expressHorrorGene(gene: DominantGene): string {
    const expressions = {
      'horror-psychological': 'Mind-bending reality distortions and questioning of sanity',
      'horror-confrontational': 'Direct encounters with terrifying entities and situations',
      'horror-existential': 'Questions about reality, purpose, and the nature of existence',
      'horror-body': 'Physical transformation and corporeal violations',
    };
    
    return expressions[gene.type] || 'Unspeakable horror that defies categorization';
  }
  
  private expressStructureGene(gene: DominantGene): 'linear' | 'branching' | 'circular' | 'fragmented' {
    const structures = {
      'structure-complex': 'branching',
      'structure-ambiguous': 'fragmented',
      'structure-direct': 'linear',
      'structure-cyclical': 'circular',
    };
    
    return structures[gene.type] || 'linear';
  }
  
  private updateGeneExpression(): void {
    // Calculate gene expression levels based on frequency and strength
    this.narrativeGenome.getAllGenes().forEach(gene => {
      const currentExpression = this.geneExpression.get(gene.type) || 0;
      const newExpression = Math.min(currentExpression + gene.strength, 1.0);
      this.geneExpression.set(gene.type, newExpression);
    });
  }
  
  private loadExistingGenome(): void {
    try {
      const stored = localStorage.getItem('apophenia_narrative_dna');
      if (stored) {
        const data = JSON.parse(stored);
        this.narrativeGenome.loadFromData(data);
      }
    } catch (error) {
      console.warn('Failed to load existing narrative genome:', error);
    }
  }
  
  private saveGenome(): void {
    try {
      const genomeData = this.narrativeGenome.exportData();
      localStorage.setItem('apophenia_narrative_dna', JSON.stringify(genomeData));
    } catch (error) {
      console.warn('Failed to save narrative genome:', error);
    }
  }
}

/**
 * NARRATIVE GENE MAP
 * Manages the collection and evolution of narrative genes
 */
class NarrativeGeneMap {
  private genes: Map<string, GeneCluster> = new Map();
  private readonly MAX_GENES = REVOLUTIONARY_FEATURES.ADAPTIVE_NARRATIVE_DNA?.maxGeneMarkers || 50;
  
  addGeneMarker(marker: GeneMarker): void {
    const geneId = marker.type;
    
    if (!this.genes.has(geneId)) {
      this.genes.set(geneId, {
        type: marker.type,
        category: this.categorizeGene(marker.type),
        markers: [],
        dominanceScore: 0,
      });
    }
    
    const cluster = this.genes.get(geneId)!;
    cluster.markers.push(marker);
    cluster.dominanceScore = this.calculateDominance(cluster);
    
    // Limit gene pool size
    if (cluster.markers.length > 10) {
      cluster.markers = cluster.markers.slice(-10);
    }
  }
  
  mutateGene(geneType: string): void {
    const cluster = this.genes.get(geneType);
    if (!cluster) return;
    
    // Mutation slightly alters the gene's strength
    cluster.markers.forEach(marker => {
      marker.strength *= (0.9 + Math.random() * 0.2); // ±10% variation
      marker.strength = Math.min(Math.max(marker.strength, 0.1), 1.0);
    });
    
    cluster.dominanceScore = this.calculateDominance(cluster);
  }
  
  getDominantGenes(): DominantGene[] {
    return Array.from(this.genes.values())
      .filter(cluster => cluster.dominanceScore > 0.3)
      .sort((a, b) => b.dominanceScore - a.dominanceScore)
      .slice(0, 8) // Top 8 dominant genes
      .map(cluster => ({
        type: cluster.type,
        category: cluster.category,
        dominance: cluster.dominanceScore,
      }));
  }
  
  getAllGenes(): GeneMarker[] {
    const allMarkers: GeneMarker[] = [];
    this.genes.forEach(cluster => {
      allMarkers.push(...cluster.markers);
    });
    return allMarkers;
  }
  
  exportData(): any {
    const data: any = {};
    this.genes.forEach((cluster, geneId) => {
      data[geneId] = {
        type: cluster.type,
        category: cluster.category,
        dominanceScore: cluster.dominanceScore,
        markerCount: cluster.markers.length,
      };
    });
    return data;
  }
  
  loadFromData(data: any): void {
    // Simplified loading - would need more sophisticated serialization for full state
    Object.keys(data).forEach(geneId => {
      const geneData = data[geneId];
      this.genes.set(geneId, {
        type: geneData.type,
        category: geneData.category,
        markers: [], // Start fresh with markers
        dominanceScore: geneData.dominanceScore || 0,
      });
    });
  }
  
  private categorizeGene(geneType: string): 'character' | 'environment' | 'horror' | 'structure' {
    if (geneType.startsWith('character-')) return 'character';
    if (geneType.startsWith('environment-')) return 'environment';
    if (geneType.startsWith('horror-')) return 'horror';
    if (geneType.startsWith('structure-')) return 'structure';
    return 'character'; // default
  }
  
  private calculateDominance(cluster: GeneCluster): number {
    if (cluster.markers.length === 0) return 0;
    
    const averageStrength = cluster.markers.reduce((sum, marker) => sum + marker.strength, 0) / cluster.markers.length;
    const frequencyBonus = Math.min(cluster.markers.length / 10, 0.5); // Up to 50% bonus for frequency
    
    return Math.min(averageStrength + frequencyBonus, 1.0);
  }
}

// Export new engine instances
export const fifthWallBreach = new FifthWallBreachEngine();
export const adaptiveNarrativeDNA = new AdaptiveNarrativeDNAEngine();

// Supporting interfaces for new engines
interface BrowserManipulation {
  type: 'fake-notification' | 'text-bleeding' | 'phantom-interaction';
  element: HTMLElement;
  duration: number;
}

interface GeneMarker {
  type: string;
  strength: number;
  context: string;
}

interface GeneCluster {
  type: string;
  category: 'character' | 'environment' | 'horror' | 'structure';
  markers: GeneMarker[];
  dominanceScore: number;
}

interface DominantGene {
  type: string;
  category: 'character' | 'environment' | 'horror' | 'structure';
  dominance: number;
}

interface NarrativeExpressions {
  characterTypes: string[];
  environmentalDetails: string[];
  horrorThemes: string[];
  narrativeStructure: 'linear' | 'branching' | 'circular' | 'fragmented';
}

// Supporting interfaces
interface ChoiceAnalysis {
  choiceText: string;
  timestamp: number;
  linguisticPatterns: string[];
  psychologicalMarkers: string[];
  contextualFactors: string[];
}

interface SemanticProfile {
  linguisticPatterns: string[];
  psychologicalMarkers: string[];
  vulnerabilities: string[];
}