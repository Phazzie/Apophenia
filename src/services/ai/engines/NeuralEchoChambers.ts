import { WorldState } from '../../../types';

/**
 * NEURAL ECHO CHAMBERS
 * Persistent memory across sessions that creates "echoes" of past decisions
 * Builds psychological continuity and haunting callbacks to previous gameplay
 */
export class NeuralEchoChambers {
  private sessionMemory: Map<string, SessionMemoryEntry[]> = new Map();
  private crossSessionPatterns: string[] = [];
  private fallbackSessionId: string | null = null;

  initializeFromPersistence(): void {
    const ls = this.getLocalStorage();
    if (!ls) {
      return;
    }

    try {
      const storedMemory = ls.getItem('apophenia-neural-echoes');
      if (storedMemory) {
        const parsed = JSON.parse(storedMemory);
        this.crossSessionPatterns = parsed.patterns || [];
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

    const memory: SessionMemoryEntry = {
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
    const sessionStorage = this.getSessionStorage();
    if (!sessionStorage) {
      if (!this.fallbackSessionId) {
        this.fallbackSessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      }
      return this.fallbackSessionId;
    }

    let sessionId = sessionStorage.getItem('apophenia-session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      sessionStorage.setItem('apophenia-session-id', sessionId);
    }
    return sessionId;
  }

  private analyzeForCrossSessionPatterns(memory: SessionMemoryEntry): void {
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
    const ls = this.getLocalStorage();
    if (!ls) {
      return;
    }

    try {
      const toStore = {
        patterns: this.crossSessionPatterns,
        timestamp: Date.now(),
      };
      ls.setItem('apophenia-neural-echoes', JSON.stringify(toStore));
    } catch (error) {
      console.warn('Neural Echo Chambers: Failed to persist memory:', error);
    }
  }

  private getLocalStorage(): Storage | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return window.localStorage;
  }

  private getSessionStorage(): Storage | null {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return null;
    }
    return window.sessionStorage;
  }
}

type SessionMemoryEntry = {
  choice: string;
  context: string;
  timestamp: number;
  psychState: WorldState['psychologicalStatus'];
  protagonist: string;
  systemHealth: number;
};