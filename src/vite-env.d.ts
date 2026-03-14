// Minimal Vite client env stubs for environments where the full package is unavailable.
// This keeps TypeScript happy during CI without depending on external downloads.
interface ImportMetaEnv {
  readonly VITE_XAI_API_KEY?: string;
  readonly VITE_DEFAULT_GENRE?: string;
  readonly VITE_FEATURE_FLAGS?: string;
  readonly VITE_IMAGE_CACHE_TTL?: string;
  readonly VITE_IMAGE_CACHE_MAX_SIZE?: string;
  readonly VITE_ENABLE_CACHE_TELEMETRY?: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_UNSPLASH_ACCESS_KEY?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
