# 📝 Project Status & TODOs

**Last Updated:** 2025-11-12
**Status:** 🔴 CRITICAL FAILURE (Recovery Required)

## 🚨 Current State Analysis

The project is currently in a **broken state**, contradicting the "Production Ready" claims in `README.md` and `AGENTS.md`.

*   **Deployment**: ❌ Fails to build and test.
*   **Dependencies**: ❌ `node_modules` and `package-lock.json` are corrupted or inconsistent. `vitest` and `vite` have installation issues.
*   **Authentication**: ❌ Supabase configuration is blocking application startup (`userStore.ts` and `supabaseClient.ts`).
*   **Tests**: ❌ 91/91 tests are claimed to pass, but the test runner (`vitest`) cannot even be found/executed.
*   **Features**: ⚠️ 9 AI Engines exist in code (`src/core/engines/`) but are unverified in the current broken environment.

## 🛠️ Critical Recovery Plan (Priority 1)

**Reference**: `RECOVERY_PLAN_DETAILED.md` (Nuclear Reset Approach)

1.  **Dependency Reset** (See `package.json` section below)
    *   [ ] Move `@supabase/supabase-js` from `devDependencies` to `dependencies`.
    *   [ ] Delete `node_modules` and `package-lock.json`.
    *   [ ] Run `npm install` (clean install).

2.  **Authentication Fix** (See `src/services/supabaseClient.ts` and `src/App.tsx`)
    *   [ ] Make authentication OPTIONAL. The game should run without Supabase credentials.
    *   [ ] Implement a mock Supabase client in `src/services/supabaseClient.ts` that activates when keys are missing.
    *   [ ] Update `src/App.tsx` to bypass the login screen if auth is disabled/missing.

3.  **Build & Type Safety** (See `src/core/state/userStore.ts` and `tsconfig.json`)
    *   [ ] Fix implicit `any` errors in `userStore.ts`.
    *   [ ] Update `tsconfig.json` to exclude test files from the build process (or use `tsconfig.build.json`).
    *   [ ] Fix `vitest.config.ts` module resolution errors.

## 🧪 Validation Tasks (Priority 2)

Once the environment is stable:

1.  **Engine Verification**
    *   [ ] Verify `TemporalRevisionEngine` logic (check for "false memory" logs).
    *   [ ] Verify `RealityCorruptionEngine` (check for visual distortion props).
    *   [ ] Verify `AdaptiveHorrorEngine` (check for localStorage profile updates).
    *   [ ] Run `src/core/engines/EngineRegistry.ts` integration tests.

2.  **Game Loop Verification**
    *   [ ] Ensure `App.tsx` transitions from `MENU` to `GENERATING` to `DESCENDING`.
    *   [ ] Verify "Mock AI" provider works for gameplay without API keys.

## 🤖 Apophenia Autonomous Dev System (AADS)

To prevent future regression and "hallucinated" success states:

### Core Principles
1.  **Trust but Verify**: No agent shall mark a task as "Complete" without a successful test log generated *in the current session*.
2.  **State Grounding**: Agents must read `CURRENT_STATE.md` (machine-generated) before acting, not just `README.md` (human-marketing).

### Components

#### 1. `HealthCheck` Script
A script (`scripts/health-check.ts`) that runs:
*   `npm run type-check` (tsc --noEmit)
*   `npm test` (vitest)
*   `npm run build` (dry run)
*   Outputs a JSON report: `{ "status": "green" | "red", "failing": [...] }`

#### 2. `StateGuard`
A pre-commit hook or CI step that:
*   Runs `HealthCheck`.
*   Updates `CURRENT_STATE.md` with the *actual* failing tests and build status.
*   Rejects commits that claim "Fixed" but fail the check.

#### 3. Agent Protocol
*   **Step 1**: Read `#TODO.md` and `CURRENT_STATE.md`.
*   **Step 2**: Implement change.
*   **Step 3**: Run `npm test`.
*   **Step 4**: If fail, rollback or document failure. NEVER commit broken code claiming success.

## 📂 File-Specific TODOs

### `package.json`
*   **Action**: Move `@supabase/supabase-js` to `dependencies`.
*   **Action**: Ensure `vite` and `vitest` versions are compatible (v5.x/v2.x recommended vs v7.x).

### `tsconfig.json`
*   **Action**: Add `"skipLibCheck": true` if missing.
*   **Action**: Exclude `**/*.test.ts` from default build context if causing errors.

### `vitest.config.ts`
*   **Action**: Fix module resolution for `vite` imports.
*   **Action**: Ensure test environment matches production build settings.
