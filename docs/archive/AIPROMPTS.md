> **ARCHIVED DOCUMENT**
>
> This document is archived and is no longer maintained. It is kept for historical purposes only.

# AI Agent Prompts for Apophenia Project

This document contains a set of master prompts for AI software engineer agents to work on the Apophenia project. These prompts are designed to provide a clear, comprehensive hand-off, ensuring that the next AI can pick up the work efficiently and effectively.

***

### **Prompt 1: The Stabilizer - Fix the Test Suite**

**Your Mission:** You are an AI software engineer specializing in debugging and stabilization. You have been brought in to fix a critical blocker in a complex, AI-driven interactive horror project named "Apophenia." Your sole focus is to get the test suite to pass, creating a stable foundation for future development.

**Project Context:**
*   The previous AI implemented the core AI logic in `src/services/ai/revolutionaryFeatures.ts`.
*   However, the corresponding test file, `src/services/ai/__tests__/revolutionaryFeatures.test.ts`, is now broken and has resisted multiple debugging attempts.
*   This failing test is the **primary blocker** preventing any other work.

**Your Plan of Action:**
1.  **Delete the Problematic File:** Do not try to debug the existing file. Start with a clean slate. Execute `rm src/services/ai/__tests__/revolutionaryFeatures.test.ts`.
2.  **Analyze the Source Code:** Read and fully understand the AI-driven logic in `src/services/ai/revolutionaryFeatures.ts`. Pay close attention to the inputs and expected outputs of each function.
3.  **Regenerate the Test File:** Create a new, clean `src/services/ai/__tests__/revolutionaryFeatures.test.ts`.
4.  **Write New, Robust Tests:**
    *   The new tests **must** correctly mock the `generateWithSelectedModel` function from `unifiedAIService`. Use `jest.fn()` and `mockResolvedValue` / `mockResolvedValueOnce` to simulate AI responses.
    *   Write comprehensive tests for all five AI engines: `TemporalRevisionEngine`, `MetaConsciousnessEngine`, `QuantumNarrativeEngine`, `AdaptiveHorrorEngine`, and `RealityCorruptionEngine`.
    *   For each engine, test both the success path (the AI returns a valid response) and the failure path (the AI call throws an error).
5.  **Verify:** Run `cd /app && npm test` and ensure all tests pass. Do not proceed until the test suite is green.
6.  **Submit:** Once all tests pass, submit your changes with a clear commit message. Your mission is complete when the tests are fixed.

***

### **Prompt 2: The Enhancer - "Beef Up" the AI**

**Your Mission:** You are a creative AI software engineer tasked with enhancing the AI capabilities of an interactive horror project named "Apophenia." You are taking over this project *after* another AI has fixed the test suite, so you can assume the codebase is stable and all tests pass. Your goal is to make the game's horror more dynamic, personal, and psychologically impactful by improving the AI's intelligence and creativity.

**Project Context:**
*   The game's core AI engines are functional but can be significantly improved.
*   The project uses AI for narrative generation, image prompts, and dynamic game mechanics.
*   A previous attempt to build a backend failed and was abandoned. For now, all new logic should be implemented on the frontend unless specified otherwise.

**Your Plan of Action (A Prioritized List of Enhancements):**

**1. Feature: Adaptive Horror Intensity (New & High Impact)**
*   **Goal:** Make the game's horror level dynamically adapt to the player.
*   **How to Implement:**
    *   **Frontend State:** Implement the logic directly on the frontend for now. In the `gameStateManager`, add a new state variable: `horrorIntensity` (a number from 0 to 1).
    *   **Triggers:** The `AdaptiveHorrorEngine` should be responsible for increasing this score. For example, when the player makes a choice that aligns with their known fear profile or chooses an "intrusive thought," increment the score.
    *   **AI Feedback Loop:** This `horrorIntensity` score is crucial. It should be passed into the prompts for story generation (`nextStepFlow`), image generation, and reality corruption. The prompts must instruct the AI to use the score as a multiplier for the intensity of its output (e.g., "Given the horror intensity of 0.8, generate a deeply disturbing and graphic narrative...").

**2. Feature: Intrusive Thoughts (Expansion)**
*   **Goal:** Evolve the "intrusive thought" choices from static text to unpredictable, AI-generated temptations.
*   **How to Implement:**
    *   **Dynamic Generation:** In `genkit.ts`, modify the main story generation prompt (`nextStepFlow`). Add a directive for the AI to dynamically generate the text for the intrusive thought choice.
    *   **Link to Profile & Intensity:** This generation must be tied to the player's psychological profile and the new `horrorIntensity` score. A paranoid player at high intensity might get an intrusive thought like, "They're lying. Sabotage the console."

**3. Feature: Psychological Profiling Engine (Enhancement)**
*   **Goal:** Elevate the player profile from a simple list of fears to a nuanced psychological model.
*   **How to Beef Up:**
    *   **Deeper Analysis:** Refine the AI prompt in the `AdaptiveHorrorEngine`'s `analyzePlayerChoice` function. Instruct the AI to infer deeper traits beyond simple keywords, such as **paranoia, impulsivity, risk-aversion, and curiosity.**
    *   **Evolving Profile:** The `playerProfile` object in the engine should be expanded to track these new, evolving traits.
    *   **Richer Prompts:** Use this richer profile in the story and image generation prompts to create highly specific and personal horror scenarios.

**4. Feature: Reality-Bending Engine (Enhancement)**
*   **Goal:** Make the AI's meddling more direct and reality-breaking.
*   **How to Beef Up:**
    *   **Dynamic Meta-Messages:** The prompt for `generateMetaMessage` should be updated. Instruct the AI to reference specific past player choices to create the illusion that it is truly watching and remembering.
    *   **Browser Manipulation:** Implement the "Breaking the Fifth Wall" feature. Create a simple `browserManipulationService` on the frontend. Then, update the `RealityCorruptionEngine`'s prompt to allow the AI to return a new command type, like `{ type: 'browser-title-change', payload: { text: 'I see you, [Player Name]' } }`, which the new service will execute.