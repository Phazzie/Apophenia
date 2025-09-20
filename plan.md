# Apophenia Migration Plan & Checklist

This document outlines the comprehensive plan to migrate the Apophenia application from a Vite-based React SPA to a modern, secure, and feature-rich Next.js application. It also includes a detailed checklist of all the work to be done.

## Part 1: The Grand Plan

Here is the high-level plan for the migration. Each step includes a focus on testing to ensure a high-quality result.

1.  ***Foundation: Initial Next.js Setup.***
    *   Set up a new Next.js project with TypeScript and Tailwind CSS. This will form the foundation for our new, improved application, providing Server-Side Rendering capabilities right from the start.

2.  ***Component and Styling Migration.***
    *   Move the existing React components to a new `components/` directory and refactor them to use Tailwind CSS.
    *   **Testing:** Write snapshot tests for the migrated components to ensure they render as expected.

3.  ***Implement App Router and Layout.***
    *   Replace the current `gameState`-based navigation with the Next.js App Router, creating routes for each part of the game.
    *   **Testing:** Write integration tests to verify that navigation between pages works correctly.

4.  ***Migrate State Management (Zustand).***
    *   Move the Zustand stores to a `lib/stores` directory and ensure they are compatible with the Next.js client component model.
    *   **Testing:** Write unit tests for the Zustand stores to ensure their logic is correct.

5.  ***Secure the Ship: Create Backend API Routes for AI.***
    *   This is the most critical step. Create Next.js API routes to handle all communication with the AI services, moving all AI logic to the server-side.
    *   **Testing:** Write unit and integration tests for the API routes using Vitest. This will involve mocking the AI services to test the routes in isolation.

6.  ***Refactor Game Logic to Use API Routes.***
    *   Update the client-side game logic to call the new, secure API routes using `fetch`.
    *   **Testing:** Write tests for the refactored client-side services to ensure they correctly call the API routes and handle the responses.

7.  ***Add Crew Quarters: User Authentication and Persistence.***
    *   Integrate NextAuth.js for user authentication and set up a simple database (like Vercel KV) to store user data and game states.
    *   **Testing:** Write tests for the authentication flow, including login, logout, and protecting routes.

8.  ***Enhance the Vessel: New Features and Polish.***
    *   Implement command cancellation, add i18n support, and perform an accessibility audit.

9.  ***Comprehensive Testing and Validation.***
    *   This step is dedicated to ensuring the quality of the final application.
    *   **Unit Tests:** Ensure all individual components, utility functions, and stores have comprehensive unit tests.
    *   **Integration Tests:** Test the interaction between components, services, and the backend.
    *   **API Route Tests:** Thoroughly test all API routes, including edge cases and error handling.
    *   **End-to-End (E2E) Tests:** Use a tool like Playwright to create E2E tests that simulate real user scenarios, from starting a new game to finishing it.

10. ***Final Voyage Preparations: Documentation and Review.***
    *   Thoroughly update the `README.md` and any other documentation to reflect the new Next.js architecture. After a final review of all changes, the migration will be complete.

---

## Part 2: The Detailed Checklist

Here is a granular checklist of all the tasks, with completed items marked.

### Phase 1: Foundation & UI Migration (Done)

*   [x] **Initial Next.js Setup**
    *   [x] Initialize Next.js project with TypeScript and Tailwind CSS.
    *   [x] Configure `next.config.mjs`, `postcss.config.js`, `tailwind.config.ts`.
    *   [x] Create `app/` directory with `layout.tsx` and `page.tsx`.
    *   [x] Create `app/globals.css` with Tailwind directives and old styles.
    *   [x] Delete old Vite config and entry point (`vite.config.mjs`, `index.html`).
*   [x] **Component Migration**
    *   [x] Create new `components/` directory.
    *   [x] Migrate and refactor `StartScreen.tsx` with Tailwind CSS.
    *   [x] Migrate and refactor `GameScreen.tsx` with Tailwind CSS.
    *   [x] Migrate and refactor `EndScreen.tsx` with Tailwind CSS.
    *   [x] Migrate and refactor `ErrorBoundary.tsx` with Tailwind CSS.
    *   [x] Delete old `src/components` directory.
*   [x] **Routing**
    *   [x] Create `app/play/[gameId]/page.tsx` for the game screen.
    *   [x] Create `app/end/[gameId]/page.tsx` for the end screen.
    *   [x] Update `StartScreen.tsx` to use `useRouter` for navigation.
    *   [x] Update `GameScreen.tsx` to use `useRouter` for navigation.
    *   [x] Implement end-game logic in `GameScreen.tsx` to navigate to the end screen.
*   [x] **State Management & Types**
    *   [x] Create new `lib/` directory.
    *   [x] Move `types.ts` to `lib/types.ts`.
    *   [x] Move all Zustand stores to `lib/stores`.
    *   [x] Update all import paths for types and stores in components.
    *   [x] Delete old `src/stores` directory and `src/types.ts`.

### Phase 2: Backend & Security (In Progress)

*   [ ] **Create API Routes for AI**
    *   [ ] Create `app/api/ai/next-step/route.ts`.
    *   [ ] Move `getNextStep` logic from `gameService.ts` to the API route.
    *   [ ] Move logic from `ai/genkit.ts` and `ai/revolutionaryFeatures.ts` to `lib/ai` and use it in the API route.
    *   [ ] Create API route for image generation (`app/api/ai/generate-image/route.ts`).
    *   [ ] Move image generation logic to the new API route.
*   [ ] **Refactor Client-Side Services**
    *   [ ] Refactor `gameService.ts` to call the `/api/ai/next-step` route using `fetch`.
    *   [ ] Refactor image generation calls in the client to use the new `/api/ai/generate-image` route.
*   [ ] **Secure API Keys**
    *   [ ] Remove `VITE_` prefix from `.env.example` and other env files.
    *   [ ] Ensure all AI API keys are only accessed on the server-side.
*   [ ] **Testing**
    *   [ ] Write unit tests for the `next-step` API route, mocking AI services.
    *   [ ] Write unit tests for the `generate-image` API route.
    *   [ ] Write integration tests for the client-side services to ensure they correctly handle API responses and errors.

### Phase 3: Features & Polish (To Do)

*   [ ] **User Accounts & Persistence**
    *   [ ] Integrate NextAuth.js.
    *   [ ] Set up a database (e.g., Vercel KV).
    *   [ ] Implement "Save Game" functionality to save progress to the database.
    *   [ ] Implement "Load Game" functionality.
    *   [ ] **Testing:** Write tests for login, logout, and saving/loading game state.
*   [ ] **New Features**
    *   [ ] Implement command cancellation with `AbortController`.
    *   [ ] Extract all strings into resource files for i18n.
    *   [ ] Integrate an analytics service.
*   [ ] **Final Testing**
    *   [ ] Write E2E tests with Playwright for the main user flows (new game, continue, finish game).
    *   [ ] Perform a full manual testing pass of the application.
*   [ ] **Documentation**
    *   [ ] Update `README.md` with the new architecture and setup instructions.
    *   [ ] Add any other necessary documentation.
*   [ ] **Code Cleanup**
    *   [ ] Remove all remaining files and directories from `src`.
    *   [ ] Perform a final code review.
