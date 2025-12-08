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
import { CommandSchema } from './responseParser';

interface CircuitBreaker {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
}

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

  // Circuit breaker state
  private circuitBreakers = new Map<AIProvider, CircuitBreaker>();
  private readonly CIRCUIT_THRESHOLD = 5;  // Open after 5 failures
  private readonly CIRCUIT_TIMEOUT = 60000; // 1 minute

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
    let attemptCount = 0;

    for (const provider of this.fallbackChain) {
      attemptCount++;

      // Check circuit breaker before attempting
      if (this.isCircuitOpen(provider)) {
        const message = `Circuit open for ${provider}, skipping (attempt ${attemptCount}/${this.fallbackChain.length})`;
        console.warn(message);
        errors.push({ provider, error: 'Circuit breaker open' });
        continue;
      }

      try {
        const service = this.getService(provider);

        // Check if service is available
        const isAvailable = await service.isAvailable();
        if (!isAvailable) {
          const message = `Provider ${provider} is not available (attempt ${attemptCount}/${this.fallbackChain.length})`;
          console.warn(message);
          errors.push({ provider, error: 'Provider not available' });
          this.recordFailure(provider);
          continue;
        }

        // Try to generate
        console.log(`Attempting generation with ${provider} (attempt ${attemptCount}/${this.fallbackChain.length})...`);
        const fullRequest: AIRequest = {
          ...request,
          provider,
        };

        const response = await service.generateResponse(fullRequest);

        // Validate response has commands
        if (!response.commands || response.commands.length === 0) {
          console.warn(`Provider ${provider} returned no commands, trying next`);
          errors.push({ provider, error: 'No commands returned' });
          this.recordFailure(provider);
          continue;
        }

        // Validate commands with Zod schema
        const validCommands = response.commands.filter((cmd) => {
          try {
            CommandSchema.parse(cmd);
            return true;
          } catch (error) {
            console.warn(`Invalid command from ${provider} skipped:`, cmd, error);
            return false;
          }
        });

        if (validCommands.length === 0) {
          console.warn(`Provider ${provider} returned no valid commands, trying next`);
          errors.push({ provider, error: 'No valid commands in response' });
          this.recordFailure(provider);
          continue;
        }

        // Update response with only valid commands
        response.commands = validCommands;

        // Success - record it and reset circuit breaker
        this.recordSuccess(provider);

        // Log success with provider info
        if (provider !== this.primaryProvider) {
          console.warn(
            `⚠️ FALLBACK ACTIVATED: Using ${provider} instead of primary provider (${this.primaryProvider})`
          );
        } else {
          console.log(`✓ Successfully generated with primary provider: ${provider}`);
        }

        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Provider ${provider} failed (attempt ${attemptCount}/${this.fallbackChain.length}):`, errorMessage);
        errors.push({ provider, error: errorMessage });
        this.recordFailure(provider);
      }
    }

    // All providers failed - critical error
    const errorSummary = errors.map(e => `${e.provider}: ${e.error}`).join(', ');
    console.error('🚨 CRITICAL: All AI providers failed in fallback chain');
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

  /**
   * Check if circuit breaker is open for a provider
   */
  private isCircuitOpen(provider: AIProvider): boolean {
    const breaker = this.circuitBreakers.get(provider);
    if (!breaker || breaker.state === 'closed') {
      return false;
    }

    // Check if timeout elapsed - move to half-open state
    if (Date.now() - breaker.lastFailure > this.CIRCUIT_TIMEOUT) {
      breaker.state = 'half-open';
      console.log(`Circuit HALF-OPEN for ${provider}, allowing test request`);
      return false;
    }

    return breaker.state === 'open';
  }

  /**
   * Record a failure for a provider
   */
  private recordFailure(provider: AIProvider): void {
    const breaker = this.circuitBreakers.get(provider) || {
      failures: 0,
      lastFailure: 0,
      state: 'closed' as const,
    };

    breaker.failures++;
    breaker.lastFailure = Date.now();

    if (breaker.failures >= this.CIRCUIT_THRESHOLD) {
      breaker.state = 'open';
      console.warn(
        `🔴 Circuit OPEN for ${provider} after ${breaker.failures} failures. Will retry in ${this.CIRCUIT_TIMEOUT / 1000}s`
      );
    }

    this.circuitBreakers.set(provider, breaker);
  }

  /**
   * Record a success for a provider - resets circuit breaker
   */
  private recordSuccess(provider: AIProvider): void {
    const breaker = this.circuitBreakers.get(provider);
    if (breaker) {
      if (breaker.state !== 'closed') {
        console.log(`✅ Circuit CLOSED for ${provider} - provider recovered`);
      }
      breaker.failures = 0;
      breaker.state = 'closed';
      this.circuitBreakers.set(provider, breaker);
    }
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
