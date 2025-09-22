// Jest setup file for testing environment
import '@testing-library/jest-dom';

// Mock import.meta for Jest environment
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_GEMINI_API_KEY: 'test-key',
        VITE_GOOGLE_IMAGEN_KEY: 'test-imagen-key',
      }
    }
  }
});

// Mock process.env for Node environment compatibility
process.env.NODE_ENV = 'test';
process.env.VITE_GEMINI_API_KEY = 'test-key';
process.env.VITE_GOOGLE_IMAGEN_KEY = 'test-imagen-key';