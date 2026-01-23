import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// #TODO: FIX_TEST_ENVIRONMENT - This config is failing with module resolution errors.
// Error: [ERR_MODULE_NOT_FOUND]: Cannot find module 'vite/dist/node/chunks/logger.js'
// See #TODO.md for details.

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'tests/**/*.{test,spec}.{ts,tsx}'
    ],
    exclude: [
      'node_modules',
      'dist',
      'build',
      '.git'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      include: [
        'src/**/*.ts',
        'src/**/*.tsx'
      ],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/*.spec.ts',
        'src/**/*.spec.tsx',
        'src/core/types/**',
        'src/types.ts',
        'src/vite-env.d.ts',
        'src/setupTests.ts',
        'src/**/__tests__/**',
        'src/**/__mocks__/**'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests')
    }
  }
});
