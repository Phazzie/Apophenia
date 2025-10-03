// Jest setup file for testing environment
import '@testing-library/jest-dom';

// Mock import.meta for Jest environment if needed for other variables.
// For now, it's clean as no client-side env vars are required for app logic.
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        // Example: VITE_APP_TITLE: 'Apophenia Test'
      }
    }
  }
});

// Mock process.env for Node environment compatibility
process.env.NODE_ENV = 'test';