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
  stream?: boolean;
  // X.AI specific parameters
  thinking?: boolean; // Enable thinking mode
}

interface GrokResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      thinking?: string; // Reasoning process when thinking mode enabled
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    thinking_tokens?: number; // Tokens used for thinking when enabled
  };
}

/**
 * X.AI API client for text generation with thinking mode
 */
export class XAIAPIClient {
  private apiKey: string;

  constructor() {
    this.apiKey = API_KEYS.xaiGrok;
    if (!this.apiKey) {
      console.warn('X.AI API key not found. Grok-4 service will not function properly.');
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
      throw new Error('X.AI API key is not configured');
    }

    const {
      temperature = 1.0,
      maxTokens = 8192,
      topP = 0.95,
      enableThinking = true
    } = config;

    const request: GrokRequest = {
      model: GROK_MODEL,
      messages: [
        {
          role: 'system',
          content: systemInstruction
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      thinking: enableThinking,
      stream: false
    };

    try {
      console.log('Making request to X.AI API with config:', {
        model: GROK_MODEL,
        temperature,
        maxTokens,
        enableThinking
      });

      const response = await fetch(`${XAI_API_BASE}/chat/completions`, {
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
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response choices returned from X.AI API');
      }

      const choice = data.choices[0];
      const content = choice.message.content;
      const thinking = choice.message.thinking;
      const usage = data.usage;

      console.log('X.AI API response received:', {
        contentLength: content?.length || 0,
        hasThinking: !!thinking,
        usage
      });

      return {
        content,
        thinking,
        usage
      };

    } catch (error) {
      console.error('X.AI API request failed:', error);
      throw error;
    }
  }

  /**
   * Test connection to X.AI API
   */
  async testConnection(testType: 'text' | 'image' = 'text'): Promise<{
    success: boolean;
    model: string;
    contextWindow: number;
    testType: string;
    error?: string;
  }> {
    if (testType === 'text') {
      try {
        const testResult = await this.generateText(
          'You are a test assistant.',
          'Please respond with exactly: "Connection successful"',
          {
            temperature: 0,
            maxTokens: 50,
            enableThinking: false
          }
        );

        const success = testResult.content.includes('Connection successful');
        
        return {
          success,
          model: GROK_MODEL,
          contextWindow: 2000000, // 2 million tokens
          testType: 'text',
          error: success ? undefined : 'Unexpected response from API'
        };
      } catch (error) {
        return {
          success: false,
          model: GROK_MODEL,
          contextWindow: 2000000,
          testType: 'text',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    } else {
      // Grok-4 doesn't support image generation
      return {
        success: false,
        model: GROK_MODEL,
        contextWindow: 2000000,
        testType: 'image',
        error: 'X.AI Grok-4 does not support image generation'
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
export const xaiClient = new XAIAPIClient();