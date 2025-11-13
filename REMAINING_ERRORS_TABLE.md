# REMAINING ERRORS - COMPLETE INVENTORY

**Generated**: 2025-11-13
**Status**: 🔴 **33 TOTAL ERRORS** (24 TypeScript + 9 Test Failures)

---

## 🚨 TYPESCRIPT ERRORS (24 Total)

### Category A: State Store API Mismatch (9 errors)
**Root Cause**: Flows using `updateWorldState()` but canonical API is `updateWorld()`

| # | File | Line | Error | Severity |
|---|------|------|-------|----------|
| 1 | `src/flows/DescentFlow.ts` | 47 | Property 'updateWorldState' does not exist. Did you mean 'updateWorld'? | HIGH |
| 2 | `src/flows/DescentFlow.ts` | 263 | Property 'updateWorldState' does not exist. Did you mean 'updateWorld'? | HIGH |
| 3 | `src/flows/DescentFlow.ts` | 272 | Property 'updateWorldState' does not exist. Did you mean 'updateWorld'? | HIGH |
| 4 | `src/flows/UnravelingFlow.ts` | 53 | Property 'updateWorldState' does not exist. Did you mean 'updateWorld'? | HIGH |
| 5 | `src/flows/UnravelingFlow.ts` | 356 | Property 'updateWorldState' does not exist. Did you mean 'updateWorld'? | HIGH |
| 6 | `src/flows/UnravelingFlow.ts` | 364 | Property 'updateWorldState' does not exist. Did you mean 'updateWorld'? | HIGH |
| 7 | `src/flows/UnravelingFlow.ts` | 374 | Property 'updateWorldState' does not exist. Did you mean 'updateWorld'? | HIGH |
| 8 | `src/hooks/useGameEffects.ts` | 7 | Property 'updateWorldState' does not exist | HIGH |
| 9 | `src/services/flows/gameFlow.ts` | 21 | Property 'updateWorldState' does not exist. Did you mean 'updateWorld'? | HIGH |

**Fix**: Global find-replace `updateWorldState` → `updateWorld` across all files

---

### Category B: GameState Enum Mismatch (4 errors)
**Root Cause**: Mixing GameState enum with numeric values

| # | File | Line | Error | Severity |
|---|------|------|-------|----------|
| 10 | `src/flows/DescentFlow.ts` | 54 | Argument of type '1' is not assignable to parameter of type 'GameState' | HIGH |
| 11 | `src/flows/UnravelingFlow.ts` | 66 | Argument of type '3' is not assignable to parameter of type 'GameState' | HIGH |
| 12 | `src/flows/FlowCoordinator.ts` | 75 | Argument of type 'number' is not assignable to parameter of type 'GameState' | HIGH |
| 13 | `src/hooks/useGameLoop.ts` | 30 | Argument of type 'GameState.PLAYING' is not assignable to parameter of type 'GameState' | HIGH |

**Fix**: Use `GameState.CONCEPT` instead of `1`, `GameState.UNRAVELING` instead of `3`, etc.

---

### Category C: GameState Type Confusion (2 errors)
**Root Cause**: Passing GameState enum where number expected

| # | File | Line | Error | Severity |
|---|------|------|-------|----------|
| 14 | `src/flows/FlowCoordinator.ts` | 47 | Argument of type 'GameState' is not assignable to parameter of type 'number' | HIGH |
| 15 | (same as above) | - | Type mismatch in flow state management | HIGH |

**Fix**: Determine correct type - should stores use enum or number?

---

### Category D: WorldState Type Mismatch (2 errors)
**Root Cause**: `summary` field is `string | undefined` but expected `string`

| # | File | Line | Error | Severity |
|---|------|------|-------|----------|
| 16 | `src/flows/FlowContextBuilder.ts` | 28 | Type 'string \| undefined' is not assignable to type 'string' | MEDIUM |
| 17 | `src/flows/FlowContextBuilder.ts` | 44 | Type 'string \| undefined' is not assignable to type 'string' | MEDIUM |

**Fix**: Add null coalescing `summary: worldState.summary ?? ''`

---

### Category E: StateManager Spread Type Errors (2 errors)
**Root Cause**: Spreading potentially undefined values

| # | File | Line | Error | Severity |
|---|------|------|-------|----------|
| 18 | `src/core/state/StateManager.ts` | 95 | Spread types may only be created from object types | MEDIUM |
| 19 | `src/core/state/StateManager.ts` | 96 | Spread types may only be created from object types | MEDIUM |

**Fix**: Add null checks before spreading

---

### Category F: Missing Image Generation Module (5 errors)
**Root Cause**: Agent 7 deleted `imageGeneration/` directory but imports still exist

| # | File | Line | Error | Severity |
|---|------|------|-------|----------|
| 20 | `src/services/ai/genkit.ts` | 25 | Cannot find module './imageGeneration/index' | HIGH |
| 21 | `src/services/ai/imageGeneration.ts` | 1 | Cannot find module './imageGeneration/index' | HIGH |
| 22 | `src/services/ai/secureGenkit.ts` | 3 | Cannot find module './imageGeneration/index' | HIGH |
| 23 | `src/services/ai/imageGeneration.ts` | 34 | Parameter 'variation' implicitly has an 'any' type | LOW |
| 24 | `src/services/ai/imageGeneration.ts` | 55 | Parameter 'result' implicitly has an 'any' type | LOW |
| 25 | `src/services/ai/imageGeneration.ts` | 63 | Parameter 'fallbackError' implicitly has an 'any' type | LOW |

**Fix**: Remove imports OR restore imageGeneration module

---

## 🧪 TEST FAILURES (9 Total)

### Category G: Flow State Tests (9 tests)
**Root Cause**: Zustand persist middleware not working in test environment

| # | Test File | Test Name | Error | Severity |
|---|-----------|-----------|-------|----------|
| 26 | `tests/unit/flows/DescentFlow.test.ts` | initialize | Genre config not initialized | MEDIUM |
| 27 | `tests/unit/flows/DescentFlow.test.ts` | calculateDescentLevel | Returns 0 instead of expected value | MEDIUM |
| 28 | `tests/unit/flows/DescentFlow.test.ts` | shouldBeginUnraveling | Threshold check fails | MEDIUM |
| 29 | `tests/unit/flows/DescentFlow.test.ts` | processChoice | Unraveling transition fails | MEDIUM |
| 30 | `tests/unit/flows/FlowContextBuilder.test.ts` | buildFlowContext | Recent history segments missing | MEDIUM |
| 31 | `tests/unit/flows/FlowContextBuilder.test.ts` | mapWorldState | Corruption level not mapped | MEDIUM |
| 32 | `tests/unit/flows/FlowCoordinator.test.ts` | getCurrentFlow (unraveling) | Expected 'Unraveling' got 'Descent' | MEDIUM |
| 33 | `tests/unit/flows/FlowCoordinator.test.ts` | transitionTo | Expected GameState.PLAYING(3) got 0 | MEDIUM |
| 34 | `tests/contracts/flows.contract.test.ts` | WorldStateStore Parity | Mock vs real store methods mismatch | LOW |

**Fix**: Mock Zustand persist middleware OR use in-memory stores for tests

---

## 📊 ERROR SUMMARY BY PRIORITY

| Priority | TypeScript | Tests | Total | % |
|----------|-----------|-------|-------|---|
| **HIGH** | 15 | 0 | 15 | 45% |
| **MEDIUM** | 6 | 8 | 14 | 42% |
| **LOW** | 3 | 1 | 4 | 12% |
| **TOTAL** | **24** | **9** | **33** | **100%** |

---

## 📊 ERROR SUMMARY BY CATEGORY

| Category | Errors | Est. Fix Time | Agent |
|----------|--------|---------------|-------|
| **A: updateWorldState API** | 9 | 30 min | Agent 9 |
| **B: GameState Enum** | 4 | 1 hour | Agent 10 |
| **C: GameState Type** | 2 | 1 hour | Agent 10 |
| **D: WorldState Type** | 2 | 15 min | Agent 11 |
| **E: StateManager Spread** | 2 | 30 min | Agent 11 |
| **F: Image Generation** | 5 | 1 hour | Agent 12 |
| **G: Flow State Tests** | 9 | 2 hours | Agent 13 |
| **TOTAL** | **33** | **~6 hours** | **5 agents** |

---

## 🎯 PARALLEL FIX STRATEGY

### Agent 9: API Rename (30 min)
- Fix 9 errors (Category A)
- Global find-replace: `updateWorldState` → `updateWorld`
- Files: 5 flow/hook/service files

### Agent 10: GameState Type Fixes (2 hours)
- Fix 6 errors (Categories B + C)
- Standardize GameState enum usage
- Fix type mismatches in flow coordinators

### Agent 11: Type Safety Fixes (45 min)
- Fix 4 errors (Categories D + E)
- Add null coalescing for optional fields
- Fix spread type errors in StateManager

### Agent 12: Image Generation Cleanup (1 hour)
- Fix 5 errors (Category F)
- Remove dead imports OR restore module
- Type safety for 'any' parameters

### Agent 13: Test Fixes (2 hours)
- Fix 9 test failures (Category G)
- Mock Zustand persist middleware
- Fix state initialization in tests

---

## 🚀 EXECUTION PLAN

**Total Time**: ~6 hours with parallelization
**Success Criteria**:
- ✅ 0 TypeScript errors (down from 24)
- ✅ 890/890 tests passing (up from 868)
- ✅ Build passes
- ✅ 100% test pass rate

**Launch Command**: Execute all 5 agents in parallel NOW!
