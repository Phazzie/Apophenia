/**
 * Image Generation Module
 * Public API for consolidated image generation with strategy pattern
 */

import { imageGenerationOrchestrator as orchestrator } from './ImageGenerationOrchestrator';

export {
  imageGenerationOrchestrator,
  ImageGenerationOrchestrator,
  type ImageGenerationOptions,
  type SingleImageResult,
  type ImageVariationResult,
} from './ImageGenerationOrchestrator';

export {
  type ImageGenerationStrategy,
  type ImageGenerationResult,
  BackendAPIStrategy,
  ImagenPrimaryStrategy,
  ImagenSecondaryStrategy,
  UnsplashFallbackStrategy,
  SVGFallbackStrategy,
} from './ImageGenerationStrategy';

export {
  enhancePromptWithHorrorIntensity,
  enhancePromptWithWorldState,
  generatePromptVariations,
} from './imagePromptEnhancer';

export {
  generateUnsplashUrl,
  extractPromptKeywords,
  selectRandomHorrorKeywords,
  extractHorrorKeywords,
} from './unsplashFallback';

// Convenience exports for backward compatibility
export { orchestrator as imageGenerator };

// Re-export the singleton instance as default
export default orchestrator;
