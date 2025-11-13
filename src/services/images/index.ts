/**
 * Image Services Module
 *
 * Exports all image generation services and the pipeline.
 * Fallback chain: Gemini/Imagen (1) → Grok (2) → Unsplash (3)
 */

// Base classes
export { BaseImageService } from './base/ImageService';

// Service implementations
export { GeminiImageService, geminiImageService } from './geminiImageService';
export { GrokImageService, grokImageService } from './grokImageService';
export { UnsplashService, unsplashService } from './unsplashService';

// Pipeline
export { ImagePipelineImpl, imagePipeline } from './ImagePipeline';

// Re-export types
export type { ImageService, ImageResult, ImagePipeline } from '../../core/types/seams';
