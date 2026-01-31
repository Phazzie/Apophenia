/// <reference types="vitest" />
// #TODO FIX: Project strictly requires vite@^5.4.11. Current usage of v7 causes ERR_MODULE_NOT_FOUND errors. Downgrade required.
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
