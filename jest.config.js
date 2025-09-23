/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  setupFiles: ['whatwg-fetch'],
  moduleNameMapper: {
    '^../../services/config$': '<rootDir>/src/services/__mocks__/config.ts',
    '^../config$': '<rootDir>/src/services/__mocks__/config.ts',
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
  // Mock import.meta.env for Vite compatibility
  globals: {
    'import.meta': {
      env: {
        VITE_GEMINI_API_KEY: 'test-key',
        VITE_GROK_API_KEY: 'test-key',
      }
    }
  }
};
