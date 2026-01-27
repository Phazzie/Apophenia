# Apophenia Project Status & TODOs

**Current Status:** Pre-Alpha (Development)
**Last Audit:** November 2025

## 🚨 Critical Action Items

- [ ] **Fix Seam Violations:** Run `npm run validate:seams` and fix the reported issues. Currently, `DescentScreen` and `UnravelingScreen` import from legacy `src/components`.
- [ ] **Remove Legacy Code:** Once seam violations are fixed, delete `src/components` and `src/stores`.
- [ ] **E2E Testing:** Implement Playwright tests to verify the full game loop.

## 🛠 Missing Integrations

### 1. Audio Generation (Web Audio API)
- **Status:** Stubbed in `src/core/commands/generateAmbiance.ts`.
- **Requirement:** Implement a Web Audio API synthesizer/manager to generate ambient horror soundscapes.
- **Reference:** See `#TODO` in `src/core/commands/generateAmbiance.ts`.

### 2. Image Pipeline Integration
- **Status:** Logic exists in `src/services/images` but not fully wired to commands.
- **Requirement:** Connect `src/core/commands/pregenerateImage.ts` to the `ImagePipeline` service.
- **Reference:** See `#TODO` in `src/core/commands/pregenerateImage.ts`.

### 3. State Persistence
- **Status:** In-memory only.
- **Requirement:** Implement `localStorage` or Supabase persistence for `QuantumNarrativeEngine` timelines and `PlayerProfileStore`.

## 🛡️ Apophenia Integrity System

This project uses a "Seam-Based" architecture to ensure reliability.

### 1. Validation Script
Run `npm run validate:seams` to check for architectural violations.
- **Pass:** No imports from legacy directories (`src/components`, `src/stores`).
- **Fail:** Direct dependencies on legacy code found.

### 2. Autonomous Development Workflow
When using AI agents to develop:
1.  **Read `AGENTS.md`:** Understand the agent types and waves.
2.  **Check `#TODO.md`:** Pick a task.
3.  **Create a Branch:** `agent/[type]-[id]`.
4.  **Implement & Verify:** Run `npm test` and `npm run validate:seams`.
5.  **Submit:** Only submit if verification passes.

## 📋 Legacy Code (To Be Deprecated)

The following directories are **DEPRECATED** and should not be used in new code:
- `src/components/` (Use `src/ui/` instead)
- `src/stores/` (Use `src/core/state/` instead)

Files in these directories have been marked with `#TODO DEPRECATED` headers.

## 🧪 Testing

- **Unit Tests:** `npm test` (Uses Vitest)
- **Validation:** `npm run validate:seams`
