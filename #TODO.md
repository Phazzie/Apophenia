# 🔴 Apophenia Project Status: CRITICAL FAILURE

**Date:** 2025-11-12
**Status:** CRITICAL FAILURE (Split-Brain State, Broken Build)

## 🚨 Critical Issues (Immediate Attention Required)

### 1. Build Environment Failure
- **Issue:** `npm test` and `npm run build` fail with `ERR_MODULE_NOT_FOUND` in `vite` and `vitest`.
- **Cause:** Corrupted `node_modules` or incompatible package versions (Node v22.22.0 vs strict 20/22 requirement).
- **Action:**
  - [ ] Wipe `node_modules` and `package-lock.json`.
  - [ ] Reinstall dependencies.
  - [ ] Verify `npm test` and `npm run build` pass.

### 2. "Split-Brain" State Architecture
- **Issue:** The project has two conflicting state management systems.
  - **Legacy:** `src/stores/*.ts` (Used by UI `src/components`)
  - **Core (Target):** `src/core/state/*.ts` (Used by Engines)
- **Impact:** The UI does not reflect the Core Engine state. The game is effectively broken logically.
- **Action:**
  - [ ] **Phase 1:** Migrate `src/components` to use `src/core/state`.
  - [ ] **Phase 2:** Move `src/components` to `src/ui` (or merge/refactor).
  - [ ] **Phase 3:** Delete `src/stores` entirely.

### 3. Missing Components
- **Issue:** Several files referenced in documentation or concept are missing.
  - `src/services/monitoring/SeamValidator.ts` (Stub needed)
  - `scripts/validate-seams.ts` (Script needed)
- **Action:** Create stubs and implement logic.

---

## 🤖 Apophenia Autonomous Development System (AADS)

To enable reliable autonomous coding, the following system is designed:

### 1. The Source of Truth: `#TODO.md`
This file serves as the master coordination log. It must be:
- **Machine-Readable:** strictly structured.
- **Updated First:** Before code is touched, the task is claimed here.
- **Updated Last:** After verification, the task is marked `[x]`.

### 2. Seam Validator (`scripts/validate-seams.ts`)
A script to enforce the architectural boundaries (SDD).
- **Rules:**
  - `src/ui` MUST NOT import from `src/stores` (Legacy).
  - `src/core` MUST NOT import from `src/ui`.
  - `src/core/engines` MUST NOT contain React hooks.
- **Usage:** Run before every commit.

### 3. Health Check (`scripts/health-check.sh`)
A unified command to verify system integrity.
- **Steps:**
  1. `npm run typecheck` (detects broken types)
  2. `npm run lint` (detects bad patterns)
  3. `npm test -- --run` (verifies logic)
  4. `ts-node scripts/validate-seams.ts` (verifies architecture)
- **Output:** A single "PASS/FAIL" score.

### 4. Agent Protocol (Update to `AGENTS.md`)
- **Rule:** If `Health Check` fails, the ONLY allowed task is "Fix Health Check".
- **Rule:** If "Split-Brain" is detected (Legacy stores usage), the ONLY allowed feature work is "Migration".

---

## 📋 Comprehensive Task List

### Infrastructure
- [ ] **FIX-ENV:** Repair `node_modules` and get `npm test` passing.
- [ ] **FIX-BUILD:** Repair `vite.config.mjs` and module resolution.
- [ ] **SETUP:** Create `scripts/validate-seams.ts`.

### Architecture (The Great Migration)
- [ ] **DEPRECATE:** Add `#TODO DEPRECATED` to `src/stores/*.ts` (DONE via Agent).
- [ ] **DEPRECATE:** Add `#TODO DEPRECATED` to `src/components/*.ts` (DONE via Agent).
- [ ] **MIGRATE:** Update `src/components/GameScreen.tsx` to use `src/core/state`.
- [ ] **MIGRATE:** Update `src/components/StartScreen.tsx` to use `src/core/state`.
- [ ] **CLEANUP:** Delete `src/stores/` once empty.

### Features (Blocked by Migration)
- [ ] **FEAT:** Implement `SeamValidator` logic.
- [ ] **FEAT:** Connect `FifthWallEngine` to `GameScreen` (via new state).

### Documentation
- [ ] **DOCS:** Update `AGENTS.md` to reflect the current broken state (remove "Level 3 SDD" claims until true).
