# Remaining TypeScript Build Errors

This file lists the last known TypeScript errors that are preventing the build from succeeding. I have attempted to fix these issues, but persistent tool failures have made it difficult to verify the solutions.

- **File:** `src/components/__tests__/TestAPIButtons.test.tsx`
  - **Error:** `error TS2352: Conversion of type 'UseBoundStore<Write<StoreApi<AIModelStore>, StorePersist<AIModelStore, { selectedModelId: string; }>>>' to type 'Mock<any, any, any>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.`
  - **Status:** I have attempted to fix this by casting the mock store to `unknown` before casting it to `jest.Mock`.

- **File:** `src/services/gameService.ts`
  - **Error:** `error TS2554: Expected 2 arguments, but got 1.`
  - **Status:** This error has been intermittent and seems to be related to a function call with an incorrect number of arguments. I have made several attempts to fix this, but the tool failures have made it difficult to confirm the fix.