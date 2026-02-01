# 📝 Project Status & Roadmap (#TODO.md)

**Last Updated:** 2025-11-13
**Status:** ⚠️ CRITICAL - Build System Failure
**Deployment Readiness:** 10% (Code exists, but cannot be built or verified)

---

## 🚨 Critical Issues (Priority 0)

The project is currently in a **Split-Brain State**: documentation claims "91/91 tests passing" and "Production Ready", but the actual environment is broken.

1.  **Build System Failure** `[infrastructure]`
    - **Issue:** `package.json` uses `vite@^7.1.5` and `vitest@^3.2.4`, but the project codebase strictly requires `vite@^5.4.11` and `vitest@^2.1.8`.
    - **Impact:** `npm test` fails with `ERR_MODULE_NOT_FOUND`. App cannot start.
    - **Fix:** Downgrade dependencies to known stable versions.

2.  **Missing Infrastructure Scripts** `[dev-ops]`
    - **Issue:** `scripts/health-check.ts` is missing. This script is critical for the "Apophenia Autonomous Guardrails" (AAG) system.
    - **Impact:** No automated verification of seams or architecture.

3.  **Missing Services** `[code]`
    - **Issue:** `src/services/monitoring/NarrativeMonitor.ts` is missing.
    - **Impact:** No runtime monitoring of narrative consistency.

---

## 🛠️ Proposed System Design: Apophenia Autonomous Guardrails (AAG)

To address the reliability and accuracy issues, we will implement the **AAG System**. This system shifts validation from manual checks to automated, code-enforced guardrails.

### 1. The Health Check Orchestrator (`scripts/health-check.ts`)
A unified script that runs before every commit and deploy. It performs:
*   **Dependency Audit:** Verifies `vite` and `vitest` are on pinned, compatible versions.
*   **Type Safety Scan:** Runs `tsc --noEmit` to catch all type errors.
*   **Seam Verification:** statically analyzes `src/core/engines/*.ts` to ensure they implement `seams.ts` interfaces correctly.
*   **Test Suite:** Runs the full test suite.

### 2. Strict Seam Enforcement
*   **Principle:** "If it's not in `seams.ts`, it doesn't exist."
*   **Implementation:** A linter rule or script check that bans imports from `src/components` (legacy) in any `src/core` file.
*   **Goal:** Prevent "Split-Brain" where UI uses old stores and Engines use new state.

### 3. Resilience Layers
*   **Fallback Strategies:** `UnifiedAIService` must implement explicit retry logic with exponential backoff (currently implicitly handled or missing).
*   **Circuit Breakers:** If an engine fails (throws error), the `EngineRegistry` must catch it, disable the engine for that turn, and log the failure without crashing the game.

---

## 📋 Comprehensive TODO List

### Infrastructure & Setup
- [ ] **[CRITICAL] Downgrade Vite/Vitest** `[#TODO-INFRA-1]`
    - Action: Update `package.json` to `vite: ^5.4.11`, `vitest: ^2.1.8`.
    - Verification: `npm test` runs (even if tests fail).
- [ ] **Create Health Check Script** `[#TODO-INFRA-2]`
    - Action: Create `scripts/health-check.ts`.
    - Features: Check Node version, deps, run type check.

### Core Architecture (Seams)
- [ ] **Verify Engine Seams** `[#TODO-CORE-1]`
    - Action: Audit all files in `src/core/engines/` to ensure strict `seams.ts` compliance.
    - Note: `TemporalRevisionEngine` looks good, check others.

### Missing Implementation
- [ ] **Implement NarrativeMonitor** `[#TODO-FEAT-1]`
    - Action: Create `src/services/monitoring/NarrativeMonitor.ts`.
    - Purpose: Watch for narrative inconsistencies.
- [ ] **Complete PregenerateImageExecutor** `[#TODO-FEAT-2]`
    - Action: Connect `src/core/commands/pregenerateImage.ts` to `ImagePipeline` (Agent 7).

### Legacy Cleanup
- [ ] **Deprecate Legacy Components** `[#TODO-CLEAN-1]`
    - Action: Add `#TODO DEPRECATED` to all files in `src/components/`.
    - Action: Verify no `src/core` files import from `src/components`.

### Documentation
- [ ] **Update AGENTS.md** `[#TODO-DOC-1]`
    - Action: Reflect the actual state (infra broken) vs the idealized state.
