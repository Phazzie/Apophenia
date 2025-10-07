# Backend Refactor and Security Plan

**Branch:** `fix/api-key-security`

## 1. Executive Summary

This document outlines a critical security vulnerability and the plan to remediate it. The root cause is the exposure of API keys for both X.AI (Grok) and Google AI (Gemini) within the frontend client-side code. This allows any user of the application to inspect the browser's network traffic or JavaScript sources and steal these keys.

The solution is to refactor the application to ensure that all API calls to external services are proxied through the existing backend server (`backend/server.js`). This centralizes API key management on the server, where they are not exposed to users, completely closing the security hole.

## 2. The Security Vulnerability

- **File:** `src/services/ai/grokService.ts`
- **Problem:** The `XAIAPIClient` is initialized directly in the frontend with the `VITE_XAI_API_KEY`. It then makes direct `fetch` calls from the browser to `https://api.x.ai`, attaching the API key as a `Bearer` token. This is insecure.

- **File:** `src/services/ai/genkit.ts`
- **Problem:** The functions in this file (`nextStepFlow`, `generateConceptFlow`) use the `@google/generative-ai` SDK directly in the frontend. This library is configured with the `VITE_GEMINI_API_KEY`, and all calls are made from the browser, exposing the key.

- **File:** `audit.md`
- **Confirmation:** The security audit explicitly identifies this issue as: `High - Exposed API Keys in Frontend Code`.

## 3. Discrepancy Between Documentation and Code

There is a significant difference between how the documentation describes the AI model usage and what the code actually implements.

### 3.1. Documentation Claims

- **`CHANGELOG.md`:** States "Grok-4 is now the primary reasoning AI, with Gemini 2.5 Pro/Flash as fallback."
- **`README.md`:** Mentions a "hybrid model using Gemini and Grok for narrative generation."

This suggests a simple, hardcoded hierarchy.

### 3.2. Code Reality

The code reveals a more complex, user-configurable, and ultimately insecure system.

- **File:** `src/services/ai/unifiedAIService.ts`
  - The function `generateWithSelectedModel` reads the AI model choice from a Zustand store (`useAIModelStore`).
  - If the user has selected `'grok-4-fast'`, the code attempts to use the (insecure) `grokService`.
  - For *any other selection*, or if an error occurs with Grok, the code falls back to the (insecure) `genkit.ts` Gemini service.
  - **Conclusion:** The primary AI is not fixed; it is selectable by the user. Gemini serves as the default and the universal fallback.

- **File:** `src/services/ai/grokService.ts`
  - **Image Generation Model:** The `generateImage` method explicitly uses the model `'grok-2-image'`.
  - **Text Generation Model:** The `generateText` method explicitly uses the model `'grok-4-fast'`.

- **File:** `src/services/ai/genkit.ts`
  - **Text Generation Model:** The `nextStepFlow` uses `genkit.getGenerativeModel({ model: "gemini-1.5-flash" })`. The `generateConceptFlow` does the same. 
  - **Conclusion:** The Gemini model being used is **Gemini 1.5 Flash**, not Gemini 2.5 Pro as suggested in the documentation.

## 4. AI Call and Model Inventory (Code-Verified)

| Use Case             | Service File              | Function(s)                 | Backend Endpoint (Current) | AI Model Used (in code) | Secure? |
| -------------------- | ------------------------- | --------------------------- | -------------------------- | ----------------------- | ------- |
| **Image Generation** | `backend/server.js`       | `grokImageService`          | `/api/generateImage`       | `grok-2-image-1212`     | **Yes** |
| **Text (Grok)**      | `src/services/ai/grokService.ts` | `generateText`              | (None - Direct Call)       | `grok-4-fast`           | **No**  |
| **Text (Gemini)**    | `src/services/ai/genkit.ts`      | `nextStepFlow`, `generateConceptFlow` | (None - Direct Call)       | `gemini-1.5-flash`      | **No**  |


## 5. Remediation Plan

To resolve the security vulnerabilities, the following actions will be taken on the `fix/api-key-security` branch:

1.  **Modify `backend/server.js`:**
    -   Add a new `POST /api/grok-text` endpoint.
    -   Add a new `POST /api/gemini-text` endpoint.
    -   These endpoints will receive prompts and configuration from the frontend, call the respective AI services using the API keys stored securely in the server's environment (`process.env`), and return the results.

2.  **Refactor `src/services/ai/grokService.ts`:**
    -   The `generateText` method in `XAIAPIClient` will be rewritten.
    -   It will no longer make a direct `fetch` call to the X.AI API.
    -   It will now make a `fetch` call to our own `POST /api/grok-text` backend endpoint.
    -   The client will no longer store or handle any API keys.

3.  **Refactor `src/services/ai/genkit.ts`:**
    -   The `nextStepFlow` and `generateConceptFlow` functions will be rewritten.
    -   They will no longer call the Google AI SDK.
    -   They will now make `fetch` calls to our own `POST /api/gemini-text` backend endpoint, passing the `gameState` in the request body.

This plan will successfully centralize all external API communication through the backend, fully mitigating the identified security risks.