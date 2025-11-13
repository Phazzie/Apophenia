/**
 * Grok AI Service - X.AI Grok-4 Fast Reasoning Integration
 *
 * Implements AIService interface from seams.ts
 * Uses X.AI API with 2M token context window
 */

import {
  AIService,
  AIProvider,
  AIRequest,
  AIResponse,
} from '../../core/types/seams';
import { promptBuilder } from './promptBuilder';
import { responseParser } from './responseParser';
import { responseCache } from './responseCache';

// X.AI API Configuration
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = 'grok-4-fast-reasoning';

// Retriable HTTP status codes (transient errors)
const RETRIABLE_STATUS_CODES = [429, 500, 502, 503, 504];

/**
 * Fetch with exponential backoff retry logic
 * Retries on transient errors: 429, 500, 502, 503, 504
 * Exponential backoff: 2s, 4s, 8s, 16s (max 4 retries)
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 4
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Success or non-retriable error - return immediately
      if (response.ok || !RETRIABLE_STATUS_CODES.includes(response.status)) {
        return response;
      }

      // Retriable error - wait before retry (unless this was the last attempt)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, 8s, 16s
        console.warn(
          `Request failed with status ${response.status}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        // Last attempt failed - return the error response
        return response;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retry
      const delay = Math.pow(2, attempt) * 1000;
      console.warn(
        `Request failed with error: ${lastError.message}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Max retries exceeded');
}

export class GrokService implements AIService {
  readonly provider = AIProvider.GROK;
  readonly maxTokens = 2000000; // 2M context
  readonly supportsImages = true;

  private apiKey: string | undefined;

  constructor() {
    this.apiKey = import.meta.env.VITE_XAI_API_KEY;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('VITE_XAI_API_KEY not found');
      return false;
    }

    // Set up timeout controller
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout for availability check

    try {
      // Test the API with a minimal request (with retry)
      const response = await fetchWithRetry(
        GROK_API_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: GROK_MODEL,
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 10,
          }),
          signal: controller.signal,
        },
        2 // Only 2 retries for availability check
      );

      clearTimeout(timeout);
      return response.ok;
    } catch (error) {
      clearTimeout(timeout);

      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
        console.error('Grok availability check timed out after 10s');
      } else {
        console.error('Grok availability check failed:', error);
      }
      return false;
    }
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('VITE_XAI_API_KEY not configured');
    }

    // Build the full prompt first (needed for cache key)
    const systemPrompt = promptBuilder.buildSystemPrompt(
      request.context.worldState.genreConfig,
      request.context.engineInstructions.map((_, i) => `Engine ${i + 1}`)
    );

    const contextPrompt = promptBuilder.buildContextPrompt(request.context);

    const fullPrompt = promptBuilder.injectEngineInstructions(
      `${contextPrompt}\n\n${request.prompt}`,
      request.context.engineInstructions
    );

    // Generate cache key from prompt and key context parameters
    const cacheKey = responseCache.generateKey(fullPrompt, {
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      horrorIntensity: request.context.worldState.horrorIntensity,
    });

    // Check cache first
    const cachedResponse = responseCache.get(cacheKey);
    if (cachedResponse) {
      console.log('Cache hit - returning cached response');
      return cachedResponse;
    }

    const startTime = Date.now();

    // Set up timeout controller (30s timeout for generation)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {

      // Call X.AI API with retry and timeout
      const response = await fetchWithRetry(
        GROK_API_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: GROK_MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: fullPrompt },
            ],
            temperature: request.temperature || 0.8,
            max_tokens: request.maxTokens || 4096,
            thinking: true, // Enable thinking mode for better reasoning
          }),
          signal: controller.signal,
        },
        4 // Max 4 retries
      );

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`X.AI API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '[]';

      // Parse commands from response
      const commands = responseParser.extractCommands(content);

      const latency = Date.now() - startTime;

      const aiResponse: AIResponse = {
        provider: this.provider,
        content,
        commands,
        metadata: {
          tokensUsed: data.usage?.total_tokens,
          latency,
          model: GROK_MODEL,
        },
      };

      // Store in cache before returning
      responseCache.set(cacheKey, aiResponse);

      return aiResponse;
    } catch (error) {
      clearTimeout(timeout);

      // Handle timeout errors specifically
      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
        throw new Error('Request timeout after 30s');
      }

      console.error('Grok generation failed:', error);
      throw error;
    }
  }

  estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }

  /**
   * Test connection to X.AI API
   * Used by aiModelStore for testing model availability
   */
  async testConnection(testType: 'text' | 'image' = 'text'): Promise<{
    success: boolean;
    model: string;
    contextWindow: number;
    testType: string;
    error?: string;
  }> {
    // X.AI Grok doesn't support image generation
    if (testType === 'image') {
      return {
        success: false,
        model: GROK_MODEL,
        contextWindow: this.maxTokens,
        testType: 'image',
        error: 'X.AI Grok does not support image generation',
      };
    }

    // Test text generation capability
    try {
      const available = await this.isAvailable();

      if (!available) {
        return {
          success: false,
          model: GROK_MODEL,
          contextWindow: this.maxTokens,
          testType: 'text',
          error: 'API key not configured or service unavailable',
        };
      }

      return {
        success: true,
        model: GROK_MODEL,
        contextWindow: this.maxTokens,
        testType: 'text',
      };
    } catch (error) {
      return {
        success: false,
        model: GROK_MODEL,
        contextWindow: this.maxTokens,
        testType: 'text',
        error: error instanceof Error ? error.message : 'Connection test failed',
      };
    }
  }
}

// Export singleton instance
export const grokService = new GrokService();

// Backward compatibility alias
export const xaiClient = grokService;
