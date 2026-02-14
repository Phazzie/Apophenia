# 📋 Project Status & Recovery Plan

**Last Updated:** 2026-02-04
**Status:** ⚠️ Recovery Mode
**Deployment Readiness:** 20% (Code exists but architecture is split)

## 🚨 Critical Issues: "Split-Brain" Architecture

The application currently suffers from a fundamental state management conflict known as the "Split-Brain" issue.

1.  **Type Mismatch:**
    *   `src/types.ts` defines `GameState` as a numeric `enum`.
    *   `src/core/types/seams.ts` defines `GameState` as a string `enum`.
    *   Legacy stores (`src/stores/*.ts`) use the numeric enum.
    *   The UI (`App.tsx`) and Engines (`src/core/engines/*.ts`) expect the string enum.
    *   Result: `App.tsx` crashes or misbehaves when reading state from legacy stores via `src/core/state` bridge.

2.  **Auth Bypass:**
    *   Authentication is largely bypassed/mocked (`src/services/supabaseClient.ts`), but `App.tsx` logic for checking session state is inconsistent or missing.

3.  **Missing Implementations:**
    *   Several engines and commands are stubs or require persistence logic (`QuantumNarrativeEngine`).

---

## 🛡️ Reliability System Design

To solve the "Split-Brain" issue and ensure a reliable deployment, we will implement the following system:

### 1. Single Source of Truth (SSOT)
*   **Canon:** `src/core/types/seams.ts` is the **only** valid source for core types (`GameState`, `WorldState`, etc.).
*   **Deprecation:** `src/types.ts` must be deprecated. All imports must be migrated to `seams.ts`.

### 2. State Unification
*   **Migration:** Rewrite `src/stores/gameStateStore.ts` (and others) to strictly use `seams.ts` types.
*   **Persistence:** Ensure Zustand stores persist correctly using the string-based enums.

### 3. Automated Guardrails
*   **Validation Script (`scripts/validate-seams.ts`):** A script to statically analyze imports. It will fail the build if any "New" code (`src/core`, `src/ui`) imports from "Legacy" code (`src/components`, `src/stores`) without going through the sanctioned `src/core/state` bridge.
*   **Health Check (`scripts/health-check.ts`):** A unified script to run type checks, linting, and seam validation before deployment.

### 4. Runtime Verification
*   **Zod Schemas:** Update Zod schemas to align 1:1 with `seams.ts` interfaces. Use these schemas to validate:
    *   AI Engine outputs.
    *   State transitions (in `StateManager`).
    *   External inputs (if any).

---

## 📝 TODO List

### High Priority (System Recovery)
- [ ] **Fix GameState Enum:** Update `src/stores/gameStateStore.ts` to use `GameState` from `src/core/types/seams.ts`. (#TODO_STATE_CONFLICT)
- [ ] **Deprecate Legacy Types:** Mark `src/types.ts` as deprecated and plan migration to `seams.ts`. (#TODO_DEPRECATION)
- [ ] **Fix App.tsx:** Align `App.tsx` state consumption with the fixed store types. (#TODO_APP_STATE)
- [ ] **Auth Configuration:** Formalize the optional auth logic in `App.tsx` using `VITE_ENABLE_AUTH`. (#TODO_AUTH)

### Engine Implementation
- [ ] **Quantum Narrative Persistence:** Implement `save/load` logic for `QuantumNarrativeEngine` (currently in-memory only). (#TODO_QUANTUM_PERSISTENCE)
- [ ] **Temporal Revision Upgrade:** Replace regex-based `TemporalRevisionEngine` with proper LLM-based rewriting. (#TODO_TEMPORAL_LLM)
- [ ] **Image Generation:** Implement `PregenerateImageExecutor` to use `ImagePipeline` (Agent 7). (#TODO_IMAGE_GEN)
- [ ] **Audio Generation:** Implement `GenerateAmbianceExecutor` to use Web Audio API / Service. (#TODO_AUDIO_GEN)

### Infrastructure & Tooling
- [ ] **Seam Validator:** Implement `scripts/validate-seams.ts`. (#TODO_TOOLING)
- [ ] **Health Check:** Implement `scripts/health-check.ts`. (#TODO_TOOLING)

### Deployment
- [ ] **Environment Check:** Ensure `vite.config.mjs` and `vitest.config.ts` align with Node/Vite versions.
- [ ] **Production Build:** Verify `npm run build` passes with strict type checking (once types are fixed).

---

## 🔍 How to Work on This Repo
1.  **Check this file first.**
2.  **Pick a task.**
3.  **Verify the Seams.** Do not import from `src/stores` directly in new code; use `src/core/state`.
4.  **Run `npm run build`** (or `scripts/health-check.ts` once ready) to verify no regressions.
