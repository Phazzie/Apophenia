/**
 * Shared Storage Utilities
 *
 * Centralized logic for localStorage and sessionStorage operations
 * Provides type-safe, error-resistant storage with SSR compatibility
 */

export interface StorageOptions<T> {
  /** Default value to return if storage is unavailable or parsing fails */
  defaultValue: T;
  /** Optional custom error handler */
  onError?: (error: unknown, operation: 'load' | 'save') => void;
  /** Whether to log operations to console (default: true for dev) */
  debug?: boolean;
}

/**
 * Check if localStorage is available (handles SSR and browser restrictions)
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    // Test if we can actually use localStorage (some browsers block it)
    const testKey = '__apophenia_storage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if sessionStorage is available (handles SSR and browser restrictions)
 */
export function isSessionStorageAvailable(): boolean {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return false;
  }

  try {
    // Test if we can actually use sessionStorage (some browsers block it)
    const testKey = '__apophenia_storage_test__';
    window.sessionStorage.setItem(testKey, 'test');
    window.sessionStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely load a value from localStorage with JSON parsing and error handling
 *
 * @param key The localStorage key
 * @param options Storage options including default value
 * @returns The parsed value or default value
 */
export function loadFromLocalStorage<T>(
  key: string,
  options: StorageOptions<T>
): T {
  const { defaultValue, onError, debug = false } = options;

  if (!isLocalStorageAvailable()) {
    if (debug) {
      console.warn(`localStorage not available for key: ${key}`);
    }
    return defaultValue;
  }

  try {
    const stored = window.localStorage.getItem(key);

    if (stored === null) {
      if (debug) {
        console.log(`No stored value found for key: ${key}`);
      }
      return defaultValue;
    }

    const parsed = JSON.parse(stored) as T;

    if (debug) {
      console.log(`✅ Loaded from localStorage: ${key}`, parsed);
    }

    return parsed;
  } catch (error) {
    console.warn(`Failed to load from localStorage: ${key}`, error);

    if (onError) {
      onError(error, 'load');
    }

    return defaultValue;
  }
}

/**
 * Safely save a value to localStorage with JSON stringification and error handling
 *
 * @param key The localStorage key
 * @param value The value to save
 * @param options Optional storage options
 * @returns true if save succeeded, false otherwise
 */
export function saveToLocalStorage<T>(
  key: string,
  value: T,
  options: { onError?: (error: unknown) => void; debug?: boolean } = {}
): boolean {
  const { onError, debug = false } = options;

  if (!isLocalStorageAvailable()) {
    if (debug) {
      console.warn(`localStorage not available, cannot save key: ${key}`);
    }
    return false;
  }

  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);

    if (debug) {
      console.log(`💾 Saved to localStorage: ${key}`);
    }

    return true;
  } catch (error) {
    console.warn(`Failed to save to localStorage: ${key}`, error);

    if (onError) {
      onError(error);
    }

    return false;
  }
}

/**
 * Safely load a value from sessionStorage with JSON parsing and error handling
 *
 * @param key The sessionStorage key
 * @param options Storage options including default value
 * @returns The parsed value or default value
 */
export function loadFromSessionStorage<T>(
  key: string,
  options: StorageOptions<T>
): T {
  const { defaultValue, onError, debug = false } = options;

  if (!isSessionStorageAvailable()) {
    if (debug) {
      console.warn(`sessionStorage not available for key: ${key}`);
    }
    return defaultValue;
  }

  try {
    const stored = window.sessionStorage.getItem(key);

    if (stored === null) {
      if (debug) {
        console.log(`No stored value found in session for key: ${key}`);
      }
      return defaultValue;
    }

    const parsed = JSON.parse(stored) as T;

    if (debug) {
      console.log(`✅ Loaded from sessionStorage: ${key}`, parsed);
    }

    return parsed;
  } catch (error) {
    console.warn(`Failed to load from sessionStorage: ${key}`, error);

    if (onError) {
      onError(error, 'load');
    }

    return defaultValue;
  }
}

/**
 * Safely save a value to sessionStorage with JSON stringification and error handling
 *
 * @param key The sessionStorage key
 * @param value The value to save
 * @param options Optional storage options
 * @returns true if save succeeded, false otherwise
 */
export function saveToSessionStorage<T>(
  key: string,
  value: T,
  options: { onError?: (error: unknown) => void; debug?: boolean } = {}
): boolean {
  const { onError, debug = false } = options;

  if (!isSessionStorageAvailable()) {
    if (debug) {
      console.warn(`sessionStorage not available, cannot save key: ${key}`);
    }
    return false;
  }

  try {
    const serialized = JSON.stringify(value);
    window.sessionStorage.setItem(key, serialized);

    if (debug) {
      console.log(`💾 Saved to sessionStorage: ${key}`);
    }

    return true;
  } catch (error) {
    console.warn(`Failed to save to sessionStorage: ${key}`, error);

    if (onError) {
      onError(error);
    }

    return false;
  }
}

/**
 * Remove an item from localStorage
 *
 * @param key The localStorage key
 * @returns true if removal succeeded, false otherwise
 */
export function removeFromLocalStorage(key: string): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove an item from sessionStorage
 *
 * @param key The sessionStorage key
 * @returns true if removal succeeded, false otherwise
 */
export function removeFromSessionStorage(key: string): boolean {
  if (!isSessionStorageAvailable()) {
    return false;
  }

  try {
    window.sessionStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a type-safe storage manager for a specific key
 * Useful for engines that need to persist state
 */
export class StorageManager<T> {
  constructor(
    private readonly key: string,
    private readonly defaultValue: T,
    private readonly useSession: boolean = false,
    private readonly debug: boolean = false
  ) {}

  load(): T {
    if (this.useSession) {
      return loadFromSessionStorage(this.key, {
        defaultValue: this.defaultValue,
        debug: this.debug,
      });
    }

    return loadFromLocalStorage(this.key, {
      defaultValue: this.defaultValue,
      debug: this.debug,
    });
  }

  save(value: T): boolean {
    if (this.useSession) {
      return saveToSessionStorage(this.key, value, { debug: this.debug });
    }

    return saveToLocalStorage(this.key, value, { debug: this.debug });
  }

  remove(): boolean {
    if (this.useSession) {
      return removeFromSessionStorage(this.key);
    }

    return removeFromLocalStorage(this.key);
  }

  /**
   * Update the stored value by applying a transformation function
   */
  update(updater: (current: T) => T): boolean {
    const current = this.load();
    const updated = updater(current);
    return this.save(updated);
  }
}

/**
 * Generate a unique session ID (useful for multi-session tracking)
 */
export function generateSessionId(): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).slice(2, 11);
  return `session-${timestamp}-${randomPart}`;
}

/**
 * Get or create a session ID stored in sessionStorage
 */
export function getOrCreateSessionId(key: string = 'apophenia-session-id'): string {
  if (!isSessionStorageAvailable()) {
    // Fallback to memory for SSR or restricted environments
    return generateSessionId();
  }

  let sessionId = window.sessionStorage.getItem(key);

  if (!sessionId) {
    sessionId = generateSessionId();
    window.sessionStorage.setItem(key, sessionId);
  }

  return sessionId;
}
