/// <reference types="vite/client" />

// All sensitive environment variables have been moved to the secure backend.
// This file can be used to define any non-sensitive, client-side environment variables if needed in the future.

interface ImportMetaEnv {
  // Example: readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}