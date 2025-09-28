# Changelog
All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [0.3.1] - 2025-09-08
## [0.3.2] - 2025-09-08
### Added
- VISION.md: Formalized product vision, principles, scope, and success criteria.
- README: Added concise Product vision section and linked to VISION.md.

### Documentation
- Aligned README roadmap and near-term goals with deployment and backend plans.

### Changed
- Simplified `GameScreen.tsx` internals:
	- Replaced manual timeout/ref pattern for the "Game Saved!" message with a declarative effect and cleanup.
	- Inlined `combinedChoices` (removed unnecessary `useMemo`).
	- Corrected effect dependencies by moving `handleChoice` earlier and listing it in the auto-start effect.
- Tightened types and tests:
	- Extended `Choice` type to allow optional `segmentId` to match recovery command payloads.
	- Fixed tests and fallback commands to include required `isIntrusive` flag.

### Quality
- Verified with full test run (all passing) and production build.

## [0.3.0] - 2025-09-08
### Added
- **New Game Functionality**: Players can now start a new game from the game screen via a "New Game" button, which properly resets all application state.
- **UI Loading Indicators**: The game screen now displays a loading spinner while waiting for the AI to generate the next part of the story, improving user feedback.
- Created a `.env.example` file to document required environment variables for easier developer onboarding.
- Stubbed out a `processImageGeneration` function to prepare for a future real AI image generation service.

### Changed
- **Core Logic**: The game now correctly uses the `GenreConfig` selected by the player on the start screen, persisting it in the `worldStateStore`. The hardcoded genre configuration on the game screen has been removed.
- **AI Fallbacks**: The fallback logic for concept generation (`generateConceptFlow`) has been improved to provide a more generic, genre-neutral response on failure.

### Fixed
- **Critical Stability**: Implemented robust error handling around the primary AI narrative generation (`runAIFlow`). The application no longer crashes on API failures and instead provides the user with a graceful recovery option.
- **Testing**: Re-enabled and rewrote previously skipped tests in `gameService.spec.ts` to validate the new error handling and recovery paths.
- **Dependencies**: Resolved moderate severity security vulnerabilities reported by `npm audit`.

### Security
- No new security changes in this version.

## [0.2.0] - 2025-09-08
### Added
- Integrated Google Generative AI (`@google/generative-ai`) for dynamic narrative generation.
- A basic, dark, horror-themed stylesheet (`index.css`) for improved UI immersion.

### Changed
- **BREAKING**: Replaced mock AI flows in `src/services/ai/genkit.ts` with a full implementation using the Gemini 1.5 Flash model.
- Refactored `gameService.ts` to remove the `withAIFlowHandling` wrapper and all associated fallback logic, simplifying the service to directly call the new AI flows.
- Updated placeholder image generation (`generateImageFlow`) to use thematic images from Unsplash, providing a more atmospheric experience than the previous random placeholders.

### Fixed
- Corrected build errors in `GameScreen.tsx` that were introduced during refactoring.
- Skipped obsolete unit tests in `gameService.spec.ts` that were failing after the removal of fallback logic, bringing the test suite back to a passing state.

### Security
- Removed hardcoded Google GenAI API key from `src/services/config.ts`. The key is now securely loaded from the `VITE_GOOGLE_GENAI_API_KEY` environment variable.

