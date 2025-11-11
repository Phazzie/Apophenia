# Apophenia Test Suite

Comprehensive test suite for the Apophenia cosmic horror narrative game. This test suite validates all architectural seams and ensures component integration.

## Structure

```
tests/
├── mocks/                    # Mock implementations
│   ├── mockAIService.ts     # Mock AI responses
│   ├── mockImageService.ts  # Mock image generation
│   ├── mockStores.ts        # Mock Zustand stores
│   └── mockContexts.ts      # Mock engine contexts
├── utils/                    # Test utilities
│   ├── testHelpers.ts       # Assertion helpers
│   └── storeInitializers.ts # Store setup utilities
├── unit/                     # Unit tests
│   ├── engines/             # Engine tests
│   ├── state/               # Store tests
│   ├── ai/                  # AI service tests
│   ├── commands/            # Command executor tests
│   ├── flows/               # Flow orchestration tests
│   └── images/              # Image service tests
└── integration/              # Integration tests
    ├── engine-state-integration.test.ts
    ├── ai-command-integration.test.ts
    └── flow-integration.test.ts
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test tests/unit/engines/TemporalRevisionEngine.test.ts

# Run tests matching pattern
npm test -- --grep "Engine"
```

## Coverage Requirements

- **Overall**: 80% minimum
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 75%
- **Statements**: 80%

## Test Categories

### Unit Tests

#### Engines (`tests/unit/engines/`)
- ✅ TemporalRevisionEngine - History revision logic
- ✅ RealityCorruptionEngine - Corruption calculation
- ✅ AdaptiveHorrorEngine - Fear profile analysis
- ✅ QuantumNarrativeEngine - Timeline management
- ✅ MetaConsciousnessEngine - Fourth wall breaking
- ✅ NeuralEchoChamberEngine - Cross-session memory
- ✅ SemanticChoiceArchaeologyEngine - Choice pattern analysis
- ✅ AdaptiveNarrativeDNAEngine - Narrative genome evolution
- ✅ FifthWallEngine - Browser manipulation

#### State (`tests/unit/state/`)
- ✅ gameStateStore - Game state management
- ✅ worldStateStore - World state and corruption
- ✅ historyStore - Story segment history
- ✅ playerProfileStore - Player psychological profile
- ✅ StateManager - Multi-store coordination

#### AI Services (`tests/unit/ai/`)
- ✅ grokService - Grok-4 integration
- ✅ geminiService - Gemini 2.5 integration
- ✅ mockService - Mock AI responses
- ✅ unifiedAIService - Service facade and fallback
- ✅ promptBuilder - Prompt construction
- ✅ responseParser - Response parsing

#### Commands (`tests/unit/commands/`)
- ✅ displayText - Text display executor
- ✅ displayChoices - Choice display executor
- ✅ generateImage - Image generation executor
- ✅ updateWorldState - World state updates
- ✅ wait - Delay executor
- ✅ applyCorruption - Corruption effects
- ✅ browserEffect - Browser manipulation
- ✅ reviseHistory - History revision
- ✅ quantumShift - Timeline shifting
- ✅ CommandQueue - Command queue management

#### Flows (`tests/unit/flows/`)
- ✅ DescentFlow - Main gameplay flow
- ✅ UnravelingFlow - Reality collapse flow
- ✅ FlowCoordinator - Flow orchestration
- ✅ FlowContextBuilder - Context building

#### Images (`tests/unit/images/`)
- ✅ grokImageService - Grok image generation
- ✅ geminiImageService - Gemini image generation
- ✅ unsplashService - Unsplash fallback
- ✅ ImagePipeline - Multi-service pipeline
- ✅ LRUTTLCache - Cache implementation

### Integration Tests

#### Engine → State (`tests/integration/engine-state-integration.test.ts`)
- ✅ Engine effects application to stores
- ✅ History revision integration
- ✅ Multi-store coordination
- ✅ State preservation during engine execution

#### AI → Command (`tests/integration/ai-command-integration.test.ts`)
- ✅ AI response to command conversion
- ✅ Command validation
- ✅ Service availability
- ✅ Token estimation

#### Flow Integration (`tests/integration/flow-integration.test.ts`)
- ✅ End-to-end choice processing
- ✅ Engine coordination
- ✅ State transitions
- ✅ Error recovery

## Mocks

### Mock AI Service
Provides predictable AI responses without API calls:
- Mock story content
- Mock choices (regular + intrusive)
- Mock commands
- Configurable delays

### Mock Image Service
Provides mock image generation:
- Success responses
- Failure responses
- Cached responses
- Configurable availability

### Mock Stores
Isolated Zustand store instances:
- No localStorage persistence
- Resettable state
- Configurable initial state

### Mock Contexts
Pre-configured test contexts:
- Engine contexts with varying horror levels
- Flow contexts for different game states
- AI contexts with full game state

## Test Utilities

### Test Helpers (`tests/utils/testHelpers.ts`)
- `assertEngineInterface()` - Validate engine implementation
- `assertValidEngineOutput()` - Validate engine output
- `assertValidCommand()` - Validate command structure
- `waitFor()` - Async helper
- `mockLocalStorage()` - LocalStorage mock
- `createSpy()` - Spy function creation

### Store Initializers (`tests/utils/storeInitializers.ts`)
- `initializeTestStores()` - Create fresh stores
- `initializeInProgressStores()` - Game in progress state
- `initializeHighHorrorStores()` - High horror state
- `initializeCorruptedStores()` - Corrupted state
- `resetAllTestStores()` - Reset all stores
- `snapshotStores()` - Capture store state

## Context Builders

### ContextBuilder Presets
```typescript
ContextBuilder.withHighHorror()      // Horror intensity > 7
ContextBuilder.withLowHealth()       // System health < 30
ContextBuilder.withHighCorruption()  // Corruption > 70
ContextBuilder.withExtensiveHistory() // 10+ segments
ContextBuilder.withIntrusiveChoice() // Intrusive thought
```

## Writing New Tests

### Engine Test Template
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { YourEngine } from '../../../src/services/ai/engines/YourEngine';
import { buildMockEngineContext } from '../../mocks/mockContexts';
import { assertEngineInterface, assertValidEngineOutput } from '../../utils/testHelpers';

describe('YourEngine', () => {
  let engine: YourEngine;

  beforeEach(() => {
    engine = new YourEngine();
  });

  it('should implement Engine interface', () => {
    assertEngineInterface(engine);
  });

  it('should activate with appropriate context', () => {
    const context = buildMockEngineContext();
    const isActive = engine.isActive(context);
    expect(typeof isActive).toBe('boolean');
  });

  it('should return valid output', async () => {
    const context = buildMockEngineContext();
    const output = await engine.process(context);
    assertValidEngineOutput(output);
  });
});
```

### Store Test Template
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createMockYourStore } from '../../mocks/mockStores';

describe('YourStore', () => {
  let store: ReturnType<typeof createMockYourStore>;

  beforeEach(() => {
    store = createMockYourStore();
    store.getState().reset();
  });

  it('should initialize with default state', () => {
    const state = store.getState();
    expect(state).toBeDefined();
  });

  it('should update state via actions', () => {
    store.getState().yourAction(value);
    expect(store.getState().yourProperty).toBe(value);
  });

  it('should reset to initial state', () => {
    store.getState().yourAction(value);
    store.getState().reset();
    // Assert reset
  });
});
```

### Integration Test Template
```typescript
import { describe, it, expect } from 'vitest';
import { Component1 } from '../../src/component1';
import { Component2 } from '../../src/component2';
import { buildMockContext } from '../mocks/mockContexts';

describe('Component1 → Component2 Integration', () => {
  it('should integrate correctly', async () => {
    const comp1 = new Component1();
    const comp2 = new Component2();

    const context = buildMockContext();
    const output1 = await comp1.process(context);
    const output2 = await comp2.process(output1);

    expect(output2).toBeDefined();
  });
});
```

## Known Issues

### Jest Compatibility
Some existing tests use Jest-specific APIs (`jest.spyOn`, `jest.useFakeTimers`). These need to be migrated to Vitest equivalents:

```typescript
// Jest
jest.spyOn(object, 'method')
jest.useFakeTimers()

// Vitest
vi.spyOn(object, 'method')
vi.useFakeTimers()
```

### Async Timeout
Some tests may timeout in long-running scenarios. Increase timeout:

```typescript
it('long running test', async () => {
  // test code
}, 10000); // 10 second timeout
```

## Coverage Reports

Coverage reports are generated in:
- `coverage/index.html` - HTML report
- `coverage/lcov.info` - LCOV format
- `coverage/coverage-final.json` - JSON format

View HTML coverage:
```bash
npm test -- --coverage
open coverage/index.html
```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Release tags

Required checks:
- ✅ All tests pass
- ✅ Coverage > 80%
- ✅ No type errors
- ✅ Linting passes

## Debugging Tests

### VS Code Configuration
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["test", "--", "--run"],
  "console": "integratedTerminal"
}
```

### Debug Single Test
```bash
npm test -- --reporter=verbose tests/unit/engines/TemporalRevisionEngine.test.ts
```

### Environment Variables
```bash
DEBUG=* npm test  # Enable debug logging
VITEST_MIN_THREADS=1 npm test  # Single thread for debugging
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Use `beforeEach` and `afterEach` for setup/teardown
3. **Mocking**: Mock external dependencies
4. **Assertions**: Use specific assertions over generic ones
5. **Coverage**: Aim for meaningful coverage, not just numbers
6. **Speed**: Keep unit tests fast (< 100ms)
7. **Clarity**: Test names should describe behavior
8. **Edge Cases**: Test boundaries and error conditions

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Ensure tests pass locally
3. Check coverage meets requirements
4. Update this README if needed
5. Run full test suite before PR

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Zustand Testing](https://docs.pmnd.rs/zustand/guides/testing)
- [SEAMS.md](/SEAMS.md) - Architecture documentation
