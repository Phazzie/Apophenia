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

// X.AI API Configuration
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = 'grok-4-fast-reasoning';

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

    try {
      // Test the API with a minimal request
      const response = await fetch(GROK_API_URL, {
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
      });

      return response.ok;
    } catch (error) {
      console.error('Grok availability check failed:', error);
      return false;
    }
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('VITE_XAI_API_KEY not configured');
    }

    const startTime = Date.now();

    try {
      // Build the full prompt
      const systemPrompt = promptBuilder.buildSystemPrompt(
        request.context.worldState.genreConfig,
        request.context.engineInstructions.map((_, i) => `Engine ${i + 1}`)
      );

      const contextPrompt = promptBuilder.buildContextPrompt(request.context);

      const fullPrompt = promptBuilder.injectEngineInstructions(
        `${contextPrompt}\n\n${request.prompt}`,
        request.context.engineInstructions
      );

      // Call X.AI API
      const response = await fetch(GROK_API_URL, {
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
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`X.AI API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '[]';

      // Parse commands from response
      const commands = responseParser.extractCommands(content);

      const latency = Date.now() - startTime;

      return {
        provider: this.provider,
        content,
        commands,
        metadata: {
          tokensUsed: data.usage?.total_tokens,
          latency,
          model: GROK_MODEL,
        },
      };
    } catch (error) {
      console.error('Grok generation failed:', error);
      throw error;
    }
  }

  estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }
}

// Export singleton instance
export const grokService = new GrokService();

// Backward compatibility alias
export const xaiClient = grokService;
