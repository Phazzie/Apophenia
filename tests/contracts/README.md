# Contract Tests

## Overview

Contract tests validate that implementations adhere EXACTLY to their interface definitions (contracts) as specified in `src/core/types/seams.ts`. These tests are critical for maintaining **Seam-Driven Development (SDD)** architectural integrity.

## Purpose

Contract tests ensure:

1. **Interface Compliance** - All required methods and properties exist
2. **Type Safety** - All types match the contract exactly
3. **Behavioral Correctness** - Actions produce expected state changes
4. **No Extra Properties** - Implementations don't leak internal details
5. **Mock Parity** - Test mocks accurately represent real implementations

## How Contract Tests Differ from Unit Tests

| Aspect | Contract Tests | Unit Tests |
|--------|---------------|------------|
| **Focus** | Interface adherence | Implementation logic |
| **Scope** | All public methods/properties | Specific behaviors |
| **Purpose** | Validate contract compliance | Validate correctness |
| **Changes** | Change only if contract changes | Change with implementation |
| **Failures** | Indicate broken architectural seams | Indicate bugs in logic |

**Key Difference**: Contract tests validate the **shape and signature** of the interface, not the complex logic inside. If a contract test fails, it means the seam boundary is broken.

## Test Structure

### AI Service Contract Tests (`ai-services.contract.test.ts`)

Tests Seam #4: AI Service Interface

**Services Tested:**
- `GrokService` - X.AI Grok integration (with network-conditional testing)
- `MockService` - Rich demo data for development (always available)
- `UnifiedAIService` - Facade with automatic fallback

**Interfaces Validated:**
- `AIService` (lines 360-368) - Provider, token estimation, response generation
- `UnifiedAIService` (lines 370-379) - Primary/fallback providers, testing
- `ProviderTestResult` (lines 381-386) - Provider availability results
- `AIRequest` (lines 102-108) - Request shape validation
- `AIResponse` (lines 118-127) - Response shape validation (exactly 4 fields)
- `Command` types (lines 74-84) - All 10 command types validated

**Test Categories:**

#### 1. Property Tests
Validates readonly properties match contract:
```typescript
it('implements AIService interface with required properties', () => {
  expect(service).toHaveProperty('provider');
  expect(service).toHaveProperty('maxTokens');
  expect(service).toHaveProperty('supportsImages');
  expect(typeof service.provider).toBe('string');
  expect(typeof service.maxTokens).toBe('number');
  expect(typeof service.supportsImages).toBe('boolean');
});
```

#### 2. Method Signature Tests
Validates all methods return correct Promise types:
```typescript
it('isAvailable returns Promise<boolean>', async () => {
  const result = await service.isAvailable();
  expect(typeof result).toBe('boolean');
});

it('estimateTokens returns number', () => {
  const result = service.estimateTokens('Test text');
  expect(typeof result).toBe('number');
  expect(result).toBeGreaterThan(0);
});
```

#### 3. Response Shape Validation
Validates AIResponse has exactly 4 fields (no extras):
```typescript
it('generateResponse returns exactly 4 fields (no extras)', async () => {
  const response = await service.generateResponse(request);
  const expectedKeys = ['provider', 'content', 'commands', 'metadata'].sort();
  const actualKeys = Object.keys(response).sort();
  expect(actualKeys).toEqual(expectedKeys);
});
```

#### 4. Command Validation
Validates generated commands match discriminated union:
```typescript
it('commands array contains valid Command objects', async () => {
  const response = await service.generateResponse(request);
  response.commands.forEach((command) => {
    expect(command).toHaveProperty('type');
    expect(command).toHaveProperty('payload');
    expect(validCommandTypes).toContain(command.type);
  });
});
```

#### 5. Cross-Service Parity
Validates Mock and Grok services return same shape:
```typescript
it('both services return same AIResponse shape', async () => {
  const mockKeys = Object.keys(mockResponse).sort();
  const grokKeys = Object.keys(grokResponse).sort();
  expect(mockKeys).toEqual(grokKeys);
});
```

#### 6. Network-Conditional Testing
Skips network-dependent tests when service unavailable:
```typescript
beforeAll(async () => {
  grokAvailable = await grokService.isAvailable().catch(() => false);
});

it.skipIf(!grokAvailable)('generateResponse returns AIResponse', async () => {
  // Only runs if Grok API is available
});
```

**Test Results:** See `AI_SERVICE_CONTRACT_RESULTS.md` for detailed results (37 passed, 13 skipped)

---

### State Store Contract Tests (`state-stores.contract.test.ts`)

Tests Seam #2: State Store Interface

**Stores Tested:**
- `GameStateStore` - Game phase, choices, intrusive thoughts
- `WorldStateStore` - World state, horror metrics, corruption
- `HistoryStore` - Story segments, revisions
- `PlayerProfileStore` - Fear profile, choice patterns, engagement

**Test Categories:**

#### 1. Interface Implementation
Validates all required methods and properties exist:
```typescript
it('implements all required state properties', () => {
  const store = useGameStateStore.getState();
  expect(store).toHaveProperty('gameState');
  expect(store).toHaveProperty('choices');
  // ...
});

it('implements all required action methods', () => {
  const store = useGameStateStore.getState();
  expect(typeof store.setGameState).toBe('function');
  expect(typeof store.setChoices).toBe('function');
  // ...
});
```

#### 2. State Shape Compliance
Validates state structure matches contract:
```typescript
it('has correct initial state types', () => {
  const store = useGameStateStore.getState();
  expect(typeof store.gameState).toBe('string');
  expect(Array.isArray(store.choices)).toBe(true);
  // ...
});

it('does not have unexpected extra properties', () => {
  const expectedKeys = ['gameState', 'choices', ...];
  const actualKeys = Object.keys(store);
  // Validate no extra properties leaked
});
```

#### 3. Action Behavior
Validates actions produce correct state changes:
```typescript
it('setGameState updates state correctly', () => {
  store.setGameState('descending');
  expect(useGameStateStore.getState().gameState).toBe('descending');
});

it('reset returns state to initial values', () => {
  // Modify state
  store.setGameState('descending');

  // Reset
  store.reset();

  // Verify back to initial
  expect(useGameStateStore.getState().gameState).toBe('menu');
});
```

#### 4. Boundary Conditions
Validates edge cases and constraints:
```typescript
it('increaseHorror increases horror intensity with cap at 10', () => {
  store.increaseHorror(15);
  expect(worldState.horrorIntensity).toBe(10); // Capped
});

it('updateFearProfile clamps values between 0 and 1', () => {
  store.updateFearProfile('claustrophobia', 1.5);
  expect(profile.fearProfile.claustrophobia).toBe(1); // Clamped
});
```

#### 5. Mock vs Real Parity
Validates test mocks match real implementations:
```typescript
it('mock has same methods as real store', () => {
  const realStore = useGameStateStore.getState();
  const mockStore = createMockGameStateStore().getState();

  const realMethods = Object.keys(realStore)
    .filter(k => typeof realStore[k] === 'function');
  const mockMethods = Object.keys(mockStore)
    .filter(k => typeof mockStore[k] === 'function');

  expect(mockMethods).toEqual(realMethods);
});
```

## Running Contract Tests

### Run All Contract Tests
```bash
npm test tests/contracts/
```

### Run Specific Store Tests
```bash
# GameStateStore only
npm test tests/contracts/state-stores.contract.test.ts -- -t "GameStateStore"

# WorldStateStore only
npm test tests/contracts/state-stores.contract.test.ts -- -t "WorldStateStore"

# HistoryStore only
npm test tests/contracts/state-stores.contract.test.ts -- -t "HistoryStore"

# PlayerProfileStore only
npm test tests/contracts/state-stores.contract.test.ts -- -t "PlayerProfileStore"

# Mock parity only
npm test tests/contracts/state-stores.contract.test.ts -- -t "Parity"
```

### Watch Mode (for development)
```bash
npm test tests/contracts/ -- --watch
```

## Adding New Contract Tests

When creating contract tests for a new seam:

### 1. Identify the Contract
Find the interface definition in `src/core/types/seams.ts`:
```typescript
export interface MyNewInterface {
  // State
  someState: string;

  // Actions
  doSomething: (param: string) => void;
  reset: () => void;
}
```

### 2. Create Test File
Create `tests/contracts/[seam-name].contract.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import type { MyNewInterface } from '../../src/core/types/seams';
import { useMyNewStore } from '../../src/core/state';

describe('Contract Tests: MyNewInterface (Seam #X)', () => {
  beforeEach(() => {
    useMyNewStore.getState().reset();
  });

  describe('Interface Implementation', () => {
    it('implements all required state properties', () => {
      const store = useMyNewStore.getState();
      expect(store).toHaveProperty('someState');
    });

    it('implements all required action methods', () => {
      const store = useMyNewStore.getState();
      expect(typeof store.doSomething).toBe('function');
      expect(typeof store.reset).toBe('function');
    });
  });

  describe('State Shape Compliance', () => {
    it('has correct initial state types', () => {
      const store = useMyNewStore.getState();
      expect(typeof store.someState).toBe('string');
    });
  });

  describe('Action Behavior', () => {
    it('doSomething updates state correctly', () => {
      const store = useMyNewStore.getState();
      store.doSomething('test');
      expect(useMyNewStore.getState().someState).toBe('test');
    });

    it('reset returns state to initial values', () => {
      const store = useMyNewStore.getState();
      store.doSomething('changed');
      store.reset();
      expect(useMyNewStore.getState().someState).toBe('');
    });
  });
});
```

### 3. Test Checklist
For each interface, ensure you test:

- [ ] All state properties exist
- [ ] All action methods exist and are functions
- [ ] State types match contract
- [ ] Initial state values are correct
- [ ] No unexpected extra properties
- [ ] Each action produces correct state changes
- [ ] Boundary conditions (min/max values)
- [ ] reset() returns to initial state
- [ ] Mock implementation matches real (if applicable)

### 4. Update Documentation
Add your new contract test section to this README.

## When Contract Tests Fail

### Failure Scenarios

#### 1. Missing Property/Method
```
Error: expect(received).toHaveProperty('methodName')
```
**Cause**: Implementation doesn't include a required interface member
**Fix**: Add the missing property/method to the implementation

#### 2. Wrong Type
```
Error: expect(received).toBe('string') // received: number
```
**Cause**: Implementation uses wrong type
**Fix**: Update implementation to match contract type

#### 3. Extra Properties
```
Error: expect(received).toBeLessThanOrEqual(expected)
```
**Cause**: Implementation exposes internal details
**Fix**: Make internal properties private or remove from public interface

#### 4. Incorrect Behavior
```
Error: expect(received).toBe('initial') // received: 'modified'
```
**Cause**: Action doesn't produce expected state change
**Fix**: Fix the action implementation logic

#### 5. Mock Mismatch
```
Error: expect(received).toEqual(expected)
```
**Cause**: Mock doesn't match real implementation
**Fix**: Update mock to match real store interface

### Resolution Process

1. **Identify the Seam**: Which interface contract failed?
2. **Find the Contract**: Check `src/core/types/seams.ts`
3. **Find the Implementation**: Locate the real implementation
4. **Compare**: What's different between contract and implementation?
5. **Decide**:
   - If contract is correct: Fix implementation
   - If contract is wrong: Update contract AND documentation (rare)
6. **Update Mocks**: Ensure test mocks stay in sync
7. **Verify**: Run full test suite to ensure no regressions

## Contract Evolution

### When to Change a Contract

⚠️ **IMPORTANT**: Changing contracts is a breaking change that affects ALL implementations and dependents.

**Valid Reasons:**
- New required feature across entire system
- Bug in contract definition (typo, wrong type)
- Architectural refactoring

**Invalid Reasons:**
- Single implementation needs it (use extension instead)
- "Nice to have" feature
- Temporary debugging

### Contract Change Process

1. **Document the Change**: Update `SEAMS.md` with rationale
2. **Update Contract**: Modify interface in `seams.ts`
3. **Update All Implementations**: Fix all stores/services that implement it
4. **Update Contract Tests**: Modify contract tests to match new interface
5. **Update Mocks**: Ensure mocks match new contract
6. **Update Unit Tests**: Fix any broken unit tests
7. **Update Integration Tests**: Fix any broken integration tests
8. **Document Migration**: Add migration notes to CHANGELOG

## Coverage Goals

Contract tests should achieve:

- **100% Interface Coverage** - Every contract member tested
- **100% Seam Coverage** - Every seam has contract tests
- **100% Pass Rate** - All tests must pass (no skips)

Current Coverage:
- ✅ Seam #2: State Store Interface (100%)
- ✅ Seam #3: Engine Interface (100%)
- ✅ Seam #4: AI Service Interface (100%)
- ✅ Seam #5: Command Executor Interface (100%)
- ✅ Seam #6: Flow Orchestrator Interface (100%)
- ✅ Seam #7: Image Service Interface (100%)
- ✅ Seam #8: UI Component Interface (100%)
- ✅ Seam #9: Config Interface (100%)

## Best Practices

### DO ✅

- **Test the contract, not the implementation**
- **Keep tests simple and focused**
- **Use descriptive test names** (`it('increaseHorror increases horror intensity with cap at 10')`)
- **Reset state before each test** (`beforeEach(() => store.reset())`)
- **Test boundary conditions** (min/max values, empty arrays, undefined)
- **Validate mock parity** (mocks must match real implementations)

### DON'T ❌

- **Test complex business logic** (that's for unit tests)
- **Test implementation details** (only test public interface)
- **Skip tests** (all contract tests must pass)
- **Modify contracts without updating SEAMS.md**
- **Create partial mocks** (mocks must be complete)

## Related Documentation

- **Architecture**: `/docs/SEAMS.md` - Seam definitions and responsibilities
- **Testing Strategy**: `/tests/README.md` - Overall testing approach
- **Mock Stores**: `/tests/mocks/mockStores.ts` - Test doubles
- **Unit Tests**: `/tests/unit/` - Implementation-specific tests
- **Integration Tests**: `/tests/integration/` - Cross-seam tests

## Questions?

If you're unsure whether something needs a contract test:

**Ask yourself:**
1. Is this part of a defined seam interface?
2. Would changing this break other components?
3. Do multiple implementations exist (or could exist)?

If yes to any → **Needs a contract test**

**Examples:**
- ✅ Store actions/properties → Contract test
- ✅ Service methods → Contract test
- ✅ Engine interfaces → Contract test
- ❌ Internal helper functions → Unit test
- ❌ Complex calculation logic → Unit test
- ❌ UI component styling → Visual test

---

**Remember**: Contract tests are the guardrails of Seam-Driven Development. They ensure architectural integrity and enable confident refactoring.
