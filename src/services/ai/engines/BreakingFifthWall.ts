import { WorldState } from '../../../types';

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