import { WorldState } from '../../../types';

/**
 * NEURAL ECHO CHAMBERS
 * Persistent memory across sessions that creates "echoes" of past decisions
 * Builds psychological continuity and haunting callbacks to previous gameplay
 * 
 * FIXED: Critical Issue #3 - Invalid Persisted Patterns Handling
 * Added comprehensive validation of localStorage data before assignment
 */
export class NeuralEchoChambers {
  private sessionMemory: Map<string, SessionMemoryEntry[]> = new Map();
  private crossSessionPatterns: string[] = [];
  private fallbackSessionId: string | null = null;

  /**
   * FIXED: Critical Issue #3 - Invalid Persisted Patterns Handling
   * Validates array structure and string content before accepting persisted patterns
   */
  initializeFromPersistence(): void {
    const ls = this.getLocalStorage();
    if (!ls) {
      console.log('Neural Echo Chambers: localStorage not available, running in memory-only mode');
      return;
    }

    try {
      const storedMemory = ls.getItem('apophenia-neural-echoes');
      if (storedMemory) {
        const parsed = JSON.parse(storedMemory);
        
        // Validate the parsed data structure
        if (this.isValidPersistedData(parsed)) {
          this.crossSessionPatterns = parsed.patterns || [];
          console.log('🧠 Neural Echo Chambers: Loaded', this.crossSessionPatterns.length, 'cross-session patterns');
        } else {
          console.warn('Neural Echo Chambers: Invalid persisted data detected, starting fresh');
          this.clearInvalidData(ls);
        }
      }
    } catch (error) {
      console.warn('Neural Echo Chambers: Failed to load persistent memory, clearing corrupted data:', error);
      this.clearInvalidData(ls);
    }
  }

  /**
   * FIXED: Critical Issue #3 - Validates localStorage data structure
   * Ensures data meets expected format before assignment to prevent echo generation breakage
   */
  private isValidPersistedData(data: any): boolean {
    // Check if data is an object
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Check if patterns field exists and is an array
    if (!Array.isArray(data.patterns)) {
      return false;
    }

    // Validate each pattern is a string and not empty
    for (const pattern of data.patterns) {
      if (typeof pattern !== 'string' || pattern.trim().length === 0) {
        return false;
      }
      
      // Check for reasonable pattern length (prevent malicious data)
      if (pattern.length > 200) {
        return false;
      }
    }

    // Check timestamp is valid if present
    if (data.timestamp !== undefined && 
        (typeof data.timestamp !== 'number' || data.timestamp < 0 || data.timestamp > Date.now() + 86400000)) {
      return false;
    }

    // Prevent excessive data (max 100 patterns)
    if (data.patterns.length > 100) {
      return false;
    }

    return true;
  }

  private clearInvalidData(ls: Storage): void {
    try {
      ls.removeItem('apophenia-neural-echoes');
      console.log('Neural Echo Chambers: Cleared invalid persisted data');
    } catch (error) {
      console.warn('Neural Echo Chambers: Could not clear invalid data:', error);
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
    
    // Convert to EchoMemory for cross-session analysis
    const echoMemory: EchoMemory = {
      choice,
      context,
      timestamp: memory.timestamp,
      psychologicalStatus: memory.psychState,
      protagonist: memory.protagonist,
      systemHealth: memory.systemHealth,
    };
    this.analyzeForCrossSessionPatterns(echoMemory);
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

  private analyzeForCrossSessionPatterns(memory: EchoMemory): void {
    const patterns = [
      memory.choice.toLowerCase().includes('trust') ? 'trust-seeker' : null,
      memory.choice.toLowerCase().includes('alone') ? 'isolation-tendency' : null,
      memory.choice.toLowerCase().includes('fight') ? 'aggressive-responder' : null,
      memory.psychologicalStatus === 'Paranoid' ? 'paranoia-spiral' : null,
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

  /**
   * FIXED: Critical Issue #3 - Safe persistence with validation
   */
  private persistMemory(): void {
    const ls = this.getLocalStorage();
    if (!ls) {
      return;
    }

    try {
      // Validate data before persisting
      const toStore = {
        patterns: this.crossSessionPatterns.filter(p => typeof p === 'string' && p.length > 0),
        timestamp: Date.now(),
      };
      
      // Additional safety check
      if (this.isValidPersistedData(toStore)) {
        ls.setItem('apophenia-neural-echoes', JSON.stringify(toStore));
      } else {
        console.warn('Neural Echo Chambers: Attempted to persist invalid data, skipping');
      }
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

/**
 * Echo memory type with proper type safety
 */
export type EchoMemory = {
  choice: string;
  context: string;
  timestamp: number;
} & Pick<WorldState, 'psychologicalStatus' | 'protagonist' | 'systemHealth'>;

type SessionMemoryEntry = {
  choice: string;
  context: string;
  timestamp: number;
  psychState: WorldState['psychologicalStatus'];
  protagonist: string;
  systemHealth: number;
};