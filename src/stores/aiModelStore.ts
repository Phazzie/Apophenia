/**
 * AI Model Selection Store
 * Manages the currently selected AI model for the game
 */

import { create } from 'zustand';

export type AIModelType = 'gemini-2.5-pro' | 'grok-4-fast-reasoning';

interface AIModelState {
  selectedModel: AIModelType;
  setSelectedModel: (model: AIModelType) => void;
  getModelDisplayName: (model: AIModelType) => string;
  getModelDescription: (model: AIModelType) => string;
}

export const useAIModelStore = create<AIModelState>((set, get) => ({
  selectedModel: 'gemini-2.5-pro', // Default to Gemini

  setSelectedModel: (model: AIModelType) => {
    set({ selectedModel: model });
    console.log(`AI Model changed to: ${model}`);
  },

  getModelDisplayName: (model: AIModelType) => {
    switch (model) {
      case 'gemini-2.5-pro':
        return 'Google Gemini 2.5 Pro';
      case 'grok-4-fast-reasoning':
        return 'X.AI Grok-4 Fast Reasoning';
      default:
        return 'Unknown Model';
    }
  },

  getModelDescription: (model: AIModelType) => {
    switch (model) {
      case 'gemini-2.5-pro':
        return 'Advanced reasoning with 1M token context window';
      case 'grok-4-fast-reasoning':
        return 'Advanced reasoning with 2M token context window and thinking mode';
      default:
        return 'No description available';
    }
  }
}));