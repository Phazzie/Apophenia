# Apophenia Project Roadmap & Issues

## 🚨 Critical Issues

- [ ] **FifthWall Engine Bug**: `FifthWallEngine` passes effects via `metadata` which is ignored by `DescentFlow`. This means browser manipulation effects currently do not fire.
    - *Status*: Fix implemented (added `browserEffects` to `EngineEffects`).
- [ ] **Test Environment Broken**: `vitest` execution fails with `ERR_MODULE_NOT_FOUND` for internal vite modules.
- [ ] **Script Execution Hang**: `npx tsx` hangs indefinitely when importing core modules, likely due to circular dependencies or environment configuration issues in `node_modules` (possibly `vite` 7.x / `vitest` 3.x version mismatch).
    - *Action*: `scripts/narrative-simulator.ts` created but cannot verify due to this hang.

## 🛠️ Engine Improvements

- [ ] **Temporal Revision Engine**: Currently uses regex replacement for history rewriting.
    - *Goal*: Upgrade to LLM-based narrative rewriting for context-aware changes.
    - *Ref*: `src/core/engines/TemporalRevisionEngine.ts`
- [ ] **Quantum Narrative Engine**: Uses in-memory `Map` for timelines.
    - *Goal*: Implement persistence (localStorage or backend) so timelines survive page reloads.
    - *Ref*: `src/core/engines/QuantumNarrativeEngine.ts`
- [ ] **Adaptive Horror Engine**: Fear analysis is heuristic-based.
    - *Goal*: Implement vector-based semantic analysis of player choices for deeper psychological profiling.

## 🚀 Future Features

- [ ] **Backend Persistence**: Replace localStorage with Supabase for cross-device progression (Neural Echo Chamber).
- [ ] **Audio Generation**: Implement WebAudio API integration for procedural soundscapes.
- [ ] **Accessibility**: Add screen reader support and high-contrast modes for corruption effects.

---

# 🤖 Autonomous Coding System Design

To enable proactive, reliable, and autonomous development by AI agents, we propose the **Seam-Validation System**.

### Core Philosophy
Trust but Verify. Agents should never assume their changes work; they must prove it using a dedicated validation layer that runs *outside* the standard test suite (which can be fragile).

### Components

#### 1. Seam Validator (`scripts/validate-seams.ts`)
A static analysis tool that parses the codebase to ensure architectural integrity.
*   **Responsibility**: Enforce that all Engines implement their Interfaces correctly.
*   **Checks**:
    *   Does `FifthWallEngine` return `EngineOutput` compatible with `DescentFlow`?
    *   Are all new files exported in `index.ts` barrels?
    *   Do `CommandExecutors` handle all `Command` types defined in `seams.ts`?

#### 2. Narrative Simulator (`scripts/narrative-simulator.ts`)
A headless runtime that plays the game.
*   **Responsibility**: Detect runtime crashes and logic errors without launching a browser.
*   **Mechanism**:
    *   Initializes `DescentFlow` and `UnifiedAIService` (in Mock mode).
    *   Simulates a player making random choices for N turns.
    *   Asserts that `GameState` transitions from `GENERATING` -> `DESCENDING` -> `UNRAVELING`.
    *   Asserts that `WorldState` updates (horror intensity increases).
*   **Usage**: Agents run this *before* committing any logic change.

#### 3. Agent Protocol (The "Self-Check")
Every autonomous agent must follow this protocol:
1.  **Read**: Analyze `AGENTS.md` and `seams.ts`.
2.  **Plan**: Design the change.
3.  **Implement**: Write the code.
4.  **Verify**: Run `npx tsx scripts/validate-seams.ts` (if available) and `npx tsx scripts/narrative-simulator.ts`.
5.  **Commit**: Only if verification passes.

### Implementation Plan
- [x] Create `scripts/narrative-simulator.ts` (Implemented but environment hangs)
- [ ] Create `scripts/validate-seams.ts` (Future)
- [ ] Add pre-commit hook to run these scripts.
