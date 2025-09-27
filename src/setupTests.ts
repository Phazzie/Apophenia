/**
 * @file setupTests.ts
 * @description Jest setup file for the testing environment.
 * This file is automatically executed by Jest before running the test suite.
 * It's used to import necessary testing libraries and to mock global objects
 * that exist in the browser but not in the Node.js environment where Jest runs.
 */

// Extends Jest's expect with additional matchers for testing DOM elements.
import '@testing-library/jest-dom';

// Mocks the `import.meta.env` object, which is used by Vite to expose environment variables
// to the client-side code. Since this object doesn't exist in Jest's Node.js environment,
// we create a mock to prevent tests from crashing when they import modules that use it.
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_GEMINI_API_KEY: 'test-key',
        VITE_XAI_API_KEY: 'test-key',
      }
    }
  }
});

// Explicitly sets the Node.js environment to 'test' and provides mock environment variables.
// This ensures that code relying on `process.env` behaves consistently during tests.
process.env.NODE_ENV = 'test';
process.env.VITE_GEMINI_API_KEY = 'test-key';
process.env.VITE_XAI_API_KEY = 'test-key';