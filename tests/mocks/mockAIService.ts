/**
 * Mock AI Service for Testing
 * Provides predictable AI responses without making actual API calls
 */

import {
  AIProvider,
  AIRequest,
  AIResponse,
  Command,
  Choice,
} from '../../src/core/types/seams';

export const mockChoice1: Choice = {
  id: 'choice-1',
  text: 'Investigate the strange sound',
  consequence: 'You move closer to the source of the noise',
  psychologicalWeight: 0.7,
};

export const mockChoice2: Choice = {
  id: 'choice-2',
  text: 'Stay hidden and observe',
  consequence: 'You remain still, watching from the shadows',
  psychologicalWeight: 0.3,
};

export const mockChoice3: Choice = {
  id: 'choice-3',
  text: 'Run away',
  consequence: 'Fear overwhelms you and you flee',
  psychologicalWeight: 0.9,
};

export const mockIntrusiveChoice: Choice = {
  id: 'intrusive-1',
  text: 'Give in to the darkness',
  isIntrusive: true,
  psychologicalWeight: 1.0,
};

export const mockCommands: Command[] = [
  {
    type: 'displayText',
    payload: {
      content: 'You find yourself in a dark corridor. The walls pulse with an otherworldly energy.',
      segmentId: 'segment-1',
    },
  },
  {
    type: 'displayChoices',
    payload: {
      choices: [mockChoice1, mockChoice2, mockChoice3],
      intrusiveThought: mockIntrusiveChoice,
    },
  },
  {
    type: 'generateImage',
    payload: {
      prompt: 'Dark corridor with pulsing walls, cosmic horror',
      segmentId: 'segment-1',
      priority: 'high',
    },
  },
];

export const mockAIResponse: AIResponse = {
  provider: AIProvider.MOCK,
  content: 'You find yourself in a dark corridor. The walls pulse with an otherworldly energy.',
  commands: mockCommands,
  metadata: {
    tokensUsed: 150,
    latency: 100,
    model: 'mock-model',
  },
};

export class MockAIService {
  readonly provider = AIProvider.MOCK;
  readonly maxTokens = 4000;
  readonly supportsImages = true;

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async generateResponse(_request: AIRequest): Promise<AIResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 50));
    return mockAIResponse;
  }

  estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}

export function createMockAIResponse(overrides?: Partial<AIResponse>): AIResponse {
  return {
    ...mockAIResponse,
    ...overrides,
  };
}

export function createMockCommand(type: Command['type'], payload: any): Command {
  return { type, payload } as Command;
}
