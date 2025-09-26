/**
 * Browser Manipulator
 *
 * This service provides functions for manipulating the browser environment
 * to create "Breaking the Fifth Wall" effects.
 */

export const changePageTitle = (newTitle: string): void => {
  document.title = newTitle;
};

export const openNewTab = (url: string): void => {
  window.open(url, '_blank');
};

export const manipulateHistory = (): void => {
  // This is a more sensitive operation and should be used with caution.
  // For now, we'll just add a dummy state to the history.
  window.history.pushState({ a: "b" }, '', '#reality-glitch');
};