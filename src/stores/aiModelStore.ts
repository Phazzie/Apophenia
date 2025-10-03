/**
 * AI Model Information and Backend Test Store
 *
 * Manages information about the AI models available on the backend
 * and provides functionality for testing backend connectivity.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIModel, ModelTestResult } from '../types';
import { backendAPIService } from '../services/ai/backendAPIService';
import { testGrokConnection } from '../services/ai/grokService';

// This list now serves for informational purposes on the frontend.
// The actual model selection logic resides on the backend server.
export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'grok-4-fast-reasoning',
    name: 'Grok-4 Fast Reasoning',
    provider: 'X.AI',
    contextWindow: 2000000,
    supportsThinking: true,
    supportsImages: false, // As per current backend implementation
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
];

interface AIModelStore {
  // State
  testResults: Record<string, ModelTestResult>;
  isTestingModel: string | null;

  // Getters
  getAllModels: () => AIModel[];
  getTestResult: (modelId: string) => ModelTestResult | undefined;

  // Actions
  testBackendConnection: (modelId: string) => Promise<ModelTestResult>;
  clearTestResults: () => void;
}

export const useAIModelStore = create<AIModelStore>()(
  persist(
    (set, get) => ({
      testResults: {},
      isTestingModel: null,

      // Getters
      getAllModels: () => AVAILABLE_MODELS,

      getTestResult: (modelId: string) => {
        const { testResults } = get();
        return testResults[modelId];
      },

      // Actions
      testBackendConnection: async (modelId: string) => {
        set({ isTestingModel: modelId });
        let result: ModelTestResult;

        try {
          // All tests now go through our secure backend.
          // We can have model-specific test logic if the backend supports it,
          // but for now, a general health check is sufficient.
          const startTime = Date.now();
          const isHealthy = await backendAPIService.healthCheck();
          const responseTime = Date.now() - startTime;

          if (!isHealthy) {
            throw new Error('Backend API health check failed.');
          }

          // If a specific test for Grok is available, use it.
          if (modelId.includes('grok')) {
              const grokResult = await testGrokConnection();
              result = { ...grokResult, responseTime };
          } else {
            // For other models, a general success message is appropriate
            result = {
              success: true,
              model: modelId,
              contextWindow: 1000000, // Example value
              responseTime,
              testType: 'text',
            };
          }

          console.log(`Backend connection test for ${modelId} successful.`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Test failed';
          console.error(`Backend connection test for ${modelId} failed:`, errorMessage);
          result = {
            success: false,
            model: modelId,
            contextWindow: 0,
            error: errorMessage,
            testType: 'text',
            responseTime: 0,
          };
        }

        set(state => ({
          testResults: {
            ...state.testResults,
            [modelId]: result,
          },
          isTestingModel: null,
        }));

        return result;
      },

      clearTestResults: () => {
        set({ testResults: {} });
      },
    }),
    {
      name: 'ai-model-store',
      // Only persist a subset of the state, excluding test results.
      partialize: (state) => ({}),
    }
  )
);