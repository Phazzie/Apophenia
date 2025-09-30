/**
 * Grok-4 Fast Reasoning API Integration
 *
 * Implements X.AI's Grok-4-fast-reasoning model with 2M token context window
 * and advanced reasoning capabilities (thinking mode).
 */

import { API_KEYS } from '../config';

// X.AI API configuration
const XAI_API_BASE = 'https://api.x.ai/v1';
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
  usage: GrokUsage;
}

interface GrokUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  thinking_tokens?: number;
}

interface GrokImage {
  url: string;
}

/**
 * X.AI API client for text generation with thinking mode
 */
export class XAIAPIClient {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || API_KEYS.xaiAPI;
    this.baseURL = XAI_API_BASE;

    if (!this.apiKey) {
      console.warn('X.AI API key not provided. Service will not function.');
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
  ): Promise<{ content: string; thinking?: string; usage: GrokUsage }> {
    if (!this.apiKey) {
      console.error('X.AI API key not configured - cannot make request');
      throw new Error('X.AI API key not configured');
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
      console.log('Making X.AI API request to:', `${this.baseURL}/chat/completions`);
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
        console.error('X.AI API error response:', response.status, errorData);
        throw new Error(`X.AI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data: GrokResponse = await response.json();
      console.log('X.AI API response received:', { model: data.model, usage: data.usage });

      if (!data.choices || data.choices.length === 0) {
        console.error('No response choices from X.AI API');
        throw new Error('No response choices from X.AI API');
      }

      const choice = data.choices[0];
      return {
        content: choice.message.content,
        thinking: choice.message.thinking,
        usage: data.usage
      };
    } catch (error) {
      console.error('X.AI API request failed:', error);
      throw error;
    }
  }

  /**
   * Generate a batch of images using the grok-2-image model
   */
  async generateImage(prompt: string, n: number = 4): Promise<string[]> {
    if (!this.apiKey) {
      console.error('X.AI API key not configured - cannot generate images.');
      throw new Error('X.AI API key not configured');
    }

    const requestBody = {
      model: 'grok-2-image',
      prompt,
      n,
      image_format: 'url',
    };

    try {
      console.log('Making X.AI image generation request to:', `${this.baseURL}/image/sample_batch`);
      const response = await fetch(`${this.baseURL}/image/sample_batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('X.AI image API error response:', response.status, errorData);
        throw new Error(`X.AI image API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('X.AI image API response received:', data);

      if (!data || !Array.isArray(data) || data.length === 0) {
        console.error('No images found in X.AI response');
        throw new Error('No images found in X.AI response');
      }

      return data.map((image: GrokImage) => image.url);

    } catch (error) {
      console.error('X.AI image generation request failed:', error);
      throw error;
    }
  }

  /**
   * Test API connection with both text and image testing
   */
  async testConnection(testType: 'text' | 'image' = 'text'): Promise<{
    success: boolean;
    model: string;
    contextWindow: number;
    testType: string;
    error?: string
  }> {
    try {
      if (testType === 'text') {
        console.log('Testing X.AI text generation API...');
        await this.generateText(
          'You are a helpful assistant.',
          'Please respond with "Test successful" and mention your model name and context window size.',
          {
            maxTokens: 100,
            temperature: 0.1,
            enableThinking: false // Don't need thinking for simple test
          }
        );

        console.log('X.AI text test successful');
        return {
          success: true,
          model: GROK_MODEL,
          contextWindow: 2000000, // 2M tokens
          testType: 'text',
        };
      } else {
        // Test X.AI image generation (experimental)
        console.log('Testing X.AI image generation (experimental)...');
        try {
          const result = await this.generateImage('A simple test image of a red circle');
          return {
            success: result !== null,
            model: GROK_MODEL,
            contextWindow: 2000000,
            testType: 'image',
            error: result === null ? 'X.AI image generation not yet available (will fallback to Imagen)' : undefined
          };
        } catch {
          return {
            success: false,
            model: GROK_MODEL,
            contextWindow: 2000000,
            testType: 'image',
            error: 'X.AI image generation experimental (will fallback to Imagen)'
          };
        }
      }
    } catch (error) {
      console.error('X.AI API test failed:', error);
      return {
        success: false,
        model: GROK_MODEL,
        contextWindow: 2000000,
        testType,
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
      supportsImages: true, // Attempting image generation (experimental/future compatibility)
    };
  }
}

// Singleton instance
export const xaiClient = new XAIAPIClient();