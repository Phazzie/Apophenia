/**
 * @file aiModelStore.ts
 * @description Zustand store for managing the state related to AI model selection.
 * This store handles which AI model is currently active, provides a list of available models,
 * and includes functionality for testing the connectivity and capabilities of each model.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIModel, ModelTestResult } from '../types';
import { xaiClient } from '../services/ai/grokService';

/**
 * @constant {AIModel[]} AVAILABLE_MODELS
 * @description A static array defining all the AI models available in the application.
 * This serves as the single source of truth for model metadata.
 */
export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'grok-4-fast-reasoning',
    name: 'Grok-4 Fast Reasoning',
    provider: 'X.AI',
    contextWindow: 2000000,
    supportsThinking: true,
    supportsImages: false,
    isDefault: true,
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    contextWindow: 1000000,
    supportsThinking: true,
    supportsImages: true,
    isDefault: false,
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    contextWindow: 1000000,
    supportsThinking: false,
    supportsImages: true,
    isDefault: false,
  },
];

/**
 * @interface AIModelStore
 * @description Defines the structure of the AI model store, including its state and actions.
 */
interface AIModelStore {
  /** The ID of the currently selected AI model. */
  selectedModelId: string;
  /** A record of test results, keyed by model ID and test type. */
  testResults: Record<string, ModelTestResult>;
  /** The ID of the model currently being tested, or null if no test is running. */
  isTestingModel: string | null;
  
  /** Returns the full object for the currently selected AI model. */
  getSelectedModel: () => AIModel | undefined;
  /** Returns the complete list of available AI models. */
  getAllModels: () => AIModel[];
  /** Retrieves the test result for a specific model and test type. */
  getTestResult: (modelId: string, testType?: string) => ModelTestResult | undefined;
  
  /** Sets the active AI model. */
  setSelectedModel: (modelId: string) => void;
  /** Initiates a test for a given model and capability (text or image). */
  testModel: (modelId: string, testType?: 'text' | 'image') => Promise<ModelTestResult>;
  /** Clears all stored test results. */
  clearTestResults: () => void;
}

/**
 * @hook useAIModelStore
 * @description A Zustand hook for accessing the AI model store.
 * It uses `persist` middleware to save the `selectedModelId` to local storage,
 * so the user's model choice is remembered across sessions.
 */
export const useAIModelStore = create<AIModelStore>()(
  persist(
    (set, get) => ({
      selectedModelId: AVAILABLE_MODELS.find(m => m.isDefault)?.id || 'grok-4-fast-reasoning',
      testResults: {},
      isTestingModel: null,

      getSelectedModel: () => {
        const { selectedModelId } = get();
        return AVAILABLE_MODELS.find(m => m.id === selectedModelId);
      },

      getAllModels: () => AVAILABLE_MODELS,

      getTestResult: (modelId: string, testType: string = 'text') => {
        const { testResults } = get();
        const resultKey = `${modelId}-${testType}`;
        return testResults[resultKey] || testResults[modelId]; // Fallback for backward compatibility
      },

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

          // Route test to the appropriate service based on model ID
          if (modelId === 'grok-4-fast-reasoning') {
            const testResult = await xaiClient.testConnection(testType);
            result = { ...testResult, responseTime: Date.now() - startTime };
          } else if (modelId.startsWith('gemini-')) {
            // Mock test for Gemini models as an example
            console.log(`Testing Gemini ${testType} generation...`);
            result = {
              success: true,
              model: modelId,
              contextWindow: 1000000,
              responseTime: Date.now() - startTime,
              testType: testType,
            };
          } else {
            // Handle unknown models
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

          // Store the result using a key that includes the test type
          const resultKey = `${modelId}-${testType}`;
          set(state => ({
            testResults: { ...state.testResults, [resultKey]: result },
            isTestingModel: null,
          }));

          return result;
        } catch (error) {
          console.error('Model test failed:', modelId, testType, error);
          const result: ModelTestResult = {
            success: false,
            model: modelId,
            contextWindow: 0,
            responseTime: 0,
            testType,
            error: error instanceof Error ? error.message : 'Test failed',
          };

          const resultKey = `${modelId}-${testType}`;
          set(state => ({
            testResults: { ...state.testResults, [resultKey]: result },
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
      // Only persist the user's selected model ID, not transient state like test results.
      partialize: (state) => ({ selectedModelId: state.selectedModelId }),
    }
  )
);