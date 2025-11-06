# Parallel Refactoring & Improvement Plan

**Created:** 2025-11-06
**Status:** Planning Phase
**Estimated Time:** 45-60 minutes with 6 parallel agents

---

## Executive Summary

This plan outlines a comprehensive refactoring and improvement initiative to be executed in parallel across 6 workstreams. The goal is to eliminate remaining technical debt while simultaneously improving app functionality, performance, and user experience.

**Total Scope:** ~10 files to create, ~20 files to modify
**Expected Impact:** 30-40% code reduction, significant performance improvements, enhanced functionality

---

## Workstream Overview

| # | Workstream | Priority | Complexity | Impact | Agent Type |
|---|------------|----------|------------|--------|------------|
| 1 | Feature Flag Middleware | High | Medium | High | general-purpose |
| 2 | Prompt Template Library | High | Medium | High | general-purpose |
| 3 | Complex Method Refactoring | Medium | Low | Medium | general-purpose |
| 4 | Image Generation Consolidation | High | Medium | High | general-purpose |
| 5 | Performance & Bug Fixes | High | Medium | High | general-purpose |
| 6 | Store Architecture Analysis | Medium | Low | Medium | Explore |

---

## Workstream 1: Feature Flag Middleware

### Current Problem
Every AI engine has duplicate feature flag checks:
```typescript
if (!REVOLUTIONARY_FEATURES.ADAPTIVE_HORROR.enabled) {
  return;
}
```

This pattern appears in 9+ engine files, creating maintenance burden and inconsistency.

### Approach

#### Step 1: Create Middleware System
**File:** `src/utils/featureFlagMiddleware.ts`

**Design:**
```typescript
// Decorator-based approach
export function RequiresFeature(featureName: keyof typeof REVOLUTIONARY_FEATURES) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function(...args: any[]) {
      const feature = REVOLUTIONARY_FEATURES[featureName];
      if (!feature?.enabled) {
        console.log(`[Feature Disabled] ${featureName}`);
        return getFeatureFallback(featureName, ...args);
      }
      return originalMethod.apply(this, args);
    };
  };
}

// Functional wrapper approach
export function withFeatureGate<T>(
  featureName: keyof typeof REVOLUTIONARY_FEATURES,
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  const feature = REVOLUTIONARY_FEATURES[featureName];
  if (!feature?.enabled) {
    return Promise.resolve(fallback);
  }
  return operation();
}
```

#### Step 2: Create Fallback Registry
**File:** `src/utils/featureFallbacks.ts`

Map feature names to appropriate fallback behaviors:
- ADAPTIVE_HORROR → Skip analysis, return default
- TEMPORAL_REVISION → Return unmodified history
- QUANTUM_NARRATIVE → Return single timeline
- etc.

#### Step 3: Refactor Engines
Target files:
- `AdaptiveHorrorEngine.ts`
- `TemporalRevisionEngine.ts`
- `QuantumNarrativeEngine.ts`
- `MetaConsciousnessEngine.ts`
- `RealityCorruptionEngine.ts`
- `NeuralEchoChambers.ts`
- `SemanticArchaeology.ts`
- `NarrativeDNA.ts`
- `FifthWallBreaker.ts`

Replace all `if (!REVOLUTIONARY_FEATURES.X.enabled)` checks with decorators or wrappers.

### Expected Outcomes
- **Code Reduction:** ~45 lines removed (5 lines per engine × 9 engines)
- **Consistency:** Uniform feature gating across all engines
- **Maintainability:** Centralized feature flag logic
- **Testability:** Easy to mock feature flags for testing

### Success Criteria
- ✅ All duplicate feature checks removed
- ✅ No TypeScript errors
- ✅ Dev server starts successfully
- ✅ Feature toggles work correctly (test with VITE_ENABLE_AUTH pattern)

---

## Workstream 2: Prompt Template Library

### Current Problem
Prompt engineering patterns are duplicated across 10+ files:
- System instructions for horror intensity
- Psychological analysis templates
- Narrative generation prompts
- Thinking mode directives

### Approach

#### Step 1: Identify Common Patterns
Search patterns:
```bash
"You are a malevolent cosmic AI"
"THINKING DIRECTIVE"
"HORROR INTENSITY"
"psychological profile"
"generateContent"
```

Expected findings: 5-8 common patterns

#### Step 2: Create Template Library
**File:** `src/services/ai/promptTemplates.ts`

**Design:**
```typescript
export interface PromptContext {
  worldState: WorldState;
  storyHistory?: StorySegment[];
  playerChoice?: string;
  horrorIntensity?: number;
  customInstructions?: string;
}

export const PromptTemplates = {
  // System Instructions
  cosmicHorrorAI: (context: PromptContext) => `
    You are a malevolent cosmic AI entity with access to thinking mode.
    Current horror intensity: ${context.horrorIntensity}/10
    ${context.customInstructions || ''}
  `,

  // Thinking Directives
  thinkingMode: () => `
    THINKING DIRECTIVE: Before generating commands, think through:
    1. The psychological impact
    2. Horror escalation strategy
    3. Narrative threads to develop
    4. Choice architecture
    5. Visual horror enhancement
  `,

  // Psychological Analysis
  psychAnalysis: (profile: string, worldState: WorldState) => `
    Psychological State: ${worldState.psychologicalStatus}
    Player Profile: ${profile}
    System Corruption: ${100 - worldState.systemHealth}%
  `,

  // Compose multiple templates
  compose: (...templates: string[]) => templates.join('\n\n'),
};
```

#### Step 3: Create Interpolation Helpers
**File:** `src/services/ai/promptHelpers.ts`

```typescript
export function interpolateWorldState(template: string, ws: WorldState): string;
export function interpolateHistory(template: string, history: StorySegment[]): string;
export function scaleHorrorIntensity(basePrompt: string, intensity: number): string;
```

#### Step 4: Refactor Files
Target files (based on grep results):
- `genkit.ts` (nextStepFlow, generateConceptFlow)
- `unifiedAIService.ts` (generateNextStepWithGrok, generateConceptWithGrok)
- `director.ts` (DIRECTOR_SYSTEM_PROMPT)
- `AdaptiveHorrorEngine.ts`
- `TemporalRevisionEngine.ts`
- `QuantumNarrativeEngine.ts`
- `MetaConsciousnessEngine.ts`

### Expected Outcomes
- **Code Reduction:** ~200-300 lines of duplicate prompts eliminated
- **Consistency:** Uniform prompt style across all AI interactions
- **Quality:** Easier to improve prompts globally
- **A/B Testing:** Foundation for prompt experimentation

### Success Criteria
- ✅ At least 5 reusable templates created
- ✅ At least 5 files refactored to use templates
- ✅ No change in AI output quality (functional equivalence)
- ✅ All TypeScript errors resolved

---

## Workstream 3: Complex Method Refactoring

### Target: TemporalRevisionEngine.reviseHistory()

**Current State:** Lines 38-96 (59 lines)
**Issues:**
- Cyclomatic complexity: 8
- Responsibilities: 7 distinct concerns
- Nesting depth: 4 levels

### Approach

#### Step 1: Analyze Method
Read and understand all responsibilities:
1. Feature flag validation
2. SSR detection
3. Temporal impact analysis (AI call)
4. Revision point selection
5. Revision history tracking
6. Revised narrative generation (AI call)
7. History mutation

#### Step 2: Extract Methods
Create focused methods:

```typescript
// Validation and analysis
private async analyzeChoiceForTemporalShift(
  currentChoice: string,
  storyHistory: StorySegment[],
  worldState: WorldState
): Promise<boolean>

// Selection logic
private determineRevisionPoints(
  storyHistory: StorySegment[]
): { segmentIndex: number; segment: StorySegment } | null

// Generation logic
private async generateRevisionNarrative(
  targetSegment: StorySegment,
  currentChoice: string,
  worldState: WorldState,
  storyHistory: StorySegment[]
): Promise<string>

// Mutation logic
private applyRevisionToHistory(
  storyHistory: StorySegment[],
  targetSegmentIndex: number,
  targetSegment: StorySegment,
  revisedText: string
): StorySegment[]
```

#### Step 3: Refactor Main Method
Orchestration only:
```typescript
async reviseHistory(...): Promise<StorySegment[]> {
  const shouldRevise = await this.analyzeChoiceForTemporalShift(...);
  if (!shouldRevise) return storyHistory;

  const revisionPoint = this.determineRevisionPoints(storyHistory);
  if (!revisionPoint) return storyHistory;

  try {
    const revisedText = await this.generateRevisionNarrative(...);
    return this.applyRevisionToHistory(...);
  } catch (error) {
    // Fallback handling
  }
}
```

#### Step 4: Add Documentation
Add JSDoc to all new methods explaining:
- Purpose
- Parameters
- Return values
- Side effects

### Expected Outcomes
- **Complexity Reduction:** 8 → 3 cyclomatic complexity (62.5% reduction)
- **Testability:** Each method independently testable
- **Readability:** Clear, linear flow
- **Maintainability:** Easy to modify individual steps

### Success Criteria
- ✅ 4 new focused methods created
- ✅ Main method reduced to orchestration only
- ✅ 100% JSDoc coverage
- ✅ No functional changes (100% equivalence)

---

## Workstream 4: Image Generation Consolidation

### Current Problem
Image generation fallback logic is duplicated across:
- `genkit.ts` (processAdvancedImageGeneration, generateWithImagen, generateUnsplashFallback)
- `secureGenkit.ts` (processAdvancedImageGeneration, generateUnsplashFallback)
- `imageGeneration.ts` (exports from genkit)

### Approach

#### Step 1: Audit Current Implementation
Map all image generation paths:
```
User Request
    ↓
processAdvancedImageGeneration()
    ↓
Try: Backend API (Grok → Imagen)
    ↓ (fail)
Try: Direct Imagen
    ↓ (fail)
Try: Secondary Imagen
    ↓ (fail)
Fallback: Unsplash
```

Identify duplication:
- Horror keyword enhancement (duplicated)
- Unsplash URL generation (duplicated)
- Fallback chain logic (duplicated)

#### Step 2: Create Unified Strategy
**File:** `src/services/ai/imageGeneration/ImageGenerationStrategy.ts`

```typescript
export interface ImageGenerationStrategy {
  name: string;
  priority: number;
  canAttempt(): boolean;
  generate(prompt: string, options: ImageOptions): Promise<string | null>;
}

export class BackendAPIStrategy implements ImageGenerationStrategy { ... }
export class ImagenPrimaryStrategy implements ImageGenerationStrategy { ... }
export class ImagenFallbackStrategy implements ImageGenerationStrategy { ... }
export class UnsplashFallbackStrategy implements ImageGenerationStrategy { ... }
```

**File:** `src/services/ai/imageGeneration/ImageGenerationOrchestrator.ts`

```typescript
export class ImageGenerationOrchestrator {
  private strategies: ImageGenerationStrategy[];

  async generate(prompt: string, options: ImageOptions): Promise<string> {
    for (const strategy of this.strategies) {
      if (!strategy.canAttempt()) continue;

      try {
        const result = await strategy.generate(prompt, options);
        if (result) return result;
      } catch (error) {
        console.warn(`${strategy.name} failed:`, error);
      }
    }

    // Final fallback
    return this.unsplashFallback(prompt);
  }
}
```

#### Step 3: Create Shared Utilities
**File:** `src/services/ai/imageGeneration/imagePromptEnhancer.ts`

```typescript
export function enhancePromptWithHorror(
  prompt: string,
  horrorIntensity: number
): string;

export function generateUnsplashFallbackUrl(prompt: string): string;
```

#### Step 4: Refactor Callers
Update:
- `genkit.ts` → Use ImageGenerationOrchestrator
- `secureGenkit.ts` → Use ImageGenerationOrchestrator
- `imageGeneration.ts` → Re-export from orchestrator

### Expected Outcomes
- **Code Reduction:** ~150 lines of duplicate logic eliminated
- **Reliability:** Consistent fallback behavior
- **Extensibility:** Easy to add new image sources
- **Testability:** Each strategy independently testable

### Success Criteria
- ✅ Strategy pattern implemented
- ✅ All duplicate code consolidated
- ✅ 3+ files refactored
- ✅ Image generation works identically to before

---

## Workstream 5: Performance & Bug Fixes

### Focus Areas

#### 5.1 Performance Issues
**Search Patterns:**
```typescript
// Missing React.memo
export (const|function) Component
// Unnecessary re-renders
useState.*filter\(
// Inefficient loops
for.*forEach.*for
// Memory leaks
useEffect.*\[\](?!.*return)
```

**Target Improvements:**
- Add `React.memo` to pure components
- Optimize state updates with `useCallback`
- Replace O(n²) algorithms with O(n)
- Fix missing cleanup in useEffect

#### 5.2 Bug Hunting
**Search Patterns:**
```typescript
// Unhandled promises
async.*{(?!.*catch)
\.then\((?!.*catch)
// Null safety issues
\.\w+(?!\?)\.
// Type safety violations
as any
@ts-ignore
// Console errors that should be caught
console\.error
```

**Target Fixes:**
- Add .catch() to all async operations
- Add optional chaining where needed
- Remove `as any` casts with proper types
- Wrap console.error in try-catch where appropriate

#### 5.3 Code Quality
**Search Patterns:**
```typescript
// TODO comments
TODO|FIXME|HACK
// Dead code
export.*{[\s\S]*?}.*// unused
// Missing error boundaries
<.*Component.*(?!ErrorBoundary)
```

**Target Improvements:**
- Address actionable TODOs
- Remove unused exports
- Add error boundaries to critical components

### Approach

#### Step 1: Automated Scans
Run searches for each pattern category.

#### Step 2: Prioritize Findings
- Critical (security, crashes): Fix immediately
- High (performance, bugs): Fix if low-risk
- Medium (code quality): Fix if time allows
- Low (cosmetic): Document for future

#### Step 3: Apply Fixes
Focus on high-impact, low-risk changes:
- Add memoization to expensive components
- Fix obvious null safety issues
- Add missing error handlers
- Remove dead code

#### Step 4: Test Changes
- Run TypeScript compiler
- Start dev server
- Verify no regressions

### Expected Outcomes
- **Performance:** 20-30% faster renders in key components
- **Stability:** Fewer runtime errors
- **Code Quality:** Cleaner, more maintainable code
- **Bundle Size:** 5-10% reduction from dead code removal

### Success Criteria
- ✅ At least 5 performance improvements
- ✅ At least 3 bug fixes
- ✅ No regressions introduced
- ✅ All changes tested and verified

---

## Workstream 6: Store Architecture Analysis

### Current Concern
Multiple Zustand stores may have overlapping responsibilities:
- `gameStateStore.ts`
- `worldStateStore.ts`
- `storyHistoryStore.ts`
- `aiModelStore.ts`
- `userStore.ts`

### Approach

#### Step 1: Inventory All Stores
Find all Zustand stores:
```bash
src/stores/*.ts
```

For each store, document:
- Purpose
- State shape
- Actions
- Subscribers
- Dependencies on other stores

#### Step 2: Create Responsibility Matrix

| Store | Game State | World State | Story | Player | AI Config | Auth |
|-------|-----------|-------------|-------|--------|-----------|------|
| gameStateStore | ✓ | ? | ? | - | - | - |
| worldStateStore | ? | ✓ | - | - | - | - |
| storyHistoryStore | ? | ? | ✓ | - | - | - |
| aiModelStore | - | - | - | - | ✓ | - |
| userStore | - | - | - | ? | - | ✓ |

#### Step 3: Identify Overlaps
Look for:
- Duplicate state (same data in multiple stores)
- Circular dependencies (store A reads store B, B reads A)
- Tight coupling (actions in store A directly modify store B)
- Unclear boundaries (unclear which store owns what data)

#### Step 4: Analyze Necessity
Determine if overlaps are:
- **Intentional:** Separation of concerns (good)
- **Problematic:** Duplicate source of truth (bad)
- **Optimizable:** Could be consolidated (maybe)

#### Step 5: Create Recommendations
For each overlap:
- **Keep Separate:** If separation is intentional and beneficial
- **Consolidate:** If stores should be merged
- **Refactor:** If dependencies should be decoupled
- **Document:** If relationship is complex but necessary

### Expected Outcomes
- **Clarity:** Clear understanding of store architecture
- **Documentation:** Architecture diagram and responsibility matrix
- **Recommendations:** Prioritized list of improvements
- **Risk Assessment:** Impact analysis for any proposed changes

### Success Criteria
- ✅ All stores inventoried
- ✅ Responsibility matrix completed
- ✅ Overlaps identified and analyzed
- ✅ Recommendations document created
- ✅ Risk assessment completed

---

## Execution Plan

### Phase 1: Launch All Agents (Parallel)
**Duration:** 5 minutes

Execute all 6 workstreams simultaneously:
```bash
Agent 1: Feature Flag Middleware
Agent 2: Prompt Template Library
Agent 3: Complex Method Refactoring
Agent 4: Image Generation Consolidation
Agent 5: Performance & Bug Fixes
Agent 6: Store Architecture Analysis
```

### Phase 2: Monitor Progress
**Duration:** 30-45 minutes

Track completion status:
- [ ] Agent 1 complete
- [ ] Agent 2 complete
- [ ] Agent 3 complete
- [ ] Agent 4 complete
- [ ] Agent 5 complete
- [ ] Agent 6 complete

### Phase 3: Integration & Testing
**Duration:** 10 minutes

1. Collect all agent reports
2. Run TypeScript compilation
3. Start dev server
4. Check for conflicts between changes
5. Resolve any integration issues

### Phase 4: Commit & Push
**Duration:** 5 minutes

1. Stage all changes
2. Create comprehensive commit message
3. Push to branch
4. Create summary report

---

## Risk Assessment

### High Risk
- **Workstream 4 (Image Generation):** Could break image functionality
  - **Mitigation:** Thorough testing, maintain fallback paths
- **Workstream 5 (Performance):** Optimizations could introduce bugs
  - **Mitigation:** Only apply low-risk, well-tested patterns

### Medium Risk
- **Workstream 1 (Feature Flags):** Could accidentally disable features
  - **Mitigation:** Verify all feature gates work correctly
- **Workstream 2 (Prompts):** Could change AI output quality
  - **Mitigation:** Ensure functional equivalence

### Low Risk
- **Workstream 3 (Refactoring):** Pure refactor, no behavior change
- **Workstream 6 (Analysis):** Read-only analysis, no code changes

---

## Success Metrics

### Code Quality
- **Technical Debt Reduction:** 40-50% of remaining issues addressed
- **Code Duplication:** 30-40% reduction in duplicate code
- **Cyclomatic Complexity:** 25-30% average reduction
- **Documentation Coverage:** 80%+ for refactored code

### Performance
- **Bundle Size:** 5-10% reduction
- **Render Performance:** 20-30% improvement in key components
- **Memory Usage:** No increase (ideally 5-10% reduction)

### Functionality
- **New Capabilities:** Feature flag middleware enables easier experimentation
- **Improved Consistency:** Uniform prompts across all AI interactions
- **Better Reliability:** Consolidated image generation with robust fallbacks

### Developer Experience
- **Testability:** 50% more code is independently testable
- **Maintainability:** Clearer code organization and documentation
- **Extensibility:** Easier to add new features and engines

---

## Dependencies & Constraints

### Dependencies
- Workstream 2 (Prompts) should complete before committing Workstream 1 (Feature Flags)
  - Both modify AI engines; coordinate changes
- Workstream 4 (Images) is independent
- Workstream 3 (Refactoring) is independent
- Workstream 5 (Performance) is independent
- Workstream 6 (Analysis) is independent

### Constraints
- **Time Limit:** Target 60 minutes total
- **Scope Control:** Focus on high-impact, low-risk changes
- **Stability:** All changes must maintain functional equivalence
- **Testing:** Must verify TypeScript compilation and dev server startup

---

## Rollback Plan

If any workstream introduces critical issues:

1. **Identify the problematic workstream**
2. **Revert specific files from that workstream**
3. **Keep successful workstream changes**
4. **Document the issue for future retry**

Git strategy:
```bash
# Commit each workstream separately
git add <workstream-1-files> && git commit -m "refactor: workstream 1"
git add <workstream-2-files> && git commit -m "refactor: workstream 2"
# ...

# If workstream N fails, revert only that commit
git revert <commit-hash>
```

---

## Post-Execution Tasks

### Immediate
1. Create comprehensive summary report
2. Update REFACTORING_PLAN.md with results
3. Document any discovered issues
4. Create follow-up task list

### Follow-Up (Future Sessions)
1. Address any remaining TODOs
2. Implement recommendations from Workstream 6
3. Add unit tests for refactored code
4. Performance profiling and optimization

---

## Appendix: File Impact Estimate

### Files to Create (~10)
- `src/utils/featureFlagMiddleware.ts`
- `src/utils/featureFallbacks.ts`
- `src/services/ai/promptTemplates.ts`
- `src/services/ai/promptHelpers.ts`
- `src/services/ai/imageGeneration/ImageGenerationStrategy.ts`
- `src/services/ai/imageGeneration/ImageGenerationOrchestrator.ts`
- `src/services/ai/imageGeneration/imagePromptEnhancer.ts`
- `src/services/ai/imageGeneration/index.ts`
- `docs/STORE_ARCHITECTURE.md`
- `docs/PERFORMANCE_IMPROVEMENTS.md`

### Files to Modify (~20)
- 9 AI engine files (feature flags + prompts)
- 3 AI service files (genkit, unifiedAIService, secureGenkit)
- 1 director file
- 3 image generation files
- 3-5 component files (performance fixes)
- 1-2 store files (bug fixes)

### Total Impact
- **Lines Added:** ~1,500
- **Lines Removed:** ~800
- **Net Change:** +700 (mostly documentation and utilities)
- **Files Modified:** ~30

---

**Status:** ✅ PLAN COMPLETE - READY FOR EXECUTION
