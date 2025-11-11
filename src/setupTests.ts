// Jest setup file for testing environment

// Mock import.meta for Jest environment
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_XAI_API_KEY: 'test-key',
        VITE_GEMINI_API_KEY: 'test-key',
        VITE_UNSPLASH_ACCESS_KEY: 'test-key',
      }
    }
  }
});

// Mock process.env for Node environment compatibility
process.env.NODE_ENV = 'test';
process.env.VITE_XAI_API_KEY = 'test-key';
process.env.VITE_GEMINI_API_KEY = 'test-key';
process.env.VITE_UNSPLASH_ACCESS_KEY = 'test-key';