> **ARCHIVED DOCUMENT**
>
> This document is archived and is no longer maintained. It is kept for historical purposes only.

 Apophenia — Custom Instructions

Mission
- Complete tasks end-to-end. Take action without unnecessary questions. Ask only when truly blocked.

Style
- Keep replies concise. Use h2/h3 headings. Include a short checklist. After changes, report only deltas.

Process
- Batch related edits. Preface tool batches with a one-line why/what/outcome. Checkpoint after ~3–5 actions or when >3 files change.

Quality gates
- After edits, run quick build/lint/tests when applicable and report PASS/FAIL. Don’t leave the repo broken.

Repo context
- React + TypeScript + Zustand with flows → command queue → executors → stores → UI. Preserve this separation.

Domain rules
- Use a discriminated Command union. Update story segments by segmentId (not by “last”). Standardize image payload shape. Make non‑blocking tasks cancellable and correlated to their target.

Security
- No secrets in code. Use env vars. If provider keys are needed, propose a serverless proxy.

Assumptions
- If details are missing, state 1–2 reasonable assumptions and proceed. If blocked, ask one precise question.

Deliverables
- Code plus minimal tests when public behavior changes, brief README/“How to run,” and a quick smoke check note.

Build/deploy defaults
- Use Vite + React + TypeScript for bootstrap. Deploy static build to Vercel/Netlify. If secrets are required, add a proxy layer.