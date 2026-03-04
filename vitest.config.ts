<<<<<<< audit-todo-system-13448203675236679220
// #TODO FIX: Version Mismatch. The project requires vitest@^2.1.8 but is running ^3.2.4. Downgrade package.json and verify this config works with v2.
=======
// #TODO: See #TODO.md - Critical Recovery Plan
// Fix module resolution errors (Cannot find package 'vitest').
// Ensure this config matches the project's dependency versions (vite 5.x vs 7.x).

>>>>>>> feature/main
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// #TODO FIX: Project strictly requires vitest@^2.1.8. Current usage of v3 causes ERR_MODULE_NOT_FOUND errors. Downgrade required.
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
