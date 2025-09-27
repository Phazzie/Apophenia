/**
 * @file browserManipulator.ts
 * @description This service provides functions for manipulating the browser environment
 * as part of the Reality Corruption Engine. These effects are designed to break the
 * fourth wall and create a sense of unease by making the game feel like it's
 * bleeding into the user's browser.
 */

/**
 * Changes the title of the browser tab/window.
 * @param {string} newTitle - The new title to set for the document.
 */
export const changePageTitle = (newTitle: string): void => {
  document.title = newTitle;
};

/**
 * Opens a new browser tab with the specified URL.
 * Can be used to lead players to external, unsettling content.
 * @param {string} url - The URL to open in a new tab.
 */
export const openNewTab = (url: string): void => {
  window.open(url, '_blank');
};

/**
 * Manipulates the browser's session history.
 * This is a sensitive operation used to create a "glitch" effect in the browser's
 * history, making it seem like the game is altering the user's navigation stack.
 */
export const manipulateHistory = (): void => {
  // This is a sensitive operation used sparingly for effect.
  // It adds a dummy state to the history to create a glitch-like entry.
  window.history.pushState({ data: "reality-glitch" }, '', '#the-corruption-spreads');
};