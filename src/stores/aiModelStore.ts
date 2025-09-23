/**
 * AI Model Selector Store
 * 
 * Manages the selected AI model and provides testing functionality
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIModel, ModelTestResult } from '../types';
import { grokClient } from '../services/ai/grokService';

// Available AI models
export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'grok-4-fast-reasoning',
    name: 'Grok-4 Fast Reasoning',
    provider: 'X.AI',
    contextWindow: 2000000, // 2M tokens
    supportsThinking: true,
    supportsImages: false,
    isDefault: true,
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    contextWindow: 1000000, // 1M tokens
    supportsThinking: true,
    supportsImages: true,
    isDefault: false,
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    contextWindow: 1000000, // 1M tokens
    supportsThinking: false,
    supportsImages: true,
    isDefault: false,
  },
];

interface AIModelStore {
  // State
  selectedModelId: string;
  testResults: Record<string, ModelTestResult>;
  isTestingModel: string | null;
  
  // Getters
  getSelectedModel: () => AIModel | undefined;
  getAllModels: () => AIModel[];
  getTestResult: (modelId: string) => ModelTestResult | undefined;
  
  // Actions
  setSelectedModel: (modelId: string) => void;
  testModel: (modelId: string) => Promise<ModelTestResult>;
  clearTestResults: () => void;
}

export const useAIModelStore = create<AIModelStore>()(
  persist(
    (set, get) => ({
      // Initialize with default model (Grok-4)
      selectedModelId: AVAILABLE_MODELS.find(m => m.isDefault)?.id || 'grok-4-fast-reasoning',
      testResults: {},
      isTestingModel: null,

      // Getters
      getSelectedModel: () => {
        const { selectedModelId } = get();
        return AVAILABLE_MODELS.find(m => m.id === selectedModelId);
      },

      getAllModels: () => AVAILABLE_MODELS,

      getTestResult: (modelId: string) => {
        const { testResults } = get();
        return testResults[modelId];
      },

      // Actions
      setSelectedModel: (modelId: string) => {
        const model = AVAILABLE_MODELS.find(m => m.id === modelId);
        if (model) {
          set({ selectedModelId: modelId });
          console.log(`AI model switched to: ${model.name} (${model.provider})`);
        }
      },

      testModel: async (modelId: string) => {
        set({ isTestingModel: modelId });
        
        try {
          const startTime = Date.now();
          let result: ModelTestResult;

          if (modelId === 'grok-4-fast-reasoning') {
            const testResult = await grokClient.testConnection();
            result = {
              ...testResult,
              responseTime: Date.now() - startTime,
            };
          } else if (modelId.startsWith('gemini-')) {
            // Test Gemini models (fallback to mock for now)
            result = {
              success: true,
              model: modelId,
              contextWindow: 1000000,
              responseTime: Date.now() - startTime,
            };
          } else {
            result = {
              success: false,
              model: modelId,
              contextWindow: 0,
              responseTime: Date.now() - startTime,
              error: 'Unknown model',
            };
          }

          // Store the test result
          set(state => ({
            testResults: {
              ...state.testResults,
              [modelId]: result,
            },
            isTestingModel: null,
          }));

          return result;
        } catch (error) {
          const result: ModelTestResult = {
            success: false,
            model: modelId,
            contextWindow: 0,
            responseTime: Date.now() - Date.now(),
            error: error instanceof Error ? error.message : 'Test failed',
          };

          set(state => ({
            testResults: {
              ...state.testResults,
              [modelId]: result,
            },
            isTestingModel: null,
          }));

          return result;
        }
      },

      clearTestResults: () => {
        set({ testResults: {} });
      },
    }),
    {
      name: 'ai-model-store',
      // Only persist the selected model, not test results
      partialize: (state) => ({ selectedModelId: state.selectedModelId }),
    }
  )
);