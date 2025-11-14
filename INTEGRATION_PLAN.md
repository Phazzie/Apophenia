# 🚀 Apophenia Integration & Completion Plan

## Context

After 8 parallel agents completed initial implementation, we need to:
1. **Fix Grok Image Integration** - Use grok-2-image-1212 (different endpoint/API from grok-4-fast-reasoning)
2. **Remove Gemini Entirely** - User wants Grok-only (text + image)
3. **Code Review** - Identify and fix all mistakes from parallel development
4. **Integration** - Wire everything together
5. **Testing** - Ensure full app works end-to-end

---

## 📋 INITIAL PLAN v1.0

### Phase 1: Parallel Code Review (4 agents, 15-20 min)

**Agent CR-1: Engine Review Specialist**
- Review all 9 engines for correctness
- Check interface compliance
- Validate priority ordering
- Test activation conditions
- Fix any logic errors

**Agent CR-2: State & Command Review Specialist**
- Review all 4 stores for correctness
- Review all 10 command executors
- Check for race conditions
- Validate store persistence
- Fix any atomicity issues

**Agent CR-3: AI Services Review Specialist**
- Review AI service implementations
- **CRITICAL: Fix Grok image service to use grok-2-image-1212 endpoint**
- **CRITICAL: Remove all Gemini code (AI + image services)**
- Update fallback chain: Grok → Mock only
- Fix prompt building
- Validate response parsing

**Agent CR-4: UI & Flow Review Specialist**
- Review all UI components
- Review flow orchestration
- Check for prop drilling issues
- Validate theme system
- Fix any rendering bugs

### Phase 2: Integration (2 agents, 20-25 min)

**Agent INT-1: Core Integration Engineer**
- Create main App.tsx
- Create config/defaults.ts (zero-config startup)
- Wire stores → engines → flows → commands
- Create game initialization flow
- Handle state transitions

**Agent INT-2: UI Integration Engineer**
- Connect UI components to stores
- Implement choice handling flow
- Add loading states
- Wire corruption effects
- Create error boundaries

### Phase 3: Testing & Fixes (2 agents, 15-20 min)

**Agent TEST-1: E2E Test Engineer**
- Write end-to-end tests
- Test full game flow (menu → descent → unraveling → collapse)
- Test with mock AI (no API keys)
- Test with real Grok API (if keys present)
- Identify integration bugs

**Agent TEST-2: Bug Fix Engineer**
- Fix all TypeScript errors
- Fix all integration bugs
- Fix all test failures
- Ensure build passes
- Ensure lint passes

### Phase 4: Final Polish (1 agent, 10 min)

**Agent POLISH-1: Documentation & Cleanup**
- Update README.md with new architecture
- Create QUICKSTART.md
- Update .env.example
- Clean up old files
- Final commit

---

## 🤔 PLAN CRITIQUE

### Strengths
✅ Parallel execution in Phase 1 (4 agents simultaneously)
✅ Clear separation of concerns
✅ Critical fixes identified (Grok image, Gemini removal)
✅ Progressive refinement (review → integrate → test → polish)

### Weaknesses & Issues

#### Issue 1: **Sequential Dependencies**
❌ **Problem**: Phase 2 can't start until Phase 1 completes (requires reviewed code)
❌ **Impact**: Loses parallelism benefit, extends timeline
🔧 **Fix**: Merge Phase 1 & 2 - agents can review AND fix simultaneously

#### Issue 2: **Gemini Removal Complexity**
❌ **Problem**: Gemini is deeply integrated (AI services, image services, fallbacks, tests, docs)
❌ **Impact**: One agent can't handle all removal in parallel with other work
🔧 **Fix**: Dedicated "Gemini Removal Specialist" that works across all codebase

#### Issue 3: **Grok Image API Misunderstanding**
❌ **Problem**: Current implementation likely uses chat endpoint for images
❌ **Impact**: Images won't generate, critical feature broken
🔧 **Fix**: Dedicated agent to rewrite GrokImageService with correct endpoint

#### Issue 4: **Too Many Agents**
❌ **Problem**: 9 total agents = high coordination overhead
❌ **Impact**: More time spent on coordination than actual work
🔧 **Fix**: Reduce to 4-5 focused agents with broader scope

#### Issue 5: **Missing Critical Path Analysis**
❌ **Problem**: What's the minimum viable work to get app running?
❌ **Impact**: Could waste time on non-critical tasks
🔧 **Fix**: Identify critical path: Grok services + App.tsx + basic wiring

#### Issue 6: **No Rollback Plan**
❌ **Problem**: If integration fails catastrophically, no plan B
❌ **Impact**: Could be stuck with broken code
🔧 **Fix**: Git branch strategy + incremental commits

---

## 📋 REVISED PLAN v2.0 (Implementing Critiques)

### Git Strategy (CRITICAL FIRST STEP)
```bash
# Current state: All agent work on main branch
# Step 1: Create integration checkpoint
git add . && git commit -m "checkpoint: All 8 agents completed"

# Step 2: Work can be reset if needed
git log --oneline  # Note commit hash
```

### Critical Path Focus
**Minimum Viable Integration** = Grok (text + image) + Mock + App.tsx + Basic UI

**Non-Critical (Defer)**: Advanced testing, documentation polish, edge cases

---

## 🚀 FINAL PLAN v2.0 - Parallel Execution

### Phase 1: Critical Fixes (4 agents in parallel, 20-25 min)

**Agent FIX-1: Grok Services Specialist** ⭐ CRITICAL
- **Fix grok-4-fast-reasoning service** (text generation)
  - Verify correct endpoint: `https://api.x.ai/v1/chat/completions`
  - Verify model name: `grok-4-fast-reasoning`
  - Test with simple prompt

- **Rewrite grok-2-image-1212 service** (image generation)
  - Use correct endpoint: `https://api.x.ai/v1/images/generations` ✅ Verified against X.AI API docs (2024-06-01)
  - Model name: `grok-2-image-1212`
  - Response format: `url` or `b64_json`
  - Handle JPG format
  - Price: $0.07/image

- **Update unified service**
  - Fallback chain: Grok Text → Mock Text
  - Image: Grok Image → Unsplash → null

- **Update tests**

**Agent FIX-2: Gemini Removal Specialist** ⭐ CRITICAL
- **Remove from AI services**
  - Delete `src/services/ai/geminiService.ts`
  - Remove from `unifiedAIService.ts` fallback chain
  - Remove from `AIProvider` enum (or keep for backwards compat)

- **Remove from image services**
  - Delete `src/services/images/geminiImageService.ts`
  - Remove from ImagePipeline

- **Remove from tests**
  - Delete all Gemini test files
  - Update integration tests

- **Remove from docs**
  - Update README.md
  - Update SEAMS.md
  - Update AGENT_DEPLOYMENT.md

- **Remove from config**
  - Remove `VITE_GEMINI_API_KEY` from .env.example
  - Update AppConfig interface

**Agent FIX-3: Core Integration Engineer**
- **Create App.tsx**
  - State machine: MENU → GENERATING → DESCENDING → UNRAVELING → COLLAPSED
  - Connect to stores via hooks
  - Render correct screen based on gameState

- **Create config/defaults.ts**
  - Zero-config defaults (works without API keys)
  - Environment variable overrides
  - Feature flags

- **Create game initialization**
  - Initialize stores on mount
  - Load from localStorage if exists
  - Handle new game vs continue

- **Wire stores → UI**
  - Pass worldState, choices, segments as props
  - Pass action callbacks (onChoice, onSave, onReset)

**Agent FIX-4: Type Safety & Build Specialist**
- **Fix all TypeScript errors**
  - Run `tsc --noEmit`
  - Fix type mismatches between old/new code
  - Fix import errors
  - Fix missing types

- **Fix build issues**
  - Run `npm run build`
  - Fix Vite errors
  - Fix dependency issues

- **Update tsconfig.json if needed**
  - Add path aliases
  - Exclude old files

- **Create index.ts barrel exports**
  - Clean public API for each module

---

### Phase 2: Integration Testing (2 agents in parallel, 15-20 min)

**Agent TEST-1: E2E Flow Tester**
- **Test new game flow**
  - Start screen → genre selection
  - Initialize game with mock AI
  - First choice → AI generation → commands
  - Verify state updates

- **Test descent progression**
  - Make 5-10 choices
  - Verify horror increases
  - Verify corruption increases
  - Verify engines activate

- **Test transitions**
  - Descent → Unraveling (at 70%)
  - Unraveling → Collapsed (at 90%)

- **Test with real Grok** (if API key available)
  - Text generation
  - Image generation
  - Error handling

**Agent TEST-2: Bug Fix & Polish**
- **Fix bugs found by TEST-1**
  - State synchronization issues
  - Command execution errors
  - UI rendering bugs

- **Run full test suite**
  - `npm test`
  - Fix failing tests
  - Ensure 80%+ coverage

- **Final build verification**
  - `npm run build` succeeds
  - `npm run lint` passes
  - No console errors in dev mode

---

### Phase 3: Documentation & Commit (1 agent, 10 min)

**Agent DOC-1: Final Polish**
- **Update README.md**
  - New architecture overview
  - Grok-only setup instructions
  - Quick start guide

- **Create QUICKSTART.md**
  - 5-minute getting started
  - API key setup (Grok only)
  - First game walkthrough

- **Update .env.example**
  ```
  VITE_XAI_API_KEY=your-xai-api-key-here
  # For Grok-4-fast-reasoning (text) and Grok-2-image-1212 (images)
  ```

- **Final commit & push**
  - Comprehensive commit message
  - Push to branch

---

## ⏱️ Timeline Estimate

- **Phase 1 (Parallel)**: 20-25 minutes
- **Phase 2 (Parallel)**: 15-20 minutes
- **Phase 3 (Single)**: 10 minutes
- **Total**: ~45-55 minutes

---

## 🎯 Success Criteria

✅ App boots without errors
✅ Works with mock AI (no API keys)
✅ Works with Grok API (if keys present)
✅ Text generation functional
✅ Image generation functional (grok-2-image-1212)
✅ All 9 engines operational
✅ State persistence working
✅ TypeScript build passes (0 errors)
✅ Tests pass (80%+ coverage)
✅ Gemini completely removed
✅ Clean git history with good commits

---

## 🚨 Rollback Plan

If catastrophic failure:
```bash
git reset --hard <checkpoint-commit>
git push -f origin claude/restructure-app-from-scratch-*
```

Then debug incrementally with smaller changes.

---

## 📊 Agent Assignment Summary

| Phase | Agent | Focus | Critical |
|-------|-------|-------|----------|
| 1 | FIX-1 | Grok Text + Image Services | ⭐⭐⭐ |
| 1 | FIX-2 | Gemini Removal | ⭐⭐⭐ |
| 1 | FIX-3 | App Integration | ⭐⭐⭐ |
| 1 | FIX-4 | TypeScript & Build | ⭐⭐ |
| 2 | TEST-1 | E2E Testing | ⭐⭐ |
| 2 | TEST-2 | Bug Fixes | ⭐⭐ |
| 3 | DOC-1 | Documentation | ⭐ |

---

This plan addresses all critique points and provides a clear execution path!
