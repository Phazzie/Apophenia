/**
 * Analytics Service - Track player engagement and behavior
 * 
 * Captures events like:
 * - Game starts/ends
 * - Choices made
 * - Horror engine responses
 * - Session duration
 * - Image generation performance
 */

export interface AnalyticsEvent {
  type: 'game_start' | 'game_end' | 'choice_made' | 'horror_trigger' | 'image_generated' | 'error';
  timestamp: number;
  sessionId: string;
  data?: Record<string, unknown>;
}

export interface SessionMetrics {
  sessionId: string;
  startTime: number;
  endTime?: number;
  totalChoices: number;
  averageChoiceTime: number;
  horrorIntensityProgression: number[];
  fearTriggersIdentified: string[];
  imagesGenerated: number;
  errors: number;
}

export interface EngagementMetrics {
  totalSessions: number;
  totalPlayTime: number; // milliseconds
  averageSessionLength: number;
  totalChoicesMade: number;
  mostCommonChoices: Array<{ text: string; count: number }>;
  horrorEngineEffectiveness: number; // 0-1 score
  imageGenerationPerformance: {
    averageTime: number;
    cacheHitRate: number;
    failureRate: number;
  };
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private currentSessionId: string | null = null;
  private sessionStartTime: number | null = null;
  private lastChoiceTime: number | null = null;
  
  private readonly STORAGE_KEY = 'apophenia_analytics';
  private readonly MAX_EVENTS = 1000; // Keep last 1000 events

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Start a new analytics session
   */
  startSession(): string {
    this.currentSessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    
    this.trackEvent({
      type: 'game_start',
      timestamp: Date.now(),
      sessionId: this.currentSessionId,
      data: {
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`
      }
    });
    
    return this.currentSessionId;
  }

  /**
   * End the current session
   */
  endSession(): void {
    if (!this.currentSessionId) return;
    
    this.trackEvent({
      type: 'game_end',
      timestamp: Date.now(),
      sessionId: this.currentSessionId,
      data: {
        sessionDuration: this.getSessionDuration()
      }
    });
    
    this.currentSessionId = null;
    this.sessionStartTime = null;
    this.lastChoiceTime = null;
  }

  /**
   * Track a player choice
   */
  trackChoice(choiceText: string, choiceIndex: number, contextData?: Record<string, unknown>): void {
    if (!this.currentSessionId) return;
    
    const now = Date.now();
    const timeSinceLastChoice = this.lastChoiceTime ? now - this.lastChoiceTime : null;
    
    this.trackEvent({
      type: 'choice_made',
      timestamp: now,
      sessionId: this.currentSessionId,
      data: {
        choiceText,
        choiceIndex,
        timeSinceLastChoice,
        ...contextData
      }
    });
    
    this.lastChoiceTime = now;
  }

  /**
   * Track horror engine fear trigger identification
   */
  trackHorrorTrigger(fearTrigger: string, intensity: number): void {
    if (!this.currentSessionId) return;
    
    this.trackEvent({
      type: 'horror_trigger',
      timestamp: Date.now(),
      sessionId: this.currentSessionId,
      data: { fearTrigger, intensity }
    });
  }

  /**
   * Track image generation performance
   */
  trackImageGeneration(prompt: string, duration: number, fromCache: boolean, success: boolean): void {
    if (!this.currentSessionId) return;
    
    this.trackEvent({
      type: 'image_generated',
      timestamp: Date.now(),
      sessionId: this.currentSessionId,
      data: { prompt, duration, fromCache, success }
    });
  }

  /**
   * Track errors
   */
  trackError(errorType: string, errorMessage: string, context?: Record<string, unknown>): void {
    this.trackEvent({
      type: 'error',
      timestamp: Date.now(),
      sessionId: this.currentSessionId || 'no-session',
      data: { errorType, errorMessage, ...context }
    });
  }

  /**
   * Get metrics for current session
   */
  getCurrentSessionMetrics(): SessionMetrics | null {
    if (!this.currentSessionId) return null;
    
    const sessionEvents = this.events.filter(e => e.sessionId === this.currentSessionId);
    const choiceEvents = sessionEvents.filter(e => e.type === 'choice_made');
    const horrorEvents = sessionEvents.filter(e => e.type === 'horror_trigger');
    const imageEvents = sessionEvents.filter(e => e.type === 'image_generated');
    const errorEvents = sessionEvents.filter(e => e.type === 'error');
    
    const choiceTimes = choiceEvents
      .map(e => e.data?.timeSinceLastChoice as number)
      .filter(t => t !== null && t !== undefined);
    
    return {
      sessionId: this.currentSessionId,
      startTime: this.sessionStartTime || Date.now(),
      totalChoices: choiceEvents.length,
      averageChoiceTime: choiceTimes.length > 0 
        ? choiceTimes.reduce((a, b) => a + b, 0) / choiceTimes.length 
        : 0,
      horrorIntensityProgression: horrorEvents.map(e => e.data?.intensity as number || 0),
      fearTriggersIdentified: horrorEvents.map(e => e.data?.fearTrigger as string),
      imagesGenerated: imageEvents.length,
      errors: errorEvents.length
    };
  }

  /**
   * Get aggregate engagement metrics across all sessions
   */
  getEngagementMetrics(): EngagementMetrics {
    const sessions = this.getUniqueSessions();
    const choiceEvents = this.events.filter(e => e.type === 'choice_made');
    const imageEvents = this.events.filter(e => e.type === 'image_generated');
    
    // Calculate choice frequency
    const choiceCounts = new Map<string, number>();
    choiceEvents.forEach(event => {
      const text = event.data?.choiceText as string;
      if (text) {
        choiceCounts.set(text, (choiceCounts.get(text) || 0) + 1);
      }
    });
    
    const mostCommonChoices = Array.from(choiceCounts.entries())
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Calculate session durations
    const sessionDurations = sessions.map(sessionId => {
      const sessionEvents = this.events.filter(e => e.sessionId === sessionId);
      const startEvent = sessionEvents.find(e => e.type === 'game_start');
      const endEvent = sessionEvents.find(e => e.type === 'game_end');
      
      if (startEvent && endEvent) {
        return endEvent.timestamp - startEvent.timestamp;
      }
      return 0;
    }).filter(d => d > 0);
    
    const totalPlayTime = sessionDurations.reduce((a, b) => a + b, 0);
    const averageSessionLength = sessionDurations.length > 0 
      ? totalPlayTime / sessionDurations.length 
      : 0;
    
    // Image generation metrics
    const imageTimes = imageEvents
      .map(e => e.data?.duration as number)
      .filter(t => t !== null && t !== undefined);
    const cacheHits = imageEvents.filter(e => e.data?.fromCache === true).length;
    const imageFailures = imageEvents.filter(e => e.data?.success === false).length;
    
    return {
      totalSessions: sessions.length,
      totalPlayTime,
      averageSessionLength,
      totalChoicesMade: choiceEvents.length,
      mostCommonChoices,
      horrorEngineEffectiveness: this.calculateHorrorEffectiveness(),
      imageGenerationPerformance: {
        averageTime: imageTimes.length > 0 
          ? imageTimes.reduce((a, b) => a + b, 0) / imageTimes.length 
          : 0,
        cacheHitRate: imageEvents.length > 0 ? cacheHits / imageEvents.length : 0,
        failureRate: imageEvents.length > 0 ? imageFailures / imageEvents.length : 0
      }
    };
  }

  /**
   * Get all events (for debugging/analysis)
   */
  getAllEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Clear all analytics data
   */
  clear(): void {
    this.events = [];
    this.currentSessionId = null;
    this.sessionStartTime = null;
    this.lastChoiceTime = null;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Private methods

  private trackEvent(event: AnalyticsEvent): void {
    this.events.push(event);
    
    // Trim to max events (FIFO)
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }
    
    this.saveToStorage();
  }

  private generateSessionId(): string {
    // Use crypto.randomUUID() for cryptographically secure random IDs
    return `session-${crypto.randomUUID()}`;
  }

  private getSessionDuration(): number {
    if (!this.sessionStartTime) return 0;
    return Date.now() - this.sessionStartTime;
  }

  private getUniqueSessions(): string[] {
    const sessions = new Set<string>();
    this.events.forEach(event => sessions.add(event.sessionId));
    return Array.from(sessions);
  }

  private calculateHorrorEffectiveness(): number {
    // Simple heuristic: ratio of horror triggers to choices
    const horrorEvents = this.events.filter(e => e.type === 'horror_trigger');
    const choiceEvents = this.events.filter(e => e.type === 'choice_made');
    
    if (choiceEvents.length === 0) return 0;
    
    // Ideal: ~30-50% of choices trigger horror analysis
    const ratio = horrorEvents.length / choiceEvents.length;
    return Math.min(ratio / 0.4, 1); // Normalize to 0-1
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.events));
    } catch (error) {
      console.warn('Failed to save analytics to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load analytics from localStorage:', error);
      this.events = [];
    }
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService();
