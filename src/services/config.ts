// Environment configuration for Apophenia
// API keys are loaded from environment variables for security

export const API_KEYS = {
  googleGenAI: import.meta.env.VITE_GEMINI_API_KEY || '',
  googleNanoBanana: import.meta.env.VITE_GOOGLE_NANO_BANANA_KEY || '',
  googleImagen: import.meta.env.VITE_GOOGLE_IMAGEN_KEY || '',
};

// AI Model Configuration
export const AI_MODELS = {
  // Primary text generation with advanced reasoning
  PRIMARY_TEXT: 'gemini-2.0-flash-exp', // Latest available model
  FALLBACK_TEXT: 'gemini-1.5-flash',
  
  // Image generation pipeline
  PRIMARY_IMAGE: 'nano-banana-v1', // Custom Nano Banana service
  FALLBACK_IMAGE: 'imagen-3.0-generate-001',
  
  // Configuration for different use cases
  CONCEPT_GENERATION: {
    model: 'gemini-2.0-flash-exp',
    temperature: 1.2,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
  },
  STORY_PROGRESSION: {
    model: 'gemini-2.0-flash-exp', 
    temperature: 1.0,
    topK: 0,
    topP: 0.95,
    maxOutputTokens: 8192,
    // Enable thinking mode for complex reasoning
    enableThinking: true,
    thinkingBudget: 'medium', // low, medium, high
  },
  SUMMARIZATION: {
    model: 'gemini-1.5-flash', // Faster for summarization
    temperature: 0.3,
    topK: 20,
    topP: 0.8,
    maxOutputTokens: 2048,
  }
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
