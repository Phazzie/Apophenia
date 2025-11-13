# Parallel Agent Execution Plan

**Date**: 2025-11-13
**Total Agents**: 7 fix agents + 1 review agent = 8 agents
**Execution Mode**: Parallel (all agents work simultaneously)
**Estimated Total Time**: 4-8 hours (with parallel execution)

---

## 🎯 Strategy

We'll divide the 50 issues across 7 specialized fix agents, each handling a logical domain. Agent 8 will perform final code review validation after all fixes are complete.

### Agent Assignment Philosophy

1. **Domain Expertise**: Each agent focuses on one architectural area
2. **Minimal Overlap**: Issues assigned to avoid file conflicts
3. **Load Balancing**: ~7-10 issues per agent, balanced by effort
4. **Dependency Order**: Quick wins first, complex issues after

---

## 👥 AGENT ASSIGNMENTS

### Agent 1: Quick Wins & TypeScript (5 issues, ~1.5 hours)
**Role**: Fix all sub-1-hour critical issues
**Priority**: CRITICAL - Run first

#### Issues Assigned
- [x] **C-TS-01**: Fix TypeScript compilation errors (5 min)
  - File: `src/ui/screens/StartScreen.tsx:32,34`
  - Action: Remove GEMINI_PRO and GEMINI_FLASH references

- [x] **C-UI-01**: Integrate ErrorBoundary (5 min)
  - File: `src/index.tsx`
  - Action: Wrap `<App />` with `<GameErrorBoundary>`

- [x] **C-UI-02**: Fix array index anti-pattern (15 min)
  - File: `src/App.tsx:69`
  - Action: Replace `segments[segments.length - 1]` with segmentId lookup

- [x] **C-CMD-02**: Fix CommandSchema mismatch (15 min)
  - File: `src/services/ai/responseParser.ts:25-36`
  - Action: Add pregenerateImage and generateAmbiance to schema

- [x] **C-FLO-01**: Remove type escape (30 min)
  - File: `src/flows/FlowCoordinator.ts:165`
  - Action: Fix type properly without `as unknown as`

**Success Criteria**:
- All TypeScript errors resolved
- Build passes
- 5 critical issues → complete

---

### Agent 2: Core Engines (8 issues, ~8 hours)
**Role**: Fix all engine-related critical and high priority issues
**Priority**: CRITICAL

#### Issues Assigned

##### Critical (3)
- [x] **C-ENG-01**: Fix mutable state in SemanticChoiceArchaeologyEngine (2h)
  - File: `src/core/engines/SemanticChoiceArchaeologyEngine.ts:16,26`
  - Action: Remove `choiceHistory` instance variable, reconstruct from context

- [x] **C-ENG-02**: Fix mutable state in AdaptiveNarrativeDNAEngine (2h)
  - File: `src/core/engines/AdaptiveNarrativeDNAEngine.ts:16,33`
  - Action: Move genome to WorldState, make engine pure functional

- [x] **C-ENG-03**: Fix error handling in QuantumNarrativeEngine (30m)
  - File: `src/core/engines/QuantumNarrativeEngine.ts:142`
  - Action: Return null on error in mergeTimelines()

##### High Priority (5)
- [x] **H-ENG-01**: Add localStorage quota handling (1h)
  - File: `src/core/engines/NeuralEchoChamberEngine.ts`
  - Action: Catch QuotaExceededError, implement fallback

- [x] **H-ENG-02**: Fix regex patterns (1h)
  - File: `src/core/engines/TemporalRevisionEngine.ts`
  - Action: Make regex more specific (avoid "his" matching "whisper")

- [x] **H-ENG-03**: Add input validation (2h)
  - Files: Multiple engines
  - Action: Add null checks on context properties in process()

- [x] **H-ENG-04**: Add user consent for browser manipulation (1h)
  - File: `src/core/engines/FifthWallEngine.ts`
  - Action: Request permission before browser manipulation

- [x] **H-ENG-05**: Fix error swallowing in EngineRegistry (30m)
  - File: `src/core/engines/EngineRegistry.ts`
  - Action: Propagate errors to caller with context

**Success Criteria**:
- All engines stateless
- All engines have proper error handling
- All engines have input validation
- All tests passing for engines

---

### Agent 3: State Store Consolidation (9 issues, ~10-16 hours)
**Role**: Consolidate duplicate stores, migrate to canonical location
**Priority**: CRITICAL

#### Issues Assigned

##### Critical (2)
- [x] **C-STO-01**: Consolidate duplicate store implementations (4-8h)
  - Files: `/src/stores/*` → `/src/core/state/*`
  - Actions:
    1. Audit all imports (find which stores are actually used)
    2. Migrate all imports to `/src/core/state/`
    3. Test after migration
    4. Delete `/src/stores/` directory

- [x] **C-STO-02**: Create localStorage migration utility (2h)
  - Action: Create migration script for `cosmic-narrative-*` → `apophenia-*`
  - Add to app initialization

##### High Priority (4)
- [x] **H-STO-01**: Create imageCacheStore in canonical location (2h)
  - File: `/src/core/state/imageCacheStore.ts` (new)
  - Action: Port from old location, add to StateManager

- [x] **H-STO-02**: Create aiModelStore in canonical location (1h)
  - File: `/src/core/state/aiModelStore.ts` (new)
  - Action: Port or deprecate if unused

- [x] **H-STO-03**: Create userStore in canonical location (2h)
  - File: `/src/core/state/userStore.ts` (new)
  - Action: Port with proper seams interface

- [x] **H-STO-04**: Fix userStore module-level side effects (1h)
  - File: `src/stores/userStore.ts:43-56`
  - Action: Move auth initialization to explicit function

##### Medium Priority (3)
- [x] **M-STO-01**: Add null checks in historyStore (1h)
  - File: `src/core/state/historyStore.ts:38-59`
  - Action: Validate segment exists before update

- [x] **M-STO-02**: Fix race condition in imageCacheStore (1h)
  - File: `src/stores/imageCacheStore.ts:152-212`
  - Action: Consolidate to single set() call

- [x] **M-STO-03**: Fix StateManager deep merge (30m)
  - File: `src/core/state/StateManager.ts:77-97`
  - Action: Add crossSessionData deep merge

**Success Criteria**:
- Single source of truth for all stores
- All imports use `/src/core/state/`
- localStorage migration utility in place
- All store tests passing

---

### Agent 4: Command System (7 issues, ~6.5 hours)
**Role**: Complete command system, fix validation issues
**Priority**: CRITICAL

#### Issues Assigned

##### Critical (2)
- [x] **C-CMD-01**: Create missing command executors (2h)
  - Files:
    - `/src/core/commands/pregenerateImage.ts` (new)
    - `/src/core/commands/generateAmbiance.ts` (new)
  - Actions:
    1. Create executor files following existing patterns
    2. Register in CommandQueue
    3. Add to index.ts exports
    4. Write unit tests

##### High Priority (2)
- [x] **H-CMD-01**: Fix type escape in test (30m)
  - File: `tests/unit/commands/CommandQueue.test.ts:73-74`
  - Action: Remove `as any`, use proper type casting

- [x] **H-CMD-02**: Add segment existence checks (1h)
  - Files: `src/core/commands/displayText.ts`, `generateImage.ts`
  - Action: Add segment validation in validate() methods

##### Medium Priority (3)
- [x] **M-CMD-01**: Add exhaustive type checking (1h)
  - Files: Multiple executors with switch statements
  - Action: Add `const _exhaustive: never = x` pattern

- [x] **M-CMD-02**: Add JSDoc documentation (2h)
  - Files: All executors
  - Action: Add JSDoc to all public methods

- [x] **M-CMD-03**: Improve validation thoroughness (1h)
  - Files: `browserEffect.ts`, `displayText.ts`
  - Actions:
    1. Add URL validation for openTab
    2. Add content length limits

**Success Criteria**:
- All 12 command types have executors
- CommandSchema matches Command type union exactly
- All tests passing
- No type escapes

---

### Agent 5: Flow Orchestration (9 issues, ~10-16 hours)
**Role**: Fix flows, implement missing ConceptFlow
**Priority**: CRITICAL

#### Issues Assigned

##### Critical (1)
- [x] **C-FLO-02**: Implement or resolve ConceptFlow (4-8h)
  - File: `/src/flows/ConceptFlow.ts` (missing)
  - Options:
    - Option A: Implement ConceptFlow (8h)
    - Option B: Remove from docs, mark as future work (1h)
  - Decision: Recommend Option B for this sprint

##### High Priority (4)
- [x] **H-FLO-01**: Implement or remove updateUIDistortion (2h)
  - Files: `src/flows/DescentFlow.ts`, `UnravelingFlow.ts`
  - Action: Either implement feature or remove empty methods

- [x] **H-FLO-02**: Standardize engine activation logic (1h)
  - Files: DescentFlow vs UnravelingFlow
  - Action: Make activation logic consistent

- [x] **H-FLO-03**: Fix double amplification bug (30m)
  - File: `src/flows/UnravelingFlow.ts`
  - Action: Change 2.25x to 1.5x

- [x] **H-FLO-04**: Improve error propagation (1h)
  - Files: Multiple flows
  - Action: Don't swallow errors in processChoice

##### Medium Priority (3)
- [x] **M-FLO-01**: Centralize EngineRegistry (2h)
  - Files: All 3 flows
  - Action: Use singleton EngineRegistry instead of creating instances

- [x] **M-FLO-02**: Extract magic numbers to constants (1h)
  - Action: Create constants file for magic numbers

- [x] **M-FLO-03**: Replace console.log with logger (1h)
  - Action: Use proper logging service

##### Low Priority (1)
- [x] **L-UI-01**: Add code splitting (2h)
  - Action: Implement lazy loading for flow components

**Success Criteria**:
- ConceptFlow resolved (implemented or documented as future)
- All flows use centralized EngineRegistry
- Consistent patterns across flows
- All flow tests passing

---

### Agent 6: AI Services (5 issues, ~9 hours)
**Role**: Add retry logic, caching, rate limiting
**Priority**: HIGH

#### Issues Assigned

##### High Priority (3)
- [x] **H-AI-01**: Add retry logic with exponential backoff (2h)
  - File: `src/services/ai/grokService.ts:60-127`
  - Actions:
    1. Retry on 429, 500, 502, 503, 504
    2. Exponential backoff (2s, 4s, 8s, 16s)
    3. Max 4 retries

- [x] **H-AI-02**: Add request timeouts (1h)
  - File: `src/services/ai/grokService.ts:82-98`
  - Action: Use AbortController with timeout (follow backendAPIService pattern)

- [x] **H-AI-03**: Apply input sanitization consistently (1h)
  - File: `src/services/ai/promptBuilder.ts:74-81`
  - Action: Use sanitization utilities from promptHelpers

##### Medium Priority (2)
- [x] **M-AI-01**: Implement response caching (2h)
  - Files: All AI services
  - Actions:
    1. Create cache service (5-minute TTL)
    2. Hash prompts for cache keys
    3. Integrate with all AI services

- [x] **M-AI-02**: Expand fallback chain (3h)
  - File: `src/services/ai/unifiedAIService.ts`
  - Actions:
    1. Re-enable Gemini OR add Claude/GPT-4
    2. Update fallback chain: Grok → Provider2 → Provider3
    3. Add tests for fallback behavior

**Success Criteria**:
- Retry logic on all AI services
- Response caching reduces redundant calls
- Rate limiting prevents quota exhaustion
- Production-ready fallback chain

---

### Agent 7: Test Fixes & Medium Priority (16 issues, ~15 hours)
**Role**: Fix test failures, address remaining medium/low priority issues
**Priority**: HIGH

#### Issues Assigned

##### Test Fixes
- [x] **FIX-TEST-01**: Fix 25 component test failures (2-4h)
  - Files: `tests/unit/ui/components/*.test.tsx`
  - Actions:
    1. Run each test individually
    2. Update CSS class assertions
    3. Fix prop interfaces
    4. Add missing context wrappers

- [x] **FIX-TEST-02**: Expand engine test coverage (2-3h)
  - Actions:
    1. Add tests for fear analysis algorithm
    2. Add edge case tests (all fears 0, all equal)
    3. Add personalized horror generation tests

##### Medium Priority Remaining (3)
- [x] **M-ENG-01**: Add rate limiting on AI calls (2h)
  - Action: Implement client-side throttling

- [x] **M-ENG-02**: Extract magic numbers to constants (1h)
  - Files: Multiple engines
  - Action: Create constants file

- [x] **M-ENG-03**: Add JSDoc for public methods (2h)
  - Files: All engines
  - Action: Document all public methods

##### Low Priority Selection (4)
- [x] **L-CMD-01**: Add execution order warning (30m)
  - File: `src/core/commands/CommandQueue.ts:135-152`
  - Action: Add console.warn for executeAll()

- [x] **L-STO-01**: Standardize reset implementation (30m)
  - Action: Document reset strategy

- [x] **L-STO-02**: Add JSDoc to store methods (2h)
  - Action: Document all public store methods

- [x] **L-STO-04**: Add periodic cache cleanup (1h)
  - File: `src/stores/imageCacheStore.ts:116-143`
  - Action: Implement setInterval cleanup

**Success Criteria**:
- 915/915 tests passing (100%)
- All medium priority issues resolved
- Selected low priority issues complete

---

### Agent 8: Code Review & Validation (Final Stage)
**Role**: Validate all fixes, ensure quality standards
**Priority**: FINAL GATE

#### Responsibilities

##### 1. Build Validation (15 min)
```bash
npm run build
npx tsc --noEmit
npm test
```

##### 2. Type Safety Audit (30 min)
- [ ] Verify 0 TypeScript errors
- [ ] Verify 0 `as any` type escapes
- [ ] Verify 0 `@ts-ignore` directives
- [ ] Run: `grep -r "as any" src/`

##### 3. SDD Level 3 Compliance (30 min)
- [ ] All interfaces in seams.ts ✓
- [ ] Mocks validated against contracts ✓
- [ ] Zero TypeScript errors ✓
- [ ] Zero type escapes ✓
- [ ] Deep validation present ✓
- [ ] Runtime validation at boundaries ✓

##### 4. Test Coverage Validation (30 min)
- [ ] All contract tests passing (417/417)
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Target: 915/915 tests (100%)

##### 5. Anti-Pattern Audit (30 min)
- [ ] No direct state mutation
- [ ] No array index access (use segmentId)
- [ ] No imports from old engine location
- [ ] No module-level side effects

##### 6. Code Quality Spot Checks (1 hour)
- [ ] Review 3-5 files from each agent's work
- [ ] Check error handling is complete
- [ ] Verify JSDoc is present
- [ ] Ensure consistent patterns

##### 7. Integration Testing (30 min)
- [ ] Run dev server: `npm run dev`
- [ ] Perform manual smoke tests:
  - [ ] Game starts without errors
  - [ ] Can make choices
  - [ ] Engines execute
  - [ ] State persists
  - [ ] Error boundary catches errors

##### 8. Generate Validation Report (30 min)
Create final report with:
- Issues fixed count
- Test pass rate
- Build status
- Compliance status
- Remaining issues (if any)
- Recommendations

**Success Criteria**:
- Build passes ✓
- 915/915 tests passing ✓
- 0 TypeScript errors ✓
- 0 type escapes ✓
- SDD Level 3 certified ✓
- All anti-patterns eliminated ✓
- Manual smoke tests pass ✓

---

## 📊 EXECUTION TIMELINE

### Phase 1: Quick Wins (Agent 1) - Run First
**Duration**: ~1.5 hours
**Blocking**: No
**Parallel**: Can run alone initially

### Phase 2: Parallel Execution (Agents 2-7)
**Duration**: 10-16 hours (actual time, not parallel time)
**Parallel Time**: 4-8 hours (assuming agents work simultaneously)
**Blocking**: Agents 2-7 work in parallel

**Agent Work Assignments**:
- Agent 2: Engines (8 issues, 8h)
- Agent 3: State Stores (9 issues, 10-16h) ← Longest
- Agent 4: Commands (7 issues, 6.5h)
- Agent 5: Flows (9 issues, 10-16h) ← Longest
- Agent 6: AI Services (5 issues, 9h)
- Agent 7: Tests & Medium (16 issues, 15h) ← Longest

**Bottleneck**: Agent 3 (State Stores) and Agent 5 (Flows) are longest
**Parallel Duration**: ~16 hours / 2 agents working together = ~8 hours actual time

### Phase 3: Code Review (Agent 8) - Run After All Complete
**Duration**: ~4 hours
**Blocking**: Yes (must wait for all agents to finish)

### Total Timeline
- **Sequential**: 65-71 hours (8-9 days)
- **Parallel**: 13-17 hours (1.5-2 days)
- **Speedup**: ~5x faster with parallelization

---

## 🎯 SUCCESS METRICS

### Critical Success Factors
1. ✅ All 11 critical issues resolved
2. ✅ Build passes (0 TypeScript errors)
3. ✅ 915/915 tests passing (100%)
4. ✅ SDD Level 3 certified
5. ✅ No anti-pattern violations

### Quality Gates
- **Gate 1**: Agent 1 must succeed before parallel execution
- **Gate 2**: All agents 2-7 must complete before Agent 8
- **Gate 3**: Agent 8 validation must pass before merge

### Risk Mitigation
- Each agent commits work independently to feature branch
- Code review agent can identify issues and request rework
- Incremental commits allow rollback if needed

---

## 🚀 EXECUTION COMMAND

When ready to execute:

```bash
# Phase 1: Quick Wins (Agent 1)
launch agent1 --issues="C-TS-01,C-UI-01,C-UI-02,C-CMD-02,C-FLO-01"

# Wait for Agent 1 completion, then Phase 2: Parallel Execution
launch agent2 --issues="C-ENG-01,C-ENG-02,C-ENG-03,H-ENG-01...H-ENG-05" & \
launch agent3 --issues="C-STO-01,C-STO-02,H-STO-01...M-STO-03" & \
launch agent4 --issues="C-CMD-01,H-CMD-01,H-CMD-02,M-CMD-01...M-CMD-03" & \
launch agent5 --issues="C-FLO-02,H-FLO-01...L-UI-01" & \
launch agent6 --issues="H-AI-01,H-AI-02,H-AI-03,M-AI-01,M-AI-02" & \
launch agent7 --issues="FIX-TEST-01,FIX-TEST-02,M-ENG-01...L-STO-04" &

wait  # Wait for all parallel agents to complete

# Phase 3: Code Review & Validation
launch agent8 --validate-all
```

---

## 📝 NOTES

- Each agent should commit work incrementally
- Use descriptive commit messages referencing issue IDs
- Agent 8 has authority to request rework from any agent
- If any agent fails, pause execution and resolve before continuing
- Keep issue tracker (`ISSUE_TRACKING_MASTER_LIST.md`) updated as issues are resolved

---

**Ready to execute when approved.**
