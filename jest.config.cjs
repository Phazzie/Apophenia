/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  setupFiles: ['whatwg-fetch'],
  moduleNameMapper: {
    '^../../config$': '<rootDir>/src/services/__mocks__/config.ts',
    '^../../services/config$': '<rootDir>/src/services/__mocks__/config.ts',
    '^../config$': '<rootDir>/src/services/__mocks__/config.ts',
    '^../services/config$': '<rootDir>/src/services/__mocks__/config.ts',
    '^../../services/ai/grokService$': '<rootDir>/src/services/__mocks__/ai/grokService.ts',
    '^../ai/grokService$': '<rootDir>/src/services/__mocks__/ai/grokService.ts',
    '^../../services/ai/unifiedAIService$': '<rootDir>/src/services/__mocks__/ai/unifiedAIService.ts',
    '^../ai/unifiedAIService$': '<rootDir>/src/services/__mocks__/ai/unifiedAIService.ts',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    // Mocks for services using import.meta.env
    '^./genkit$': '<rootDir>/src/services/__mocks__/ai/genkit.ts',
    '^../services/ai/genkit$': '<rootDir>/src/services/__mocks__/ai/genkit.ts',
    '^./grokService$': '<rootDir>/src/services/__mocks__/ai/grokService.ts',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/*.spec.{ts,tsx}'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/src/services/ai/__tests__/testUtils.helper.ts',
    '<rootDir>/src/services/gameService.spec.ts'
  ],
  // Coverage configuration
  collectCoverage: false, // Only when --coverage flag is used
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/setupTests.ts',
    '!src/types.ts',
    '!src/vite-env.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 21,
      functions: 35,
      lines: 33,
      statements: 34,
    },
  },
};