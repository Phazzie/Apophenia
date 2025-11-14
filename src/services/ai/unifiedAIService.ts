/**
 * Unified AI Service - Facade with Automatic Fallback
 *
 * Implements UnifiedAIService interface from seams.ts
 * Provides automatic fallback chain: Grok → Mock
 */

import {
  UnifiedAIService,
  AIService,
  AIProvider,
  AIRequest,
  AIResponse,
  ProviderTestResult,
} from '../../core/types/seams';
import { grokService } from './grokService';
import { mockService } from './mockService';

export class UnifiedAIServiceImpl implements UnifiedAIService {
  private primaryProvider: AIProvider = AIProvider.GROK;
  private fallbackChain: AIProvider[] = [
    AIProvider.GROK,
    AIProvider.MOCK,
  ];

  private services: Map<AIProvider, AIService> = new Map<AIProvider, AIService>([
    [AIProvider.GROK, grokService],
    [AIProvider.MOCK, mockService],
  ] as Array<[AIProvider, AIService]>);

  /**
   * Set the primary provider (first choice)
   */
  setPrimaryProvider(provider: AIProvider): void {
    this.primaryProvider = provider;
    console.log(`Primary AI provider set to: ${provider}`);
  }

  /**
   * Set custom fallback chain
   */
  setFallbackChain(providers: AIProvider[]): void {
    if (providers.length === 0) {
      throw new Error('Fallback chain cannot be empty');
    }
    this.fallbackChain = providers;
    console.log(`Fallback chain set to: ${providers.join(' → ')}`);
  }

  /**
   * Generate with primary provider only (no fallback)
   */
  async generate(request: Omit<AIRequest, 'provider'>): Promise<AIResponse> {
    const service = this.getService(this.primaryProvider);
    const fullRequest: AIRequest = {
      ...request,
      provider: this.primaryProvider,
    };

    return await service.generateResponse(fullRequest);
  }

  /**
   * Generate with automatic fallback through the chain
   */
  async generateWithFallback(request: Omit<AIRequest, 'provider'>): Promise<AIResponse> {
    const errors: Array<{ provider: AIProvider; error: string }> = [];

    for (const provider of this.fallbackChain) {
      try {
        const service = this.getService(provider);

        // Check if service is available
        const isAvailable = await service.isAvailable();
        if (!isAvailable) {
          console.warn(`Provider ${provider} is not available, trying next in chain`);
          errors.push({ provider, error: 'Provider not available' });
          continue;
        }

        // Try to generate
        console.log(`Attempting generation with ${provider}...`);
        const fullRequest: AIRequest = {
          ...request,
          provider,
        };

        const response = await service.generateResponse(fullRequest);

        // Validate response has commands
        if (!response.commands || response.commands.length === 0) {
          console.warn(`Provider ${provider} returned no commands, trying next`);
          errors.push({ provider, error: 'No commands returned' });
          continue;
        }

        console.log(`Successfully generated with ${provider}`);
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Provider ${provider} failed:`, errorMessage);
        errors.push({ provider, error: errorMessage });
      }
    }

    // All providers failed
    const errorSummary = errors.map(e => `${e.provider}: ${e.error}`).join(', ');
    throw new Error(`All AI providers failed. Errors: ${errorSummary}`);
  }

  /**
   * Test a specific provider
   */
  async testProvider(provider: AIProvider): Promise<ProviderTestResult> {
    const startTime = Date.now();
    const service = this.getService(provider);

    try {
      const isAvailable = await service.isAvailable();
      const latency = Date.now() - startTime;

      if (!isAvailable) {
        return {
          provider,
          available: false,
          latency,
          error: 'Provider reported unavailable',
        };
      }

      return {
        provider,
        available: true,
        latency,
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        provider,
        available: false,
        latency,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test all providers
   */
  async testAllProviders(): Promise<Map<AIProvider, ProviderTestResult>> {
    const results = new Map<AIProvider, ProviderTestResult>();

    // Test all providers in parallel
    const tests = Array.from(this.services.keys()).map(async (provider) => {
      const result = await this.testProvider(provider);
      results.set(provider, result);
    });

    await Promise.all(tests);

    return results;
  }

  /**
   * Get service instance for a provider
   */
  private getService(provider: AIProvider): AIService {
    const service = this.services.get(provider);
    if (!service) {
      throw new Error(`No service found for provider: ${provider}`);
    }
    return service;
  }
}

// Export singleton instance
export const unifiedAIService = new UnifiedAIServiceImpl();

/**
 * Legacy wrapper functions for backward compatibility
 */

/**
 * Generate AI response with selected model (alias for generateWithFallback)
 */
export async function generateWithSelectedModel(
  request: Omit<AIRequest, 'provider'>
): Promise<AIResponse> {
  return unifiedAIService.generateWithFallback(request);
}

/**
 * Generate concept with selected model
 */
export async function generateConceptWithSelectedModel(
  request: Omit<AIRequest, 'provider'>
): Promise<AIResponse> {
  return unifiedAIService.generateWithFallback(request);
}

/**
 * Generate next step with selected model
 */
export async function generateNextStepWithSelectedModel(
  request: Omit<AIRequest, 'provider'>
): Promise<AIResponse> {
  return unifiedAIService.generateWithFallback(request);
}
