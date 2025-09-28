# Apophenia Vision

A living guide to what we’re building, how it should feel, and how we’ll know it’s working.

## Tagline
An AI-directed, choice-driven psychological horror that adapts to you in real time.

## Player experience
- Tension that escalates: the world pushes back, the UI frays, and your choices ripple.
- Temptation vs. control: intrusive thoughts appear as risky options with narrative consequences.
- Momentum: minimal waiting; the story advances in crisp, readable beats.
- Replayable: genres reshape tone, threats, and imagery. No two runs feel the same.

## System goals
- Adaptive narrative via an AI Director that emits typed, composable commands.
- Deterministic-enough orchestration: schema-validated payloads, defensive fallbacks, and recoverable errors.
- Fast interaction loop: typical step completes in < 3 seconds under normal load.
- Safe key handling: image generation and any paid services run server-side.

## Principles
1. Player agency first: choices are clear, meaningful, and occasionally dangerous.
2. Maintain immersion: UX communicates state (loading, corruption, endings) without breaking the spell.
3. Reliability over flash: typed commands, Zod validation, and conservative parsing protect the loop.
4. Performance is part of horror: slow pace kills tension; keep responses snappy and progressive.
5. Privacy and security: never expose secrets in the client; prefer backend mediation.

## Scope
- In-scope (MVP):
  - Text narrative via Gemini (server-validated commands)
  - Genre-configurable system instruction and world state
  - Intrusive-thought choices and endings
  - Server-side image generation endpoint (Gemini image-capable) with caching and fallbacks
  - DigitalOcean App Platform deployment (frontend + backend)
- Out-of-scope (for now):
  - Multiplayer or shared worlds
  - Long-form save import/export beyond persisted local state
  - Non-web platforms

## Success criteria (MVP)
- Functional: complete loop from start to at least one ending without errors.
- Performance: median step time < 3s on broadband; UI remains responsive.
- Stability: no uncaught exceptions in typical play; graceful fallbacks on AI errors.
- Engagement: at least 3 distinct endings reachable with different genres/paths.

## Implementation anchors
- Commands as the API: displayText, displayChoices (with isIntrusive), generateImage, updateWorldState, etc.
- Zod schemas define the source of truth (see `src/types.ts`).
- State via Zustand stores with persistence; genreConfig lives in world state.
- Backend needed for image generation; client holds no image model keys.

## Roadmap highlights
- Implement /api/generateImage (Express) with Gemini image-capable model; pluggable cache.
- Visual polish: responsive, readable horror aesthetic; subtle degradation effects.
- Broaden genre presets and world rules; document authoring knobs.

This vision is concise by design; iterate the details, not the destination.