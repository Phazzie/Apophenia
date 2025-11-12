# CLAUDE.md Update Standards for Apophenia

**Version**: 1.0
**Last Updated**: 2025-11-12
**Status**: ACTIVE STANDARD

---

## Table of Contents

1. [Purpose & Philosophy](#purpose--philosophy)
2. [Audience Definition](#audience-definition)
3. [Current State Analysis](#current-state-analysis)
4. [Required Updates for This Session](#required-updates-for-this-session)
5. [Structure Guidelines](#structure-guidelines)
6. [Content Principles](#content-principles)
7. [Maintenance Schedule](#maintenance-schedule)
8. [Special Considerations](#special-considerations)
9. [Quality Checklist](#quality-checklist)
10. [Update Workflow](#update-workflow)

---

## Purpose & Philosophy

### Why CLAUDE.md Exists

**CLAUDE.md is the single source of truth for AI assistants working on Apophenia.**

Unlike human-focused documentation (README.md, API docs), CLAUDE.md is optimized for:
- **AI comprehension speed** - Fast context loading in <10 seconds
- **Actionable guidance** - "What to do" not just "what exists"
- **Anti-pattern warnings** - Critical mistakes to avoid
- **Current state awareness** - What's working, what's broken, what's in progress
- **Quick decision-making** - Immediate answers to "should I do X?"

### Core Philosophy

**Progressive Disclosure**: Start with the essentials, drill down on demand.

```
Level 1: Executive Summary (5-10 lines) → "What is this project?"
Level 2: Critical Context (50-100 lines) → "What do I need to know RIGHT NOW?"
Level 3: Deep Dives (linked sections) → "How does X work in detail?"
```

**Truth Over Polish**:
- It's better to document a known bug than pretend everything is perfect
- Honest status > marketing speak
- "Currently broken" > silence

**Maintainability First**:
- If updates take >30 minutes, the structure is wrong
- If information is duplicated, consolidate it
- If a section hasn't been updated in 3+ months, it's probably outdated

---

## Audience Definition

### Primary Audience: AI Coding Assistants

**Who reads this:**
- Claude (Anthropic) - Advanced reasoning, multi-file context
- GitHub Copilot - Code completion, inline suggestions
- GPT-4/ChatGPT (OpenAI) - Conversational development
- Gemini (Google) - Multi-modal assistance
- Cursor/Windsurf AI - IDE-integrated assistants

**What they need:**
1. **Fast context loading** - Understand project in <30 seconds
2. **Architecture clarity** - Know where things go and why
3. **Anti-pattern warnings** - Avoid common mistakes
4. **Current status** - What's stable, what's in flux
5. **Decision frameworks** - "When to use X vs Y"

### Secondary Audience: Human Developers (Onboarding)

**Use case:** New developers getting up to speed

**What they need:**
- High-level architecture overview
- Key principles and patterns
- Where to find detailed documentation
- Who to ask for help

**Note:** Humans should read CLAUDE.md FIRST, then dive into README.md, SEAMS.md, etc.

### Tertiary Audience: Future Self

**Use case:** Coming back to project after 6+ months

**What they need:**
- "Why did we make this decision?"
- "What were we working on?"
- "What's the current state?"
- "What were the known issues?"

---

## Current State Analysis

### What Exists Today (2025-11-12)

**Status**: ❌ **CLAUDE.md DOES NOT EXIST YET**

**Existing AI Assistant Documentation**:
1. `.github/copilot-instructions.md` (655 lines)
   - Comprehensive Copilot guide
   - Excellent technical depth
   - Focus: Code-level guidance for Copilot

2. `.github/agents.md` (398 lines)
   - AI agent-specific instructions
   - Advanced architectural patterns
   - Focus: Conversational AI assistants (Claude, GPT-4)

3. `README.md` (387 lines)
   - User-facing documentation
   - Deployment guides
   - Project marketing

**Problems with Current State**:
- ❌ **No unified entry point** - AI assistants don't know which file to read first
- ❌ **Information scattered** - Architecture info in multiple files
- ❌ **Duplication** - Same concepts explained differently in each file
- ❌ **No current status** - Files don't reflect recent work (engine refactor)
- ❌ **No anti-patterns** - Missing critical "DON'T DO THIS" warnings
- ❌ **No quick reference** - Can't answer "where is X?" in 5 seconds

**Recommendation**: Create CLAUDE.md as the **master index** that references other docs while providing critical quick-reference information.

---

## Required Updates for This Session

### Context: Recent Major Work

**Completed Work (November 2025)**:
1. ✅ **Engine Refactor Complete** - All 9 revolutionary AI engines rebuilt
   - 2,015 lines of engine code
   - 886 lines of test code
   - Pure TypeScript, stateless design
   - Full interface compliance with seams.ts

2. ✅ **SDD Compliance Analysis** - Comprehensive audit completed
   - Current: Level 2 (BETTER) compliance
   - Target: Level 3 (BEST) compliance
   - 40 TypeScript errors identified (likely fixed)
   - 35 `as any` type escapes documented
   - Contract test requirements defined

3. ✅ **Phase 2 Testing & Integration** - Bug fixes and validation
   - Integration testing completed
   - Known issues documented

4. ✅ **Documentation Updates** - Multiple major docs created/updated
   - DATA-BOUNDARIES.md (595 lines)
   - CONTRACT-BLUEPRINT.md created
   - SDD_COMPLIANCE_ANALYSIS.md (328 lines)
   - ENGINE_IMPLEMENTATION_REPORT.md (404 lines)

### What CLAUDE.md Should Include (Initial Version)

**Section 1: Project Identity** (30 lines)
- What is Apophenia?
- Core technology stack
- Architecture pattern (seams-based)
- Current status (Level 2 SDD compliance)

**Section 2: Critical Context** (50 lines)
- Recent major work (engine refactor)
- Current known issues (TypeScript errors, type escapes)
- Architecture principles (command-driven, stateless engines)
- Key anti-patterns (direct store mutations, missing segmentId)

**Section 3: Quick Reference** (40 lines)
- File structure map
- "Where is X?" guide
- Command patterns
- State management rules

**Section 4: Current Status** (30 lines)
- What's working (9 engines, test suite)
- What's in progress (SDD Level 3 validation)
- What's broken (contract tests missing)
- What's next (integration readiness)

**Section 5: Success Stories** (20 lines)
- Engine refactor (parallel agents)
- SDD compliance progress
- Test coverage achievements

**Section 6: Architecture Deep Dive** (60 lines)
- Seams overview (link to SEAMS.md)
- Command system
- Engine system
- State management
- AI integration

**Section 7: AI Assistant Guidelines** (40 lines)
- How to use parallel agents
- When to update CLAUDE.md
- How to maintain SDD compliance
- Decision frameworks

**Total**: ~270 lines (optimal length for fast AI comprehension)

---

## Structure Guidelines

### Required Sections (Level 1)

Every CLAUDE.md must have these sections in this order:

```markdown
# Apophenia - AI Assistant Guide

**ALWAYS read this file first before making changes.**

## Executive Summary
[3-5 sentences: What is this project? What's its current state?]

## Critical Context
[10-15 lines: What do I absolutely need to know RIGHT NOW?]

## Quick Reference
[Where is X? Fast lookup for common questions]

## Current Status
[What's working, what's broken, what's in progress]

## Architecture Overview
[High-level system design with links to detailed docs]

## Anti-Patterns & Gotchas
[Critical mistakes to avoid, with examples]

## Recent Work
[Last 3-5 major updates, reverse chronological]

## AI Assistant Guidelines
[How to work effectively on this project]

## External Documentation Index
[Links to other important docs with descriptions]
```

### Optional Sections (Level 2)

Add these as needed:

- **Testing Strategy** - How to test changes
- **Deployment Guide** - How to deploy safely
- **Performance Considerations** - Known bottlenecks
- **Security Notes** - Critical security concerns
- **Debugging Tips** - How to troubleshoot common issues
- **Success Stories** - What went well and why
- **Lessons Learned** - What went wrong and why

### Section Ordering Principles

1. **Fastest value first** - Most critical info at top
2. **Logical progression** - Each section builds on previous
3. **External links last** - Keep readers in the document until they need more
4. **Status before history** - Current state before past work

---

## Content Principles

### 1. Accuracy & Currentness

**Rule**: Information must be current within 1 week maximum.

**Bad**:
```markdown
## Current Status
We're working on implementing the engine system.
```
*(Written 3 months ago, engines are done)*

**Good**:
```markdown
## Current Status (Last Updated: 2025-11-12)
✅ All 9 engines implemented and tested (2,015 LOC)
⚠️ SDD Level 2 compliance - targeting Level 3
🔴 40 TypeScript errors to fix (see SDD_COMPLIANCE_ANALYSIS.md)
```

**Enforcement**:
- Add "Last Updated" dates to time-sensitive sections
- Mark information as "As of [date]" when referencing specific states
- Update Current Status section with EVERY significant change

### 2. AI-Friendly Formatting

**Scannable Structure**:
```markdown
✅ Use emoji/symbols for quick scanning
📋 Lists over paragraphs
🔗 Links to details, summaries inline
⚠️ Warnings stand out
❌ Anti-patterns clearly marked
```

**Code Examples**:
```markdown
// GOOD: Show correct pattern
const updateSegment = (segmentId: string, data: Partial<Segment>) => {
  useGameStore.getState().updateSegment(segmentId, data);
};

// BAD: Show anti-pattern with explanation
const updateSegment = () => {
  const segments = useGameStore.getState().segments;
  segments[segments.length - 1].text = "New text"; // ❌ Direct mutation
};
```

**Decision Tables**:
```markdown
| Situation | Action | Rationale |
|-----------|--------|-----------|
| Adding new feature | Create seam first | SDD compliance |
| Fixing bug | Check for tests | Prevent regression |
| Refactoring | Use parallel agents | Speed + safety |
```

### 3. Quick Reference Capability

**"Where is X?" should be answerable in 5 seconds**

**Bad**:
```markdown
The state management is handled by Zustand stores which are located
in the stores directory. We have several stores for different purposes.
```

**Good**:
```markdown
## Quick Reference: Where is X?

| What | Where | Key Files |
|------|-------|-----------|
| Game state | `src/stores/` | `gameStateStore.ts`, `worldStateStore.ts` |
| Engines | `src/core/engines/` | All 9 engine files + `EngineRegistry.ts` |
| Commands | `src/commands/` | Individual command executors |
| AI services | `src/services/ai/` | `grokService.ts`, `unifiedAIService.ts` |
| Tests | `tests/` | `unit/`, `integration/`, `contracts/` |
```

### 4. Progressive Disclosure

**Summary → Details pattern**

**Level 1** (inline):
```markdown
## State Management
Uses Zustand stores with immutable updates. **ALWAYS update by segmentId, never by index.**
```

**Level 2** (expandable):
```markdown
<details>
<summary>State Management Details</summary>

### Stores
- **gameStateStore.ts**: Story segments, choices, current state
- **worldStateStore.ts**: Game world, corruption, horror intensity
- **historyStore.ts**: Player choices, decision tracking
- **profileStore.ts**: Psychological profile, fear analysis

### Update Pattern
```typescript
// Correct: Update by ID
useGameStore.getState().updateSegment(segmentId, { text: "new" });

// Wrong: Update by index
segments[segments.length - 1] = newSegment; // ❌ NEVER DO THIS
```
</details>
```

**Level 3** (external link):
```markdown
For complete state management architecture, see [STATE_MANAGEMENT_DELIVERY_REPORT.md](../STATE_MANAGEMENT_DELIVERY_REPORT.md)
```

### 5. Actionable Guidance

**Show "what to do", not just "what exists"**

**Bad** (descriptive only):
```markdown
The project uses TypeScript with strict mode enabled.
```

**Good** (actionable):
```markdown
**Before committing:**
```bash
npx tsc --noEmit  # Must pass with 0 errors
npm test          # Must pass with 0 failures
npm run build     # Must build successfully
```
**If TypeScript errors:** See `SDD_COMPLIANCE_ANALYSIS.md` section 4.
```

**Decision Framework Example**:
```markdown
## When to Deploy Parallel Agents

✅ **Use parallel agents when:**
- Tasks touch different files/modules
- Tasks are >1 hour of work each
- Tasks can be validated independently
- You can monitor 3-5 agents simultaneously

❌ **Don't use parallel agents when:**
- Tasks share the same files
- Tasks have dependencies (B needs A's output)
- Tasks are <30 minutes each
- Task requires human judgment
```

---

## Maintenance Schedule

### When to Update CLAUDE.md

**REQUIRED Updates (must happen within 24 hours)**:

1. **Major architectural changes**
   - New seam added/removed
   - Core pattern changed (e.g., command system redesign)
   - Technology stack changes (e.g., Zustand → Redux)

2. **Breaking changes**
   - API contract changes
   - Interface modifications
   - State shape changes

3. **Critical bugs discovered**
   - Security vulnerabilities
   - Data corruption risks
   - Integration blockers

4. **Project status changes**
   - Milestone completions (Phase 1 → Phase 2)
   - Compliance level changes (Level 2 → Level 3)
   - Major refactor completions

**RECOMMENDED Updates (within 1 week)**:

5. **New features added**
   - New engine implemented
   - New AI service integrated
   - New command type added

6. **Documentation created**
   - New architecture docs
   - New guides or standards
   - Test reports or analysis docs

7. **Known issues resolved**
   - TypeScript errors fixed
   - Type escapes eliminated
   - Contract tests added

8. **Anti-patterns discovered**
   - New gotcha identified
   - Common mistake pattern found
   - Integration issue documented

**OPTIONAL Updates (monthly)**:

9. **Performance improvements**
   - Optimization completed
   - Benchmarks updated
   - Caching strategies added

10. **Refactoring (non-breaking)**
    - Code cleanup
    - Test improvements
    - Documentation polish

### Update Frequency Guidelines

```markdown
| Section | Update Frequency | Trigger |
|---------|------------------|---------|
| Executive Summary | Monthly | Major milestones |
| Critical Context | Weekly | Significant changes |
| Current Status | Every PR merge | State changes |
| Quick Reference | When adding files | New modules |
| Architecture Overview | Quarterly | Architecture evolution |
| Anti-Patterns | As discovered | New gotchas found |
| Recent Work | Every completion | Work finishes |
| AI Guidelines | Quarterly | Process improvements |
```

### Version Control

**Use semantic versioning for major changes:**

```markdown
# Apophenia - AI Assistant Guide
**Version**: 2.1.0
**Last Updated**: 2025-11-12
```

- **Major (2.0.0)**: Complete restructure or rewrite
- **Minor (2.1.0)**: New sections added, significant content changes
- **Patch (2.1.1)**: Corrections, clarifications, status updates

---

## Special Considerations

### 1. How to Document "Critical" vs "Nice to Know"

**Critical Information** (Must be in main document):
- ✅ Architecture principles that MUST be followed
- ✅ Anti-patterns that WILL cause bugs
- ✅ Current blockers that WILL prevent progress
- ✅ Integration requirements that MUST be met

**Formatting**:
```markdown
## Critical Anti-Patterns

### ❌ NEVER Update State by Array Index

**Why**: Async operations can cause race conditions.

**Bad**:
```typescript
segments[segments.length - 1].text = "new text"; // ❌ WILL BREAK
```

**Good**:
```typescript
updateSegment(segmentId, { text: "new text" }); // ✅ SAFE
```

**Impact**: Direct mutations cause React re-render issues and data loss.
```

**Nice-to-Know Information** (Link to external docs):
- ℹ️ Historical context ("Why we chose X")
- ℹ️ Detailed implementation guides
- ℹ️ Alternative approaches considered
- ℹ️ Future enhancement ideas

**Formatting**:
```markdown
## State Management

Zustand stores with immutable updates. **Key rule: Update by segmentId, not index.**

<details>
<summary>📚 Why we chose Zustand over Redux</summary>
[Historical context here...]
</details>

For complete architecture details, see [STATE_MANAGEMENT_DELIVERY_REPORT.md](../STATE_MANAGEMENT_DELIVERY_REPORT.md)
```

### 2. How to Show Current Status vs History

**Current Status** (Top of document, always visible):
```markdown
## Current Status (2025-11-12)

### ✅ Working
- 9 revolutionary engines implemented (2,015 LOC)
- 50+ tests passing (unit + integration)
- Development server stable
- Mock AI mode fully functional

### ⚠️ In Progress
- SDD Level 3 compliance (targeting 0 TypeScript errors)
- Contract test suite (6 seams covered, 3 remaining)
- Real service integration validation

### 🔴 Known Issues
- 40 TypeScript errors remaining (see `SDD_COMPLIANCE_ANALYSIS.md`)
- 35 `as any` type escapes to eliminate
- Missing contract tests for AI services seam
```

**History** (Bottom of document, collapsed by default):
```markdown
<details>
<summary>📜 Recent Work History</summary>

### 2025-11-12: Engine Refactor Complete
- All 9 engines rebuilt as pure TypeScript classes
- 2,015 lines of engine code + 886 lines of tests
- Full interface compliance with seams.ts
- **Report**: `ENGINE_IMPLEMENTATION_REPORT.md`

### 2025-11-11: SDD Compliance Analysis
- Comprehensive audit completed
- Current: Level 2, Target: Level 3
- Identified 40 TypeScript errors, 35 type escapes
- **Report**: `SDD_COMPLIANCE_ANALYSIS.md`

### 2025-11-10: Phase 2 Testing Complete
- Integration testing finished
- Bug fixes deployed
- **Report**: `PHASE2_BUG_FIX_REPORT.md`

</details>
```

**Principle**: **Status is a snapshot, History is a timeline.**

### 3. How to Link to Detailed Documentation

**Pattern**: Brief inline summary + link to details

```markdown
## Architecture: Seams-Based Design

Apophenia uses **Seam-Driven Development** with 9 major architectural seams:
1. Core Types Layer
2. State Store Interface
3. Engine Interface
4. AI Service Interface
5. Flow Orchestrator Interface
6. Image Service Interface
7. Command Executor Interface
8. UI Component Interface
9. Game Controller Interface

**Key principle**: Each seam has defined contracts that enable parallel development.

📖 **Full Details**: [SEAMS.md](../SEAMS.md) (600+ lines)
📋 **Data Boundaries**: [DATA-BOUNDARIES.md](../DATA-BOUNDARIES.md) (595 lines)
🎯 **Contract Blueprint**: [CONTRACT-BLUEPRINT.md](../CONTRACT-BLUEPRINT.md)
```

**Link Context**: Always explain what's in the linked doc
```markdown
❌ Bad: See SEAMS.md for more information.
✅ Good: See SEAMS.md (9 seam definitions with TypeScript interfaces)
```

### 4. How to Format Code Examples

**Pattern**: Good vs Bad with explanations

```markdown
### Command Creation Pattern

**✅ CORRECT: Type-safe command with metadata**
```typescript
const createDisplayTextCommand = (
  segmentId: SegmentId,
  text: string
): DisplayTextCommand => ({
  type: 'DISPLAY_TEXT',           // Discriminated union
  payload: { segmentId, text },   // Required fields
  metadata: {
    correlationId: generateCorrelationId(),
    timestamp: Date.now()
  }
});
```

**❌ INCORRECT: Unsafe command creation**
```typescript
const badCommand = {
  type: 'DISPLAY_TEXT',
  payload: { text: "Some text" }  // ❌ Missing segmentId
  // ❌ Missing metadata
};
```

**Why this matters**: Type-safe commands prevent runtime errors and enable proper async handling.
```

**Real-World Example**:
```markdown
### State Update Anti-Pattern

**Story**: In Phase 1, we had 12 bugs caused by updating segments by index instead of ID.

**The Bug**:
```typescript
// This caused race conditions when multiple async operations ran
const lastSegment = segments[segments.length - 1];
lastSegment.text = newText; // ❌ Mutated while other operations in flight
```

**The Fix**:
```typescript
// Atomic update by unique ID
updateSegment(segmentId, { text: newText }); // ✅ Safe for async
```

**Result**: 0 state synchronization bugs in Phase 2.
```

### 5. How to Document Workflows

**Pattern**: Step-by-step with decision points

```markdown
## AI Assistant Workflow: Adding a New Feature

### Step 1: Check Current Status
```bash
# Verify project builds
npm run build && npm test
```
- ✅ Builds successfully → Proceed to Step 2
- ❌ Build fails → Fix errors first (see `SDD_COMPLIANCE_ANALYSIS.md`)

### Step 2: Identify Seam
**Question**: Which seam does this feature touch?
- Command system → Add command type to `src/types.ts`
- Engine behavior → Create new engine in `src/core/engines/`
- AI integration → Modify `src/services/ai/`

📖 See [SEAMS.md](../SEAMS.md) section 2 for seam definitions

### Step 3: Define Contract
```typescript
// Define interface FIRST
interface NewFeature {
  readonly id: string;
  process(input: FeatureInput): Promise<FeatureOutput>;
}
```

### Step 4: Create Mock
```typescript
// Mock implementation for testing
class MockNewFeature implements NewFeature {
  // Must exactly match interface
}
```

### Step 5: Write Contract Tests
```typescript
// Validate mock matches interface
describe('NewFeature Contract', () => {
  it('should implement all interface methods', () => {
    // Test contract compliance
  });
});
```

### Step 6: Implement Real Service
```typescript
// Real implementation
class RealNewFeature implements NewFeature {
  // Same interface as mock
}
```

### Step 7: Integrate
```typescript
// Swap mock for real
const feature = USE_MOCK ? new MockNewFeature() : new RealNewFeature();
```

✅ **Success**: Feature integrates on first try (SDD compliance)
```

---

## Quality Checklist

Before considering a CLAUDE.md update complete, verify:

### Content Quality

- [ ] **Accuracy**: All information is current as of update date
- [ ] **Completeness**: All critical information is present
- [ ] **Clarity**: AI assistant can understand in first read
- [ ] **Actionability**: Clear "what to do" guidance provided
- [ ] **Examples**: Code examples show good and bad patterns
- [ ] **Links**: All external references are valid and described

### Structure Quality

- [ ] **Ordering**: Most critical information appears first
- [ ] **Sections**: All required sections present (Executive Summary, Critical Context, Quick Reference, Current Status, Architecture, Anti-Patterns, Recent Work, AI Guidelines)
- [ ] **Headers**: Descriptive and scannable
- [ ] **Lists**: Used instead of long paragraphs where appropriate
- [ ] **Tables**: Complex comparisons presented in table format
- [ ] **Progressive Disclosure**: Details hidden until needed

### Formatting Quality

- [ ] **Emoji/Symbols**: Used for quick scanning (✅ ❌ ⚠️ 🔴 📖)
- [ ] **Code Blocks**: Properly syntax highlighted
- [ ] **Comparisons**: Good vs Bad examples provided
- [ ] **Whitespace**: Adequate spacing between sections
- [ ] **Line Length**: No lines >120 characters (readability)
- [ ] **Headings**: Consistent hierarchy (## for major, ### for sub)

### Metadata Quality

- [ ] **Version**: Semantic version number present
- [ ] **Date**: "Last Updated" timestamp current
- [ ] **Status Tags**: Current status clearly marked (✅ ⚠️ 🔴)
- [ ] **Section Dates**: Time-sensitive sections have "As of" dates
- [ ] **Change Log**: Major changes documented in history

### AI Optimization

- [ ] **Fast Comprehension**: Can be read in <5 minutes
- [ ] **Quick Reference**: "Where is X?" answerable in <10 seconds
- [ ] **Decision Support**: Clear guidance for common decisions
- [ ] **Error Prevention**: Anti-patterns clearly documented
- [ ] **Context Complete**: Enough info to start contributing immediately

### Maintenance Quality

- [ ] **Update Triggers**: Clear rules for when to update
- [ ] **Update Process**: Simple update workflow documented
- [ ] **Ownership**: Clear who maintains this file
- [ ] **Review Process**: Updates reviewed before merge
- [ ] **Automation**: Auto-checks for stale information (if possible)

---

## Update Workflow

### Process: Updating CLAUDE.md

**Step 1: Identify Trigger**
- Did a required or recommended trigger occur? (See Maintenance Schedule)
- Is the information >1 week old?
- Did project status change significantly?

**Step 2: Gather Context**
```bash
# Review recent work
git log --oneline -10
git diff HEAD~10 --stat

# Check project status
npm run build 2>&1 | tee current-status.log
npm test 2>&1 | tee test-status.log
npx tsc --noEmit 2>&1 | tee typescript-status.log

# Review documentation updates
ls -lt *.md | head -10
```

**Step 3: Update Relevant Sections**

**Current Status** (always update):
```markdown
## Current Status (2025-11-[date])

### ✅ Working
[What's stable and functional]

### ⚠️ In Progress
[What's being worked on]

### 🔴 Known Issues
[What's broken or blocked]
```

**Recent Work** (add new entry at top):
```markdown
### 2025-11-[date]: [Work Title]
- [Key accomplishment 1]
- [Key accomplishment 2]
- **Report**: [Link to detailed doc]
```

**Critical Context** (if architecture changed):
```markdown
## Critical Context

**Recent change**: [What changed and why it matters]
```

**Anti-Patterns** (if new gotcha discovered):
```markdown
### ❌ [Anti-Pattern Name]

**What**: [Description]
**Why it's bad**: [Consequences]
**Instead do**: [Correct pattern]
```

**Step 4: Validate Update**
- [ ] Run Quality Checklist (above)
- [ ] Test that links work
- [ ] Verify code examples compile
- [ ] Check that dates are current
- [ ] Ensure version number updated

**Step 5: Commit Update**
```bash
# If CLAUDE.md doesn't exist yet, create it
git add CLAUDE.md

# Commit with descriptive message
git commit -m "docs: Update CLAUDE.md - [what changed]

- Updated Current Status (Level 3 compliance achieved)
- Added anti-pattern: direct state mutation
- Documented engine refactor completion
- Version 2.1.0"
```

**Step 6: Announce Update**
- [ ] Mention in PR description
- [ ] Add comment explaining changes
- [ ] Update other AI assistant docs if needed (.github/agents.md, .github/copilot-instructions.md)

---

## Implementation Notes

### Creating the Initial CLAUDE.md

**For Apophenia specifically**, the initial CLAUDE.md should include:

1. **Executive Summary** (30 lines)
   - Project identity: Apophenia = AI-driven cosmic horror game
   - Stack: React + TypeScript + Zustand
   - Architecture: Seams-based (SDD approach)
   - Current status: Level 2 SDD compliance, 9 engines complete

2. **Critical Context** (50 lines)
   - Engine refactor completed (2,015 LOC)
   - SDD compliance status (40 TS errors, 35 type escapes)
   - Key principles: Command-driven, stateless engines, update by segmentId
   - Top 3 anti-patterns to avoid

3. **Quick Reference** (40 lines)
   - File structure map
   - "Where is X?" table
   - Command patterns
   - State management rules

4. **Current Status** (30 lines)
   - ✅ Working: 9 engines, tests, dev server
   - ⚠️ In Progress: Level 3 compliance
   - 🔴 Known Issues: TypeScript errors, type escapes

5. **Architecture Overview** (60 lines)
   - Seams overview with links
   - Command system
   - Engine system
   - State management
   - AI integration points

6. **Anti-Patterns** (40 lines)
   - Direct state mutations
   - Missing segmentId
   - Using `as any`
   - Skipping contract tests

7. **Recent Work** (30 lines)
   - Engine refactor (Nov 12)
   - SDD compliance analysis (Nov 11)
   - Phase 2 testing (Nov 10)

8. **AI Assistant Guidelines** (40 lines)
   - SDD workflow
   - Parallel agent guidelines
   - When to update CLAUDE.md

9. **External Docs Index** (20 lines)
   - Links to SEAMS.md, README.md, etc.

**Total**: ~340 lines (optimal for comprehensive initial version)

---

## Success Metrics

### How to Measure CLAUDE.md Quality

**Quantitative Metrics**:
- ⏱️ **Time to Comprehension**: AI assistant can understand project in <5 minutes
- 🎯 **Time to First Contribution**: New AI can make valid PR in <30 minutes
- 🔍 **Search Success Rate**: "Where is X?" answered in <10 seconds
- 📊 **Freshness**: Current Status section <1 week old
- ✅ **Accuracy**: 0 outdated information found during audit

**Qualitative Metrics**:
- 🤖 **AI Feedback**: AI assistants report feeling "well-informed"
- 👤 **Human Feedback**: Developers say "I read CLAUDE.md first"
- 🐛 **Bug Prevention**: Fewer anti-pattern bugs in PRs
- 🚀 **Productivity**: Faster parallel agent deployment
- 📚 **Maintenance**: Updates take <30 minutes

**Red Flags** (indicators of poor quality):
- ❌ AI assistants ask basic questions answered in CLAUDE.md
- ❌ PRs violate documented anti-patterns
- ❌ Updates take >1 hour
- ❌ Information contradicts other docs
- ❌ Section dates >1 month old

---

## Maintenance Responsibilities

### Who Maintains CLAUDE.md?

**Primary Owner**: Project architect/lead

**Update Triggers**:
- **Lead**: Major architectural changes, status updates
- **Feature developers**: New features, anti-patterns discovered
- **DevOps**: Deployment changes, CI/CD updates
- **AI assistants**: Can propose updates via PR

**Review Process**:
- All CLAUDE.md updates require review by project lead
- Updates >100 lines require two reviewers
- Breaking changes require explicit approval

**Automation Opportunities**:
- Auto-detect stale "Last Updated" dates (>1 month)
- Auto-generate "Recent Work" from git commits
- Auto-check links for validity
- Auto-run Quality Checklist via CI

---

## Conclusion

**CLAUDE.md is the single source of truth for AI assistants working on Apophenia.**

By following these standards, we ensure:
- ✅ **Fast onboarding** - AI assistants productive in minutes
- ✅ **Accurate information** - Always reflects current state
- ✅ **Error prevention** - Anti-patterns clearly documented
- ✅ **Maintainability** - Updates are quick and straightforward
- ✅ **Scalability** - Supports parallel agent development

**Remember**:
- Truth over polish
- Actionable over descriptive
- Current over historical
- Quick reference over deep dives
- Examples over explanations

**Update CLAUDE.md often. Keep it honest. Keep it current. Keep it short.**

---

**Next Action**: Create initial CLAUDE.md using this standard as a guide.

**Reference Documents**:
- [SEAMS.md](../SEAMS.md) - Architectural seams
- [SDD_COMPLIANCE_ANALYSIS.md](../SDD_COMPLIANCE_ANALYSIS.md) - Compliance status
- [ENGINE_IMPLEMENTATION_REPORT.md](../ENGINE_IMPLEMENTATION_REPORT.md) - Engine refactor
- [README.md](../README.md) - Project overview
- [.github/agents.md](../.github/agents.md) - AI agent guidelines
- [.github/copilot-instructions.md](../.github/copilot-instructions.md) - Copilot guide

---

**Document Status**: ✅ COMPLETE
**Version**: 1.0
**Created**: 2025-11-12
**Author**: Claude Code
**Purpose**: Define world-class standards for CLAUDE.md maintenance
