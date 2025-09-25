/**
 * X.AI Grok Service
 *
 * This service provides a client for interacting with the X.AI Grok API.
 */

import { API_KEYS } from '../config';

interface GrokUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  thinking_tokens?: number;
}

interface GrokResponse {
  content: string;
  thinking?: string;
  usage: GrokUsage;
}

export class XAIAPIClient {
  private apiKey: string;
  private baseURL = 'https://api.x.ai/v1';

  constructor() {
    this.apiKey = API_KEYS.xaiAPI;
    if (!this.apiKey) {
      console.warn('X.AI API key not configured. Grok service will not be available.');
    }
  }

  private async makeAPIRequest(endpoint: string, body: object): Promise<any> {
    if (!this.apiKey) {
      throw new Error('X.AI API key is not configured.');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('X.AI API error response:', response.status, errorData);
      throw new Error(`X.AI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    return response.json();
  }

  async generateText(
    systemInstruction: string,
    userPrompt: string,
    config: any = {}
  ): Promise<GrokResponse> {
    const body = {
      model: 'grok-4-fast',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userPrompt },
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      top_p: config.topP,
    };

    try {
      const data = await this.makeAPIRequest('/chat/completions', body);
      const choice = data.choices[0];

      return {
        content: choice.message.content,
        usage: data.usage,
        thinking: choice.message.thinking,
      };
    } catch (error) {
      console.error('X.AI API request failed:', error);
      throw error;
    }
  }

  async testConnection(testType: 'text' | 'image' = 'text'): Promise<any> {
    if (testType === 'image') {
      return {
        success: false,
        model: 'grok-4-fast',
        contextWindow: 128000,
        testType: 'image',
        error: 'X.AI does not support image generation',
      };
    }

    try {
      await this.generateText('Test instruction', 'Test prompt', { max_tokens: 10 });
      return {
        success: true,
        model: 'grok-4-fast',
        contextWindow: 128000,
        testType: 'text',
      };
    } catch (error: any) {
      return {
        success: false,
        model: 'grok-4-fast',
        contextWindow: 128000,
        testType: 'text',
        error: error.message,
      };
    }
  }

  getModelInfo() {
    return {
      name: 'grok-4-fast',
      provider: 'X.AI',
      contextWindow: 128000,
      supportsFunctions: false,
      supportsThinking: true, // Assuming this is a potential feature
      supportsImages: false,
    };
  }

  async generateImage(prompt: string): Promise<string | null> {
    console.warn("X.AI Grok does not support image generation.");
    return null;
  }
}

export const xaiClient = new XAIAPIClient();