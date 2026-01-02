# TODO: Comprehensive Project Roadmap and Status

## 1. Critical Infrastructure Fixes (Immediate Priority)
- [ ] **Dependency Restoration**: The `node_modules` are currently corrupted or incomplete. The "Nuclear Reset" plan (`rm -rf node_modules && npm install`) failed due to environment restrictions.
    - *Action*: Run `npm install` in a clean environment or selectively fix missing packages like `vite`.
- [ ] **Build Pipeline**: The build command (`npm run build`) fails due to file system constraints in this environment.
    - *Action*: Ensure `tsconfig.build.json` is correctly used and verify build locally.
- [ ] **Supabase Auth**: Authentication is currently blocking access.
    - *Action*: Verify `VITE_ENABLE_AUTH=false` is respected in `App.tsx` and `supabaseClient.ts`. (Partially Done - Code updated).

## 2. Core Engine Improvements
### Adaptive Horror Engine (`src/core/engines/AdaptiveHorrorEngine.ts`)
- [ ] **Telemetry**: Implement logging for fear analysis to tune the algorithm.
- [ ] **Safety Caps**: Add validation to prevent fear scores from exceeding limits (1.0).

### Quantum Narrative Engine (`src/core/engines/QuantumNarrativeEngine.ts`)
- [ ] **Persistence**: Save alternate timelines to `localStorage` so they survive page refreshes.
- [ ] **Logic**: Enhance timeline shifting logic to be less random and more narrative-driven.

### Temporal Revision Engine (`src/core/engines/TemporalRevisionEngine.ts`)
- [ ] **LLM Integration**: Replace regex-based text replacement with LLM-powered context-aware rewriting for more convincing "false memories".

### Reality Corruption Engine (`src/core/engines/RealityCorruptionEngine.ts`)
- [ ] **Configuration**: Move hardcoded corruption thresholds to a config file.
- [ ] **Visuals**: Verify that generated CSS classes (e.g., `reality-tear`) actually exist and render correctly in `index.css` or `GameScreen`.

## 3. Game Service & Flow (`src/services/gameService.ts`)
- [ ] **Analytics**: Add detailed tracking for game start, choice selection, and flow transitions.
- [ ] **Debug**: Add a debug stream to monitor the "Flow Context" in real-time.

## 4. Testing & Validation
- [ ] **Headless Playtest**: Implement `tests/integration/headlessPlaytest.ts` to simulate 50+ turns automatically.
- [ ] **Chaos Testing**: Add a mode to randomly fuzz inputs and ensure the game doesn't crash.
- [ ] **End-to-End**: Verify the full user journey from Start Screen -> Game -> End State -> Reset.

## 5. Deployment Readiness
- [ ] **Docker**: Create a `Dockerfile` for consistent production builds.
- [ ] **CI/CD**: Set up GitHub Actions to run the headless playtest on every PR.
- [ ] **Environment Vars**: Document all required env vars in a `env.example` file (done, but needs verification against code usage).

## 6. UI/UX
- [ ] **Login Screen**: `LoginScreen` component is referenced in `App.tsx` but might be missing from exports. Verify its location.
- [ ] **Accessibility**: Audit the "corruption" effects to ensure they don't trigger photosensitive epilepsy without a warning/toggle.

## System Design Proposal: "The Loom" (Automated Narrative Validation)
To ensure reliability, I propose a system called **"The Loom"**:
1.  **Simulator**: A Node.js script that imports `gameService` and plays the game 100 times in parallel.
2.  **Validators**:
    - *Narrative Coherence*: Uses a cheaper LLM (e.g., Gemini Flash) to grade the story segments for logical consistency.
    - *Engine Activity*: tracks how often each engine fires. If "Quantum Narrative" never fires in 100 games, it's a bug.
3.  **Reporter**: Generates a static HTML report showing pass/fail rates and "interesting" story traces.

This system should be implemented in `scripts/loom.ts` and run nightly.
