/**
 * Test Helpers and Utilities
 * Common helper functions for writing tests
 */

import { expect } from 'vitest';
import {
  Engine,
  EngineOutput,
  EngineContext,
  Command,
  ExecutionResult,
  ValidationResult,
} from '../../src/core/types/seams';

/**
 * Assert that an engine implements the Engine interface correctly
 */
export function assertEngineInterface(engine: Engine): void {
  expect(engine.name).toBeDefined();
  expect(typeof engine.name).toBe('string');
  expect(engine.name.length).toBeGreaterThan(0);

  expect(engine.description).toBeDefined();
  expect(typeof engine.description).toBe('string');

  expect(engine.priority).toBeDefined();
  expect(typeof engine.priority).toBe('number');
  expect(engine.priority).toBeGreaterThan(0);
  expect(engine.priority).toBeLessThanOrEqual(10);

  expect(engine.isActive).toBeDefined();
  expect(typeof engine.isActive).toBe('function');

  expect(engine.process).toBeDefined();
  expect(typeof engine.process).toBe('function');

  expect(engine.generateInstructions).toBeDefined();
  expect(typeof engine.generateInstructions).toBe('function');
}

/**
 * Assert that engine output is valid
 */
export function assertValidEngineOutput(output: EngineOutput): void {
  expect(output.engineName).toBeDefined();
  expect(typeof output.engineName).toBe('string');

  expect(output.instructions).toBeDefined();
  expect(Array.isArray(output.instructions)).toBe(true);

  expect(output.effects).toBeDefined();
  expect(typeof output.effects).toBe('object');

  expect(output.metadata).toBeDefined();
  expect(typeof output.metadata).toBe('object');
}

/**
 * Assert that a command is valid
 */
export function assertValidCommand(command: Command): void {
  expect(command.type).toBeDefined();
  expect(typeof command.type).toBe('string');

  expect(command.payload).toBeDefined();
  expect(typeof command.payload).toBe('object');
}

/**
 * Assert that an execution result is valid
 */
export function assertValidExecutionResult(result: ExecutionResult): void {
  expect(result.success).toBeDefined();
  expect(typeof result.success).toBe('boolean');

  expect(result.command).toBeDefined();
  expect(typeof result.command).toBe('object');

  if (!result.success) {
    expect(result.error).toBeDefined();
    expect(typeof result.error).toBe('string');
  }
}

/**
 * Assert that a validation result is valid
 */
export function assertValidValidationResult(result: ValidationResult): void {
  expect(result.valid).toBeDefined();
  expect(typeof result.valid).toBe('boolean');

  expect(result.errors).toBeDefined();
  expect(Array.isArray(result.errors)).toBe(true);
}

/**
 * Wait for async operations
 */
export async function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock localStorage for testing
 */
export function mockLocalStorage(): void {
  const store: Record<string, string> = {};

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach((key) => delete store[key]);
      },
      get length() {
        return Object.keys(store).length;
      },
      key: (index: number) => Object.keys(store)[index] || null,
    },
    writable: true,
  });
}

/**
 * Create a spy function that tracks calls
 */
export function createSpy<T extends (...args: any[]) => any>(
  implementation?: T
): T & { calls: any[][]; callCount: number; reset: () => void } {
  const calls: any[][] = [];

  const spy = ((...args: any[]) => {
    calls.push(args);
    return implementation ? implementation(...args) : undefined;
  }) as any;

  spy.calls = calls;
  Object.defineProperty(spy, 'callCount', {
    get: () => calls.length,
  });
  spy.reset = () => {
    calls.length = 0;
  };

  return spy;
}

/**
 * Assert that an engine can be activated
 */
export async function assertEngineCanActivate(
  engine: Engine,
  context: EngineContext
): Promise<void> {
  const isActive = engine.isActive(context);
  expect(typeof isActive).toBe('boolean');
}

/**
 * Assert that an engine can process context
 */
export async function assertEngineCanProcess(
  engine: Engine,
  context: EngineContext
): Promise<void> {
  const output = await engine.process(context);
  assertValidEngineOutput(output);
}

/**
 * Assert that an engine can generate instructions
 */
export function assertEngineCanGenerateInstructions(
  engine: Engine,
  context: EngineContext
): void {
  const instructions = engine.generateInstructions(context);
  expect(Array.isArray(instructions)).toBe(true);
  instructions.forEach((instruction) => {
    expect(typeof instruction).toBe('string');
    expect(instruction.length).toBeGreaterThan(0);
  });
}

/**
 * Run all engine interface tests
 */
export async function testEngineInterface(
  engine: Engine,
  context: EngineContext
): Promise<void> {
  assertEngineInterface(engine);
  await assertEngineCanActivate(engine, context);
  await assertEngineCanProcess(engine, context);
  assertEngineCanGenerateInstructions(engine, context);
}
