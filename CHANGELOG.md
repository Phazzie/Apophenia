# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Frontend Architecture**: Refactored the `GameScreen.tsx` component by extracting core logic into `useGameLoop` and `useGameEffects` custom hooks. This improves separation of concerns and component readability.
- **Testing Framework**: Migrated the test runner from Jest to Vitest to resolve persistent ES Module (ESM) compatibility issues. This involved updating the test scripts in `package.json` and adding a test configuration to `vite.config.mjs`.
### Added
- **Architectural Decision Records (ADRs):** Established a new `docs/adr` directory to formally document significant architectural decisions, starting with `0001-record-architecture-decisions.md`.
- **Expert-Level Project Documentation:** Created and distributed `agents.md` (explaining the AI architecture for humans) and `gemini.md` (providing instructions for the AI assistant) across the root, `.github`, and `docs` directories to ensure maximum visibility and utility.

### Changed
- **Comprehensive README Update:** Overhauled the `README.md` to include a detailed architectural deep-dive, an expert development workflow, and information on the revolutionary 9-module AI engine system.
- **Node Version Update:** Updated the `engines` field in `package.json` to require `node >= 20.19.0` to match modern development standards.
- **Changelog Update:** Significantly updated this `CHANGELOG.md` to accurately reflect recent, crucial documentation and architectural enhancements.

## [1.1.0] - 2025-01-XX - "The Complete Revolutionary Engine"

### Added - Complete 8-Module Revolutionary AI System ✨
The most significant update in Apophenia's history - the complete implementation of the revolutionary 8-module AI engine system that creates unprecedented personalized interactive horror experiences:

#### **Core Revolutionary Engines (Restored & Enhanced)**
- **🕰️ Temporal Revision Engine**: AI retroactively modifies past story segments based on current choices, creating "false memory" horror effects and unreliable narrator experiences
- **🌌 Quantum Narrative Engine**: Maintains multiple parallel story threads with reality shifts between quantum states, creating horror through timeline inconsistencies  
- **💀 Reality Corruption Engine**: Progressive UI distortions that respond to story corruption levels, physically corrupting the game interface as horror intensifies
- **🧠 Adaptive Horror Engine**: Enhanced with complete 2M token session memory for building comprehensive personalized psychological horror profiles
- **👁️ Meta-Consciousness Engine**: AI breaks the fourth wall to directly address players, creating self-aware horror that transcends the game boundaries

#### **Advanced Psychological Systems (NEW)**
- **🧬 Neural Echo Chambers**: Cross-session memory persistence using encrypted localStorage, maintaining detailed player psychological profiles between gaming sessions for evolving personalized experiences
- **⚗️ Semantic Choice Archaeology**: Deep psychological analysis engine that excavates meaning from player choice sequences, understanding the deeper psyche behind decisions for targeted horror crafting  
- **🧬 Adaptive Narrative DNA**: Evolutionary story genetics that adapt and mutate over time based on player engagement patterns, creating unique narrative branches that evolve like living organisms

#### **System Integration & Orchestration**
- **Complete 8-Module Orchestration**: All engines work simultaneously during gameplay, processing every player choice through the entire revolutionary system
- **Cross-Engine Data Sharing**: Sophisticated inter-engine communication creates emergent psychological experiences that exceed the sum of their parts
- **Real-Time Adaptation**: Dynamic system evolution ensures no two playthroughs are ever identical, with each session building upon previous psychological insights

### Enhanced - Existing Systems Upgraded
- **Game Service Architecture**: Completely redesigned to orchestrate all 8 revolutionary engines in perfect harmony
- **Test Coverage**: Expanded to 35+ tests covering all revolutionary features with comprehensive integration testing
- **Configuration System**: Advanced configuration management for all 8 modules with granular control settings
- **Error Handling**: Robust fallback systems ensure graceful degradation when individual engines encounter issues

### Technical Improvements
- **Bundle Size**: Optimized despite massive feature additions (310KB bundle, 92KB gzipped)
- **Performance**: Efficient inter-engine communication with minimal performance impact
- **Memory Management**: Smart caching and cleanup for cross-session psychological data
- **Type Safety**: Complete TypeScript coverage for all 8 revolutionary engines

### Documentation Updates
- **Complete 8-Module Documentation**: Comprehensive documentation of all revolutionary features
- **Integration Guides**: How all engines work together to create the complete experience
- **Psychological Engine Deep-Dives**: Technical details on each engine's psychological mechanisms

## [0.4.0] - 2025-01-XX
### Added
- **🧠 Grok-4 Fast Reasoning Integration**: Primary AI model with 2M token context window and advanced reasoning capabilities
- **🔄 Multi-Model AI System**: Dynamic switching between Grok-4, Gemini 2.5 Pro, and Gemini 2.5 Flash
- **🎛️ Model Selector Interface**: Comprehensive modal for selecting and configuring AI models
- **🔍 Test API System**: Built-in connectivity testing for all AI providers with real-time feedback
- **⚡ Enhanced Premium Features**: 2M token context enables complete session memory, advanced psychological profiling, and narrative consistency engine
- **🎨 UI Enhancements**: Model selector modal, test API button, improved start screen layout
- **📦 New Components**: `ModelSelector.tsx`, `TestAPIButton.tsx`, `aiModelStore.ts`
- **🔧 Unified AI Service**: Routes requests between providers with intelligent fallback system

### Changed
- **Default AI Model**: Grok-4 Fast Reasoning is now the primary model (fallback to Gemini)
- **Environment Configuration**: Added `VITE_XAI_API_KEY` for X.AI integration
- **Context Window**: Upgraded from 1M tokens (Gemini) to 2M tokens (Grok-4) for enhanced narrative consistency
- **Game Service**: Updated to use unified AI service with model selection
- **Start Screen**: Added AI model information and selection controls

### Enhanced
- **Psychological Profiling**: Now tracks complete player history across entire session
- **Narrative Consistency**: Cross-references all story elements with 2M token context
- **Memory System**: Complete session memory for perfect story continuity
- **Error Handling**: Graceful fallbacks when primary AI model unavailable

### Technical
- **Architecture**: Added unified AI service layer for multi-provider support
- **State Management**: New Zustand store for AI model selection persistence
- **Testing**: Updated test suite for new AI service architecture
- **Types**: Enhanced TypeScript definitions for AI models and testing

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
- Removed hardcoded Google GenAI API key from `src/services/config.ts`. The key is now securely loaded from the `VITE_GEMINI_API_KEY` environment variable.

## [1.0.0] - 2025-09-23

### Added - Core Application Features
- **Complete React + TypeScript Application**: Full implementation of AI-driven interactive narrative game
- **Google Gemini 2.5 Pro Integration**: Advanced AI storytelling with Gemini 2.0 Flash Experimental model support
- **Revolutionary AI Features**: 
  - Multi-step story generation with context awareness
  - Psychological profiling and adaptive storytelling
  - Advanced image generation with multiple fallback services
  - Mega-context features for complex narrative handling
- **Secure API Architecture**: Separate server.js for secure API key management
- **Command-Driven Architecture**: Type-safe command system (flows → commands → executors → stores → UI)
- **Comprehensive State Management**: Zustand stores for game state, UI state, and image caching
- **Error Handling & Recovery**: Robust error boundaries with thematic error messages
- **Responsive Horror UI**: Mobile-first design with cosmic horror aesthetic

### Added - Development Infrastructure
- **Complete Build Pipeline**: Vite + TypeScript + Jest configuration
- **GitHub Actions CI/CD**: Automated testing and deployment workflow
- **Environment Management**: Secure environment variable handling for API keys
- **Test Suite**: 40+ tests covering command executors, AI services, and core game logic
- **Development Tools**: ESLint, TypeScript strict mode, hot reload development server
- **Multiple Deployment Targets**: Vercel, Netlify, and custom server deployment options

### Added - AI Service Features
- **Multiple AI Model Support**: Gemini 2.5 Pro, Gemini 2.0 Flash Experimental with intelligent fallbacks
- **Advanced Image Generation**: Multi-service image generation (Nano Banana → Imagen → Unsplash)
- **Context-Aware Storytelling**: Story summarization and context preservation across long sessions
- **Safety & Content Filtering**: Built-in safety settings and content moderation
- **Performance Optimization**: Caching, request deduplication, and efficient API usage

### Added - Documentation & Guides
- **Technical Debt Audit**: Comprehensive 279-line analysis of codebase health
- **Executive Summary**: 240-line project overview and strategic recommendations  
- **Deployment Roadmap**: Detailed 425-line deployment planning and execution guide
- **Multiple Deployment Guides**: Platform-specific guides for Vercel, Netlify, DigitalOcean
- **Developer Guides**: Specialized documentation for AI agents and GitHub Copilot

### Changed - Architecture & Performance
- **Command System**: Implemented discriminated union command system for type safety
- **State Management**: Unified atomic store operations through GameStateManager
- **Memory Management**: LRU + TTL image cache with automatic eviction (50 items, 30min TTL)
- **Error Recovery**: Enhanced error boundaries with graceful degradation
- **API Integration**: Secure proxy pattern for API key management

### Changed - User Experience
- **Mobile Responsiveness**: Optimized for all screen sizes with touch-friendly interface
- **Loading States**: Comprehensive loading indicators for AI operations
- **Visual Design**: Enhanced cosmic horror aesthetic with atmospheric effects
- **Performance**: Bundle size optimization (~252KB, 74KB gzipped)

### Fixed - Critical Issues
- **Empty History Handling**: Fixed crash bug in displayTextExecutor on empty story history
- **State Corruption**: Resolved partial state corruption from individual store resets
- **Memory Leaks**: Fixed unbounded image cache growth
- **Type Safety**: Eliminated 'any' payload types in Command interface
- **Async Coordination**: Fixed correlation issues with segmentId tracking

### Fixed - Development Issues
- **Build Pipeline**: Resolved TypeScript compilation errors and test failures
- **Test Suite**: Fixed flaky tests and improved test reliability
- **Environment Configuration**: Proper environment variable handling across development/production
- **CI/CD Pipeline**: GitHub Actions workflow optimization

### Security
- **API Key Protection**: Removed all hardcoded API keys from codebase
- **Environment Variables**: Secure API key management through environment variables
- **Server-Side Proxy**: Implemented secure API proxy to protect keys from client exposure
- **Content Filtering**: Built-in safety measures for AI-generated content

### Infrastructure
- **Docker Support**: Container configuration for consistent deployment
- **Multi-Platform Deployment**: Support for Vercel, Netlify, DigitalOcean, and custom servers
- **Monitoring Ready**: Structured logging and error tracking preparation
- **Scalability**: Architecture designed for horizontal scaling

### Performance Metrics
- **Bundle Size**: 237.99 KB JavaScript (72.60 KB gzipped)
- **CSS Size**: 17.43 KB (4.06 KB gzipped)  
- **Build Time**: ~1.14 seconds
- **Test Suite**: 40 tests, ~2.2 seconds execution time
- **Development Server**: Ready in ~0.2 seconds
