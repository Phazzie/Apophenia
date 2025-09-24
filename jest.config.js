/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  setupFiles: ['whatwg-fetch'],
  moduleNameMapper: {
    '^../../services/config$': '<rootDir>/src/services/__mocks__/config.ts',
    '^../config$': '<rootDir>/src/services/__mocks__/config.ts',
    '^../../services/ai/grokService$': '<rootDir>/src/services/__mocks__/ai/grokService.ts',
    '^../ai/grokService$': '<rootDir>/src/services/__mocks__/ai/grokService.ts',
    '^../../services/ai/unifiedAIService$': '<rootDir>/src/services/__mocks__/ai/unifiedAIService.ts',
    '^../ai/unifiedAIService$': '<rootDir>/src/services/__mocks__/ai/unifiedAIService.ts',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
      }
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/*.spec.{ts,tsx}'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/src/services/ai/__tests__/testUtils.helper.ts'
  ],
  // Coverage configuration - enforce 80% threshold
  collectCoverage: process.env.CI === 'true' || process.env.COVERAGE === 'true',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/setupTests.ts',
    '!src/**/__mocks__/**',
    '!src/**/__tests__/**',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/services/ai/__tests__/testUtils.helper.ts'
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    }
  },
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageDirectory: 'coverage',
  // Mock import.meta.env for Vite compatibility
  globals: {
    'import.meta': {
      env: {
        VITE_GEMINI_API_KEY: 'test-key',
        VITE_XAI_API_KEY: 'test-key',
      }
    }
  }
};
