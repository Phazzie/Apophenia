// Jest setup file for testing environment
import '@testing-library/jest-dom';

// Mock import.meta for Jest environment
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_GEMINI_API_KEY: 'test-key',
        VITE_IMAGE_API_KEY: 'test-image-key',
        VITE_GOOGLE_NANO_BANANA_KEY: 'test-nano-key',
        VITE_GOOGLE_IMAGEN_KEY: 'test-imagen-key',
      }
    }
  }
});

// Mock process.env for Node environment compatibility
process.env.NODE_ENV = 'test';
process.env.VITE_GEMINI_API_KEY = 'test-key';
process.env.VITE_IMAGE_API_KEY = 'test-image-key';
process.env.VITE_GOOGLE_NANO_BANANA_KEY = 'test-nano-key';
process.env.VITE_GOOGLE_IMAGEN_KEY = 'test-imagen-key';