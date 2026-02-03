# Apophenia Project Status & TODOs

**Status**: Development / Recovery
**Last Updated**: 2025-11-12

## 🚀 Deployment Readiness Assessment

**Current Status**: **Mixed**
- **Documentation**: ⭐⭐⭐⭐⭐ (Excellent, claims Level 3 SDD)
- **Architecture**: ⭐⭐⭐⭐ (Strong Seam-Driven Development)
- **Codebase**: ⭐⭐⭐ (Solid core, but split-brain UI state)
- **Test Environment**: ⭐ (Broken, `vitest` fails to load)
- **Reliability**: ⭐⭐ (Stubs in place, missing implementation)

**Summary**: While the documentation claims "Production Ready," the actual codebase requires significant recovery work on the test environment and UI migration before it can be reliably deployed and maintained. The "Split-Brain" state issue (Legacy Stores vs Core State) is a major technical debt item.

---

## 📋 Action Items

### 🔴 Critical (Broken / Blocking)

#### 1. Fix Test Environment [BROKEN]
- **Issue**: `npx vitest` fails with `ERR_MODULE_NOT_FOUND`.
- **Cause**: Potential version mismatch between `vite` (^7.1.5) and `vitest` (^3.2.4), or node module corruption. `jest` and `ts-jest` are also present in `package.json`, causing potential conflict.
- **Task**:
    - [ ] Clean up `package.json` dependencies (decide between Vitest and Jest, preferably Vitest).
    - [ ] Ensure `vite` and `vitest` versions are compatible.
    - [ ] Verify `src/setupTests.ts` works with the chosen runner.
    - [ ] `npx vitest run` must pass.

#### 2. Resolve "Split-Brain" State [HIGH RISK]
- **Issue**: UI components (`src/components/`) use legacy `src/stores/`. Engines (`src/core/engines/`) use `src/core/state/`.
- **Consequence**: Game logic updates in engines are NOT reflected in the UI.
- **Task**:
    - [ ] Migrate `src/ui/screens/*.tsx` to use `src/core/state/*.ts`.
    - [ ] Delete `src/stores/` once migration is complete.
    - [ ] Ensure `src/components/` is fully deprecated in favor of `src/ui/`.

### 🟡 Improvements (Missing Features / Stubs)

#### 3. Implement Image Pre-generation
- **File**: `src/core/commands/pregenerateImage.ts`
- **Status**: Stub.
- **Task**:
    - [ ] Integrate with `ImagePipeline` (Agent 7).
    - [ ] Implement actual caching logic (currently in-memory map stub).

#### 4. Implement Audio/Ambiance
- **File**: `src/core/commands/generateAmbiance.ts`
- **Status**: Stub.
- **Task**:
    - [ ] Integrate with Web Audio API or external Audio Service.
    - [ ] Implement `stopAmbiance` and crossfading logic.

#### 5. Circuit Breaker for AI Service
- **File**: `src/services/ai/unifiedAIService.ts`
- **Status**: Simple retry logic exists.
- **Task**:
    - [ ] Implement true Circuit Breaker (state tracking: OPEN/HALF-OPEN/CLOSED).
    - [ ] Add explicit retry policies (exponential backoff).

#### 6. Fifth Wall CSP Verification
- **Task**: Verify Content Security Policy to ensure `FifthWallEngine` cannot perform unsafe browser manipulations while still allowing intended effects.

---

## 🛠️ Continuous Verification System Design

To improve reliability and prevent regression, we will implement a **Continuous Verification** pipeline.

### Principles
1.  **Trust but Verify**: Never assume documentation matches code.
2.  **Seams as Contracts**: Boundaries must be enforced by code, not just convention.
3.  **Fail Fast**: Tests and checks should fail immediately if a contract is violated.

### Components

#### 1. `scripts/health-check.ts` (Unified Verification)
A single script that runs all checks in order:
1.  **Type Check**: `tsc --noEmit`
2.  **Seam Validation**: `ts-node scripts/validate-seams.ts` (see below)
3.  **Unit Tests**: `vitest run`
4.  **Contract Tests**: `vitest run --project contracts`

#### 2. `scripts/validate-seams.ts` (Static Analysis)
A custom tool to enforce architecture:
- **Rule 1**: Files in `src/ui` CANNOT import from `src/core/engines` directly (must use Commands/State).
- **Rule 2**: Files in `src/core` CANNOT import from `src/ui` or `react`.
- **Rule 3**: No imports from `src/stores` or `src/components` (Legacy Ban).
- **Implementation**: Uses `ts-morph` or simple regex to scan imports and fail build on violation.

#### 3. Pre-Commit Hook
- Run `scripts/health-check.ts` before every commit.
- Block commit if "Environment Recovered" status is not met.

---

## 📝 Notes & Context

- **Environment**: Node 20.19.0+
- **Architecture**: Seam-Driven Development (SDD)
- **Legacy Artifacts**: `src/stores`, `src/components` (Scheduled for deletion).
