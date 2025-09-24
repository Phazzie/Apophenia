/**
 * Mock X.AI Grok Service for Testing
 */

export class XAIAPIClient {
  constructor() {}

  async generateText(
    systemInstruction: string,
    userPrompt: string,
    config: any = {}
  ): Promise<{ content: string; thinking?: string; usage: any }> {
    // Mock successful X.AI response
    return {
      content: JSON.stringify([
        {
          type: 'displayText',
          payload: {
            content: 'Mock story content from X.AI Grok-4',
            segmentId: 'mock-segment-id'
          }
        }
      ]),
      thinking: config.enableThinking ? 'Mock reasoning process' : undefined,
      usage: {
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150,
        thinking_tokens: config.enableThinking ? 25 : 0
      }
    };
  }

  async testConnection(testType: 'text' | 'image' = 'text'): Promise<{
    success: boolean;
    model: string;
    contextWindow: number;
    testType: string;
    error?: string;
  }> {
    if (testType === 'text') {
      return {
        success: true,
        model: 'grok-4-fast-reasoning',
        contextWindow: 2000000,
        testType: 'text'
      };
    } else {
      return {
        success: false,
        model: 'grok-4-fast-reasoning',
        contextWindow: 2000000,
        testType: 'image',
        error: 'X.AI does not support image generation'
      };
    }
  }

  getModelInfo() {
    return {
      name: 'grok-4-fast-reasoning',
      provider: 'X.AI',
      contextWindow: 2000000,
      supportsFunctions: false,
      supportsThinking: true,
      supportsImages: false,
    };
  }
}

// Export the singleton instance
export const xaiClient = new XAIAPIClient();