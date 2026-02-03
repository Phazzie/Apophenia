# 🔴 PROJECT STATUS: ENVIRONMENT RECOVERED (Verification Pending)

**Last Updated:** 2025-11-12
**Status:** PARTIAL RECOVERY

## ✅ Issues Resolved

### 1. Dependency Version Mismatch (FIXED)
*   **Action:** Downgraded `vite` to `^5.4.11` and `vitest` to `^2.1.8`.
*   **Result:** `npm list vite` confirms correct versions.

### 2. Build Errors (FIXED)
*   **Action:** Moved `@supabase/supabase-js` to `dependencies`. Created `tsconfig.build.json` to exclude test files.
*   **Result:** `npx tsc --noEmit --project tsconfig.build.json` passes with 0 errors. **Production build is now possible.**

### 3. Nuclear Reset (COMPLETED)
*   **Action:** Deleted `node_modules` and `package-lock.json`, performed clean `npm install`.
*   **Result:** Dependency tree is clean (except for test runner issues).

### 4. Code Annotations (COMPLETED)
*   **Action:** Added `#TODO DEPRECATED` to legacy `src/stores` and `src/components`.
*   **Action:** Added `#TODO` to `src/App.tsx` for Auth and Environment checks.

## ⚠️ Outstanding Issues

### 1. Test Environment Failure (CRITICAL)
*   **Issue:** `npx vitest run` fails with `MODULE_NOT_FOUND` for `whatwg-url` and `@testing-library/jest-dom` internals.
*   **Impact:** Cannot run unit tests.
*   **Suspected Cause:** Incompatibility between `jsdom` environment and current node_modules layout or `vitest` configuration.
*   **Next Step:** Investigate `jsdom` version or try `happy-dom`.

### 2. "Split-Brain" Architecture (MITIGATED)
*   **Issue:** Legacy `src/stores` vs new `src/core/state`.
*   **Status:** Legacy files annotated.
*   **Next Step:** Migrate all components to use `src/core/state` and delete `src/stores`.

### 3. Auth Bypass
*   **Issue:** `src/App.tsx` bypasses strict auth checks.
*   **Status:** Annotated with `#TODO SECURITY`.

## 🏗️ System Design: Seam Verification

To prevent future regression and enforce the architecture:

### Proposed Architecture Validation
Create a script `scripts/verify-seams.ts` that enforces:
1.  **UI Layer (`src/ui`)** can ONLY import from:
    *   `src/core/types`
    *   `src/core/state` (via hooks)
    *   `src/core/commands`
2.  **Engines (`src/core/engines`)** must be Pure TypeScript.
3.  **No "Split-Brain":**
    *   Ban imports from `src/stores` in new files.
    *   Ban imports from `src/components` in new files.

## 📋 Comprehensive TODO List

### Infrastructure
- [x] Downgrade `vite` and `vitest`.
- [x] Move `@supabase/supabase-js` to `dependencies`.
- [x] Create `tsconfig.build.json`.
- [x] Verify `npm run build` succeeds (TSC passes).
- [ ] **Fix Test Environment:** Resolve `whatwg-url` / `jsdom` errors.

### Refactoring (Split-Brain)
- [x] **DEPRECATE** `src/stores/*.ts`.
- [x] **DEPRECATE** `src/components/*.tsx`.
- [ ] Verify `src/App.tsx` uses ONLY `src/core/state`.
- [ ] Implement Seam Verification Script.

### Features / Logic
- [ ] **Auth:** Re-enable or properly mock Auth in `App.tsx`.
- [ ] **Engines:** Verify all engines implemented in `src/core/engines` are actually wired up in `FlowCoordinator`.
