# Apophenia — AI-Driven Interacti## Game Concept & Vision

**## Game Concept & Vision

**Apophenia** creates adaptive psychological horror through AI-driven storytelling:

### Core Gameplay Loop:
1. Player makes a choice from AI-generated options
2. AI Director analyzes choice and generates:
   - Next story segment (text)
   - Atmospheric image
   - New choice set (including intrusive thoughts)
   - Psychological state updates
3. UI adapts to player's mental state (distortion effects)
4. Process repeats until story conclusion

### Key Features:
- **Dynamic Narrative:** Every playthrough is unique
- **Psychological Profiling:** AI adapts to player choices
- **Visual Storytelling:** Generated images for each scene
- **Intrusive Thoughts:** Disturbing choices that reveal character psychology
- **Atmospheric Audio:** Ambient sound generation (planned)
- **UI Distortion:** Interface degradation based on psychological state

## Technical Implementation

### Command Architecture
All game actions flow through a type-safe command system:
```typescript
type Command = CreateSegment | DisplayText | GenerateImage | DisplayChoices | ...
```

### AI Integration Points
- **Story Generation:** Google Gemini for narrative content
- **Image Generation:** Integrated image AI for scene visualization  
- **Psychological Analysis:** AI tracks and responds to player patterns

### State Management
- **Game State:** Current screen, choices, loading states
- **World State:** Story context, psychological status, UI effects
- **Story History:** Segmented narrative with images and metadata
- **Image Cache:** LRU cache with TTL for performance

## Execution Model

1. A flow (e.g., `nextStepFlow`) returns a list of Commands representing UI updates and side effects (text display, ambiance, image gen, world updates, choices).
2. `executeCommandQueue` resolves commands in sequence, awaiting blocking ones and fire-and-forgetting non-blocking ones.
3. Stores update accordingly; UI should reflect changes.

## Development Status

### ✅ COMPLETED CORE SYSTEMSs adaptive psychological horror through AI-driven storytelling:

### Core Gameplay Loop:
1. Player makes a choice from AI-generated options
2. AI Director analyzes choice and generates:
   - Next story segment (text)
   - Atmospheric image
   - New choice set (including intrusive thoughts)
   - Psychological state updates
3. UI adapts to player's mental state (distortion effects)
4. Process repeats until story conclusion

### Key Features:
- **Dynamic Narrative:** Every playthrough is unique
- **Psychological Profiling:** AI adapts to player choices
- **Visual Storytelling:** Generated images for each scene
- **Intrusive Thoughts:** Disturbing choices that reveal character psychology
- **Atmospheric Audio:** Ambient sound generation (planned)
- **UI Distortion:** Interface degradation based on psychological state

## Technical Implementation

### Command Architecture
All game actions flow through a type-safe command system:
```typescript
type Command = CreateSegment | DisplayText | GenerateImage | DisplayChoices | ...
```

### AI Integration Points
- **Story Generation:** Google Gemini for narrative content
- **Image Generation:** Integrated image AI for scene visualization  
- **Psychological Analysis:** AI tracks and responds to player patterns

### State Management
- **Game State:** Current screen, choices, loading states
- **World State:** Story context, psychological status, UI effects
- **Story History:** Segmented narrative with images and metadata
- **Image Cache:** LRU cache with TTL for performanceme

**Status: 75% Complete MVP** | **Updated: September 6, 2025**

An AI-powered psychological horror narrative game where players make choices and an AI director dynamically generates story content, images, and increasingly disturbing choices based on player psychology.

## Current State

**✅ WORKING:**
- Full React + TypeScript + Vite build system
- Complete command-driven architecture with type-safe executors
- Zustand state management with persistence
- Error boundaries and loading states
- Comprehensive test coverage
- CI/CD pipeline (GitHub Actions)

**🔄 IN PROGRESS:**
- AI integration (framework ready, using mocks)
- Basic UI styling (functional but minimal)

**🎯 READY FOR:** Real AI integration → immediate MVP deployment

## Architecture Overview

- **Stack:** React + TypeScript + Vite + Zustand + Jest
- **Pattern:** Command-driven architecture with AI flow orchestration
- **Components:**
  - UI: Start/Game/End screens with loading states and error boundaries
  - State: Atomic Zustand stores (game, world, story, image cache)
  - Commands: Type-safe executors for all game actions
  - AI Flows: Genkit integration ready for Google AI
  - Services: Game orchestration and error handling

## Execution model (intended)

1. A flow (e.g., `nextStepFlow`) returns a list of Commands representing UI updates and side effects (text display, ambiance, image gen, world updates, choices).
2. `executeCommandQueue` resolves commands in sequence, awaiting blocking ones and fire-and-forgetting non-blocking ones.
3. Stores update accordingly; UI should reflect changes.

## What’s done well

- **Build System:** Vite + TypeScript + React fully configured
- **Command Architecture:** Type-safe command executors with proper error handling
- **State Management:** Zustand stores with persistence and atomic operations
- **UI Framework:** React components with loading states and error boundaries
- **Testing:** Jest setup with comprehensive test coverage
- **CI/CD:** GitHub Actions for build and test automation
- **Type Safety:** Zod schemas for runtime validation
- **Cache Management:** Smart image cache with LRU eviction

### 🔄 CURRENT GAPS
- **AI Integration:** Framework ready but using mock responses
- **UI Styling:** Functional but needs visual polish
- **Environment Config:** API keys need proper env variable setup
- **Deployment:** Ready for static hosting setup

### 🎯 NEXT MILESTONE: DEPLOYABLE MVP
**Estimated Time:** 6-8 hours focused work
**Goal:** Functional game with real AI, basic styling, deployed to web

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## File Structure
```
src/
├── components/          # React UI components
├── stores/             # Zustand state management
├── services/           # Business logic and AI integration
├── commands/           # Command executors
├── types.ts           # Type definitions
└── App.tsx            # Main application
```

## Remaining Work

### Critical Issues (Fixed)
- ~~Command typing was loose~~ → Now type-safe with discriminated unions
- ~~Empty history handling~~ → Fixed with proper error checking
- ~~Missing segment creation~~ → createSegment executor implemented
- ~~Async update correlation~~ → Fixed with segmentId tracking
- ~~No error boundaries~~ → Comprehensive error handling added

### Ready for Production
The core architecture is solid and battle-tested. Remaining work is primarily integration and polish.

Functional/build
- No `package.json`, build tool, or dependency manifests; nothing will run yet.
- `src/index.html` and `src/index.tsx` are empty; `App` is not mounted.
- No real UI components for Start/Game/End; only placeholders.

Type safety and contracts
- Command typing is loose (`Command` is just `{ type: string; payload?: any }`). Executors rely on implicit payload shapes; easy to break.
- `history` is typed as `any[]` in flows/services.
- `generateImageExecutor` expects `payload.styleModifier` but `gameService.generateImage(prompt: string)` and `generateImageFlow(prompt)` treat the argument as a prompt. Ambiguity/contract mismatch.

Runtime correctness
- `displayTextExecutor` assumes `storyHistory` has at least one segment and dereferences `slice(-1)[0].text`; this will error when empty.
- There’s no command or place that creates the initial `StorySegment`; subsequent updates (text, images) modify a non-existent segment.
- Asynchronous updates (e.g., image generation, summary) update “last segment” by position; if segments are appended between start and completion, updates can land on the wrong segment. Needs IDs/correlation.
- `displayChoicesExecutor` logs choices and flips game state to PLAYING but doesn’t persist the choices to a store/UI.
- `worldState` updates for summary are fire-and-forget; no loading/error handling.

DX/quality
- No linting/formatting/tests/CI.
- Secrets: `services/config.ts` contains an API key placeholder; not wired to env vars and should not be committed when real keys are added.
- No error boundaries or centralized error/logging strategy.

Architecture/design
- No UI orchestration connecting user input -> flow -> executeCommandQueue -> UI updates. The core loop is implicit but not wired.
- Non-blocking command policy is hard-coded by string; no explicit command metadata (idempotency, retry, cancellation).
- No cancellation/abort for in-flight async effects (image/audio gen).

## Deployment readiness

- Conceptual: Solid skeleton for a command-driven, AI-directed narrative. Roughly 30–40% of an MVP conceptually (core ideas present but many contracts/UI gaps).
- Structural: Not deployable. Missing build tooling, app bootstrap, UI, and real service integration. 0% deploy-ready as of now.

## Prioritized roadmap to MVP and deploy

P0 — Make it runnable (1–2 days)
- Add `package.json` with Vite + React + TypeScript, `tsconfig.json`, and minimal `index.html`/`index.tsx` to mount `App`.
- Add ESLint + Prettier + basic configs. Add `npm scripts` for dev/build/preview.

P1 — Wire the game loop and safe state updates (2–4 days)
- Create a `StoryEngine`/`GameController` that:
  - Creates an initial `StorySegment` (id, text: "", images: {}, status) before any display commands run.
  - Calls flows based on user choice and feeds the resulting commands to `executeCommandQueue`.
- Strengthen stores:
  - `StorySegment` IDs and helper selectors: update by id, not just “last”.
  - Store for current choices; persist `displayChoices` payload.
- Fix command contracts:
  - Use a discriminated union for `Command` with typed payloads per command.
  - Align `generateImage` payload to a single field (`prompt`), and let the flow build that from a style modifier if needed.
- Guardrails:
  - Handle empty history in executors or ensure a segment exists before `displayText`/`generateImage`.

P2 — UX and feedback (2–4 days)
- Implement real `StartScreen`, `GameScreen`, `EndScreen` components:
  - Start: genre selection (using `GenreConfig`), start button.
  - Game: show story history (segments), main image with status spinner, choices UI, and ambient audio placeholder.
  - End: summary and replay.
- Add loading state indicators for flows and non-blocking tasks; add toasts/errors.

P3 — Async robustness and caching (2–3 days)
- Add `AbortController`-style cancellation for in-flight image/audio tasks when a new choice supersedes the previous one.
- Make async updates segment-aware: pass segmentId through commands and update the intended segment even if more segments are appended.
- Improve image cache usage: if `predictedImagePrompt` exists and is cached, prefer it immediately; otherwise fall back to generation.

P4 — Service integration and config (2–5 days)
- Real AI integrations (text, image, audio) with configurable providers; hide behind `services/*` interfaces.
- Config via `.env` and `import.meta.env` (Vite) or equivalent. Remove `services/config.ts` from source control.

P5 — Quality, tests, and deployment (2–4 days)
- Unit tests for stores and executors; a small harness test for `executeCommandQueue` sequencing.
- GitHub Actions CI for build/lint/test.
- Deployment target: Vercel/Netlify/Cloudflare Pages. Build artifacts from Vite are static.
- Runtime env var wiring for client calls (if needed) or move provider calls to a backend proxy if secrets required.

## Suggested concrete fixes (quick wins)

- Add a `createOrAppendSegment` command so flows can explicitly create a segment before text/image mutations.
- Change `displayTextExecutor` to guard when no segment exists (or rely on the new create command).
- Unify image command payload to `{ prompt: string }`. Update flow and executors accordingly.
- Introduce a `choicesStore` and persist choices from `displayChoices`.
- Add typed `Command` union, e.g.:
  ```ts
  type DisplayText = { type: 'displayText'; payload: { content: string; segmentId: string } };
  type GenerateImage = { type: 'generateImage'; payload: { prompt: string; segmentId: string } };
  // ...
  type Command = DisplayText | GenerateImage | /* etc */;
  ```
- Pass `segmentId` through async tasks and update by id.

## Notable code-level issues

- `displayTextExecutor` may throw on empty `storyHistory`.
- `generateImageExecutor` mutates the last segment; should target a specific segment.
- `services/config.ts` should be removed/migrated to envs.
- `index.html`/`index.tsx` are empty.

## Files of interest

- UI: `src/App.tsx`
- Stores: `src/stores/*`
- Commands/executors: `src/commands/*`, `src/services/commandExecutor.ts`
- Flows: `src/services/flows/*`, surfaces in `src/services/gameService.ts`
- Types: `src/types.ts`

## Deploy notes

- After Vite setup, deploy static build to Vercel/Netlify. If AI providers require secrets, proxy calls through a serverless function with env vars instead of exposing them client-side.

---

## Contributors
- Architecture & Core Systems: Phazzie
- Command System & Type Safety: AI Assistant  
- Testing & Error Handling: Collaborative

*Last Updated: September 6, 2025*
