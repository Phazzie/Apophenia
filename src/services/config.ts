// Environment configuration for Apophenia
// API keys are loaded from environment variables for security

export const API_KEYS = {
  googleGenAI: import.meta.env.VITE_GEMINI_API_KEY || '',
  googleNanoBanana: import.meta.env.VITE_GOOGLE_NANO_BANANA_KEY || '',
  googleImagen: import.meta.env.VITE_GOOGLE_IMAGEN_KEY || '',
};

// Validation - warn if API keys are not set
if (!API_KEYS.googleGenAI) {
  console.warn(
    'Warning: VITE_GEMINI_API_KEY is not set in your .env file. Story generation will use fallbacks.'
  );
}

if (!API_KEYS.googleNanoBanana && !API_KEYS.googleImagen) {
  console.warn(
    'Warning: Google Nano Banana or Imagen API keys not set. Image generation will use Unsplash fallback.'
  );
}
