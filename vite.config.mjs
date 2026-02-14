// #TODO: Fix module resolution error (ERR_MODULE_NOT_FOUND).
// The build/test environment is currently broken due to issues with vite/vitest and node_modules.
// See #TODO.md for details.

/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
