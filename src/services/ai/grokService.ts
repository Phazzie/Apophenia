/**
 * Grok-4 Fast Reasoning API Integration
 * 
 * Implements X.AI's Grok-4-fast-reasoning model with 2M token context window
 * and advanced reasoning capabilities (thinking mode).
 */

import { API_KEYS } from '../config';

// Grok API configuration
const GROK_API_BASE = 'https://api.x.ai/v1';
const GROK_MODEL = 'grok-4-fast-reasoning';

interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GrokRequest {
  model: string;
  messages: GrokMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  thinking?: boolean; // Enable reasoning mode
  stream?: boolean;
}

interface GrokResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
      thinking?: string; // Reasoning trace when thinking mode enabled
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    thinking_tokens?: number; // Tokens used for thinking
  };
}

/**
 * Grok API client for text generation with thinking mode
 */
export class GrokAPIClient {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || API_KEYS.grokAI;
    this.baseURL = GROK_API_BASE;
    
    if (!this.apiKey) {
      console.warn('Grok API key not provided. Service will not function.');
    }
  }

  /**
   * Generate text with Grok-4 Fast Reasoning
   */
  async generateText(
    systemInstruction: string,
    userPrompt: string,
    config: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
      enableThinking?: boolean;
    } = {}
  ): Promise<{ content: string; thinking?: string; usage: any }> {
    if (!this.apiKey) {
      throw new Error('Grok API key not configured');
    }

    const messages: GrokMessage[] = [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userPrompt }
    ];

    const request: GrokRequest = {
      model: GROK_MODEL,
      messages,
      temperature: config.temperature ?? 1.0,
      max_tokens: config.maxTokens ?? 8192,
      top_p: config.topP ?? 0.95,
      thinking: config.enableThinking ?? true, // Enable thinking by default
      stream: false
    };

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Grok API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data: GrokResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response choices from Grok API');
      }

      const choice = data.choices[0];
      return {
        content: choice.message.content,
        thinking: choice.message.thinking,
        usage: data.usage
      };
    } catch (error) {
      console.error('Grok API request failed:', error);
      throw error;
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{ success: boolean; model: string; contextWindow: number; error?: string }> {
    try {
      const result = await this.generateText(
        'You are a helpful assistant.',
        'Please respond with "Test successful" and mention your model name and context window size.',
        { 
          maxTokens: 100, 
          temperature: 0.1,
          enableThinking: false // Don't need thinking for simple test
        }
      );
      
      return {
        success: true,
        model: GROK_MODEL,
        contextWindow: 2000000, // 2M tokens
      };
    } catch (error) {
      return {
        success: false,
        model: GROK_MODEL,
        contextWindow: 2000000,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      name: GROK_MODEL,
      provider: 'X.AI',
      contextWindow: 2000000, // 2 million tokens
      supportsFunctions: false, // Grok-4 doesn't support function calling yet
      supportsThinking: true, // Advanced reasoning mode
      supportsImages: false, // Text-only model
    };
  }
}

// Singleton instance
export const grokClient = new GrokAPIClient();