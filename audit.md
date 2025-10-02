# Code Audit: Apophenia

This document tracks the findings of the comprehensive technical debt and code quality audit.

## Critical Issues

### 1. Exposed API Keys in Frontend Code

*   **File Path**: `src/services/config.ts`
*   **Problem Description**: The file `src/services/config.ts` is still exposing API keys in the frontend code. Although the comments mention that this file is deprecated and that a secure backend API should be used, the code for accessing API keys from environment variables is still present and actively used. This is a critical security risk as it makes the API keys publicly accessible. The `API_KEYS` constant is defined and exported, and it reads the keys from `import.meta.env` in the browser environment.
*   **Issue Type**: Security Vulnerability
*   **Suggested Fix**:
    1.  Remove the entire `API_KEYS` constant and the `getConfig` function from `src/services/config.ts`.
    2.  Refactor all the code that relies on `API_KEYS` to fetch the necessary information from the secure backend API.
    3.  Delete the `src/services/config.ts` file after all dependencies on it are removed.

## Systemic Issues

### 1. Widespread Incorrect Usage of `generateWithSelectedModel`

*   **Files Affected**: `src/services/ai/engines/RealityCorruptionEngine.ts`, `src/services/ai/engines/TemporalRevisionEngine.ts`, and likely others.
*   **Problem Description**: There is a recurring pattern of calling the `generateWithSelectedModel` function with an incorrect number of arguments. The function signature, defined in `src/services/ai/unifiedAIService.ts`, requires five parameters: `systemInstruction`, `prompt`, `worldState`, `storyHistory`, and an optional `useCase`. However, multiple AI engines are calling it with only three parameters, omitting `worldState` and `storyHistory`.
*   **Impact**: This will lead to guaranteed runtime `TypeError` or `ReferenceError` exceptions whenever these AI engines are invoked, causing the corresponding game mechanics to fail catastrophically. The fallback mechanisms might hide the immediate crash, but the intended functionality will not work.
*   **Suggested Fix**: A full codebase review is required to identify all calls to `generateWithSelectedModel`. Each call site must be updated to pass the complete, correct set of arguments. This involves tracing the data flow to ensure `worldState` and `storyHistory` are available in the calling context, which may require refactoring method signatures in the calling classes to pass this data down.

## High Priority Issues

### 1. Undefined Variable in `getAIDirectorAnalysis`

*   **File Path**: `src/services/gameService.ts`
*   **Problem Description**: In the `getAIDirectorAnalysis` function, `generateDirectorAnalysis` is called with `recentChoices`, but `recentChoices` is not defined within the function's scope. This will cause a `ReferenceError` at runtime, crashing the AI Director feature.
*   **Issue Type**: Bug
*   **Suggested Fix**: Modify the function signature to accept `recentChoices` as a parameter. The function should be updated from `getAIDirectorAnalysis(worldState: WorldState)` to `getAIDirectorAnalysis(worldState: WorldState, recentChoices: string[])`. The calling location for this function will need to be updated to pass in the `recentChoices` array.

### 2. Incorrect Function Call in `RealityCorruptionEngine`

*   **File Path**: `src/services/ai/engines/RealityCorruptionEngine.ts`
*   **Problem Description**: The `generateCorruptionEffects` method calls `generateWithSelectedModel` with only three arguments. The function signature for `generateWithSelectedModel` requires five arguments: `systemInstruction`, `prompt`, `worldState`, `storyHistory`, and an optional `useCase`. The `worldState` and `storyHistory` arguments are missing, which will cause a runtime error.
*   **Issue Type**: Bug
*   **Suggested Fix**: The `processCorruption` method signature in `RealityCorruptionEngine.ts` should be updated to accept `worldState` and `storyHistory`. These should then be passed to `generateCorruptionEffects` and subsequently to `generateWithSelectedModel`. The call to `realityCorruption.processCorruption` in `gameService.ts` will also need to be updated to pass these additional arguments.

### 3. Incorrect Function Call in `TemporalRevisionEngine`

*   **File Path**: `src/services/ai/engines/TemporalRevisionEngine.ts`
*   **Problem Description**: The `generateRevisedSegment` method calls `generateWithSelectedModel` with only three arguments. The function signature for `generateWithSelectedModel` requires five arguments: `systemInstruction`, `prompt`, `worldState`, `storyHistory`, and an optional `useCase`. The `worldState` and `storyHistory` arguments are missing, which will cause a runtime error.
*   **Issue Type**: Bug
*   **Suggested Fix**: The `reviseHistory` method already accepts `worldState` and `storyHistory`. These parameters should be passed down to the `generateRevisedSegment` method. The `generateRevisedSegment` signature should be updated to accept `worldState` and `storyHistory` and then pass them correctly to `generateWithSelectedModel`.

### 4. Incorrect Function Call in `QuantumNarrativeEngine`

*   **File Path**: `src/services/ai/engines/QuantumNarrativeEngine.ts`
*   **Problem Description**: The `isSignificantChoice` method calls `generateWithSelectedModel` with only three arguments, omitting `worldState` and `storyHistory`. This will cause a runtime error.
*   **Issue Type**: Bug
*   **Suggested Fix**: The `processQuantumChoice` method signature should be updated to accept `worldState`. This should then be passed to `isSignificantChoice` and subsequently to `generateWithSelectedModel`. The calling location in `gameService.ts` will need to be updated to pass in the `worldState`.
