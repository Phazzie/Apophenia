# Apophenia Project Status & Roadmap

## 1. Executive Summary

The **Apophenia** project is in an advanced state of development, with a solid "Seams-based" architecture, 9 implemented horror engines, and a comprehensive documentation suite. However, there is a significant discrepancy between the documentation's claims (91/91 tests, 100% coverage) and the actual codebase (missing unit tests for 6/9 engines).

**Deployment Readiness:** 80%
**Code Quality:** High (Architecture), Medium (Verification)
**Critical Gap:** Missing validation tooling and test coverage.

## 2. Autonomous Quality Assurance & Evolution System (AQAES)

To achieve the "proactive / autonomous coding" vision, we need to implement the following system design. This system allows agents to safely refactor and evolve the game without human intervention.

### Component A: Seam Sentinel (`scripts/validate-seams.ts`)
**Purpose:** Enforce architectural boundaries statically.
**Functionality:**
- Parses AST to ensure no direct store mutations outside of Action creators.
- Verifies that Engines only communicate via `EngineOutput`.
- Checks that `node_modules` are not imported where prohibited.
- Validates that all files in `src/core/engines` implement their respective interfaces from `seams.ts`.
- **Status:** #TODO (Missing)

### Component B: Narrative Simulator (`scripts/narrative-simulator.ts`)
**Purpose:** "Headless" gameplay for regression testing and chaos engineering.
**Functionality:**
- Simulates a game session without a UI (Headless Browser or pure Node execution).
- Makes random or patterned choices (Fuzzing).
- Validates that no "undefined" states are reached.
- Verifies that `EngineRegistry` triggers engines correctly based on state.
- **Status:** #TODO (Missing)

### Component C: Documentation Sync Check
**Purpose:** Ensure documentation reflects reality.
**Functionality:**
- Scans `tests/README.md` and verifies listed test files exist.
- Updates coverage reports automatically.
- **Status:** #TODO (Manual for now)

## 3. Deployment Checklist & Missing Items

### Critical (Must Fix Before Deployment)

- [ ] **Implement Missing Unit Tests**
    - [ ] `tests/unit/engines/QuantumNarrativeEngine.test.ts` #TODO
    - [ ] `tests/unit/engines/MetaConsciousnessEngine.test.ts` #TODO
    - [ ] `tests/unit/engines/NeuralEchoChamberEngine.test.ts` #TODO
    - [ ] `tests/unit/engines/SemanticChoiceArchaeologyEngine.test.ts` #TODO
    - [ ] `tests/unit/engines/AdaptiveNarrativeDNAEngine.test.ts` #TODO
    - [ ] `tests/unit/engines/FifthWallEngine.test.ts` #TODO
- [ ] **Implement Seam Sentinel**
    - [ ] Create `scripts/validate-seams.ts` #TODO
- [ ] **Implement Narrative Simulator**
    - [ ] Create `scripts/narrative-simulator.ts` #TODO

### Improvements (For "Better System")

- [ ] **Enhance `UnifiedAIService`**
    - [ ] Implement Circuit Breaker pattern (prevent cascading failures if Grok is down). #TODO
    - [ ] Add explicit retries with exponential backoff. #TODO
- [ ] **Persist Quantum State**
    - [ ] `QuantumNarrativeEngine` currently uses in-memory Map. Needs serialization to `localStorage` or `WorldState`. #TODO
- [ ] **Browser Effect Safety**
    - [ ] `FifthWallEngine` needs strict CSP (Content Security Policy) verification to ensure it doesn't trigger browser warnings. #TODO

### Broken / Inconsistent

- [ ] `tests/README.md` claims tests exist that do not.
- [ ] `scripts/test-grok-api.sh` exists but might need updating for the new Unified Service.
- [ ] **Critical:** Test suite is currently unrunnable due to `Error: Cannot find module ... @testing-library/jest-dom`. Environment needs repair. #TODO

## 4. Immediate Action Plan

1.  **Skeletonize Missing Tests:** Create test files for all missing engines with `#TODO` blocks.
2.  **Build The Sentinel:** Implement the AST validator to protect the architecture.
3.  **Build The Simulator:** Create the harness for autonomous testing.

---
*This file is machine-generated and maintained by the Autonomous Coding System. Do not delete.*
