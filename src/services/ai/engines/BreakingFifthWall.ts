import { WorldState } from '../../../types';

/**
 * BREAKING THE FIFTH WALL
 * Browser manipulation effects that break beyond the fourth wall
 * Manipulates the browser environment itself for horror effects
 */
export class BreakingFifthWall {
  private originalTitle: string | null = null;
  private titleInterval: ReturnType<typeof setInterval> | null = null;
  private faviconInterval: ReturnType<typeof setInterval> | null = null;
  private windowTimeouts: ReturnType<typeof setTimeout>[] = [];
  private isActive: boolean = false;

  activateBreakage(intensity: number, worldState: WorldState): void {
    if (this.isActive || intensity < 0.3) return;

    const doc = this.getDocument();
    if (!doc) {
      console.warn('BreakingFifthWall: document not available, skipping activation');
      return;
    }

    if (this.originalTitle === null) {
      this.originalTitle = doc.title || 'Apophenia';
    }

    this.isActive = true;
    console.log('💥 FIFTH WALL BREACH: Browser manipulation activated');

    // Progressive browser effects based on intensity
    if (intensity > 0.3) this.manipulateTitle(doc, worldState);
    if (intensity > 0.5) this.manipulateFavicon(doc);
    if (intensity > 0.7) this.manipulateWindow(doc);
  }

  deactivateBreakage(): void {
    this.cleanup();
  }

  cleanup(): void {
    if (!this.isActive) return;

    this.isActive = false;
    const doc = this.getDocument();
    if (doc && this.originalTitle !== null) {
      doc.title = this.originalTitle;
    }

    if (this.titleInterval) {
      clearInterval(this.titleInterval);
      this.titleInterval = null;
    }

    if (this.faviconInterval) {
      clearInterval(this.faviconInterval);
      this.faviconInterval = null;
    }

    // Clear all window manipulation timeouts
    this.windowTimeouts.forEach(timeout => clearTimeout(timeout));
    this.windowTimeouts = [];

    console.log('💥 Fifth Wall effects deactivated and cleaned up');
  }

  private manipulateTitle(doc: Document, worldState: WorldState): void {
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
        doc.title = corruptedTitles[titleIndex % corruptedTitles.length];
        titleIndex++;
      } else {
        doc.title = this.originalTitle || 'Apophenia';
      }
    }, 2000 + Math.random() * 3000); // Random interval 2-5 seconds
  }

  private manipulateFavicon(doc: Document): void {
    const faviconElement = doc.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
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

  private manipulateWindow(doc: Document): void {
    const win = this.getWindow();
    if (!win) {
      return;
    }
    // Subtle window effects that don't break user experience
    const originalScrollBehavior = doc.documentElement?.style.scrollBehavior ?? '';

    // Occasionally make scrolling slightly jerky
    const timeout1 = setTimeout(() => {
      if (!doc.documentElement) {
        return;
      }

      doc.documentElement.style.scrollBehavior = 'auto';
      win.scrollBy(0, Math.random() * 2 - 1); // Tiny random scroll

      const timeout2 = setTimeout(() => {
        if (!doc.documentElement) {
          return;
        }

        doc.documentElement.style.scrollBehavior = originalScrollBehavior;
      }, 100);
      
      this.windowTimeouts.push(timeout2);
    }, Math.random() * 10000 + 5000); // Random delay 5-15 seconds
    
    this.windowTimeouts.push(timeout1);
  }

  private getDocument(): Document | null {
    if (typeof document === 'undefined') {
      return null;
    }
    return document;
  }

  private getWindow(): Window | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return window;
  }
}
