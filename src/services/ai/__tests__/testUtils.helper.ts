import { REVOLUTIONARY_FEATURES } from '../../config';

// Utility type for deep partial mocking
type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

// Test utilities for mocking revolutionary features
export const createMockRevolutionaryFeatures = (overrides: DeepPartial<typeof REVOLUTIONARY_FEATURES> = {}) => ({
  TEMPORAL_REVISION: {
    enabled: true,
    maxRevisions: 3,
    corruptionThreshold: 0.6,
    ...overrides.TEMPORAL_REVISION
  },
  META_CONSCIOUSNESS: {
    enabled: true,
    triggerProbability: 0.15,
    minInterval: 30000,
    escalationFactor: 1.2,
    ...overrides.META_CONSCIOUSNESS
  },
  QUANTUM_NARRATIVES: {
    enabled: true,
    branchProbability: 0.25,
    maxBranches: 3,
    ...overrides.QUANTUM_NARRATIVES
  },
  ADAPTIVE_HORROR: {
    enabled: true,
    learningRate: 0.1,
    profilingDepth: 5,
    ...overrides.ADAPTIVE_HORROR
  },
  REALITY_CORRUPTION: {
    enabled: true,
    baseCorruption: 0.05,
    escalationRate: 0.1,
    maxCorruption: 0.9,
    ...overrides.REALITY_CORRUPTION
  }
});

export const mockRevolutionaryFeatures = (overrides: DeepPartial<typeof REVOLUTIONARY_FEATURES> = {}) => {
  const mockConfig = createMockRevolutionaryFeatures(overrides);
  jest.doMock('../../config', () => ({
    REVOLUTIONARY_FEATURES: mockConfig,
    API_KEYS: {
      googleGenAI: 'test-key',
      googleNanoBanana: 'test-nano-key',
      googleImagen: 'test-imagen-key'
    }
  }));
  return mockConfig;
};