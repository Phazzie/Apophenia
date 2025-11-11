/**
 * Gemini AI Service - Google Gemini 2.5 Pro + Flash
 *
 * Implements AIService interface from seams.ts
 * Supports both Pro (high quality) and Flash (fast) models
 */

import {
  AIService,
  AIProvider,
  AIRequest,
  AIResponse,
} from '../../core/types/seams';
import { promptBuilder } from './promptBuilder';
import { responseParser } from './responseParser';

// Gemini API Configuration
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

// Model selection based on provider enum
const GEMINI_MODELS = {
  [AIProvider.GEMINI_PRO]: 'gemini-2.5-pro-latest',
  [AIProvider.GEMINI_FLASH]: 'gemini-2.5-flash-latest',
};

export class GeminiService implements AIService {
  readonly provider: AIProvider;
  readonly maxTokens: number;
  readonly supportsImages = true;

  private apiKey: string | undefined;
  private model: string;

  constructor(provider: AIProvider.GEMINI_PRO | AIProvider.GEMINI_FLASH) {
    this.provider = provider;
    this.model = GEMINI_MODELS[provider];
    this.maxTokens = provider === AIProvider.GEMINI_PRO ? 1000000 : 1000000; // Both have 1M context
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('VITE_GEMINI_API_KEY not found');
      return false;
    }

    try {
      // Test the API with a minimal request
      const url = `${GEMINI_API_BASE}/models/${this.model}:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'test' }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
      });

      return response.ok;
    } catch (error) {
      console.error(`${this.provider} availability check failed:`, error);
      return false;
    }
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('VITE_GEMINI_API_KEY not configured');
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

      // Combine system and user prompts (Gemini doesn't have separate system role)
      const combinedPrompt = `${systemPrompt}\n\n${fullPrompt}`;

      // Call Gemini API
      const url = `${GEMINI_API_BASE}/models/${this.model}:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: combinedPrompt }],
            },
          ],
          generationConfig: {
            temperature: request.temperature || 0.8,
            maxOutputTokens: request.maxTokens || 4096,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();

      // Extract content from Gemini response
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

      // Parse commands from response
      const commands = responseParser.extractCommands(content);

      const latency = Date.now() - startTime;

      return {
        provider: this.provider,
        content,
        commands,
        metadata: {
          tokensUsed: data.usageMetadata?.totalTokenCount,
          latency,
          model: this.model,
        },
      };
    } catch (error) {
      console.error(`${this.provider} generation failed:`, error);
      throw error;
    }
  }

  estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }
}

// Export singleton instances
export const geminiProService = new GeminiService(AIProvider.GEMINI_PRO);
export const geminiFlashService = new GeminiService(AIProvider.GEMINI_FLASH);
