/**
 * AI Model Selector Store
 * 
 * Manages the selected AI model and provides testing functionality
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIModel, ModelTestResult } from '../types';
import { xaiClient } from '../services/ai/grokService';

// Available AI models (Grok-only deployment)
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
];

interface AIModelStore {
  // State
  selectedModelId: string;
  testResults: Record<string, ModelTestResult>;
  isTestingModel: string | null;
  
  // Getters
  getSelectedModel: () => AIModel | undefined;
  getAllModels: () => AIModel[];
  getTestResult: (modelId: string, testType?: string) => ModelTestResult | undefined;
  
  // Actions
  setSelectedModel: (modelId: string) => void;
  testModel: (modelId: string, testType?: 'text' | 'image') => Promise<ModelTestResult>;
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

      getTestResult: (modelId: string, testType: string = 'text') => {
        const { testResults } = get();
        const resultKey = `${modelId}-${testType}`;
        return testResults[resultKey] || testResults[modelId]; // Fallback to old format
      },

      // Actions
      setSelectedModel: (modelId: string) => {
        const model = AVAILABLE_MODELS.find(m => m.id === modelId);
        if (model) {
          set({ selectedModelId: modelId });
          console.log(`AI model switched to: ${model.name} (${model.provider})`);
        }
      },

      testModel: async (modelId: string, testType: 'text' | 'image' = 'text') => {
        set({ isTestingModel: modelId });
        
        try {
          const startTime = Date.now();
          let result: ModelTestResult;

          console.log(`Testing ${modelId} for ${testType} capability...`);

          if (modelId === 'grok-4-fast-reasoning') {
            const testResult = await xaiClient.testConnection(testType);
            result = {
              ...testResult,
              responseTime: Date.now() - startTime,
            };
          } else {
            console.error('Unknown model for testing:', modelId);
            result = {
              success: false,
              model: modelId,
              contextWindow: 0,
              responseTime: Date.now() - startTime,
              testType,
              error: 'Unknown model',
            };
          }

          console.log('Test result:', result);

          // Store the test result with test type
          const resultKey = `${modelId}-${testType}`;
          set(state => ({
            testResults: {
              ...state.testResults,
              [resultKey]: result,
            },
            isTestingModel: null,
          }));

          return result;
        } catch (error) {
          console.error('Model test failed:', modelId, testType, error);
          const result: ModelTestResult = {
            success: false,
            model: modelId,
            contextWindow: 0,
            responseTime: Date.now() - Date.now(),
            testType,
            error: error instanceof Error ? error.message : 'Test failed',
          };

          const resultKey = `${modelId}-${testType}`;
          set(state => ({
            testResults: {
              ...state.testResults,
              [resultKey]: result,
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