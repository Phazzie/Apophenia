import { WorldState } from '../../../types';
import {
  StorageManager,
  getOrCreateSessionId,
} from '../../../utils/storageUtils';

/**
 * NEURAL ECHO CHAMBERS
 * Persistent memory across sessions that creates "echoes" of past decisions
 * Builds psychological continuity and haunting callbacks to previous gameplay
 */

interface EchoPersistence {
  patterns: string[];
  timestamp: number;
}

const DEFAULT_PERSISTENCE: EchoPersistence = {
  patterns: [],
  timestamp: Date.now(),
};

export class NeuralEchoChambers {
  private sessionMemory: Map<string, SessionMemoryEntry[]> = new Map();
  private crossSessionPatterns: string[] = [];
  private storage: StorageManager<EchoPersistence>;

  constructor() {
    this.storage = new StorageManager(
      'apophenia-neural-echoes',
      DEFAULT_PERSISTENCE,
      false, // use localStorage
      true   // debug mode
    );
  }

  initializeFromPersistence(): void {
    const stored = this.storage.load();
    this.crossSessionPatterns = stored.patterns || [];

    if (this.crossSessionPatterns.length > 0) {
      console.log(
        '🧠 Neural Echo Chambers: Loaded',
        this.crossSessionPatterns.length,
        'cross-session patterns'
      );
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

  generateEchoPrompt(currentChoice: string): string | null {
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
    return getOrCreateSessionId('apophenia-session-id');
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

  private persistMemory(): void {
    const toStore: EchoPersistence = {
      patterns: this.crossSessionPatterns,
      timestamp: Date.now(),
    };
    this.storage.save(toStore);
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