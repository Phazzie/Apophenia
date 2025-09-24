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

// Mock localStorage for revolutionary features testing
const localStorageMock = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock document methods for Fifth Wall Breach testing
Object.defineProperty(document, 'title', {
  writable: true,
  value: 'Apophenia'
});

// Mock browser APIs
Object.defineProperty(window, 'requestAnimationFrame', {
  value: (callback: FrameRequestCallback) => setTimeout(callback, 16)
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  value: (id: number) => clearTimeout(id)
});