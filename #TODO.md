# Apophenia Project TODO & Improvement Plan

## 🚀 Deployment Readiness Status
**Current Status**: ⚠️ **Not Ready for Deployment**

Although `README.md` claims "Level 3 Certified - Production Ready", my investigation reveals significant issues preventing a stable deployment:
1.  **Test Failures**: 3 critical test failures in Image Services (Priority mismatch in `GrokImageService`).
2.  **TypeScript Errors**: 24 reported TypeScript errors in `REMAINING_ERRORS_TABLE.md` (mostly `updateWorldState` API mismatches and `GameState` enum confusion).
3.  **Dependency Issues**: The environment required manual fixes (`vite`, `whatwg-url`, `@testing-library/jest-dom`) to even run tests. The `package.json` engines field (`20.19.0 || 22.12.0`) is strict but the dependencies were not consistent with the lockfile state.
4.  **Build Instability**: `npm run build` failed initially due to dependency resolution issues.

## 🛠️ System for Improved Reliability & Accuracy

To make this setup work better and be more accurate, I propose the following **Reliability Engineering System**:

### 1. **Robust Dependency Locking**
*   **Problem**: Inconsistent `node_modules` caused build failures.
*   **Solution**: Enforce `npm ci` usage in CI/CD pipelines. Add a `.npmrc` to strictly manage peer dependencies. Ensure all build-time dependencies (like `vite` internal chunks) are properly resolved or explicitly added if they are phantom dependencies.

### 2. **Strict Contract Verification (Seam-Driven Development++)**
*   **Problem**: TypeScript errors show a drift between the "Seams" (interfaces) and the implementation (e.g., `updateWorldState` vs `updateWorld`).
*   **Solution**: Implement a "Contract Guardian" script that runs before `tsc`. It should parse `seams.ts` and verify that implementing classes match strictly *before* the full compile. This is already partially in place but needs to be stricter about API naming.

### 3. **Automated Fallback Verification**
*   **Problem**: AI services are flaky. Tests showed fallbacks to "Mock" service, but we need to ensure this happens gracefully in production without user impact.
*   **Solution**: Add "Chaos Testing" to the test suite. Deliberately fail the primary AI service in integration tests and assert that the UI renders the correct fallback content without error boundaries catching unrelated crashes.

### 4. **Unified State Management Standards**
*   **Problem**: Confusion between `GameState` enum and raw numbers.
*   **Solution**: Create a `types/strict.ts` that re-exports all enums and uses Opaque Types for IDs. This prevents accidental number-to-enum assignment. Enforce this via a custom ESLint rule.

### 5. **Observability & Logging**
*   **Problem**: When things go wrong (like the image generation priority mismatch), it's hard to trace why.
*   **Solution**: Integrate a structured logging library (like `winston` or a lightweight browser compatible one) that logs the *decision tree* of the AI engines. "Why did the engine choose this path?" should be answerable from logs.

---

## 📝 Detailed TODO List

### 🔴 Critical (Must Fix for Deployment)

#### 1. Fix Image Service Priority Mismatch
*   **Location**: `src/services/images/grokImageService.ts`
*   **Issue**: `GrokImageService` has priority `2` but tests expect `1`.
*   **Action**: Change priority to `1` or update tests if `2` is correct.
*   **Reference**: `tests/unit/images/imageServices.test.ts` failures.

#### 2. Fix `updateWorldState` API Mismatch
*   **Location**: Multiple files (see `REMAINING_ERRORS_TABLE.md`)
    *   `src/flows/DescentFlow.ts`
    *   `src/flows/UnravelingFlow.ts`
    *   `src/hooks/useGameEffects.ts`
    *   `src/services/flows/gameFlow.ts`
*   **Issue**: Code calls `updateWorldState` but the store likely exposes `updateWorld`.
*   **Action**: Rename calls to `updateWorld` to match the store API.

#### 3. Standardize `GameState` Enum Usage
*   **Location**: `src/flows/DescentFlow.ts`, `src/flows/UnravelingFlow.ts`, `src/flows/FlowCoordinator.ts`
*   **Issue**: Passing raw numbers (e.g., `1`, `3`) instead of `GameState.CONCEPT`, `GameState.UNRAVELING`.
*   **Action**: Replace all magic numbers with `GameState` enum members.

#### 4. Fix WorldState Type Safety
*   **Location**: `src/flows/FlowContextBuilder.ts`
*   **Issue**: `summary` field is potentially `undefined` but `string` is required.
*   **Action**: Add null coalescing (`?? ''`) to ensure a string is always passed.

#### 5. Restore or Clean Up Image Generation Module
*   **Location**: `src/services/ai/genkit.ts`, `src/services/ai/imageGeneration.ts`
*   **Issue**: Imports referencing `./imageGeneration/index` which seems to be missing.
*   **Action**: Either restore the missing directory or update imports to point to the correct location (likely `src/services/images/`).

### 🟡 Improvements (Better UX/DX)

#### 6. Improve Dependency Management
*   **Location**: `package.json`
*   **Action**: Add `whatwg-url` and `@testing-library/jest-dom` as explicit dependencies since they are required for the environment.

#### 7. Refactor `StateManager`
*   **Location**: `src/core/state/StateManager.ts`
*   **Issue**: Spread types error (`Spread types may only be created from object types`).
*   **Action**: Add type guards/checks before spreading generic state objects.

#### 8. Fix Test Environment Configuration
*   **Location**: `tests/unit/flows/`
*   **Issue**: Tests fail because `Zustand` persist middleware might not be mocked correctly.
*   **Action**: Create a `tests/setup.ts` that mocks `zustand/middleware` to handle persistence in a non-browser environment.

### 🟢 Feature Ideas (Future)

#### 9. Implement "Chaos" Mode in Dev Tools
*   **Description**: A UI toggle that randomly fails AI requests to test resilience.

#### 10. Add Sentry/Telemetry
*   **Description**: Catch runtime errors in production.
