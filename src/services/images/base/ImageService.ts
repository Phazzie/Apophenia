/**
 * Abstract Base Image Service
 *
 * Defines the interface for all image generation providers.
 * All concrete implementations must extend this class and implement
 * the generate() and isAvailable() methods.
 */

import { ImageService, ImageResult } from '../../../core/types/seams';

/**
 * Abstract base class for all image generation services.
 * Ensures all providers implement the required interface.
 */
export abstract class BaseImageService implements ImageService {
  abstract readonly provider: string;
  abstract readonly priority: number;

  /**
   * Generate an image from a prompt.
   *
   * @param prompt - The image generation prompt
   * @returns ImageResult with URL or null if generation fails
   */
  abstract generate(prompt: string): Promise<ImageResult>;

  /**
   * Check if this service is available (API key configured, etc).
   *
   * @returns true if service can be used, false otherwise
   */
  abstract isAvailable(): Promise<boolean>;

  /**
   * Validate that the provider has required configuration.
   * Should be called during initialization.
   *
   * @protected
   * @returns true if properly configured
   */
  protected validateConfiguration(): boolean {
    return this.hasRequiredEnvVars();
  }

  /**
   * Check for required environment variables.
   * Override in subclasses to specify which env vars are required.
   *
   * @protected
   * @returns true if all required env vars are set
   */
  protected hasRequiredEnvVars(): boolean {
    return true;
  }

  /**
   * Create a successful ImageResult.
   *
   * @protected
   * @param url - The generated image URL
   * @returns ImageResult with url and provider info
   */
  protected success(url: string): ImageResult {
    return {
      url,
      provider: this.provider,
      cached: false,
    };
  }

  /**
   * Create a failed ImageResult.
   *
   * @protected
   * @param error - The error message
   * @returns ImageResult with null url and error details
   */
  protected failure(error: string): ImageResult {
    return {
      url: null,
      provider: this.provider,
      cached: false,
      error,
    };
  }

  /**
   * Create a cached ImageResult.
   *
   * @protected
   * @param url - The cached image URL
   * @returns ImageResult marked as cached
   */
  protected fromCache(url: string): ImageResult {
    return {
      url,
      provider: this.provider,
      cached: true,
    };
  }
}
