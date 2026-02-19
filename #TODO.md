# 🚨 APOPHENIA - CRITICAL FAILURE & ROADMAP (#TODO)

**Status**: 🔴 CRITICAL FAILURE (Infrastructure/Split-Brain)
**Last Updated**: 2025-11-12
**Created By**: Jules (AI Agent)

---

## 🛑 CRITICAL ISSUES (MUST FIX FIRST)

### 1. Infrastructure Failure (Version Mismatch)
The project build and test environment is currently broken due to critical version mismatches.
- **Problem**: `package.json` specifies `vite@^7.1.5` and `vitest@^3.2.4`, but the project strictly requires **Vite 5** and **Vitest 2**.
- **Impact**: `ERR_MODULE_NOT_FOUND` errors, failed builds, failed tests.
- **Fix Required**: Downgrade to `vite@^5.4.11` and `vitest@^2.1.8`.

### 2. Split-Brain State
The project is currently in a "Split-Brain" state where legacy code coexists with the new architecture, creating confusion and potential conflicts.
- **New System (Source of Truth)**: `src/core`, `src/ui`, `src/services` (Seams-based architecture).
- **Legacy System (Deprecated)**: `src/components`, `src/stores`.
- **Risk**: New code might accidentally import from legacy stores/components, violating architectural boundaries.
- **Fix Required**:
    - Strictly enforce boundaries (nothing in `src/core` can import from `src/components` or `src/stores`).
    - Migrate any remaining logic from legacy to new.
    - Delete `src/components` and `src/stores` once verified unused.

### 3. Missing Guardrails
The project lacks automated enforcement of architectural rules, leading to the Split-Brain issue.
- **Missing**: Automated checks for import violations.
- **Missing**: Unified health check script.

---

## 🛡️ APOPHENIA AUTONOMOUS GUARDRAILS (AAG) DESIGN

To prevent regression and enforce the Seams architecture, we will implement the **Apophenia Autonomous Guardrails (AAG)** system.

### System Overview
A unified set of scripts that autonomously verify the health, integrity, and architectural compliance of the codebase.

### Components

#### 1. `scripts/health-check.ts` (The Orchestrator)
**Purpose**: A single entry point (`npm run guardrails`) to verify the entire system.
**Responsibilities**:
- **Environment Check**: Verifies Node.js version, `package.json` vs `package-lock.json` sync.
- **Dependency Check**: Verifies critical package versions (Vite 5, Vitest 2).
- **Orchestration**: Runs `validate-seams.ts`, type checks, and tests in sequence.

#### 2. `scripts/validate-seams.ts` (The Enforcer)
**Purpose**: Statically analyze code to enforce architectural boundaries.
**Rules to Enforce**:
- **Core Isolation**: `src/core/*` CANNOT import from `src/ui`, `src/components`, `src/services`, `src/stores`.
- **Legacy Ban**: New files CANNOT import from `src/components` or `src/stores`.
- **State Integrity**: UI components must use `src/core/state` hooks, not direct store access.
- **Type Safety**: No usage of `any` type in `src/core`.

#### 3. Continuous Verification
- These scripts should be added to `pre-commit` hooks and CI pipelines.

---

## 📋 DETAILED TODO LIST

### Configuration & Infrastructure
- [ ] **Fix Vite/Vitest Versions**: Downgrade to `vite@^5.4.11` and `vitest@^2.1.8` in `package.json`.
- [ ] **Remove Jest**: Remove `jest` and related types from `devDependencies` to avoid confusion (project uses Vitest).
- [ ] **Annotate Configs**: Add `#TODO` warnings in `vite.config.mjs` and `vitest.config.ts` about version strictness.

### Core Architecture & Engines
- [ ] **FifthWallEngine CSP**: Add Content Security Policy (CSP) verification in `src/core/engines/FifthWallEngine.ts` to ensure safe browser manipulation.
- [ ] **QuantumNarrativeEngine Persistence**: Implement state persistence in `src/core/engines/QuantumNarrativeEngine.ts` (currently uses in-memory `Map`).
- [ ] **TemporalRevisionEngine Upgrade**: Replace regex-based replacement with LLM-based narrative rewriting in `src/core/engines/TemporalRevisionEngine.ts`.
- [ ] **PregenerateImageExecutor**: Implement `ImagePipeline` integration in `src/core/commands/pregenerateImage.ts`.
- [ ] **GenerateAmbianceExecutor**: Integrate `AudioManager` singleton in `src/core/commands/generateAmbiance.ts`.

### Services
- [ ] **UnifiedAIService Circuit Breaker**: Implement Circuit Breaker pattern with explicit retry logic in `src/services/ai/unifiedAIService.ts`.
- [ ] **NarrativeMonitor**: Implement LLM-based narrative consistency monitoring in `src/services/monitoring/NarrativeMonitor.ts` (currently missing/stub).

### Scripts & Automation
- [ ] **Create `scripts/health-check.ts`**: Implement the AAG orchestrator.
- [ ] **Create `scripts/validate-seams.ts`**: Implement the AAG enforcer.

### Cleanup
- [ ] **Deprecate Legacy**: Add `// @deprecated` annotations to all files in `src/components` and `src/stores`.
- [ ] **Delete Legacy**: Remove `src/components` and `src/stores` after full migration.
