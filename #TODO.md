# Apophenia Project Status & Roadmap (#TODO)

## 🚨 Current Deployment Status
**Documentation Claim:** "Production Ready (Level 3 SDD)" - Nov 12, 2025
**Actual Status:** **Development / Pre-Alpha**

While the architecture is sophisticated and the "Seams" system is in place, the project currently fails basic verification steps.

### 🔴 Critical Issues (Broken)
- **Test Suite Failure:** `npm test` fails immediately with `ERR_MODULE_NOT_FOUND` due to `vitest` / `vite` path resolution issues. The claimed "91/91 tests passing" is currently verifying nothing.
- **Legacy Code Debt:** The `src/stores` and `src/components` directories appear to be legacy artifacts from before the "Seams" refactor. They are still referenced by some files but `App.tsx` uses the new `src/core` and `src/ui` structure.
- **Dependencies:** `vite` and `vitest` versions may be conflicting or incorrectly installed in the environment.

## 📝 TODO List

### 🛠️ Infrastructure & Maintenance
- [ ] **Fix Testing Pipeline:** Resolve `ERR_MODULE_NOT_FOUND` in `vitest`. Ensure `npm test` runs and passes.
- [ ] **Legacy Cleanup:**
    - [ ] Audit `src/stores/` and migrate any remaining logic to `src/core/state/`.
    - [ ] Delete `src/stores/` directory.
    - [ ] Audit `src/components/` and migrate any remaining logic to `src/ui/`.
    - [ ] Delete `src/components/` directory.

### 🧠 AI Engine Improvements
- [ ] **Temporal Revision Engine:**
    - [ ] Upgrade from regex-based replacement to LLM-based narrative rewriting.
    - [ ] Context: Currently uses simple regex (e.g., swapping "red" with "blue"). An LLM should rewrite entire sentences to subtly alter meaning while maintaining flow.
- [ ] **Quantum Narrative Engine:**
    - [ ] Implement persistent state storage.
    - [ ] Context: Currently relies on in-memory state, meaning quantum branches are lost on page refresh.

### 🛡️ Reliability & Stability
- [ ] **Unified AI Service:**
    - [ ] Implement Circuit Breaker pattern.
    - [ ] Add explicit retry logic with exponential backoff for API calls.

### 🧪 Quality Assurance
- [ ] **Seam-Validation System:** Implement the proposed runtime validation system (see below).

---

## 🏗️ Proposed System: Seam-Validation System

To ensure the high accuracy and reliability required by the "Autonomous" nature of this project, we propose a three-pillar validation system.

### 1. Runtime Validator (The Guard)
**Location:** `src/services/monitoring/SeamValidator.ts`
**Purpose:** Enforce architectural contracts at runtime.

Instead of trusting that engines return valid output, we wrap the `EngineRegistry` in a validator.

```typescript
// Conceptual design
export class RuntimeSeamValidator {
  validateEngineOutput(output: any, schema: ZodSchema): ValidationResult {
    const result = schema.safeParse(output);
    if (!result.success) {
      console.error(`Seam Violation in ${output.engineName}:`, result.error);
      return { valid: false, sanitized: this.sanitize(output) }; // Degrade gracefully
    }
    return { valid: true, data: result.data };
  }
}
```

### 2. Chaos Monkey (The Stress Test)
**Location:** `scripts/chaos-monkey.ts`
**Purpose:** Verify system resilience by injecting failures.

A script/mode that can be enabled during E2E testing:
- **Network Latency:** artificial delays in `unifiedAIService`.
- **Service Failure:** Randomly returning 500s from Mock/Grok services.
- **State Corruption:** Randomly dropping keys from `localStorage`.

### 3. Narrative Consistency Monitor (The Editor)
**Location:** `src/services/monitoring/NarrativeMonitor.ts`
**Purpose:** Ensure the story remains coherent.

A background process (running potentially on a cheaper/faster model) that analyzes the last N segments:
- **Input:** Last 3 story segments.
- **Prompt:** "Does the latest segment contradict the established facts in the previous two? Answer YES/NO."
- **Action:** If YES, flag for "Reality Corruption" engine to interpret it as a glitch, turning a bug into a feature.
