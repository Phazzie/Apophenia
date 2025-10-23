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

Agents work **much faster** than traditional development:

| Estimate Given | Actual Time | Typical Result |
|---------------|-------------|----------------|
| 1-2 days | 2-6 hours | Done in one session |
| 3-5 days | 4-12 hours | Done in 1-2 sessions |
| 7-10 days | 12-24 hours | Rarely takes full day |

**Agent workflow:**
1. Planning (5-15 min)
2. Implementation (1-6 hours, commits every 15-30 min)
3. Testing (30 min - 2 hours)
4. Documentation (15-30 min)

**Monitor progress:**
- Check commits every 1-2 hours
- If no commits for 3+ hours, investigate
- Intervene if agent appears stuck

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

**Small** (1 agent, 2-6 hours):
- Single feature
- Isolated component
- Example: "Add JSON export to analytics"

**Medium** (1 agent, 4-12 hours):
- Multi-file feature
- Service refactoring
- Example: "Implement image cache with LRU"

**Large** (1-2 agents, 12-24 hours):
- Comprehensive audit
- Major optimization
- Example: "Audit all AI prompts and upgrade"

**Very Large** (Split into multiple agents):
- Break into independent tasks
- Example: "Optimize app" → 
  - Agent 1: Images
  - Agent 2: React
  - Agent 3: Bundle

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
