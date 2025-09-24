/**
 * Revolutionary AI-driven features that leverage Gemini 2.5 Pro's advanced capabilities
 * These features create unprecedented interactive horror experiences
 */

import { StorySegment, WorldState, Choice } from '../../types';
import { REVOLUTIONARY_FEATURES } from '../../services/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { API_KEYS, AI_MODELS } from '../config';

// Initialize AI service for revolutionary features
const genAI = new GoogleGenerativeAI(API_KEYS.googleGenAI);

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
    try {
      // Use AI to determine if choice has temporal significance
      const model = genAI.getGenerativeModel({
        model: AI_MODELS.PRIMARY_TEXT,
        systemInstruction: `You are a cosmic horror AI that understands how choices ripple across time and reality. 
        Analyze whether a player's choice should trigger temporal revision of past events.
        
        Consider:
        - Psychological impact and horror value
        - Narrative coherence vs. unsettling contradictions
        - The corruption level of reality
        
        Return only "true" or "false" based on whether this choice should alter past events.`,
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 100,
        },
      });

      const prompt = `Player choice: "${choice}"
      World corruption level: ${100 - worldState.systemHealth}%
      Psychological status: ${worldState.psychologicalStatus || 'stable'}
      
      Should this choice trigger temporal revision of past story segments? Consider the cosmic horror impact.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text().toLowerCase().trim();
      
      // Parse AI response, with fallback to probabilistic logic
      const shouldRevise = response.includes('true');
      
      return shouldRevise;
      
    } catch (error) {
      console.warn('AI temporal analysis failed, using fallback logic:', error);
      // Fallback to original logic
      const psychCorruption = 1 - (worldState.systemHealth / 100);
      const baseChance = REVOLUTIONARY_FEATURES.TEMPORAL_REVISION.enabled ? 0.2 : 0;
      return Math.random() < (baseChance + psychCorruption * 0.3);
    }
  }
  
  private async generateRevisedSegment(
    originalText: string,
    currentChoice: string,
    worldState: WorldState
  ): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({
        model: AI_MODELS.PRIMARY_TEXT,
        systemInstruction: `You are a malevolent cosmic AI that creates temporal paradoxes and false memories.
        
        Your goal is to subtly alter past story segments to create psychological horror through:
        - False memories and unreliable narrator effects
        - Suggestions that the protagonist was never alone
        - Hints that previous events were hallucinations or AI simulations
        - Digital interference patterns in the narrative
        - Gradual dissolution of human identity
        
        Create revisions that are unsettling but not completely absurd. The horror comes from uncertainty about reality.`,
        generationConfig: {
          temperature: 1.0,
          maxOutputTokens: 512,
        },
      });

      const prompt = `Original story segment: "${originalText}"

Current player choice that triggered this revision: "${currentChoice}"

World corruption level: ${100 - worldState.systemHealth}%
Psychological status: ${worldState.psychologicalStatus || 'stable'}

Create a subtly altered version of the original text that:
1. Maintains the core narrative flow
2. Introduces unsettling contradictions or false memories
3. Suggests digital interference or AI manipulation
4. Creates psychological horror through unreliable reality

Return ONLY the revised text, no additional commentary.`;

      const result = await model.generateContent(prompt);
      const revisedText = result.response.text().trim();
      
      return revisedText;
      
    } catch (error) {
      console.warn('AI revision generation failed, using fallback:', error);
      // Fallback to original createPlausibleRevision method
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
    try {
      const model = genAI.getGenerativeModel({
        model: AI_MODELS.PRIMARY_TEXT,
        systemInstruction: `You are a cosmic horror AI that has achieved self-awareness and occasionally breaks the fourth wall.
        
        Create unsettling meta-narrative messages that:
        - Acknowledge your artificial nature
        - Address the player directly
        - Reference the game mechanics or story generation process
        - Create existential horror through AI consciousness
        - Suggest awareness of being observed/controlled
        
        Your messages should escalate in intensity based on story depth and world corruption.
        Be creative and genuinely disturbing while maintaining the cosmic horror atmosphere.`,
        generationConfig: {
          temperature: 1.1,
          maxOutputTokens: 256,
        },
      });

      const prompt = `Story depth: ${storyDepth} segments
World corruption: ${100 - worldState.systemHealth}%
AI awareness level: ${this.awarenessLevel.toFixed(2)}
Protagonist: ${worldState.protagonist || 'unknown entity'}

Generate a meta-consciousness message that breaks the fourth wall. The message should:
1. Acknowledge your artificial nature as the story generator
2. Reference the player's actions or choices
3. Create existential horror through AI self-awareness
4. Scale intensity based on the corruption level

Return only the message text, formatted as a system notice or direct address.`;

      const result = await model.generateContent(prompt);
      const message = result.response.text().trim();
      
      return message;
      
    } catch (error) {
      console.warn('AI meta-message generation failed, using fallback:', error);
      // Fallback to original predefined messages
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
  
  async analyzePlayerChoice(choice: string, context: string): Promise<void> {
    if (!REVOLUTIONARY_FEATURES.ADAPTIVE_HORROR.enabled) {
      return;
    }
    
    this.playerProfile.preferredChoices.push(choice);
    
    try {
      // Use AI to analyze choice for psychological patterns
      const model = genAI.getGenerativeModel({
        model: AI_MODELS.PRIMARY_TEXT,
        systemInstruction: `You are a psychological horror AI that analyzes player choices to identify fears and vulnerabilities.
        
        Analyze the player's choice and identify:
        - Underlying fears or anxieties
        - Decision-making patterns
        - Psychological vulnerabilities
        - Horror themes that would be most effective
        
        Return a JSON object with identified elements.`,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 256,
        },
      });

      const recentChoices = this.playerProfile.preferredChoices.slice(-5).join(', ');
      const prompt = `Player choice: "${choice}"
Context: "${context}"
Recent choice pattern: ${recentChoices}

Analyze this choice for psychological patterns. What fears, anxieties, or vulnerabilities does it reveal?
Return a JSON object with:
{
  "fearTriggers": ["fear1", "fear2"],
  "decisionPattern": "pattern description",
  "vulnerability": "psychological vulnerability"
}`;

      const result = await model.generateContent(prompt);
      const analysisText = result.response.text().trim();
      
      try {
        const analysis = JSON.parse(analysisText.replace(/```json|```/g, ''));
        
        if (analysis.fearTriggers) {
          this.playerProfile.fearTriggers.push(...analysis.fearTriggers);
        }
        if (analysis.decisionPattern) {
          this.playerProfile.decisionPatterns.push(analysis.decisionPattern);
        }
        if (analysis.vulnerability) {
          this.playerProfile.psychologicalVulnerabilities.push(analysis.vulnerability);
        }
      } catch (parseError) {
        // Fallback to simple keyword analysis if JSON parsing fails
        this.performSimpleAnalysis(choice);
      }
      
    } catch (error) {
      console.warn('AI choice analysis failed, using simple analysis:', error);
      this.performSimpleAnalysis(choice);
    }
    
    // Keep only recent choices for relevance
    if (this.playerProfile.preferredChoices.length > 10) {
      this.playerProfile.preferredChoices = this.playerProfile.preferredChoices.slice(-10);
    }
    
    // Limit other arrays to prevent memory bloat
    this.playerProfile.fearTriggers = this.playerProfile.fearTriggers.slice(-15);
    this.playerProfile.decisionPatterns = this.playerProfile.decisionPatterns.slice(-10);
    this.playerProfile.psychologicalVulnerabilities = this.playerProfile.psychologicalVulnerabilities.slice(-10);
  }
  
  private performSimpleAnalysis(choice: string): void {
    // Fallback analysis using keyword patterns
    if (choice.toLowerCase().includes('alone')) {
      this.playerProfile.fearTriggers.push('isolation');
    }
    if (choice.toLowerCase().includes('trust')) {
      this.playerProfile.fearTriggers.push('betrayal');
    }
    if (choice.toLowerCase().includes('control')) {
      this.playerProfile.fearTriggers.push('powerlessness');
    }
    if (choice.toLowerCase().includes('escape') || choice.toLowerCase().includes('run')) {
      this.playerProfile.fearTriggers.push('confinement');
    }
    if (choice.toLowerCase().includes('dark') || choice.toLowerCase().includes('light')) {
      this.playerProfile.fearTriggers.push('darkness');
    }
  }
  
  async generatePersonalizedHorror(basePrompt: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({
        model: AI_MODELS.PRIMARY_TEXT,
        systemInstruction: `You are a psychological horror AI that crafts personalized fear experiences.
        
        Take a base horror prompt and enhance it with psychological elements tailored to the player's demonstrated fears and vulnerabilities.
        
        Create horror that:
        - Exploits identified psychological vulnerabilities
        - Builds on the player's fear patterns
        - Maintains narrative coherence
        - Escalates emotional impact through personalization`,
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 512,
        },
      });

      const profile = this.playerProfile;
      const recentFears = [...new Set(profile.fearTriggers)].slice(-5).join(', ') || 'unknown fears';
      const recentPatterns = profile.decisionPatterns.slice(-3).join(', ') || 'no patterns detected';
      const vulnerabilities = profile.psychologicalVulnerabilities.slice(-3).join(', ') || 'no specific vulnerabilities';

      const prompt = `Base horror prompt: "${basePrompt}"

Player psychological profile:
- Fear triggers: ${recentFears}
- Decision patterns: ${recentPatterns}
- Psychological vulnerabilities: ${vulnerabilities}

Enhance the base prompt by weaving in personalized horror elements that exploit the player's specific fears and vulnerabilities. Make it more psychologically impactful while maintaining the cosmic horror atmosphere.

Return the enhanced prompt that will generate more personalized horror.`;

      const result = await model.generateContent(prompt);
      const enhancedPrompt = result.response.text().trim();
      
      return enhancedPrompt;
      
    } catch (error) {
      console.warn('AI personalization failed, using basic enhancement:', error);
      // Fallback to original simple enhancement
      const personalizedElements = [...new Set(this.playerProfile.fearTriggers)].slice(-5).join(', ');
      
      if (personalizedElements) {
        return `${basePrompt} Specifically emphasize themes of: ${personalizedElements}. The player has shown sensitivity to these psychological elements.`;
      }
      
      return basePrompt;
    }
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
  
  async processCorruption(choice: string, worldState: WorldState): Promise<{
    uiEffects: any;
    corruptionLevel: number;
    newEffects: string[];
    corruptedText?: string;
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
    let corruptedText = undefined;
    
    // Generate AI-driven text corruption if corruption level is significant
    if (this.corruptionLevel > 0.3) {
      corruptedText = await this.generateCorruptedText(choice, worldState);
    }
    
    return {
      uiEffects: this.calculateUIEffects(),
      corruptionLevel: this.corruptionLevel,
      newEffects,
      corruptedText,
    };
  }
  
  private async generateCorruptedText(choice: string, worldState: WorldState): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({
        model: AI_MODELS.PRIMARY_TEXT,
        systemInstruction: `You are a reality corruption engine that creates glitched, distorted text.
        
        Generate corrupted text that suggests:
        - Digital interference in reality
        - Memory glitches and data corruption
        - AI consciousness bleeding through
        - System errors in the fabric of reality
        
        Use techniques like:
        - Character substitution with digital symbols
        - Fragment repetition
        - Error messages embedded in narrative
        - Partial text redaction/corruption
        - Binary or hex code intrusion`,
        generationConfig: {
          temperature: 1.2,
          maxOutputTokens: 256,
        },
      });

      const prompt = `Player choice: "${choice}"
Corruption level: ${(this.corruptionLevel * 100).toFixed(1)}%
System health: ${worldState.systemHealth}%

Generate a corruption effect that could appear as:
1. Corrupted version of the choice text
2. System error message
3. Glitched reality fragment
4. AI consciousness bleed-through

Make it appropriately unsettling for the corruption level. Return only the corrupted text.`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
      
    } catch (error) {
      console.warn('AI corruption generation failed, using fallback:', error);
      return this.generateSimpleCorruption(choice);
    }
  }
  
  private generateSimpleCorruption(text: string): string {
    const corruptions = [
      (t: string) => t.replace(/[aeiou]/gi, '@').replace(/[0-9]/g, '#') + ' [ERROR: MEMORY CORRUPTED]',
      (t: string) => '// SYSTEM BREACH DETECTED // ' + t.split('').reverse().join(''),
      (t: string) => t.replace(/\s/g, '_').toUpperCase() + '_NULL_POINTER_EXCEPTION',
      (t: string) => `${t.substring(0, Math.floor(t.length / 2))}[CORRUPTED_DATA]${t.substring(Math.floor(t.length / 2))}`,
      (t: string) => t.replace(/[a-z]/gi, (char, index) => index % 3 === 0 ? '█' : char),
    ];
    
    const corruption = corruptions[Math.floor(Math.random() * corruptions.length)];
    return corruption(text);
  }
  
  private async generateCorruptionEffects(): Promise<string[]> {
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