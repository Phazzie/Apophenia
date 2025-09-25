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
  try {
    const parsedUrl = new URL(url, window.location.origin);
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      window.open(parsedUrl.href, '_blank');
    } else {
      // Optionally, handle invalid protocol (e.g., log or ignore)
      console.warn('Blocked attempt to open a URL with disallowed protocol:', parsedUrl.protocol);
    }
  } catch (e) {
    // Optionally, handle invalid URL (e.g., log or ignore)
    console.warn('Blocked attempt to open an invalid URL:', url);
  }
};

/**
 * Manipulate the browser history by pushing a new state and URL fragment/path.
 * @param state The state object to associate with the new history entry.
 * @param url The URL fragment or path to add to the history.
 */
export const manipulateHistory = (state: any = { realityGlitch: true }, url: string = '#reality-glitch'): void => {
  // This is a sensitive operation and should be used with caution.
  window.history.pushState(state, '', url);
};