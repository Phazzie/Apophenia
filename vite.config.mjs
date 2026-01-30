// #TODO FIX: Version Mismatch. The project requires vite@^5.4.11 but is running ^7.1.5. Downgrade package.json and verify this config works with v5.
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
