/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  setupFiles: ['whatwg-fetch'],
  moduleNameMapper: {
    '^(..|../..)/config$': '<rootDir>/src/services/__mocks__/config.ts',
    '^../services/config$': '<rootDir>/src/services/__mocks__/config.ts',
    '^../../services/ai/grokService$': '<rootDir>/src/services/__mocks__/ai/grokService.ts',
    '^../ai/grokService$': '<rootDir>/src/services/__mocks__/ai/grokService.ts',
    '^../../services/ai/unifiedAIService$': '<rootDir>/src/services/__mocks__/ai/unifiedAIService.ts',
    '^../ai/unifiedAIService$': '<rootDir>/src/services/__mocks__/ai/unifiedAIService.ts',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  transform: {
    // useESM: true was removed here to prevent jest from failing on import.meta.env
    // The project uses Vite, which supports import.meta.env, but Jest runs in a Node environment
    // where it is not supported out-of-the-box. The current setup transpiles to CommonJS,
    // and the setupTests.ts file mocks import.meta.env for compatibility.
    '^.+\\.tsx?$': ['ts-jest', {
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
