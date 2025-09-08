// Environment configuration for Apophenia
// API keys are loaded from environment variables for security

export const API_KEYS = {
  googleGenAI: import.meta.env.VITE_GEMINI_API_KEY || '',
};

// Validation - warn if API key is not set
if (!API_KEYS.googleGenAI) {
  console.warn(
    'Warning: VITE_GEMINI_API_KEY is not set in your .env file. AI features will not work.'
  );
}
