import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  isDefault?: boolean;
  contextWindow: number;
  capabilities: string[];
  status?: 'available' | 'unavailable' | 'testing';
}

export interface ModelTestResult {
  modelId: string;
  success: boolean;
  latency?: number;
  error?: string;
  timestamp: number;
}

interface AIModelStore {
  selectedModelId: string | null;
  models: AIModel[];
  testResults: Record<string, ModelTestResult>;
  isTestingModel: string | null;
  
  // Actions
  setSelectedModel: (modelId: string) => void;
  getSelectedModel: () => AIModel | null;
  getAllModels: () => AIModel[];
  testModel: (modelId: string) => Promise<void>;
  getTestResult: (modelId: string) => ModelTestResult | null;
}

// Define available models
const DEFAULT_MODELS: AIModel[] = [
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    isDefault: true,
    contextWindow: 1000000,
    capabilities: ['text', 'reasoning', 'code'],
    status: 'available'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    contextWindow: 1000000,
    capabilities: ['text', 'speed'],
    status: 'available'
  }
];

export const useAIModelStore = create<AIModelStore>()(
  persist(
    (set, get) => ({
      selectedModelId: 'gemini-2.5-pro', // Default to reliable model
      models: DEFAULT_MODELS,
      testResults: {},
      isTestingModel: null,

      setSelectedModel: (modelId) => {
        set({ selectedModelId: modelId });
      },

      getSelectedModel: () => {
        const { selectedModelId, models } = get();
        if (!selectedModelId) {
          // Return default model if no selection
          return models.find(m => m.isDefault) || models[0] || null;
        }
        return models.find(m => m.id === selectedModelId) || null;
      },

      getAllModels: () => {
        return get().models;
      },

      testModel: async (modelId) => {
        set({ isTestingModel: modelId });
        
        const startTime = Date.now();
        try {
          // Simple connectivity test - attempt to make a minimal request
          const testPrompt = "Test connection with one word response: OK";
          
          // For now, simulate a test. In real implementation, this would call the actual AI service
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
          
          const latency = Date.now() - startTime;
          const testResult: ModelTestResult = {
            modelId,
            success: true,
            latency,
            timestamp: Date.now()
          };
          
          set(state => ({
            testResults: { ...state.testResults, [modelId]: testResult },
            isTestingModel: null
          }));
          
        } catch (error) {
          const testResult: ModelTestResult = {
            modelId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: Date.now()
          };
          
          set(state => ({
            testResults: { ...state.testResults, [modelId]: testResult },
            isTestingModel: null
          }));
        }
      },

      getTestResult: (modelId) => {
        return get().testResults[modelId] || null;
      }
    }),
    {
      name: 'cosmic-narrative-ai-models',
      partialize: (state) => ({
        selectedModelId: state.selectedModelId,
        testResults: state.testResults
      })
    }
  )
);