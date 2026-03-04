<<<<<<< audit-todo-system-13448203675236679220
// #TODO FIX: Version Mismatch. The project requires vite@^5.4.11 but is running ^7.1.5. Downgrade package.json and verify this config works with v5.
=======
// #TODO: Fix module resolution error (ERR_MODULE_NOT_FOUND).
// The build/test environment is currently broken due to issues with vite/vitest and node_modules.
// See #TODO.md for details.

>>>>>>> feature/main
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
