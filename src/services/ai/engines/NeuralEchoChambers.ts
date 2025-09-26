import { WorldState } from '../../../types';

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