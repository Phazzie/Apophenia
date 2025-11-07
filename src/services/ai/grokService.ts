/**
 * Grok-4 Fast API Integration
 *
 * Implements X.AI's Grok-4-fast model.
 */

// X.AI API configuration
const XAI_API_BASE = 'https://api.x.ai/v1';
const GROK_TEXT_MODEL = 'grok-4-fast-reasoning';
const GROK_IMAGE_MODEL = 'grok-2-image-1212';

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
  thinking?: boolean; 
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
      thinking?: string;
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
 * X.AI API client for text generation
 */
export class XAIAPIClient {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseURL = XAI_API_BASE;

    if (!this.apiKey) {
      console.warn('X.AI API key not provided. Service will not function.');
    }
  }

  /**
   * Generate text with Grok-4 Fast
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
      model: GROK_TEXT_MODEL,
      messages,
      temperature: config.temperature ?? 1.0,
      max_tokens: config.maxTokens ?? 8192,
      top_p: config.topP ?? 0.95,
      thinking: config.enableThinking ?? true,
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
   * Generate images using the grok-2-image-1212 model
   * Official endpoint: https://api.x.ai/v1/images/generations
   * Model: grok-2-image-1212 (latest as of Nov 2025)
   * Pricing: $0.07 per image
   * Rate limit: 5 requests/sec, up to 10 images per request
   */
  async generateImage(prompt: string, n: number = 1): Promise<string[]> {
    if (!this.apiKey) {
      console.error('X.AI API key not configured - cannot generate images.');
      throw new Error('X.AI API key not configured');
    }

    // Enforce API limits
    const imageCount = Math.min(Math.max(1, n), 10);

    const requestBody = {
      model: GROK_IMAGE_MODEL,
      prompt,
      n: imageCount,
      response_format: 'url', // 'url' or 'b64_json'
    };

    try {
      console.log(`Making X.AI image generation request to: ${this.baseURL}/images/generations`);
      console.log(`Model: ${GROK_IMAGE_MODEL}, Images: ${imageCount}`);

      const response = await fetch(`${this.baseURL}/images/generations`, {
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

      // Response format: { created: number, data: [{ url: string }] }
      if (!data || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
        console.error('No images found in X.AI response');
        throw new Error('No images found in X.AI response');
      }

      return data.data.map((image: { url: string }) => image.url);

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
            enableThinking: false
          }
        );

        console.log('X.AI text test successful');
        return {
          success: true,
          model: GROK_TEXT_MODEL,
          contextWindow: 2000000,
          testType: 'text',
        };
      } else {
        // Test X.AI image generation (experimental)
        console.log('Testing X.AI image generation (experimental)...');
        try {
          const result = await this.generateImage('A simple test image of a red circle', 1);
          return {
            success: result !== null && result.length > 0,
            model: `${GROK_TEXT_MODEL} (text) + ${GROK_IMAGE_MODEL} (image)`,
            contextWindow: 2000000,
            testType: 'image',
            error: result === null || result.length === 0 ? 'X.AI image generation failed (will fallback to Unsplash)' : undefined
          };
        } catch (err) {
          return {
            success: false,
            model: `${GROK_TEXT_MODEL} (text) + ${GROK_IMAGE_MODEL} (image)`,
            contextWindow: 2000000,
            testType: 'image',
            error: err instanceof Error ? err.message : 'X.AI image generation failed'
          };
        }
      }
    } catch (error) {
      console.error('X.AI API test failed:', error);
      return {
        success: false,
        model: GROK_TEXT_MODEL,
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
      name: GROK_TEXT_MODEL,
      imageModel: GROK_IMAGE_MODEL,
      provider: 'X.AI',
      contextWindow: 2000000,
      supportsFunctions: false,
      supportsThinking: true,
      supportsImages: true,
      pricing: {
        text: '$5 per 1M input tokens, $15 per 1M output tokens',
        image: '$0.07 per image'
      },
      rateLimits: {
        text: '60 requests/min',
        image: '5 requests/sec, max 10 images/request'
      }
    };
  }
}

// Singleton instance
const xaiApiKey =
  (typeof process !== 'undefined' ? process.env.VITE_XAI_API_KEY : import.meta.env.VITE_XAI_API_KEY) || '';
export const xaiClient = new XAIAPIClient(xaiApiKey);