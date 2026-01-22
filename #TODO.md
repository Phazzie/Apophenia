# 📝 Apophenia Project TODO

**Last Updated**: 2025-11-12
**Status**: ~90% Complete (Pre-Release)
**Test Status**: ~95% Passing (after recent fixes)

---

## 🚀 Deployment Readiness

### Critical Blockers
- [ ] **Supabase Authentication**: Currently configured but missing credentials.
    - *Action*: Decide whether to keep Supabase or fully fallback to local storage/mocking for v1.0.
    - *Reference*: `src/config/supabase.ts`
- [ ] **TypeScript Errors**: Previous audits reported 11 errors. While `tsc` currently passes, strict mode compliance should be enforced in CI.
    - *Action*: Enable strict mode in `tsconfig.json` and ensure CI pipeline fails on errors.
- [ ] **Environment Fragility**: `node_modules` and `vitest` dependencies are fragile.
    - *Action*: Dockerize the dev/test environment or lock dependencies more strictly.

### High Priority Fixes
- [ ] **Temporal Revision Engine Upgrade**: Currently uses simple regex replacement.
    - *Action*: Upgrade to LLM-based narrative rewriting for context-aware "false memories".
    - *Reference*: `src/core/engines/TemporalRevisionEngine.ts`
- [ ] **Circuit Breaker for AI Service**: Prevent cascading failures when AI APIs are down.
    - *Action*: Implement Circuit Breaker pattern in `UnifiedAIService`.
    - *Reference*: `src/services/ai/unifiedAIService.ts`
- [ ] **Unraveling Flow Effects**: Expand the browser manipulation effects.
    - *Action*: Add more safe but unsettling browser effects (e.g., favicon changes, subtle scroll hijacking).
    - *Reference*: `src/flows/UnravelingFlow.ts`

---

## 🛠️ Improvements & Polish

### User Experience
- [ ] **Mobile Optimization**: Ensure horror effects (glitches, corruption) work on mobile.
- [ ] **Audio Implementation**: Hook up `GenerateAmbianceExecutor` to Web Audio API.
    - *Current*: `src/services/audio/` is likely a placeholder or basic.
- [ ] **Loading States**: Add thematic loading screens for AI generation delays.

### Technical Debt
- [ ] **Zod Schemas**: Complete Zod validation for all external data (AI responses).
    - *Reference*: `src/core/types/seams.ts` (Phase 1 audit gap).
- [ ] **Old Code Cleanup**: Remove any remaining references to `src/services/ai/engines/` if they exist.

---

## 🤖 Autonomous Coding System Design

To enable proactive and autonomous maintenance, we are implementing a **Seam-Based Autonomous Verification System**.

### System Overview
The system consists of two primary autonomous agents (scripts) that run on a schedule or git hook:

1.  **Seam-Validator (`scripts/validate-seams.ts`)**
    *   **Purpose**: Enforce architectural boundaries defined in `seams.ts`.
    *   **Function**:
        *   Static analysis of imports (ensure layers don't leak).
        *   Verification of mocked interfaces against real implementations.
        *   Contract test execution.
    *   **Output**: A report of "Seam Violations" that blocks deployment.

2.  **Narrative-Simulator (`scripts/narrative-simulator.ts`)**
    *   **Purpose**: End-to-end black-box testing of the narrative engine.
    *   **Function**:
        *   Simulates a player making random or patterned choices.
        *   Runs the game loop for N turns.
        *   Validates that state transitions (Descent -> Unraveling) occur correctly.
        *   Checks for crash loops or invalid states.
    *   **Output**: A "Simulation Report" with gameplay metrics (avg session length, crash rate).

### Implementation Plan
- [ ] Create `scripts/validate-seams.ts` (Placeholder created).
- [ ] Create `scripts/narrative-simulator.ts` (Placeholder created).
- [ ] Integrate into CI/CD pipeline (`.github/workflows/autonomous-check.yml`).

---

## 📌 Inline TODO References

### `src/core/engines/TemporalRevisionEngine.ts`
- `#TODO: Upgrade to LLM-based rewriting` - Replace regex logic with `UnifiedAIService` call.

### `src/services/ai/unifiedAIService.ts`
- `#TODO: Implement Circuit Breaker` - Add state tracking for API failures to fail fast.

### `src/flows/UnravelingFlow.ts`
- `#TODO: Expand browser effects` - Add favicon glitching and scroll manipulation.
