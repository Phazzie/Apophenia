# Collaboration Playbook for PR #34 Finish & DigitalOcean Launch

> **Operational constraints**
> - Google Jules only sees content on merged branches. Anything we expect Jules to review must be summarized or merged before hand-off.
> - Creating GitHub Copilot coding agents or GitHub issues can occasionally report an error even when the resource is created. Always refresh the PR/Issues list to confirm before retrying, and avoid spawning duplicates.

The following three collaboration patterns break the remaining work into focused streams shared between me (Copilot), Google Jules, and the GitHub Copilot coding agent. Each idea spells out scope, responsibilities, hand-offs, and risk checks so you can choose the style that fits how you want to work right now.

---

## Idea 1 · "Precision Fix + Automated Polish"
**Goal:** Knock out the critical review fixes fast while offloading bulk mechanical edits and documentation polish.

### Scope
- Finish PR #34 review blockers (typed corruption/narrative payloads, awaiting async calls, SSR guards).
- Update affected tests and mocks.
- Respond to reviewers and mark threads resolved.

### Roles
- **Copilot (me):**
  - Audit each blocking review comment and craft the concrete fixes (e.g., typed return objects, narrative DNA getter, realistic response time default).
  - Directly edit the most sensitive files: `src/services/gameService.ts`, `AdaptiveNarrativeDNA.ts`, `NeuralEchoChambers.ts`, and relevant tests.
  - Run `npm run build`, `npx tsc --noEmit`, `npm test`, and summarize results.
- **GitHub Copilot coding agent:**
  - After core fixes, handle repetitive follow-ups: apply DOM/storage guards across engines, adjust mocks (`generateWithSelectedModel` calls), refresh docs (e.g., `REVOLUTIONARY_FEATURES_AUDIT.md`).
  - Generate the comment replies list for the PR description.
- **Google Jules:**
  - Draft the final PR status comment to the reviewer/owner, summarizing changes and test evidence.
  - Perform a second pass diff review for overlooked `any` types or missing awaits.

### Hand-off rhythm
1. Copilot patches high-risk areas and commits locally.
2. Coding agent receives scoped task for remaining nits + doc path cleanup.
3. Jules writes the reviewer response comment and highlights any missed nits.

### Pros / Watch-outs
- ✅ Keeps the most intricate logic changes human-guided.
- ✅ Automates the repetitive tail work.
- ⚠ Requires clear instructions to the coding agent to avoid reintroducing `any`.

---

## Idea 2 · "Parallel Tracks with Daily Sync"
**Goal:** Split the workload into three parallel tracks that converge at end-of-day checkpoints.

### Scope
- Track A: TypeScript hardening & engine refactors.
- Track B: Test stabilization + CI verification.
- Track C: Deployment readiness (DigitalOcean spec, env config, docs).

### Roles
- **Copilot (me):** Own Track A — refactor semantic analyzer keyword map, gene mutation helpers, DOM/SSR guards, and ensure `gameService` payload typings & awaits are correct.
- **Google Jules:** Lead Track B — expand/update Jest coverage where behavior changed, make sure `generateWithSelectedModel` mocks assert three parameters, and orchestrate the final test plan write-up.
- **GitHub Copilot coding agent:** Handle Track C — update `digitalocean.app.yaml` to target post-merge branch, verify secrets placeholders, add `/api/ready` stub if needed, and sync docs.

### Hand-off rhythm
- Stand up three short-lived branches (one per track).
- Twice per day, merge progress onto `fix/test-suite-stabilization`, run the full build/test suite, and resolve conflicts.
- Close with a combined PR comment summarizing status from each track.

### Pros / Watch-outs
- ✅ Maximizes parallelism; ideal if we’re time-constrained.
- ✅ Clear domain ownership reduces merge churn.
- ⚠ Needs disciplined sync to avoid diverging type definitions or duplicated fixes.

---

## Idea 3 · "Agent-First Iterations with Human QA Gate"
**Goal:** Let automation take the first pass across all review comments, while Copilot and Jules operate as QA/steering.

### Scope
- Coding agent attempts every outstanding review change, including optional suggestions, in one or two iterative passes.
- Copilot performs a deep QA review, fixing any nuanced logic/data issues the agent missed.
- Jules focuses entirely on deployment playbook (DigitalOcean) and communication artifacts.

### Roles
- **GitHub Copilot coding agent:**
  - Execute a scripted checklist: await async engine calls, add getter on `AdaptiveNarrativeDNA`, introduce SSR guards, tighten typings, update docs and mocks, and regenerate tests as needed.
  - Run `npm run build`, `npx tsc --noEmit`, `npm test` after each major commit.
- **Copilot (me):**
  - Review the agent’s branch, leave inline notes (or direct commits) correcting subtle issues such as over-eager awaits, randomUUID fallbacks, or performance regressions.
  - Consolidate reviewer responses, highlighting which suggestions were accepted or intentionally deferred.
- **Google Jules:**
  - Update `DIGITALOCEAN_DEPLOYMENT.md` with lessons learned, confirm `digitalocean.app.yaml` matches the final branch layout, and prepare a deployment checklist for after merge.

### Hand-off rhythm
1. Kick off coding agent with the full checklist and allow it to iterate until tests pass.
2. Copilot reviews diffs, applies targeted fixes, and approves/merges when clean.
3. Jules posts deployment-readiness summary + merges doc updates.

### Pros / Watch-outs
- ✅ Fastest if the agent can cleanly apply the majority of changes.
- ✅ Human oversight remains but with lighter manual coding load.
- ⚠ Requires extra QA to ensure no subtle regressions slip through the automated pass.

---

### How to choose
- **Need speed & precision:** Go with Idea 1.
- **Want balanced parallel momentum:** Idea 2.
- **Prefer automation-heavy workflow:** Idea 3.

Once you pick a pattern, we can spin up the corresponding branch plan and start assigning concrete todos to each assistant. Let me know which route sounds best and I’ll draft the next action list.

---

## Batch Execution Checklist

Use this checklist whenever launching a batch of coding-agent work:

1. **Sync baseline**: Rebase `fix/test-suite-stabilization` onto `feature/ai-director-refactor` and push so agents start from the newest base.
2. **Define batch scope**: Group 6–7 tightly related tasks that touch the same subsystem.
3. **Create branch**: `git checkout -b agent/batch-<name>` and push it empty so the agent has a remote target.
4. **Craft prompt**:
  - Include goal, files, must/avoid rules, and required commands (`npm run build`, `npx tsc --noEmit`, `npm test`).
  - Instruct the agent to stop after the batch, avoid unrelated files, and open/annotate a PR.
5. **Run agent**: Trigger GitHub Copilot coding agent with a timeout ≥15 minutes; note the issue/PR link.
6. **Verify creation**: Refresh the PR and issues lists even if the CLI/UI reports an error.
7. **Review & tests**: Pull the branch locally, review diffs, rerun build/typecheck/tests, and post findings in the PR.
8. **Merge or queue**: If clean, squash merge; if more work remains, capture feedback and recycle the branch for the next agent iteration.
9. **Communicate to Jules**: After merging, summarize the changes (or link to the merged PR) so Jules can operate on the final state.

Repeat steps 2–9 for each additional batch, ensuring only one active agent per branch and disjoint file sets if running agents in parallel.

---

## Merge Log Template

Track completed batches so everyone can see what landed and when.

| Batch | Branch | Summary | Tests | Merge Commit | Jules notified |
|-------|--------|---------|-------|--------------|----------------|
| Batch 1 – Await & Typings | `fix/test-suite-stabilization` (current) | Awaited engine calls, tightened `gameService` payload types, added DNA getter. | ✅ build / ✅ tsc / ✅ test | Pending | ⬜ |
| Batch 2 – SSR Guards | `fix/test-suite-stabilization` (in-flight) | DOM/storage guards for Neural Echo + Fifth Wall, standardized AI call signature, tests/mocks refresh. | _Pending_ | _Pending_ | ⬜ |
| Batch 3 – Docs & Deploy | _TBD_ | Deployment docs refresh, DO app spec alignment, reviewer response drafts. | _Pending_ | _Pending_ | ⬜ |

> Update this table after each merge so future batches know the current baseline, and Jules has a quick reference to catch up.
