# Apophenia - Master Issue Tracking List

**Generated**: 2025-11-13
**Total Issues**: 50 identified across 8 components
**Status**: ⬜ Not Started

---

## 🚨 CRITICAL ISSUES (11) - BLOCKING PRODUCTION

### Engines (3 issues)
- [ ] **C-ENG-01**: Mutable state in SemanticChoiceArchaeologyEngine (line 16, 26)
  - **File**: `src/core/engines/SemanticChoiceArchaeologyEngine.ts`
  - **Severity**: CRITICAL
  - **Effort**: 2 hours
  - **Fix**: Remove instance `choiceHistory`, reconstruct from context

- [ ] **C-ENG-02**: Mutable state in AdaptiveNarrativeDNAEngine (line 16, 33)
  - **File**: `src/core/engines/AdaptiveNarrativeDNAEngine.ts`
  - **Severity**: CRITICAL
  - **Effort**: 2 hours
  - **Fix**: Store genome in WorldState/PlayerProfile, make engine pure

- [ ] **C-ENG-03**: Unchecked error throw in QuantumNarrativeEngine (line 142)
  - **File**: `src/core/engines/QuantumNarrativeEngine.ts`
  - **Severity**: CRITICAL
  - **Effort**: 30 minutes
  - **Fix**: Return null on error in mergeTimelines(), handle gracefully

### State Stores (2 issues)
- [ ] **C-STO-01**: Duplicate store implementations
  - **Files**: `/src/stores/*` vs `/src/core/state/*`
  - **Severity**: CRITICAL
  - **Effort**: 4-8 hours
  - **Fix**: Migrate all imports to canonical location, delete old stores

- [ ] **C-STO-02**: localStorage key conflicts
  - **Files**: Multiple stores
  - **Severity**: CRITICAL
  - **Effort**: 2 hours
  - **Fix**: Create migration utility for old → new keys

### Commands (2 issues)
- [ ] **C-CMD-01**: Missing command executors (pregenerateImage, generateAmbiance)
  - **Files**: `/src/core/commands/` (missing files)
  - **Severity**: CRITICAL
  - **Effort**: 2 hours
  - **Fix**: Create pregenerateImage.ts and generateAmbiance.ts executors

- [ ] **C-CMD-02**: CommandSchema mismatch with Command type
  - **File**: `src/services/ai/responseParser.ts` (lines 25-36)
  - **Severity**: CRITICAL
  - **Effort**: 15 minutes
  - **Fix**: Add pregenerateImage and generateAmbiance to CommandSchema

### Flows (2 issues)
- [ ] **C-FLO-01**: Type escape in FlowCoordinator (line 165)
  - **File**: `src/flows/FlowCoordinator.ts`
  - **Severity**: CRITICAL (SDD Level 3 violation)
  - **Effort**: 30 minutes
  - **Fix**: Remove `as unknown as` double cast, fix type properly

- [ ] **C-FLO-02**: Missing ConceptFlow implementation
  - **File**: `/src/flows/ConceptFlow.ts` (doesn't exist)
  - **Severity**: CRITICAL
  - **Effort**: 4-8 hours
  - **Fix**: Implement ConceptFlow OR remove from documentation

### UI (2 issues)
- [ ] **C-UI-01**: ErrorBoundary not integrated
  - **File**: `src/index.tsx`
  - **Severity**: CRITICAL
  - **Effort**: 5 minutes
  - **Fix**: Wrap <App /> with <GameErrorBoundary>

- [ ] **C-UI-02**: Array index access anti-pattern (line 69)
  - **File**: `src/App.tsx`
  - **Severity**: CRITICAL
  - **Effort**: 15 minutes
  - **Fix**: Use segmentId lookup instead of segments[length-1]

### TypeScript (1 issue)
- [ ] **C-TS-01**: 2 compilation errors (lines 32, 34)
  - **File**: `src/ui/screens/StartScreen.tsx`
  - **Severity**: CRITICAL
  - **Effort**: 5 minutes
  - **Fix**: Remove references to GEMINI_PRO and GEMINI_FLASH

---

## 🔴 HIGH PRIORITY ISSUES (18)

### Engines (5 issues)
- [ ] **H-ENG-01**: LocalStorage quota not handled
  - **File**: `src/core/engines/NeuralEchoChamberEngine.ts`
  - **Severity**: HIGH
  - **Effort**: 1 hour

- [ ] **H-ENG-02**: Overly broad regex patterns
  - **File**: `src/core/engines/TemporalRevisionEngine.ts`
  - **Severity**: HIGH
  - **Effort**: 1 hour

- [ ] **H-ENG-03**: Missing input validation on context
  - **Files**: Multiple engines
  - **Severity**: HIGH
  - **Effort**: 2 hours

- [ ] **H-ENG-04**: Browser manipulation without consent
  - **File**: `src/core/engines/FifthWallEngine.ts`
  - **Severity**: HIGH
  - **Effort**: 1 hour

- [ ] **H-ENG-05**: EngineRegistry swallows errors silently
  - **File**: `src/core/engines/EngineRegistry.ts`
  - **Severity**: HIGH
  - **Effort**: 30 minutes

### State Stores (4 issues)
- [ ] **H-STO-01**: Missing imageCacheStore in canonical location
  - **File**: `/src/core/state/imageCacheStore.ts` (missing)
  - **Severity**: HIGH
  - **Effort**: 2 hours

- [ ] **H-STO-02**: Missing aiModelStore in canonical location
  - **File**: `/src/core/state/aiModelStore.ts` (missing)
  - **Severity**: HIGH
  - **Effort**: 1 hour

- [ ] **H-STO-03**: Missing userStore in canonical location
  - **File**: `/src/core/state/userStore.ts` (missing)
  - **Severity**: HIGH
  - **Effort**: 2 hours

- [ ] **H-STO-04**: Module-level side effects in userStore
  - **File**: `src/stores/userStore.ts` (lines 43-56)
  - **Severity**: HIGH
  - **Effort**: 1 hour

### AI Services (3 issues)
- [ ] **H-AI-01**: No retry logic for transient failures
  - **File**: `src/services/ai/grokService.ts` (lines 60-127)
  - **Severity**: HIGH
  - **Effort**: 2 hours

- [ ] **H-AI-02**: No request timeout
  - **File**: `src/services/ai/grokService.ts` (lines 82-98)
  - **Severity**: HIGH
  - **Effort**: 1 hour

- [ ] **H-AI-03**: Inconsistent input sanitization
  - **File**: `src/services/ai/promptBuilder.ts` (lines 74-81)
  - **Severity**: HIGH
  - **Effort**: 1 hour

### Commands (2 issues)
- [ ] **H-CMD-01**: Type escape in test file (line 73-74)
  - **File**: `tests/unit/commands/CommandQueue.test.ts`
  - **Severity**: HIGH (SDD violation)
  - **Effort**: 30 minutes

- [ ] **H-CMD-02**: Missing segment existence checks
  - **Files**: `src/core/commands/displayText.ts`, `generateImage.ts`
  - **Severity**: HIGH
  - **Effort**: 1 hour

### Flows (4 issues)
- [ ] **H-FLO-01**: Empty updateUIDistortion() methods
  - **Files**: `src/flows/DescentFlow.ts`, `UnravelingFlow.ts`
  - **Severity**: HIGH
  - **Effort**: 2 hours

- [ ] **H-FLO-02**: Inconsistent engine activation logic
  - **Files**: DescentFlow vs UnravelingFlow
  - **Severity**: HIGH
  - **Effort**: 1 hour

- [ ] **H-FLO-03**: Double amplification bug
  - **File**: `src/flows/UnravelingFlow.ts`
  - **Severity**: HIGH
  - **Effort**: 30 minutes

- [ ] **H-FLO-04**: Error swallowing in processChoice
  - **Files**: Multiple flows
  - **Severity**: HIGH
  - **Effort**: 1 hour

---

## 🟡 MEDIUM PRIORITY ISSUES (14)

### Engines (3 issues)
- [ ] **M-ENG-01**: No rate limiting on AI calls
  - **Severity**: MEDIUM
  - **Effort**: 2 hours

- [ ] **M-ENG-02**: Magic numbers should be constants
  - **Severity**: MEDIUM
  - **Effort**: 1 hour

- [ ] **M-ENG-03**: Missing JSDoc for public methods
  - **Severity**: MEDIUM
  - **Effort**: 2 hours

### State Stores (3 issues)
- [ ] **M-STO-01**: Null checks missing in updateSegment/reviseSegment
  - **File**: `src/core/state/historyStore.ts` (lines 38-59)
  - **Severity**: MEDIUM
  - **Effort**: 1 hour

- [ ] **M-STO-02**: Race condition in imageCacheStore getFromCache
  - **File**: `src/stores/imageCacheStore.ts` (lines 152-212)
  - **Severity**: MEDIUM
  - **Effort**: 1 hour

- [ ] **M-STO-03**: StateManager missing crossSessionData deep merge
  - **File**: `src/core/state/StateManager.ts` (lines 77-97)
  - **Severity**: MEDIUM
  - **Effort**: 30 minutes

### AI Services (2 issues)
- [ ] **M-AI-01**: No response caching
  - **Files**: All AI services
  - **Severity**: MEDIUM
  - **Effort**: 2 hours

- [ ] **M-AI-02**: Limited fallback chain (Grok → Mock only)
  - **File**: `src/services/ai/unifiedAIService.ts`
  - **Severity**: MEDIUM
  - **Effort**: 3 hours

### Commands (3 issues)
- [ ] **M-CMD-01**: No exhaustive type checking pattern
  - **Files**: Multiple executors with switch statements
  - **Severity**: MEDIUM
  - **Effort**: 1 hour

- [ ] **M-CMD-02**: Incomplete JSDoc documentation
  - **Files**: Multiple executors
  - **Severity**: MEDIUM
  - **Effort**: 2 hours

- [ ] **M-CMD-03**: Validation could be more thorough
  - **Files**: browserEffect.ts, displayText.ts
  - **Severity**: MEDIUM
  - **Effort**: 1 hour

### Flows (3 issues)
- [ ] **M-FLO-01**: Duplicate engine instances (27 instead of 9)
  - **Files**: All 3 flows
  - **Severity**: MEDIUM
  - **Effort**: 2 hours

- [ ] **M-FLO-02**: Magic numbers should be constants
  - **Severity**: MEDIUM
  - **Effort**: 1 hour

- [ ] **M-FLO-03**: console.log should be proper logger
  - **Severity**: MEDIUM
  - **Effort**: 1 hour

---

## 🟢 LOW PRIORITY ISSUES (7)

### Various Components
- [ ] **L-CMD-01**: CommandQueue parallel execution may violate order
  - **File**: `src/core/commands/CommandQueue.ts` (lines 135-152)
  - **Severity**: LOW
  - **Effort**: 30 minutes

- [ ] **L-CMD-02**: Missing tests for edge cases
  - **Severity**: LOW
  - **Effort**: 2 hours

- [ ] **L-STO-01**: Inconsistent reset implementation
  - **Files**: Multiple stores
  - **Severity**: LOW
  - **Effort**: 30 minutes

- [ ] **L-STO-02**: Missing JSDoc for public store methods
  - **Severity**: LOW
  - **Effort**: 2 hours

- [ ] **L-STO-03**: No size limits on worldState string fields
  - **File**: `src/core/state/worldStateStore.ts`
  - **Severity**: LOW
  - **Effort**: 1 hour

- [ ] **L-STO-04**: Potential memory leak in imageCacheStore eviction
  - **File**: `src/stores/imageCacheStore.ts` (lines 116-143)
  - **Severity**: LOW
  - **Effort**: 1 hour

- [ ] **L-UI-01**: No code splitting
  - **Severity**: LOW
  - **Effort**: 2 hours

---

## 📊 ISSUE SUMMARY BY COMPONENT

| Component | Critical | High | Medium | Low | Total |
|-----------|----------|------|--------|-----|-------|
| Engines | 3 | 5 | 3 | 0 | 11 |
| State Stores | 2 | 4 | 3 | 5 | 14 |
| AI Services | 0 | 3 | 2 | 0 | 5 |
| Commands | 2 | 2 | 3 | 2 | 9 |
| Flows | 2 | 4 | 3 | 0 | 9 |
| UI | 2 | 0 | 0 | 1 | 3 |
| TypeScript | 1 | 0 | 0 | 0 | 1 |
| **TOTAL** | **11** | **18** | **14** | **7** | **50** |

---

## 📈 PROGRESS TRACKING

### Overall Progress
- Total Issues: 50
- Fixed: 0
- Remaining: 50
- Progress: 0%

### By Priority
- Critical (11): ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ (0/11)
- High (18): ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ (0/18)
- Medium (14): ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ (0/14)
- Low (7): ⬜⬜⬜⬜⬜⬜⬜ (0/7)

### By Component
- Engines: 0/11
- State Stores: 0/14
- AI Services: 0/5
- Commands: 0/9
- Flows: 0/9
- UI: 0/3
- TypeScript: 0/1

---

## 🎯 ESTIMATED EFFORT

### Critical Issues: 17-25 hours
### High Priority: 19.5 hours
### Medium Priority: 17.5 hours
### Low Priority: 9 hours

**Total Estimated Effort**: 63-71 hours (8-9 days)

---

**This document will be updated as issues are resolved.**
