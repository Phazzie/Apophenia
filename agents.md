```markdown
# AI Agent Architecture

This document outlines the architecture of the AI agents used in Apophenia, both for in-game AI (AI Director) and development workflow (GitHub Copilot coding agents).

## In-Game AI: The AI Director

The AI Director is the primary agent responsible for orchestrating the player's experience. It is a sophisticated AI that uses a multi-layered approach to generate and manage the game's narrative.

### Core Responsibilities

- **Narrative Generation:** The AI Director generates the game's story, including the text, choices, and images that the player experiences.
- **Player Modeling:** The AI Director models the player's psychological state and tailors the narrative to create a personalized horror experience.
- **Game State Management:** The AI Director manages the game's state, including the world state, the player's inventory, and the status of the various AI engines.

### AI Engines

The AI Director uses a suite of specialized AI engines to modulate the player's experience. Each engine is responsible for a specific aspect of the game's horror.

- **Temporal Revision Engine:** This engine is responsible for creating a sense of unease and paranoia by retroactively modifying past story segments.
- **Quantum Narrative Engine:** This engine is responsible for creating a sense of disorientation and confusion by maintaining multiple parallel story threads.
- **Reality Corruption Engine:** This engine is responsible for creating a sense of dread and helplessness by progressively distorting the game's UI.
- **Adaptive Horror Engine:** This engine is responsible for creating a personalized horror experience by building a psychological profile of the player.
- **Meta-Consciousness Engine:** This engine is responsible for creating a sense of self-aware horror by occasionally breaking the fourth wall and directly addressing the player.
- **Neural Echo Chambers:** This engine is responsible for creating a sense of being trapped and manipulated by maintaining a persistent psychological profile of the player across multiple gaming sessions.
- **Semantic Choice Archaeology:** This engine is responsible for creating a sense of being watched and understood by analyzing the player's choice patterns.
- **Adaptive Narrative DNA:** This engine is responsible for creating a sense of a living and evolving world by adapting and mutating the game's narrative over time.
- **Breaking the Fifth Wall:** This engine is responsible for creating a sense of true cosmic horror by manipulating the browser environment itself.

---

## Development AI: GitHub Copilot Coding Agents

GitHub Copilot coding agents are autonomous AI developers that can implement features, fix bugs, and refactor code.

### When to Use Coding Agents

**✅ Deploy agents for:**
- Large features (1+ days of work)
- Performance optimizations with metrics
- Comprehensive audits (multi-file analysis)
- Refactoring with clear scope
- Tasks that can be parallelized

**❌ Don't use agents for:**
- Small bugs (< 50 lines)
- Documentation-only changes
- Quick config tweaks
- Exploratory work
- Design decisions requiring human judgment

### Critical Rule: One Agent = One PR

**Each agent should work in a separate branch/PR.**

```bash
# ✅ CORRECT
Agent 1 → PR "feat/analytics-dashboard"
Agent 2 → PR "perf/image-optimization"
Agent 3 → PR "refactor/ai-prompts"

# ❌ WRONG - Multiple agents in same PR
All agents → PR "big-update" (conflicts, unclear ownership)
```

**Exception**: Agents can share a PR only when:
- Tasks are strictly sequential (B depends on A)
- Tasks are tightly coupled (feature + tests)
- Total scope is small (< 500 lines)

### Agent Performance Reality

**CRITICAL**: Agents complete tasks in **7-15 minutes**, not hours/days!

| Human Estimate | Agent Reality | Commits |
|---------------|---------------|----------|
| "1-2 days" | **7-15 min** | 3-5 commits |
| "3-5 days" | **15-30 min** | 5-10 commits |
| "1 week" | **30-60 min** | 10-20 commits |

**Actual agent workflow:**
1. Planning (1-2 min)
2. Implementation (5-12 min, commits every 2-3 min)
3. Testing (1-3 min)
4. Documentation (1-2 min)

**Monitor progress:**
- Check commits every **10-15 minutes** (not hours!)
- If no commits for **30+ minutes**, investigate
- Most agents finish before you check back

### How to Deploy

Use `github-pull-request_copilot-coding-agent` tool:

```typescript
{
  title: "Clear, specific task name",
  body: "Detailed description with:
    - Objective
    - Files to modify
    - Success criteria
    - Constraints
    - Expected outcome"
}
// Agent automatically creates NEW PR
```

### Task Sizing

**Small** (1 agent, **7-15 min**):
- Single feature
- Isolated component
- Example: "Add JSON export to analytics"

**Medium** (1 agent, **15-30 min**):
- Multi-file feature
- Service refactoring
- Example: "Implement image cache with LRU"

**Large** (1 agent, **30-60 min**):
- Comprehensive audit
- Major optimization
- Example: "Audit all AI prompts and upgrade"

**Very Large** (Split into **3-5 agents**, parallel deployment):
- Break into independent tasks
- Deploy simultaneously to separate PRs
- Example: "Optimize app" → 
  - Agent 1 → PR "perf/images" (15 min)
  - Agent 2 → PR "perf/react" (20 min)
  - Agent 3 → PR "perf/bundle" (15 min)
- **Total: 20 min** (parallel) vs 50 min (sequential)

---

## Deploying Multiple Agents (Parallel Development)

### When to Deploy Multiple Agents

**Perfect for parallel deployment:**
```bash
✅ Independent features (no file overlap)
✅ Different parts of codebase
✅ Can be merged in any order
✅ Self-contained changes

Example:
Agent 1 → Analytics dashboard    (src/services/analytics*)
Agent 2 → Image caching          (src/services/imageCache*)
Agent 3 → Error logging          (src/utils/logger*)
Agent 4 → API documentation      (docs/API.md)
```

**NOT suitable for parallel:**
```bash
❌ Same files/functions
❌ Sequential dependencies (B needs A's output)
❌ Tightly coupled features
❌ Core architecture changes

Bad Example:
Agent 1 → Modify gameService.ts
Agent 2 → Also modify gameService.ts  ❌ Merge conflicts!
```

### How Many Agents Simultaneously?

**Recommended: 3-5 agents max**
- You can monitor 3-5 PRs every 10-15 minutes
- More than 5 becomes hard to track
- Each agent creates 3-10 commits in 7-15 minutes

**Example parallel deployment:**
```bash
# 2:00 PM - Deploy 4 agents
Agent A → PR #101 "feat/analytics"
Agent B → PR #102 "perf/cache"
Agent C → PR #103 "docs/api"
Agent D → PR #104 "test/coverage"

# 2:15 PM - Check all PRs (agents have 3-5 commits each)
Agent A: ✅ Complete (merge now)
Agent B: ⏳ Still working (5/8 commits)
Agent C: ✅ Complete (merge now)
Agent D: ⏳ Still working (2/4 commits)

# 2:25 PM - Check remaining
Agent B: ✅ Complete (merge)
Agent D: ✅ Complete (merge)

# Total: 25 minutes for 4 major features!
```

### Multi-Agent Deployment Workflow

**Step 1: Plan the split**
```typescript
Task: "Improve game performance"

// Split into independent agents:
Agent 1: Image optimization      → PR #101
Agent 2: React memoization       → PR #102
Agent 3: Bundle code splitting   → PR #103
Agent 4: API request batching    → PR #104

// Check file overlap:
- Agent 1: src/services/imageCache.ts ✅
- Agent 2: src/components/*.tsx ✅
- Agent 3: vite.config.ts ✅
- Agent 4: src/services/api/*.ts ✅
// No overlap = safe for parallel deployment
```

**Step 2: Deploy agents with 2-3 min stagger**
```bash
2:00 PM - Deploy Agent 1
2:03 PM - Deploy Agent 2 (Agent 1 has initial commits)
2:06 PM - Deploy Agent 3 (Agents 1-2 progressing)
2:09 PM - Deploy Agent 4 (All visible in PR list)
```

Why stagger? Easier to track which PR belongs to which agent.

**Step 3: Monitor every 10-15 minutes**
```bash
# Check PR list:
- Agent 1: 5 commits, last 2 min ago ✅
- Agent 2: 3 commits, last 1 min ago ✅
- Agent 3: 7 commits, last 30 sec ago ✅
- Agent 4: 2 commits, last 5 min ago ⚠️ (might be stuck)
```

**Step 4: Merge as they complete**
```bash
# Don't wait for all to finish!
# Merge completed PRs immediately:

2:15 PM - Agent 1 complete → Review & merge
2:18 PM - Agent 3 complete → Review & merge  
2:22 PM - Agent 2 complete → Review & merge
2:28 PM - Agent 4 complete → Review & merge

# Total time: 28 minutes for 4 features
```

### Multi-Agent Best Practices

1. **Analyze dependencies first**
   - Use `git grep` to find file usage
   - Check for shared utilities
   - Identify potential conflicts

2. **Name PRs clearly**
   - Use prefixes: `feat/`, `perf/`, `docs/`, `test/`
   - Include scope: `feat/analytics-dashboard`
   - Makes tracking easier

3. **Set clear boundaries**
   - Each agent owns specific files
   - No overlap in responsibilities
   - Clear success criteria

4. **Monitor actively**
   - Check every 10-15 minutes
   - Watch for stuck agents
   - Intervene early if issues arise

5. **Merge quickly**
   - Don't batch merges
   - Merge as agents complete
   - Reduces conflict risk

### Common Multi-Agent Patterns

**Pattern 1: Feature Suite**
```bash
# Build related but independent features
Agent 1 → User authentication
Agent 2 → User profile page
Agent 3 → User settings
Agent 4 → User analytics
# Different files, same domain
```

**Pattern 2: Performance Optimization**
```bash
# Optimize different parts
Agent 1 → Frontend bundle
Agent 2 → API responses  
Agent 3 → Database queries
Agent 4 → Image loading
# Different layers, same goal
```

**Pattern 3: Documentation Sprint**
```bash
# Document everything
Agent 1 → API docs
Agent 2 → User guide
Agent 3 → Developer setup
Agent 4 → Architecture diagrams
# All docs, no code conflicts
```

**Pattern 4: Testing Expansion**
```bash
# Add comprehensive tests
Agent 1 → Unit tests (services/)
Agent 2 → Integration tests (flows/)
Agent 3 → Component tests (components/)
Agent 4 → E2E tests (e2e/)
# Different test types, different files
```

### When NOT to Use Multiple Agents

❌ **Core architecture changes**
- Refactoring base classes
- Changing state management
- Modifying type system
- Updating build configuration

❌ **Sequential tasks**
- Task B requires Task A's output
- Incremental changes
- Exploratory refactoring

❌ **Highly coupled features**
- All touch same core logic
- Share complex state
- Require coordination

### Troubleshooting Multi-Agent Deployments

**Problem: Agent appears stuck (no commits for 30+ min)**
```bash
Solution:
1. Check PR for error messages
2. Look at last commit - is it complete or mid-change?
3. Cancel agent, fix issue, redeploy
```

**Problem: Merge conflicts between agents**
```bash
Solution:
1. Merge Agent A first (completed first)
2. Pull latest to Agent B's branch
3. Resolve conflicts manually
4. Agent B continues from there
```

**Problem: Too many agents to monitor**
```bash
Solution:
1. Prioritize: Let critical agents finish first
2. Cancel lowest-priority agents
3. Redeploy after first batch completes
4. Don't exceed 5 agents at once
```

### Best Practices

1. **Clear requirements** - Agent needs specific goals
2. **Defined success** - What does "done" look like?
3. **File context** - Point to relevant files
4. **Constraints** - What NOT to do
5. **Examples** - Show desired patterns

### Common Mistakes

❌ Deploying 4 agents to same PR  
✅ Deploy 4 agents to 4 separate PRs

❌ Vague task: "Make it better"  
✅ Specific: "Reduce bundle size by 20%"

❌ No success criteria  
✅ Clear metrics: "Cache hit rate > 60%"

❌ 10-day estimates  
✅ Realistic: Most tasks done in hours

```
