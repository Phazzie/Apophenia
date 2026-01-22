# Autonomous Coding System Design

## Overview
Apophenia utilizes a "Seam-Based Autonomous Verification System" to ensure architectural integrity and narrative stability without constant human oversight. This system is composed of specialized scripts that act as autonomous agents.

## 1. Seam-Validator (`scripts/validate-seams.ts`)

**Role**: The Architect
**Responsibility**: Enforce the `seams.ts` contracts and architectural layering.

### Capabilities:
1.  **Static Analysis**:
    *   Parses `src/` files to check imports.
    *   Ensures `core/engines` never imports from `ui/`.
    *   Ensures `services/` don't depend on specific `ui/` components.
2.  **Contract Verification**:
    *   Runs `tests/contracts/*.contract.test.ts`.
    *   Compares Typescript interfaces in `seams.ts` with exported class members.
3.  **Drift Detection**:
    *   Alerts if a new public method is added to a class but not its interface.

### Execution:
*   Run on pre-commit and CI.
*   Command: `npx tsx scripts/validate-seams.ts`

## 2. Narrative-Simulator (`scripts/narrative-simulator.ts`)

**Role**: The Playtester
**Responsibility**: Stress-test the game logic and flow transitions.

### Capabilities:
1.  **Monte Carlo Simulation**:
    *   Instantiates the full game stack (Stores, Flows, Engines).
    *   Mocks the AI Service (using `MockAIService`).
    *   Simulates a player clicking choices randomly or with specific personalities (e.g., "Risk Taker").
2.  **State Monitoring**:
    *   Tracks `WorldState` and `GameState` over time.
    *   Ensures `Descent -> Unraveling -> Collapsed` transition happens within N turns.
    *   Detects "soft locks" (no choices available) or "crash loops".
3.  **Performance Profiling**:
    *   Measures time-to-render for each turn.
    *   Tracks memory usage during long sessions (memory leak detection).

### Execution:
*   Run nightly or on demand.
*   Command: `npx tsx scripts/narrative-simulator.ts --sessions 100`

## Integration
These scripts are intended to be run by the `Deployment AI Agents` or CI/CD pipelines to certify a build before human review.
