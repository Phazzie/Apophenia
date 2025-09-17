/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
    }],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'import.meta': {
      env: {
        VITE_GEMINI_API_KEY: 'test-key',
        VITE_IMAGE_API_KEY: 'test-image-key',
        VITE_GOOGLE_NANO_BANANA_KEY: 'test-nano-key',
        VITE_GOOGLE_IMAGEN_KEY: 'test-imagen-key',
      }
    }
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
};
