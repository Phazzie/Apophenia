/**
 * Developer Mode Utilities
 *
 * Toggle debug features and advanced controls for development
 */

// Type extensions for Chrome-specific APIs
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceMemory extends Performance {
  memory?: MemoryInfo;
}

interface WindowWithDebug extends Window {
  __GAME_STATE__?: unknown;
  __WORLD_STATE__?: unknown;
  __STORY_HISTORY__?: unknown;
  devMode?: DevModeService;
}

interface DevModeState {
  enabled: boolean;
  showDebugInfo: boolean;
  showAIPrompts: boolean;
  showPerformanceMetrics: boolean;
  enableManualHorrorControl: boolean;
  logAllEvents: boolean;
}

class DevModeService {
  private state: DevModeState = {
    enabled: false,
    showDebugInfo: false,
    showAIPrompts: false,
    showPerformanceMetrics: false,
    enableManualHorrorControl: false,
    logAllEvents: false
  };

  private readonly STORAGE_KEY = 'apophenia_dev_mode';

  constructor() {
    this.loadFromStorage();
    this.setupKeyboardShortcut();
  }

  /**
   * Toggle developer mode on/off
   */
  toggle(): void {
    this.state.enabled = !this.state.enabled;
    this.saveToStorage();
    
    console.log(`🛠️ Developer Mode: ${this.state.enabled ? 'ENABLED' : 'DISABLED'}`);
    
    if (this.state.enabled) {
      this.showWelcomeMessage();
    }
  }

  /**
   * Enable specific dev feature
   */
  enable(feature: keyof Omit<DevModeState, 'enabled'>): void {
    if (!this.state.enabled) {
      console.warn('Developer mode is not enabled. Enable it first with Ctrl+Shift+D');
      return;
    }
    
    this.state[feature] = true;
    this.saveToStorage();
    console.log(`✅ Enabled: ${feature}`);
  }

  /**
   * Disable specific dev feature
   */
  disable(feature: keyof Omit<DevModeState, 'enabled'>): void {
    this.state[feature] = false;
    this.saveToStorage();
    console.log(`❌ Disabled: ${feature}`);
  }

  /**
   * Get current dev mode state
   */
  getState(): Readonly<DevModeState> {
    return { ...this.state };
  }

  /**
   * Check if developer mode is enabled
   */
  isEnabled(): boolean {
    return this.state.enabled;
  }

  /**
   * Check if specific feature is enabled
   */
  isFeatureEnabled(feature: keyof Omit<DevModeState, 'enabled'>): boolean {
    return this.state.enabled && this.state[feature];
  }

  /**
   * Log debug info (only if enabled)
   */
  log(category: string, ...args: any[]): void {
    if (this.state.enabled && this.state.logAllEvents) {
      console.log(`[DEV:${category}]`, ...args);
    }
  }

  /**
   * Get performance snapshot
   */
  getPerformanceSnapshot(): Record<string, any> {
    if (!this.state.enabled || !this.state.showPerformanceMetrics) {
      return {};
    }

    const perfWithMemory = performance as PerformanceMemory;

    return {
      memory: perfWithMemory.memory ? {
        usedJSHeapSize: (perfWithMemory.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
        totalJSHeapSize: (perfWithMemory.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
        jsHeapSizeLimit: (perfWithMemory.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
      } : 'Not available',
      timing: {
        loadTime: (performance.timing.loadEventEnd - performance.timing.navigationStart) + ' ms',
        domReady: (performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart) + ' ms',
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime.toFixed(2) + ' ms' || 'N/A'
      },
      resources: performance.getEntriesByType('resource').length + ' resources loaded'
    };
  }

  /**
   * Export current game state for debugging
   */
  exportGameState(): void {
    if (!this.state.enabled) {
      console.warn('Developer mode is not enabled');
      return;
    }

    const win = window as WindowWithDebug;

    // Gather all store states
    const gameState = {
      timestamp: new Date().toISOString(),
      stores: {
        game: win.__GAME_STATE__ || 'Not available',
        world: win.__WORLD_STATE__ || 'Not available',
        story: win.__STORY_HISTORY__ || 'Not available'
      },
      performance: this.getPerformanceSnapshot()
    };

    const blob = new Blob([JSON.stringify(gameState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apophenia-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('📥 Game state exported');
  }

  private setupKeyboardShortcut(): void {
    window.addEventListener('keydown', (e) => {
      // Ctrl+Shift+D = Toggle Developer Mode
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggle();
      }

      // Developer mode shortcuts (only when enabled)
      if (this.state.enabled) {
        // Ctrl+Shift+E = Export game state
        if (e.ctrlKey && e.shiftKey && e.key === 'E') {
          e.preventDefault();
          this.exportGameState();
        }

        // Ctrl+Shift+P = Toggle performance metrics
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
          e.preventDefault();
          this.state.showPerformanceMetrics = !this.state.showPerformanceMetrics;
          this.saveToStorage();
          console.log(`Performance metrics: ${this.state.showPerformanceMetrics ? 'ON' : 'OFF'}`);
        }

        // Ctrl+Shift+L = Toggle event logging
        if (e.ctrlKey && e.shiftKey && e.key === 'L') {
          e.preventDefault();
          this.state.logAllEvents = !this.state.logAllEvents;
          this.saveToStorage();
          console.log(`Event logging: ${this.state.logAllEvents ? 'ON' : 'OFF'}`);
        }
      }
    });
  }

  private showWelcomeMessage(): void {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║         🛠️  APOPHENIA DEVELOPER MODE ENABLED  🛠️          ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Keyboard Shortcuts:                                      ║
║  • Ctrl+Shift+D  - Toggle Developer Mode                  ║
║  • Ctrl+Shift+E  - Export Game State                      ║
║  • Ctrl+Shift+P  - Toggle Performance Metrics             ║
║  • Ctrl+Shift+L  - Toggle Event Logging                   ║
║  • Ctrl+Shift+A  - Open Analytics Dashboard               ║
║                                                           ║
║  Console Commands:                                        ║
║  • devMode.enable('showDebugInfo')                        ║
║  • devMode.enable('showAIPrompts')                        ║
║  • devMode.enable('enableManualHorrorControl')            ║
║  • devMode.getPerformanceSnapshot()                       ║
║  • devMode.exportGameState()                              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.warn('Failed to save dev mode state:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.state = { ...this.state, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load dev mode state:', error);
    }
  }
}

// Global singleton
export const devMode = new DevModeService();

// Expose to window for console access
if (typeof window !== 'undefined') {
  (window as WindowWithDebug).devMode = devMode;
}
