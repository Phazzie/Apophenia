# Product Requirements Document & Roadmap
# Path to 100% Seam-Driven Development Compliance

**Project**: Apophenia - Cosmic Horror Narrative Engine
**Current Status**: Level 2 SDD Compliance (BETTER)
**Target Status**: Level 3 SDD Compliance (BEST)
**Estimated Timeline**: 5-7 days with parallel agent deployment
**Strategy**: Maximum parallelism - deploy 10+ agents simultaneously

---

## 🎯 Success Criteria

### Definition of Done (100% SDD Compliance)
- ✅ 0 TypeScript errors (`npx tsc --noEmit` passes)
- ✅ 0 `as any` type escapes in src/
- ✅ 100% contract test coverage for all 9 seams
- ✅ All mocks explicitly `implements` their interface
- ✅ All mocks validated with automated tests
- ✅ Real services pass same contract tests as mocks
- ✅ DATA-BOUNDARIES.md created and complete
- ✅ CONTRACT-BLUEPRINT.md created
- ✅ Zod schemas for all external data
- ✅ CI/CD enforces contract compliance
- ✅ Integration works on first try ("The Switch")

---

## 📋 Phase 1: Critical Validation (Days 1-3)
**Parallel Agents**: 10 agents
**Goal**: Achieve contract validation and eliminate blockers

### Agent Group A: Critical Fixes (2 agents in parallel)

#### **Agent FIX-TS: TypeScript Error Eliminator**
- **Priority**: CRITICAL
- **Time Estimate**: 6-8 hours
- **Dependencies**: None
- **Checklist**:
  - [ ] Run `npx tsc --noEmit > typescript-errors-full.log`
  - [ ] Categorize 40 errors by type:
    - [ ] Type mismatches in flows/ (estimated 12 errors)
    - [ ] Type mismatches in engines/ (estimated 10 errors)
    - [ ] Type mismatches in test files (estimated 8 errors)
    - [ ] Missing types in commands/ (estimated 6 errors)
    - [ ] Other (estimated 4 errors)
  - [ ] Fix all flow type errors
  - [ ] Fix all engine type errors
  - [ ] Fix all command type errors
  - [ ] Fix all test file errors
  - [ ] Verify `npx tsc --noEmit` returns 0 errors
  - [ ] Create `TYPESCRIPT_FIXES.md` documenting changes
- **Deliverable**: 0 TypeScript errors
- **Success Metric**: `npx tsc --noEmit` exits with code 0

#### **Agent FIX-TYPES: Type Escape Eliminator**
- **Priority**: CRITICAL
- **Time Estimate**: 4-6 hours
- **Dependencies**: None
- **Checklist**:
  - [ ] Run `grep -rn "as any" src/ > type-escapes.log`
  - [ ] Document all 35 violations with file:line
  - [ ] Categorize by fix type:
    - [ ] Can use proper type assertion (estimated 15 cases)
    - [ ] Need type guard function (estimated 8 cases)
    - [ ] Need generic type parameter (estimated 7 cases)
    - [ ] Need interface extension (estimated 5 cases)
  - [ ] Fix all type assertions
  - [ ] Create type guard functions where needed
  - [ ] Add generic type parameters where needed
  - [ ] Extend interfaces where needed
  - [ ] Verify `grep -rn "as any" src/` returns 0 results
  - [ ] Create `TYPE_ESCAPE_FIXES.md` documenting changes
- **Deliverable**: 0 `as any` violations
- **Success Metric**: `grep -rn "as any" src/` returns empty

---

### Agent Group B: Contract Tests (6 agents in parallel - one per seam group)

#### **Agent TEST-SEAM-1: State Store Contract Tests**
- **Priority**: CRITICAL
- **Time Estimate**: 3-4 hours
- **Seams Covered**: #2 (State Store Interface)
- **Dependencies**: None
- **Checklist**:
  - [ ] Create `tests/contracts/state-stores.contract.test.ts`
  - [ ] Test GameStateStore interface compliance:
    - [ ] Mock implements GameStateStore interface
    - [ ] All required methods exist
    - [ ] State shape matches interface exactly
    - [ ] Actions produce correct state changes
    - [ ] No extra fields in state
  - [ ] Test WorldStateStore interface compliance
  - [ ] Test HistoryStore interface compliance
  - [ ] Test PlayerProfileStore interface compliance
  - [ ] Test StateManager interface compliance
  - [ ] Verify mock stores match real stores (shape comparison)
  - [ ] All tests pass with 100% coverage
- **Deliverable**: State contract tests with 100% coverage
- **Success Metric**: All contract tests pass

#### **Agent TEST-SEAM-2: Engine Contract Tests**
- **Priority**: CRITICAL
- **Time Estimate**: 4-5 hours
- **Seams Covered**: #3 (Engine Interface)
- **Dependencies**: None
- **Checklist**:
  - [ ] Create `tests/contracts/engines.contract.test.ts`
  - [ ] Test base Engine interface compliance:
    - [ ] All engines implement Engine interface
    - [ ] Required properties exist (name, description, priority)
    - [ ] isActive() returns boolean
    - [ ] process() returns Promise<EngineOutput>
    - [ ] generateInstructions() returns string[]
  - [ ] Test EngineOutput shape compliance:
    - [ ] engineName is string
    - [ ] instructions is string[]
    - [ ] effects matches EngineEffects interface
    - [ ] metadata is Record<string, unknown>
    - [ ] No extra fields
  - [ ] Test EngineContext input validation
  - [ ] Test all 9 engines individually
  - [ ] Verify EngineRegistry compliance
- **Deliverable**: Engine contract tests with 100% coverage
- **Success Metric**: All 9 engines pass contract tests

#### **Agent TEST-SEAM-3: AI Service Contract Tests**
- **Priority**: CRITICAL
- **Time Estimate**: 3-4 hours
- **Seams Covered**: #4 (AI Service Interface)
- **Dependencies**: None
- **Checklist**:
  - [ ] Create `tests/contracts/ai-services.contract.test.ts`
  - [ ] Test AIService interface compliance:
    - [ ] Mock AI implements AIService
    - [ ] Grok service implements AIService
    - [ ] Required properties exist
    - [ ] isAvailable() returns Promise<boolean>
    - [ ] generateResponse() returns Promise<AIResponse>
    - [ ] estimateTokens() returns number
  - [ ] Test AIResponse shape compliance:
    - [ ] provider is AIProvider enum
    - [ ] content is string
    - [ ] commands is Command[]
    - [ ] metadata has correct shape
    - [ ] No extra fields
  - [ ] Test UnifiedAIService interface compliance
  - [ ] Test PromptBuilder interface compliance
  - [ ] Test ResponseParser interface compliance
  - [ ] Verify mock AIResponse === real AIResponse shape
- **Deliverable**: AI service contract tests
- **Success Metric**: Mock and real services pass same tests

#### **Agent TEST-SEAM-4: Command Executor Contract Tests**
- **Priority**: CRITICAL
- **Time Estimate**: 3-4 hours
- **Seams Covered**: #5 (Command Executor Interface)
- **Dependencies**: None
- **Checklist**:
  - [ ] Create `tests/contracts/command-executors.contract.test.ts`
  - [ ] Test CommandExecutor interface compliance:
    - [ ] All executors implement CommandExecutor
    - [ ] execute() returns Promise<ExecutionResult>
    - [ ] canExecute() returns boolean
    - [ ] validate() returns ValidationResult
  - [ ] Test ExecutionResult shape compliance:
    - [ ] success is boolean
    - [ ] command matches input
    - [ ] error is optional string
    - [ ] metadata is optional Record
    - [ ] No extra fields
  - [ ] Test CommandQueue interface compliance
  - [ ] Test all 10 command types
  - [ ] Verify command validation works
  - [ ] Test error handling and recovery
- **Deliverable**: Command contract tests
- **Success Metric**: All executors pass contract tests

#### **Agent TEST-SEAM-5: Flow & Image Contract Tests**
- **Priority**: CRITICAL
- **Time Estimate**: 3-4 hours
- **Seams Covered**: #6 (Flow), #7 (Image Service)
- **Dependencies**: None
- **Checklist**:
  - [ ] Create `tests/contracts/flows.contract.test.ts`
  - [ ] Test GameFlow interface compliance:
    - [ ] DescentFlow implements GameFlow
    - [ ] UnravelingFlow implements GameFlow
    - [ ] initialize() returns Promise<void>
    - [ ] processChoice() returns Promise<FlowResult>
    - [ ] shouldTransition() returns GameState | null
  - [ ] Test FlowResult shape compliance
  - [ ] Test FlowCoordinator interface compliance
  - [ ] Create `tests/contracts/image-services.contract.test.ts`
  - [ ] Test ImageService interface compliance:
    - [ ] Grok image service implements ImageService
    - [ ] Mock image service implements ImageService
    - [ ] generate() returns Promise<ImageResult>
    - [ ] isAvailable() returns Promise<boolean>
  - [ ] Test ImageResult shape compliance
  - [ ] Test ImagePipeline interface compliance
  - [ ] Test ImageCache interface compliance
- **Deliverable**: Flow and image contract tests
- **Success Metric**: All flows and image services pass

#### **Agent TEST-SEAM-6: UI & Config Contract Tests**
- **Priority**: HIGH
- **Time Estimate**: 2-3 hours
- **Seams Covered**: #8 (UI), #9 (Config)
- **Dependencies**: None
- **Checklist**:
  - [ ] Create `tests/contracts/ui-components.contract.test.ts`
  - [ ] Test Screen interface compliance:
    - [ ] StartScreen has required props
    - [ ] DescentScreen has required props
    - [ ] UnravelingScreen has required props
    - [ ] All props match interface definitions
    - [ ] No extra props required
  - [ ] Test CorruptionEffect interface compliance
  - [ ] Test GlitchEffect interface compliance
  - [ ] Create `tests/contracts/config.contract.test.ts`
  - [ ] Test AppConfig interface compliance:
    - [ ] All required fields exist
    - [ ] Default config matches interface
    - [ ] Environment overrides work correctly
  - [ ] Test ConfigProvider interface compliance
  - [ ] Verify feature flags work
- **Deliverable**: UI and config contract tests
- **Success Metric**: All UI components and config pass

---

### Agent Group C: Documentation (2 agents in parallel)

#### **Agent DOC-1: Data Boundaries Mapper**
- **Priority**: HIGH
- **Time Estimate**: 3-4 hours
- **Dependencies**: None
- **Checklist**:
  - [ ] Create `DATA-BOUNDARIES.md`
  - [ ] Map all data boundaries in system:
    - [ ] Frontend ↔ State Stores (4 stores)
    - [ ] State Stores ↔ Engines (9 engines)
    - [ ] Engines ↔ AI Services (3 services)
    - [ ] AI Services ↔ External APIs (Grok, Unsplash)
    - [ ] Commands ↔ Executors (10 command types)
    - [ ] Executors ↔ State Updates
    - [ ] UI Components ↔ Props
    - [ ] Image Pipeline ↔ Image Services
    - [ ] Flow Coordinator ↔ Flows
  - [ ] Document data shape at each boundary
  - [ ] Map UI state transitions:
    - [ ] MENU → GENERATING (loading state)
    - [ ] GENERATING → DESCENDING (success state)
    - [ ] GENERATING → MENU (error state)
    - [ ] DESCENDING → UNRAVELING (transition state)
    - [ ] UNRAVELING → COLLAPSED (end state)
  - [ ] Document async boundaries (loading, error, success)
  - [ ] List all identified seams
  - [ ] Create visual boundary diagram
- **Deliverable**: Complete DATA-BOUNDARIES.md
- **Success Metric**: All data flow paths documented

#### **Agent DOC-2: Contract Blueprint Creator**
- **Priority**: HIGH
- **Time Estimate**: 2-3 hours
- **Dependencies**: None
- **Checklist**:
  - [ ] Create `CONTRACT-BLUEPRINT.md`
  - [ ] Define contract creation template:
    - [ ] Interface definition structure
    - [ ] Naming conventions
    - [ ] Type vs Interface guidelines
    - [ ] Zod schema integration
    - [ ] Comment requirements
    - [ ] Requirement tracing format
  - [ ] Create example contract following template
  - [ ] Document edge case handling:
    - [ ] Empty arrays
    - [ ] Null vs undefined
    - [ ] Optional fields
    - [ ] Error states
  - [ ] Add consistency checklist
  - [ ] Document single responsibility principle
  - [ ] Add validation rules
  - [ ] Include anti-patterns to avoid
- **Deliverable**: CONTRACT-BLUEPRINT.md template
- **Success Metric**: Template usable for future contracts

---

## 📋 Phase 2: Mock Validation (Days 3-4)
**Parallel Agents**: 4 agents
**Goal**: Validate all mocks match their contracts perfectly

### Agent Group D: Mock Validators (4 agents in parallel)

#### **Agent MOCK-1: AI Service Mock Validator**
- **Priority**: HIGH
- **Time Estimate**: 2-3 hours
- **Dependencies**: Agent TEST-SEAM-3 complete
- **Checklist**:
  - [ ] Update `src/services/ai/mockService.ts`:
    - [ ] Add `implements AIService` to class declaration
    - [ ] Verify all interface methods implemented
    - [ ] Ensure response shape matches AIResponse exactly
    - [ ] Remove any `as any` casts
    - [ ] Add runtime shape validation
  - [ ] Update `tests/mocks/mockAIService.ts`:
    - [ ] Add `implements AIService`
    - [ ] Match production mock exactly
  - [ ] Run contract tests against both mocks
  - [ ] Verify no extra fields in responses
  - [ ] Add JSDoc comments linking to contract
- **Deliverable**: Validated AI mocks
- **Success Metric**: Mocks pass all contract tests

#### **Agent MOCK-2: Image Service Mock Validator**
- **Priority**: HIGH
- **Time Estimate**: 2-3 hours
- **Dependencies**: Agent TEST-SEAM-5 complete
- **Checklist**:
  - [ ] Update `tests/mocks/mockImageService.ts`:
    - [ ] Add `implements ImageService`
    - [ ] Verify generate() returns correct ImageResult shape
    - [ ] Verify isAvailable() exists
    - [ ] Ensure no extra fields
    - [ ] Remove any type escapes
  - [ ] Create mock for ImagePipeline if missing
  - [ ] Add `implements ImagePipeline`
  - [ ] Run contract tests
  - [ ] Verify cache behavior matches interface
- **Deliverable**: Validated image mocks
- **Success Metric**: Image mocks pass contract tests

#### **Agent MOCK-3: Store Mock Validator**
- **Priority**: HIGH
- **Time Estimate**: 2-3 hours
- **Dependencies**: Agent TEST-SEAM-1 complete
- **Checklist**:
  - [ ] Update `tests/mocks/mockStores.ts`:
    - [ ] Add `implements GameStateStore` to mock
    - [ ] Add `implements WorldStateStore` to mock
    - [ ] Add `implements HistoryStore` to mock
    - [ ] Add `implements PlayerProfileStore` to mock
    - [ ] Verify all actions exist
    - [ ] Verify state shapes match exactly
    - [ ] Remove any type escapes
  - [ ] Run contract tests against all 4 store mocks
  - [ ] Verify reset() works correctly
  - [ ] Test persistence behavior
- **Deliverable**: Validated store mocks
- **Success Metric**: All store mocks pass contract tests

#### **Agent MOCK-4: Context Mock Validator**
- **Priority**: MEDIUM
- **Time Estimate**: 2 hours
- **Dependencies**: Agent TEST-SEAM-2 complete
- **Checklist**:
  - [ ] Update `tests/mocks/mockContexts.ts`:
    - [ ] Verify buildMockContext() returns EngineContext shape
    - [ ] Verify buildMockFlowContext() returns FlowContext shape
    - [ ] Verify buildMockAIContext() returns AIContext shape
    - [ ] Ensure no extra fields
    - [ ] Add type assertions where needed
  - [ ] Create helper for generating valid test data
  - [ ] Run contract tests
  - [ ] Document mock data generation strategy
- **Deliverable**: Validated context mocks
- **Success Metric**: Context builders pass validation

---

## 📋 Phase 3: Real Service Validation (Days 4-5)
**Parallel Agents**: 3 agents
**Goal**: Ensure real services match mock contracts exactly

### Agent Group E: Real Service Validators (3 agents in parallel)

#### **Agent REAL-1: Grok Service Contract Validator**
- **Priority**: CRITICAL
- **Time Estimate**: 3-4 hours
- **Dependencies**: Agent TEST-SEAM-3, MOCK-1 complete
- **Checklist**:
  - [ ] Run AI service contract tests against `grokService.ts`
  - [ ] Verify AIResponse shape matches mock exactly:
    - [ ] Same fields
    - [ ] Same types
    - [ ] No extra fields
    - [ ] Commands array properly parsed
  - [ ] Test with real API (if key available)
  - [ ] Test error responses match contract
  - [ ] Test fallback behavior
  - [ ] Verify estimateTokens() works
  - [ ] Document any discrepancies
  - [ ] Fix any shape mismatches
- **Deliverable**: Grok service passes mock contract tests
- **Success Metric**: Same tests pass for mock and real

#### **Agent REAL-2: Grok Image Service Contract Validator**
- **Priority**: CRITICAL
- **Time Estimate**: 2-3 hours
- **Dependencies**: Agent TEST-SEAM-5, MOCK-2 complete
- **Checklist**:
  - [ ] Run image service contract tests against `grokImageService.ts`
  - [ ] Verify ImageResult shape matches mock:
    - [ ] url field correct type
    - [ ] provider field correct
    - [ ] cached field exists
    - [ ] error field optional
    - [ ] No extra fields
  - [ ] Test with real API (if key available)
  - [ ] Test error handling
  - [ ] Verify isAvailable() works
  - [ ] Test fallback to Unsplash
  - [ ] Document any discrepancies
- **Deliverable**: Grok image service validated
- **Success Metric**: Real service === mock shape

#### **Agent REAL-3: UnifiedAIService Contract Validator**
- **Priority**: HIGH
- **Time Estimate**: 2-3 hours
- **Dependencies**: Agent TEST-SEAM-3, REAL-1 complete
- **Checklist**:
  - [ ] Run unified service contract tests
  - [ ] Verify UnifiedAIService interface compliance
  - [ ] Test provider switching works
  - [ ] Test fallback chain (Grok → Mock)
  - [ ] Verify responses match contract regardless of provider
  - [ ] Test provider testing methods
  - [ ] Verify no shape changes during fallback
  - [ ] Document fallback behavior
- **Deliverable**: Unified service validated
- **Success Metric**: All providers return same shape

---

## 📋 Phase 4: Schema Validation (Day 5)
**Parallel Agents**: 2 agents
**Goal**: Add runtime validation with Zod

### Agent Group F: Schema Validators (2 agents in parallel)

#### **Agent SCHEMA-1: Core Type Schemas**
- **Priority**: HIGH
- **Time Estimate**: 3-4 hours
- **Dependencies**: None (can run in parallel)
- **Checklist**:
  - [ ] Create/update Zod schemas in `src/types.ts`:
    - [ ] WorldState schema (extend existing)
    - [ ] Choice schema (extend existing)
    - [ ] StorySegment schema (extend existing)
    - [ ] Command discriminated union schema
    - [ ] BrowserEffect schema
  - [ ] Verify schemas match seams.ts interfaces exactly
  - [ ] Add schema validation to parsers:
    - [ ] ResponseParser uses schemas
    - [ ] Command validation uses schemas
  - [ ] Test schema validation catches invalid data
  - [ ] Add error messages for validation failures
  - [ ] Document schema usage
- **Deliverable**: Core type Zod schemas
- **Success Metric**: All external data validated at runtime

#### **Agent SCHEMA-2: API & Service Schemas**
- **Priority**: HIGH
- **Time Estimate**: 3-4 hours
- **Dependencies**: None (can run in parallel)
- **Checklist**:
  - [ ] Create Zod schemas for API responses:
    - [ ] AIRequest schema
    - [ ] AIResponse schema
    - [ ] AIContext schema
    - [ ] ImageResult schema
    - [ ] ProviderTestResult schema
  - [ ] Add schema validation to service boundaries:
    - [ ] AI service responses validated
    - [ ] Image service responses validated
    - [ ] External API responses validated
  - [ ] Test schemas catch malformed responses
  - [ ] Add graceful error handling
  - [ ] Document API contracts with schemas
- **Deliverable**: API Zod schemas
- **Success Metric**: All API boundaries validated

---

## 📋 Phase 5: Integration Preparation (Days 6-7)
**Parallel Agents**: 4 agents
**Goal**: Final polish and integration readiness

### Agent Group G: Integration Preparers (4 agents in parallel)

#### **Agent INTEGRATE-1: CI/CD Contract Enforcer**
- **Priority**: HIGH
- **Time Estimate**: 3-4 hours
- **Dependencies**: All contract tests complete
- **Checklist**:
  - [ ] Update `.github/workflows/` or create if missing:
    - [ ] Add contract test job
    - [ ] Add TypeScript strict check job
    - [ ] Add `as any` detection job (must fail if found)
    - [ ] Add test coverage job (require 80%+)
  - [ ] Create pre-commit hook:
    - [ ] Run `npx tsc --noEmit`
    - [ ] Run contract tests
    - [ ] Block commits with `as any`
  - [ ] Update package.json scripts:
    - [ ] Add `npm run check:contracts`
    - [ ] Add `npm run check:types`
    - [ ] Add `npm run check:escapes`
    - [ ] Add `npm run check:all` (runs all checks)
  - [ ] Document CI/CD setup in CONTRIBUTING.md
  - [ ] Test CI/CD pipeline
- **Deliverable**: Automated contract enforcement
- **Success Metric**: CI blocks contract violations

#### **Agent INTEGRATE-2: Component State Seams**
- **Priority**: MEDIUM
- **Time Estimate**: 2-3 hours
- **Dependencies**: Agent DOC-1 complete
- **Checklist**:
  - [ ] Add to `src/core/types/seams.ts`:
    - [ ] ComponentStateSeam interface
    - [ ] LoadingState type
    - [ ] ErrorState type
    - [ ] SuccessState type
    - [ ] AsyncSeam<T> generic type
  - [ ] Define UI state transitions:
    - [ ] loading → data | error
    - [ ] idle → loading → data | error
    - [ ] Include lastFetch, isStale, invalidate
  - [ ] Update UI components to use AsyncSeam
  - [ ] Test all async state transitions
  - [ ] Document async patterns
- **Deliverable**: UI state seams defined
- **Success Metric**: All async states type-safe

#### **Agent INTEGRATE-3: Error Handling Audit**
- **Priority**: MEDIUM
- **Time Estimate**: 3-4 hours
- **Dependencies**: All contract tests complete
- **Checklist**:
  - [ ] Audit error handling at all seam boundaries:
    - [ ] AI service errors
    - [ ] Image service errors
    - [ ] Command execution errors
    - [ ] Engine processing errors
    - [ ] Flow transition errors
    - [ ] State update errors
  - [ ] Ensure all try-catch blocks:
    - [ ] Log errors properly
    - [ ] Return structured error responses
    - [ ] Don't expose internal errors to UI
    - [ ] Provide recovery mechanisms
  - [ ] Test error scenarios:
    - [ ] Network failures
    - [ ] Invalid API keys
    - [ ] Malformed responses
    - [ ] State corruption
  - [ ] Document error handling patterns
  - [ ] Create error handling guide
- **Deliverable**: Comprehensive error handling
- **Success Metric**: All errors handled gracefully

#### **Agent INTEGRATE-4: Integration Test Suite**
- **Priority**: HIGH
- **Time Estimate**: 4-5 hours
- **Dependencies**: All contract tests pass
- **Checklist**:
  - [ ] Create `tests/integration/` test suite:
    - [ ] Full game flow test (menu → descended → unraveling → collapsed)
    - [ ] Engine integration test (all 9 engines work together)
    - [ ] AI service integration test (fallback chain works)
    - [ ] Command execution integration test (queue processes all commands)
    - [ ] State persistence integration test (save/load works)
  - [ ] Test with mock AI:
    - [ ] Complete playthrough works
    - [ ] All features functional
    - [ ] No console errors
  - [ ] Prepare for "The Switch":
    - [ ] Document how to switch mock → real
    - [ ] Create toggle mechanism
    - [ ] Test switch doesn't break app
  - [ ] Run full test suite: `npm test`
  - [ ] Verify 80%+ coverage
- **Deliverable**: Integration test suite
- **Success Metric**: Full game flow works end-to-end

---

## 📋 Phase 6: The Switch & Verification (Day 7)
**Parallel Agents**: 2 agents
**Goal**: Flip to real services and verify integration works

### Agent Group H: Integration Executors (2 agents in parallel)

#### **Agent SWITCH-1: The Switch Executor**
- **Priority**: CRITICAL
- **Time Estimate**: 2-3 hours
- **Dependencies**: ALL previous phases complete
- **Pre-Switch Checklist**:
  - [ ] ✅ Contract versions match (frontend/backend): ___
  - [ ] ✅ All contract tests pass: ___
  - [ ] ✅ All mock tests pass: ___
  - [ ] ✅ Full test suite passes: ___
  - [ ] ✅ Zero TypeScript errors: ___
  - [ ] ✅ Zero `as any` violations: ___
  - [ ] ✅ Dependency injection ready: ___
- **The Switch Process**:
  - [ ] Create `.env.local` with real API keys
  - [ ] Update UnifiedAIService to use real Grok by default
  - [ ] Start dev server: `npm run dev`
  - [ ] Test basic functionality:
    - [ ] App loads without errors
    - [ ] Start screen renders
    - [ ] Genre selection works
    - [ ] AI provider selection shows Grok
    - [ ] "Start Game" initializes with real Grok
  - [ ] Test full game flow:
    - [ ] First story segment generates
    - [ ] Choices display correctly
    - [ ] Selecting choice generates next segment
    - [ ] Images load from Grok-2-image-1212
    - [ ] Horror intensity increases
    - [ ] Corruption affects UI
    - [ ] State persists
  - [ ] Monitor for errors:
    - [ ] Check browser console
    - [ ] Check network tab
    - [ ] Check for any UI glitches
- **If Integration Fails**:
  - [ ] Run Emergency Protocols Checklist (from SDD guide)
  - [ ] Document failure point
  - [ ] Revert to mocks
  - [ ] Fix issue
  - [ ] Re-run The Switch
- **Deliverable**: Integration with real services
- **Success Metric**: Integration works on first try

#### **Agent SWITCH-2: Post-Integration Validator**
- **Priority**: CRITICAL
- **Time Estimate**: 2-3 hours
- **Dependencies**: Agent SWITCH-1 complete
- **Checklist**:
  - [ ] Run contract tests against live system
  - [ ] Verify real service responses match expected shapes
  - [ ] Test error scenarios with real services:
    - [ ] Invalid API key
    - [ ] Rate limiting
    - [ ] Network timeout
    - [ ] Malformed prompts
  - [ ] Verify fallback chain works:
    - [ ] Grok fails → falls back to Mock
    - [ ] Grok image fails → falls back to Unsplash
  - [ ] Performance testing:
    - [ ] Measure Grok response times
    - [ ] Verify 2M token context works
    - [ ] Test image generation latency
  - [ ] Create performance baseline
  - [ ] Document any issues found
  - [ ] Create `INTEGRATION_REPORT.md`
- **Deliverable**: Integration validation report
- **Success Metric**: Real services work as expected

---

## 📋 Phase 7: SDD Compliance Review (Day 7)
**Agent**: 1 final review agent
**Goal**: Certify 100% SDD compliance

### **Agent REVIEW-FINAL: SDD Compliance Auditor**
- **Priority**: CRITICAL
- **Time Estimate**: 2-3 hours
- **Dependencies**: ALL phases complete
- **Checklist**:
  - [ ] **Phase 1 Verification (Definition)**:
    - [ ] ✅ Step 1 UNDERSTAND: Requirements documented
    - [ ] ✅ Step 2 IDENTIFY: DATA-BOUNDARIES.md exists and complete
    - [ ] ✅ Step 3 DEFINE: All contracts in seams.ts with Zod schemas
  - [ ] **Phase 2 Verification (Parallel Development)**:
    - [ ] ✅ Step 4 BUILD MOCKS: All mocks implement interfaces
    - [ ] ✅ Step 5 VALIDATE MOCKS: All contract tests pass (100% coverage)
    - [ ] ✅ Step 6 BUILD UI: UI built against validated mocks
    - [ ] ✅ Step 7 IMPLEMENT REAL: Real services pass contract tests
  - [ ] **Phase 3 Verification (Integration)**:
    - [ ] ✅ Step 8 INTEGRATE: Integration works on first try
  - [ ] **Compliance Scorecard**:
    - [ ] TypeScript errors: 0 ✅
    - [ ] `as any` violations: 0 ✅
    - [ ] Contract test coverage: 100% ✅
    - [ ] Mock validation: Complete ✅
    - [ ] Real service validation: Complete ✅
    - [ ] Integration test: Passed ✅
    - [ ] CI/CD enforcement: Active ✅
  - [ ] **Generate Compliance Certificate**:
    - [ ] Create `SDD_COMPLIANCE_CERTIFICATE.md`
    - [ ] List all passing metrics
    - [ ] Document compliance level: Level 3 (BEST)
    - [ ] Sign off on integration readiness
  - [ ] **Update README.md**:
    - [ ] Add SDD compliance badge
    - [ ] Link to compliance certificate
    - [ ] Document testing approach
- **Deliverable**: SDD Compliance Certificate
- **Success Metric**: Level 3 (BEST) compliance achieved

---

## 🎯 Success Metrics Dashboard

### Before (Current State - Level 2)
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| TypeScript Errors | 40 | 0 | 🔴 FAIL |
| `as any` Violations | 35 | 0 | 🔴 FAIL |
| Contract Test Coverage | 0% | 100% | 🔴 FAIL |
| Mock Validation | 0% | 100% | 🔴 FAIL |
| Real Service Tests | 0% | 100% | 🔴 FAIL |
| Integration Status | Not Ready | Ready | 🔴 FAIL |
| SDD Compliance Level | 2 (BETTER) | 3 (BEST) | 🔴 FAIL |

### After (Target State - Level 3)
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| TypeScript Errors | 0 | 0 | ✅ PASS |
| `as any` Violations | 0 | 0 | ✅ PASS |
| Contract Test Coverage | 100% | 100% | ✅ PASS |
| Mock Validation | 100% | 100% | ✅ PASS |
| Real Service Tests | 100% | 100% | ✅ PASS |
| Integration Status | Ready | Ready | ✅ PASS |
| SDD Compliance Level | 3 (BEST) | 3 (BEST) | ✅ PASS |

---

## 🚀 Execution Strategy

### Maximum Parallelism
- **Phase 1**: 10 agents simultaneously
- **Phase 2**: 4 agents simultaneously
- **Phase 3**: 3 agents simultaneously
- **Phase 4**: 2 agents simultaneously
- **Phase 5**: 4 agents simultaneously
- **Phase 6**: 2 agents simultaneously
- **Phase 7**: 1 agent (final review)

**Total Agent Deployments**: 26 agents across 7 phases

### Critical Path
1. FIX-TS + FIX-TYPES (Day 1) → Enables contract test writing
2. TEST-SEAM-* (Days 1-2) → Enables mock validation
3. MOCK-* (Days 3-4) → Enables real service validation
4. REAL-* (Days 4-5) → Enables integration
5. INTEGRATE-* (Days 6-7) → Final preparation
6. SWITCH-* (Day 7) → The moment of truth
7. REVIEW-FINAL (Day 7) → Certification

### Daily Milestones
- **Day 1**: Critical fixes complete (0 TS errors, 0 `as any`)
- **Day 2**: Contract tests complete (100% coverage)
- **Day 3**: Mocks validated (all pass contract tests)
- **Day 4**: Real services validated (match mocks exactly)
- **Day 5**: Schemas and integration tests complete
- **Day 6**: CI/CD enforcing contracts, error handling audited
- **Day 7**: Integration successful, Level 3 certified

---

## 📊 Risk Management

### High-Risk Items
1. **TypeScript error fixing** - Could uncover deeper issues
   - *Mitigation*: Fix in isolated feature branches
2. **Contract test writing** - Might reveal contract design flaws
   - *Mitigation*: Review contracts before writing tests
3. **The Switch** - Integration might fail despite preparation
   - *Mitigation*: Run Emergency Protocols Checklist

### Low-Risk Items
1. Documentation (DATA-BOUNDARIES, CONTRACT-BLUEPRINT)
2. Schema creation (extends existing work)
3. CI/CD setup (standard patterns)

---

## 📝 Deliverables Checklist

### Documentation
- [ ] SDD_COMPLIANCE_ANALYSIS.md ✅ (Complete)
- [ ] PRD_ROADMAP.md ✅ (This document)
- [ ] DATA-BOUNDARIES.md
- [ ] CONTRACT-BLUEPRINT.md
- [ ] TYPESCRIPT_FIXES.md
- [ ] TYPE_ESCAPE_FIXES.md
- [ ] INTEGRATION_REPORT.md
- [ ] SDD_COMPLIANCE_CERTIFICATE.md

### Test Files
- [ ] tests/contracts/state-stores.contract.test.ts
- [ ] tests/contracts/engines.contract.test.ts
- [ ] tests/contracts/ai-services.contract.test.ts
- [ ] tests/contracts/command-executors.contract.test.ts
- [ ] tests/contracts/flows.contract.test.ts
- [ ] tests/contracts/image-services.contract.test.ts
- [ ] tests/contracts/ui-components.contract.test.ts
- [ ] tests/contracts/config.contract.test.ts
- [ ] tests/integration/*.test.ts

### Code Updates
- [ ] All mocks implement interfaces explicitly
- [ ] All services validated against contracts
- [ ] Zod schemas for all external data
- [ ] CI/CD pipeline enforcing contracts
- [ ] Component state seams added to seams.ts

---

## 🎓 Lessons from SDD Guide

### What We're Implementing
1. ✅ **"The 8-Step SDD Process"** - Following strictly, no skipping
2. ✅ **"The Pixel-Perfect Mock Rule"** - Mocks validated against contracts
3. ✅ **"Level 3 Compliance"** - Zero errors, zero escapes, 100% tests
4. ✅ **"Integration Readiness Checklist"** - Before "The Switch"
5. ✅ **"Emergency Protocols"** - If integration fails

### The Promise
> "If you follow SDD strictly, integration is no longer a hope, but a guarantee."

**Our Commitment**: By completing all phases of this roadmap, we GUARANTEE integration will work on the first try.

---

## 🏁 Final Notes

This roadmap transforms Apophenia from **Level 2 (BETTER)** to **Level 3 (BEST)** SDD compliance through systematic, parallel agent deployment focused on contract validation.

The key insight: **We already have excellent seams (seams.ts)**, we just need to **validate them**.

**Estimated Timeline**: 5-7 days with maximum parallelism
**Agent Count**: 26 specialized agents
**Success Probability**: 95%+ (with strict SDD adherence)

**Next Step**: Deploy Phase 1 agents immediately (10 agents in parallel).

---

**Status**: 📋 ROADMAP COMPLETE - READY FOR AGENT DEPLOYMENT
