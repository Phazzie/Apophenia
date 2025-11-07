/**
 * Security Utilities for Apophenia
 * 
 * Provides input validation, sanitization, and security checks
 */

import { z } from 'zod';

/**
 * Environment Variable Schema
 * Validates that API keys are properly formatted
 */
const envSchema = z.object({
  VITE_XAI_API_KEY: z.string()
    .optional()
    .refine(
      (val) => !val || /^[a-zA-Z0-9_-]+$/.test(val),
      'XAI API key contains invalid characters'
    ),
});

/**
 * Validate environment variables
 * @throws {Error} If environment variables are invalid
 */
export function validateEnvironment(): void {
  try {
    const env = {
      VITE_XAI_API_KEY: import.meta.env.VITE_XAI_API_KEY,
    };

    envSchema.parse(env);
    console.log('✅ Environment validation passed');
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:', error.errors);
      throw new Error(`Invalid environment configuration: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

/**
 * Sanitize user input to prevent XSS
 * @param input - Raw user input
 * @returns Sanitized string
 * 
 * Note: For production use, consider using DOMPurify library for comprehensive XSS protection.
 * This basic implementation handles common HTML entity encoding but may not cover all edge cases.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;')
    .replace(/=/g, '&#x3D;');
}

/**
 * Validate API key format
 * @param key - API key to validate
 * @returns True if valid, false otherwise
 */
export function validateAPIKey(key: string | undefined): boolean {
  if (!key) return false;
  
  // API keys should be alphanumeric with hyphens/underscores
  const apiKeyPattern = /^[a-zA-Z0-9_-]{20,}$/;
  return apiKeyPattern.test(key);
}

/**
 * Rate limiter for API calls
 */
export class RateLimiter {
  private calls: number[] = [];
  private readonly maxCalls: number;
  private readonly windowMs: number;

  constructor(maxCalls: number = 10, windowMs: number = 60000) {
    this.maxCalls = maxCalls;
    this.windowMs = windowMs;
  }

  /**
   * Check if action is allowed under rate limit
   * @param key - Identifier for the action
   * @returns True if allowed, false if rate limited
   */
  isAllowed(key: string = 'default'): boolean {
    const now = Date.now();
    
    // Remove calls outside the window
    this.calls = this.calls.filter(time => now - time < this.windowMs);
    
    if (this.calls.length >= this.maxCalls) {
      console.warn(`⚠️ Rate limit exceeded for ${key}: ${this.calls.length}/${this.maxCalls} calls in ${this.windowMs}ms`);
      return false;
    }
    
    this.calls.push(now);
    return true;
  }

  /**
   * Reset the rate limiter
   */
  reset(): void {
    this.calls = [];
  }

  /**
   * Get current rate limit status
   */
  getStatus(): { current: number; max: number; resetIn: number } {
    const now = Date.now();
    this.calls = this.calls.filter(time => now - time < this.windowMs);
    
    const resetIn = this.calls.length > 0 
      ? this.windowMs - (now - this.calls[0])
      : 0;
    
    return {
      current: this.calls.length,
      max: this.maxCalls,
      resetIn,
    };
  }
}

/**
 * Global rate limiter for AI API calls
 * Limits to 10 calls per minute to prevent abuse
 */
export const aiRateLimiter = new RateLimiter(10, 60000);

/**
 * Content Security Policy meta tag generator
 * @returns CSP policy string
 */
export function generateCSP(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Required for Vite dev
    "style-src 'self' 'unsafe-inline'", // Required for styled components
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.x.ai wss://api.x.ai",
    "media-src 'self' data:",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

/**
 * Secure local storage wrapper with encryption
 */
export class SecureStorage {
  private static readonly PREFIX = 'apophenia_';
  
  /**
   * Simple XOR encryption (not cryptographically secure, but better than plain text)
   * For production, use Web Crypto API
   */
  private static encrypt(data: string, key: string = 'apophenia_secret'): string {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result); // Base64 encode
  }
  
  private static decrypt(data: string, key: string = 'apophenia_secret'): string {
    const decoded = atob(data);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  }
  
  /**
   * Set item in secure storage
   */
  static setItem(key: string, value: unknown): void {
    try {
      const serialized = JSON.stringify(value);
      const encrypted = this.encrypt(serialized);
      localStorage.setItem(this.PREFIX + key, encrypted);
    } catch (error) {
      console.error('Failed to save to secure storage:', error);
    }
  }
  
  /**
   * Get item from secure storage
   */
  static getItem<T>(key: string): T | null {
    try {
      const encrypted = localStorage.getItem(this.PREFIX + key);
      if (!encrypted) return null;
      
      const decrypted = this.decrypt(encrypted);
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('Failed to read from secure storage:', error);
      return null;
    }
  }
  
  /**
   * Remove item from secure storage
   */
  static removeItem(key: string): void {
    localStorage.removeItem(this.PREFIX + key);
  }
  
  /**
   * Clear all secure storage
   */
  static clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
}
