# Apophenia Improvements Checklist

This document outlines the next set of prioritized improvements to move the Apophenia project closer to a feature-complete and deployable state.

## 1. Core Logic: Remove Hardcoded Configuration

**Objective:** Ensure the player's selected genre is respected throughout the game, instead of being overridden by a hardcoded value.

- [ ] **Types**: Add `genreConfig: GenreConfig` to the `WorldState` interface in `src/types.ts`.
- [ ] **State Management**: Add `genreConfig` to the `worldStateStore`, including an initial default value and an action to set it.
- [ ] **Start Screen**: Modify `StartScreen.tsx` to call the new action, saving the selected `GenreConfig` into the `worldStateStore` when a new game is started.
- [ ] **Game Screen**: Remove the hardcoded `mockGenreConfig` from `GameScreen.tsx`.
- [ ] **Game Screen**: Read the `genreConfig` from the `worldStateStore` and pass it to the `getNextStep` service call.

## 2. AI Refinement: Improve Fallback Logic

**Objective:** Make the AI's fallback behavior more generic and less jarring for the user.

- [ ] **Concept Generation**: In `src/services/ai/genkit.ts`, modify the `catch` block within `generateConceptFlow` to return a more generic, genre-neutral concept instead of the hardcoded "jaded detective" one.

## 3. UI/UX: Add "New Game" Functionality

**Objective:** Allow the player to restart the game from the main game screen without having to manually clear their browser's local storage.

- [ ] **Game Screen**: Add a "New Game" button to the UI in `GameScreen.tsx`.
- [ ] **State Management**: Create a new `handleNewGame` function in `GameScreen.tsx`.
- [ ] **Reset Logic**: Implement the `handleNewGame` function to call the `reset` methods on all relevant Zustand stores (`gameStateStore`, `worldStateStore`, `storyHistoryStore`).

## 4. Feature: Stub Real AI Image Generation

**Objective:** Lay the groundwork for a real AI image generation service, making it easy to plug in a real implementation later.

- [ ] **Configuration**: Gemini API handles both text and image generation via `VITE_GEMINI_API_KEY`.
- [ ] **Placeholder Flow**: Create a new, empty, asynchronous function named `processImageGeneration(prompt: string)` in `src/services/ai/genkit.ts`.
- [ ] **Integration**: Update the existing `generateImageFlow` to call `processImageGeneration`. For now, it can just return the Unsplash URL as a fallback.
