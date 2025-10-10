# Architecture Design Record (ADR)

## Introduction

This document records the architectural decisions made for the Apophenia project. The purpose of this ADR is to provide a clear and concise history of the project's architectural evolution, including the context, decisions, and consequences of each significant choice. This record is intended to help current and future developers understand the reasoning behind the system's design and to ensure that future development is consistent with the established architecture.

Apophenia is an AI-driven interactive cosmic horror narrative game that uses a- sophisticated command-driven architecture to deliver personalized and adaptive storytelling. The system is designed to be highly modular and extensible, with a clear separation of concerns between the user interface, state management, and AI services. This ADR will detail the key architectural decisions that have shaped the project, from its initial design to its current state.

## 1. Initial Command-Driven Architecture

**Context:** The initial design of Apophenia required a flexible and extensible architecture that could support a wide range of AI-driven narrative events. The system needed to be able to handle a variety of commands, such as displaying text, generating images, and presenting choices to the player, without tightly coupling the game logic to the UI.

**Decision:** A command-driven architecture was chosen to decouple the AI services from the UI. The system uses a flow-based approach, where AI services generate a series of commands that are then executed by a command executor. The command executor is responsible for updating the game state and triggering the appropriate UI updates. This architecture allows for a clean separation of concerns and makes it easy to add new commands and features without modifying the core game logic.

**Consequences:** The command-driven architecture has proven to be highly effective. It has allowed for the rapid development of new features and has made it easy to maintain a clean and organized codebase. The use of a command queue also provides a clear audit trail of all game events, which has been invaluable for debugging and testing.

## 2. Secure API Architecture

**Context:** The project requires the use of several third-party AI services, each of which requires a unique API key. These keys must be kept secure and should not be exposed in the client-side code.

**Decision:** A secure API architecture was implemented using a separate Node.js server to manage API keys. The client-side application makes requests to this server, which then forwards the requests to the appropriate AI service with the necessary API key. This approach ensures that the API keys are never exposed to the client and provides a single point of control for managing API access.

**Consequences:** The secure API architecture has successfully protected the project's API keys and has provided a robust and scalable solution for managing API access. The use of a separate server adds a small amount of latency to each API request, but this is a necessary trade-off for the increased security.

## 3. Multi-Model AI System

**Context:** The project's success is heavily dependent on the quality and reliability of the AI models it uses. To mitigate the risk of relying on a single AI provider, the system needed to be able to support multiple AI models and to switch between them dynamically.

**Decision:** A multi-model AI system was implemented that allows the user to switch between different AI models at runtime. The system uses a unified AI service that routes requests to the appropriate AI provider based on the user's selection. The system also includes a fallback mechanism that automatically switches to a secondary model if the primary model fails.

**Consequences:** The multi-model AI system has provided a high degree of flexibility and resilience. It has allowed the project to take advantage of the strengths of different AI models and has ensured that the game remains playable even if one of the AI providers experiences an outage. The ability to switch between models has also been a valuable tool for testing and development.

## 4. 8-Module Revolutionary AI Engine System

**Context:** To create a truly unique and personalized cosmic horror experience, the project needed to go beyond simple narrative generation. The system required a more sophisticated AI engine that could create a deep sense of psychological horror and that could adapt to the player's choices in a meaningful way.

**Decision:** The 8-Module Revolutionary AI Engine System was developed to address this need. This system consists of eight interconnected AI engines that work together to create a deeply immersive and personalized horror experience. The engines include a Temporal Revision Engine, a Quantum Narrative Engine, and a Reality Corruption Engine, among others. Each engine is responsible for a different aspect of the narrative, and they all work together to create a cohesive and terrifying experience.

**Consequences:** The 8-Module Revolutionary AI Engine System has been a resounding success. It has allowed the project to create a truly unique and innovative horror game that is unlike anything else on the market. The system is highly complex, but the modular design has made it manageable and has allowed for the continued development and refinement of each engine.

## 5. Image Generation Service

**Context:** To enhance the immersive experience of the game, the project needed a way to generate atmospheric visuals that would complement the AI-driven narrative. The system needed to be able to create high-quality images on the fly, based on the current state of the game.

**Decision:** A multi-provider image generation service was implemented that uses a combination of AI image generation services and a fallback to Unsplash for thematic images. This approach ensures that the game can always generate a relevant image, even if one of the AI services is unavailable. The service is integrated into the command-driven architecture, and images are generated asynchronously to avoid blocking the main game loop.

**Consequences:** The image generation service has significantly enhanced the game's atmosphere and has made the narrative more engaging. The use of multiple providers has provided a high degree of resilience, and the fallback to Unsplash has proven to be a reliable way to ensure that there is always a relevant image to display. The asynchronous nature of the service has also ensured that the game remains responsive, even when generating high-resolution images.

## 6. Cross-Session Memory Persistence

**Context:** To create a truly adaptive and personalized horror experience, the system needed a way to remember the player's choices and psychological profile across multiple gaming sessions. This would allow the AI to build a long-term understanding of the player's fears and to tailor the narrative accordingly.

**Decision:** `localStorage` was chosen as the mechanism for persisting player data across sessions. The system uses encrypted `localStorage` to store the player's psychological profile and other relevant data. This data is then loaded at the start of each new session, allowing the AI to pick up where it left off.

**Consequences:** The use of `localStorage` for cross-session memory persistence has been highly effective. It has allowed the project to create a sense of continuity between gaming sessions and has enabled the AI to build a much deeper and more nuanced understanding of the player. The use of encryption has also ensured that the player's data remains secure.

## 7. Next.js Migration Exploration

**Context:** As the project grew in complexity, the development team began to explore ways to improve the developer experience and to streamline the deployment process. The team also wanted to take advantage of the latest features and performance optimizations offered by modern web frameworks.

**Decision:** A proof-of-concept migration to Next.js was undertaken to evaluate the feasibility and benefits of moving away from the custom Vite-based build process. The migration involved refactoring the application to use Next.js's file-based routing system and to take advantage of its server-side rendering capabilities.

**Consequences:** The Next.js migration was ultimately not pursued, but the exploration provided valuable insights into the trade-offs between different web frameworks. The team decided to stick with the existing Vite-based build process, as it was already well-suited to the project's needs and provided a high degree of flexibility. However, the lessons learned from the Next.js migration have informed subsequent architectural decisions and have helped the team to make more informed choices about the project's future direction.

## 8. State of the Test Suite

**Context:** As part of the process of creating this ADR, the project's test suite was run to ensure that no regressions were introduced. This revealed that the test suite is currently in a broken state.

**Decision:** After multiple failed attempts to fix the test suite, the decision was made to document its current state in this ADR rather than attempting a full repair. This is to ensure that the primary goal of creating the ADR is met without getting sidetracked by a significant test-fixing effort that is outside the scope of the original request.

**Consequences:** The test suite is currently unreliable and cannot be used to validate changes to the codebase. This represents a significant risk to the project's stability and maintainability. The key issues identified are:
- **`SyntaxError: Cannot use 'import.meta' outside a module`**: This indicates a fundamental misconfiguration in how the Jest environment handles Vite-specific code.
- **Component Test Failures**: A variety of `TypeError`, `ReferenceError`, and `TestingLibraryElementError` failures suggest that the component tests are not correctly mocking their dependencies or handling asynchronous behavior.

A separate task should be created to address these issues and restore the test suite to a functional state.