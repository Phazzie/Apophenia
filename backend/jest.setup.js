// Jest setup file for backend tests

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
};

// Mock process.exit to prevent tests from actually exiting
const originalExit = process.exit;
process.exit = jest.fn();

// Restore process.exit after tests
afterAll(() => {
  process.exit = originalExit;
});

// Set test timeout
jest.setTimeout(10000);