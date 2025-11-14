// Vitest setup file for testing environment
import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Mock zustand persist middleware BEFORE any imports
// This must be done at the top level to ensure it's hoisted
vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual<typeof import('zustand/middleware')>('zustand/middleware');
  return {
    ...actual,
    persist: (config: any) => config, // Bypass persist, use in-memory only
  };
});

// Mock import.meta for Jest environment
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_XAI_API_KEY: 'test-key',
        VITE_UNSPLASH_ACCESS_KEY: 'test-key',
      }
    }
  }
});

// Mock process.env for Node environment compatibility
process.env.NODE_ENV = 'test';
process.env.VITE_XAI_API_KEY = 'test-key';
process.env.VITE_UNSPLASH_ACCESS_KEY = 'test-key';