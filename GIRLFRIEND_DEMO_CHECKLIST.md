# Girlfriend Demo Checklist

This plan outlines the necessary steps to get a stable, impressive, and shareable demo version of the game running locally. The focus is on a "golden path" experience that showcases the game's unique features without needing production-level robustness.

## Phase 1: Stabilize the Core Gameplay Loop (Critical Path)

*   [x] **Fix the Gemini Fallback Mechanism:**
    *   **Goal:** Ensure the game is playable even if the primary Grok AI fails.
    *   **Task:** Modify the `generateWithGemini` function in `src/services/ai/unifiedAIService.ts`.
    *   **Details:** Replace the current `mockWorldState` with the actual `worldState`, `storyHistory`, and `playerChoice` from the game. This makes Gemini a true backup, preventing crashes.

*   [x] **Implement Consistent Error Handling:**
    *   **Goal:** Prevent the game from crashing if an AI call unexpectedly fails.
    *   **Task:** Add a `try...catch` block with a fallback to Gemini within the `generateWithGrok` function in `src/services/ai/unifiedAIService.ts`, similar to the logic in `generateConceptWithGrok`.

*   [x] **Create Simple Local Run Instructions:**
    *   **Goal:** Have a clear, simple guide to start the game locally.
    *   **Task:** Create a new file named `RUN_DEMO.md`.
    *   **Details:** Add the necessary terminal commands (`npm install`, `npm run dev`, etc.) and the URL to open in the browser.

## Phase 2: Enhance the "Wow" Factor

*   [x] **Verify Visual and UI Elements:**
    *   **Goal:** Ensure the most impressive visual features are working correctly.
    *   **Task:** Manually test the game flow.
    *   **Details:**
        *   Confirm that the `intrusive-thought` button style is applied correctly.
        *   Check that the image loading/retrying/error overlays in `GameScreen.tsx` appear as expected.
        *   Ensure the `Reality Coherence` UI updates.

*   [x] **Externalize Key AI Prompts:**
    *   **Goal:** Make it easier to quickly tweak the narrative tone before the demo.
    *   **Task:** Move the long prompt strings from `generateNextStepWithGrok` and `generateConceptWithGrok` in `src/services/ai/unifiedAIService.ts` into separate text files (e.g., `src/prompts/grok_next_step.txt`).
    *   **Details:** Read these files in the functions instead of using embedded strings. This is a quick refactor that improves maintainability.

## Phase 3: Ensure a Smooth Demo Experience

*   [x] **Optional: Pre-generate a "Golden Path" Start:**
    *   **Goal:** Guarantee a fast, impressive start to the demo without any AI lag.
    *   **Task:** Write a simple, one-off script or manually trigger the game's first few steps.
    *   **Details:** Save the generated `worldState`, `storyHistory`, and initial `GameCommand[]` to a JSON file. You could then add a temporary "Load Demo" button to the start screen to load this state directly, bypassing the initial AI concept generation for the demo.

