# 🤖 Agent Deployment Plan - Apophenia Rewrite

## Overview

8 specialized agents will work **in parallel** to rebuild Apophenia from scratch. Each agent has clearly defined responsibilities and must honor the seams defined in `SEAMS.md` and `src/core/types/seams.ts`.

---

## 🎯 Agent 1: Core Engines Architect

**Priority**: CRITICAL
**Estimated Time**: 30-45 minutes
**Location**: `src/core/engines/`

### Responsibilities

Rebuild all 9 revolutionary AI engines as **pure TypeScript classes** with zero React dependencies.

### Deliverables

1. **Base Engine Class** (`src/core/engines/base/Engine.ts`)
   - Implements `Engine` interface from seams
   - Abstract base class all engines extend

2. **Temporal Revision Engine** (`src/core/engines/TemporalRevisionEngine.ts`)
   - Implements `TemporalRevisionEngine` interface
   - Identifies past segments to revise
   - Generates revised narrative text
   - Creates "false memory" effects

3. **Quantum Narrative Engine** (`src/core/engines/QuantumNarrativeEngine.ts`)
   - Implements `QuantumNarrativeEngine` interface
   - Maintains parallel timeline map
   - Shifts between realities
   - Merges conflicting timelines

4. **Reality Corruption Engine** (`src/core/engines/RealityCorruptionEngine.ts`)
   - Implements `RealityCorruptionEngine` interface
   - Calculates corruption level (0-100)
   - Generates visual corruption effects
   - Increases over time and with horror intensity

5. **Adaptive Horror Engine** (`src/core/engines/AdaptiveHorrorEngine.ts`)
   - Implements `AdaptiveHorrorEngine` interface
   - Analyzes player fear profile
   - Generates personalized horror content
   - Learns from choice patterns

6. **Meta-Consciousness Engine** (`src/core/engines/MetaConsciousnessEngine.ts`)
   - Implements `MetaConsciousnessEngine` interface
   - Determines when to break fourth wall
   - Generates meta-aware content
   - References player as separate entity

7. **Neural Echo Chamber Engine** (`src/core/engines/NeuralEchoChamberEngine.ts`)
   - Implements `NeuralEchoChamberEngine` interface
   - Loads/saves cross-session memories
   - Encrypts psychological profiles
   - Generates echo content from past sessions

8. **Semantic Choice Archaeology Engine** (`src/core/engines/SemanticChoiceArchaeologyEngine.ts`)
   - Implements `SemanticChoiceArchaeologyEngine` interface
   - Analyzes choice sequences
   - Identifies psychological patterns
   - Generates reflective content

9. **Adaptive Narrative DNA Engine** (`src/core/engines/AdaptiveNarrativeDNAEngine.ts`)
   - Implements `AdaptiveNarrativeDNAEngine` interface
   - Maintains narrative genome
   - Mutates story over time
   - Crossover mechanics for variation

10. **Fifth Wall Engine** (`src/core/engines/FifthWallEngine.ts`)
    - Implements `FifthWallEngine` interface
    - Determines when to manipulate browser
    - Generates browser effects (title change, tab open, etc.)
    - Respects safety boundaries

11. **Engine Registry** (`src/core/engines/EngineRegistry.ts`)
    - Implements `EngineRegistry` interface
    - Registers all engines
    - Executes in priority order
    - Collects and aggregates outputs

### Testing Requirements

- Unit test for each engine
- Test `isActive()` conditions
- Test `process()` with mock contexts
- Test `generateInstructions()` output
- 80%+ coverage

### Seam Contracts

- ✅ Implement `Engine` interface exactly
- ✅ Pure TypeScript (no React, no DOM access)
- ✅ Stateless (all state in context, return effects)
- ✅ Return `EngineOutput` with instructions and effects
- ✅ Never mutate stores directly

---

## 🎯 Agent 2: State Management Engineer

**Priority**: CRITICAL
**Estimated Time**: 20-30 minutes
**Location**: `src/core/state/`

### Responsibilities

Create Zustand stores with atomic operations and localStorage persistence.

### Deliverables

1. **Game State Store** (`src/core/state/gameStateStore.ts`)
   - Implements `GameStateStore` interface
   - Manages: gameState, choices, intrusiveThought, isGenerating
   - Persistence to localStorage

2. **World State Store** (`src/core/state/worldStateStore.ts`)
   - Implements `WorldStateStore` interface
   - Manages: worldState with all properties
   - Actions: updateWorld, increaseHorror, decreaseHealth, setCorruption

3. **History Store** (`src/core/state/historyStore.ts`)
   - Implements `HistoryStore` interface
   - Manages: story segments array
   - Actions: addSegment, updateSegment, reviseSegment, getRecent

4. **Player Profile Store** (`src/core/state/playerProfileStore.ts`)
   - Implements `PlayerProfileStore` interface
   - Manages: player psychological profile
   - Actions: updateFearProfile, recordChoice, analyzePatterns

5. **State Manager** (`src/core/state/StateManager.ts`)
   - Implements `StateManager` interface
   - Coordinates multi-store operations
   - Atomic updates via `applyEngineEffects()`
   - Snapshot/restore for testing

### Testing Requirements

- Test each store action
- Test persistence (localStorage)
- Test atomic operations
- Test reset functionality
- 85%+ coverage

### Seam Contracts

- ✅ All actions synchronous
- ✅ Zustand with persist middleware
- ✅ Never expose internal store implementation
- ✅ All updates via actions only
- ✅ StateManager coordinates atomicity

---

## 🎯 Agent 3: AI Services Integrator

**Priority**: CRITICAL
**Estimated Time**: 30-40 minutes
**Location**: `src/services/ai/`

### Responsibilities

Rebuild AI service layer with Grok-4 primary, Gemini fallback, graceful degradation.

### Deliverables

1. **Grok Service** (`src/services/ai/grokService.ts`)
   - Implements `AIService` interface
   - X.AI Grok-4 Fast Reasoning integration
   - 2M token context window
   - API key from env (VITE_XAI_API_KEY)

2. **Gemini Service** (`src/services/ai/geminiService.ts`)
   - Implements `AIService` interface
   - Google Gemini 2.5 Pro + Flash
   - Graceful model fallback
   - API key from env (VITE_GEMINI_API_KEY)

3. **Mock Service** (`src/services/ai/mockService.ts`)
   - Implements `AIService` interface
   - Rich demo data for development
   - Works without API keys
   - Returns realistic command sequences

4. **Unified AI Service** (`src/services/ai/unifiedAIService.ts`)
   - Implements `UnifiedAIService` interface
   - Facade over all providers
   - Automatic fallback chain: Grok → Gemini Pro → Gemini Flash → Mock
   - Provider testing

5. **Prompt Builder** (`src/services/ai/promptBuilder.ts`)
   - Implements `PromptBuilder` interface
   - Builds system prompts with genre
   - Injects engine instructions
   - Context summarization

6. **Response Parser** (`src/services/ai/responseParser.ts`)
   - Implements `ResponseParser` interface
   - Extracts JSON from AI responses
   - Validates with Zod schemas
   - Sanitizes text output

### Testing Requirements

- Test each service with mock responses
- Test fallback chain
- Test prompt building
- Test response parsing
- 75%+ coverage

### Seam Contracts

- ✅ All methods async
- ✅ Services don't access stores directly
- ✅ Receive context, return AIResponse
- ✅ Handle network failures gracefully
- ✅ Token estimation for context management

---

## 🎯 Agent 4: UI Components Designer

**Priority**: MEDIUM
**Estimated Time**: 25-35 minutes
**Location**: `src/ui/`

### Responsibilities

Create React UI components with cosmic horror theme and corruption effects.

### Deliverables

1. **Start Screen** (`src/ui/screens/StartScreen.tsx`)
   - Genre selection
   - AI provider selection
   - New Game / Continue / Demo
   - Props: `StartScreenProps`

2. **Descent Screen** (`src/ui/screens/DescentScreen.tsx`)
   - Main gameplay interface
   - Story text display
   - Choice buttons
   - Image display with loading states
   - Props: `DescentScreenProps`

3. **Unraveling Screen** (`src/ui/screens/UnravelingScreen.tsx`)
   - Reality collapse state
   - Final narrative
   - Restart option
   - Props: `UnravelingScreenProps`

4. **Corruption Effect Component** (`src/ui/effects/CorruptionEffect.tsx`)
   - Implements `CorruptionEffect` interface
   - CSS transformations based on corruption level
   - Hue shift, rotation, opacity, glitch

5. **Glitch Effect Component** (`src/ui/effects/GlitchEffect.tsx`)
   - Implements `GlitchEffect` interface
   - Text glitch animations
   - Triggered by horror events

6. **Story Segment Display** (`src/ui/components/StorySegmentDisplay.tsx`)
   - Renders StorySegment
   - Shows images with loading states
   - Marks revised/quantum shift segments

7. **Choice Button Component** (`src/ui/components/ChoiceButton.tsx`)
   - Renders Choice
   - Special styling for intrusive thoughts
   - Disabled during generation

8. **Theme Provider** (`src/ui/theme/ThemeProvider.tsx`)
   - CSS variables for cosmic horror
   - Color palette: dark blues, purples, reds
   - Typography: monospace, horror fonts

### Testing Requirements

- Render tests for each component
- Test props handling
- Test corruption effect application
- 70%+ coverage

### Seam Contracts

- ✅ Pure React (no store access in components)
- ✅ State via props, actions via callbacks
- ✅ No business logic in components
- ✅ Effects as separate composable components

---

## 🎯 Agent 5: Command System Builder

**Priority**: MEDIUM
**Estimated Time**: 20-30 minutes
**Location**: `src/core/commands/`

### Responsibilities

Rebuild command pattern with discriminated unions and type-safe executors.

### Deliverables

1. **Base Executor** (`src/core/commands/base/CommandExecutor.ts`)
   - Implements `CommandExecutor` interface
   - Abstract base for all executors

2. **Display Text Executor** (`src/core/commands/displayText.ts`)
   - Executes `displayText` command
   - Updates history store
   - Implements `TextDisplayExecutor` with effects

3. **Display Choices Executor** (`src/core/commands/displayChoices.ts`)
   - Executes `displayChoices` command
   - Updates game state store with choices
   - Handles intrusive thoughts

4. **Generate Image Executor** (`src/core/commands/generateImage.ts`)
   - Executes `generateImage` command
   - Implements `ImageGenerationExecutor`
   - Async image generation
   - Updates segment with image URL

5. **Update World State Executor** (`src/core/commands/updateWorldState.ts`)
   - Executes `updateWorldState` command
   - Implements `WorldStateExecutor`
   - Validates updates before applying

6. **Wait Executor** (`src/core/commands/wait.ts`)
   - Executes `wait` command
   - Delays for dramatic effect

7. **Apply Corruption Executor** (`src/core/commands/applyCorruption.ts`)
   - Executes `applyCorruption` command
   - Updates corruption level
   - Generates visual effects

8. **Browser Effect Executor** (`src/core/commands/browserEffect.ts`)
   - Executes `browserEffect` command
   - Implements `BrowserEffectExecutor`
   - Safe browser manipulation

9. **Revise History Executor** (`src/core/commands/reviseHistory.ts`)
   - Executes `reviseHistory` command
   - Updates past segments (Temporal Revision)

10. **Quantum Shift Executor** (`src/core/commands/quantumShift.ts`)
    - Executes `quantumShift` command
    - Switches timelines (Quantum Narrative)

11. **Command Queue** (`src/core/commands/CommandQueue.ts`)
    - Implements `CommandQueue` interface
    - Sequential execution
    - Error recovery

### Testing Requirements

- Unit test for each executor
- Test validation logic
- Test error handling
- Test queue execution order
- 80%+ coverage

### Seam Contracts

- ✅ All executors async
- ✅ Validate before executing
- ✅ Return structured ExecutionResult
- ✅ Update stores via actions only
- ✅ Failed commands don't break queue

---

## 🎯 Agent 6: Flow Orchestrator

**Priority**: MEDIUM
**Estimated Time**: 25-35 minutes
**Location**: `src/flows/`

### Responsibilities

Create game flow orchestration with "descent" and "unraveling" phases.

### Deliverables

1. **Descent Flow** (`src/flows/DescentFlow.ts`)
   - Implements `DescentFlow` interface
   - Main gameplay loop
   - Calculates descent level
   - Determines when to transition to unraveling

2. **Unraveling Flow** (`src/flows/UnravelingFlow.ts`)
   - Implements `UnravelingFlow` interface
   - Reality collapse mechanics
   - Calculates unraveling level
   - Generates collapse effects
   - Determines when to transition to collapsed

3. **Flow Coordinator** (`src/flows/FlowCoordinator.ts`)
   - Implements `FlowCoordinator` interface
   - Manages flow transitions
   - Orchestrates: Engines → AI → Commands → State
   - Choice processing pipeline

4. **Flow Context Builder** (`src/flows/FlowContextBuilder.ts`)
   - Builds `FlowContext` from stores
   - Gathers recent history
   - Includes player profile
   - Adds current choice

### Testing Requirements

- Test flow transitions
- Test engine coordination
- Test command execution
- Mock all dependencies
- 75%+ coverage

### Seam Contracts

- ✅ Flows don't implement engine logic
- ✅ Flows coordinate, don't execute
- ✅ Return FlowResult with commands
- ✅ Testable without UI

---

## 🎯 Agent 7: Image & Cache Engineer

**Priority**: LOW
**Estimated Time**: 15-25 minutes
**Location**: `src/services/images/`

### Responsibilities

Rebuild image generation pipeline with caching and multi-service support.

### Deliverables

1. **Image Service Base** (`src/services/images/base/ImageService.ts`)
   - Implements `ImageService` interface
   - Abstract base for providers

2. **Grok Image Service** (`src/services/images/grokImageService.ts`)
   - X.AI image generation
   - Priority: 1 (highest)

3. **Gemini Image Service** (`src/services/images/geminiImageService.ts`)
   - Google Gemini image generation
   - Priority: 2

4. **Unsplash Fallback Service** (`src/services/images/unsplashService.ts`)
   - Fallback to Unsplash API
   - Priority: 3 (lowest)

5. **Image Pipeline** (`src/services/images/ImagePipeline.ts`)
   - Implements `ImagePipeline` interface
   - Tries services in priority order
   - Returns first success or null

6. **LRU + TTL Cache** (`src/services/cache/LRUTTLCache.ts`)
   - Implements `LRUTTLCache` interface
   - Max 50 items
   - 30 min TTL
   - Automatic eviction and pruning

### Testing Requirements

- Test cache eviction
- Test TTL expiration
- Test image fallback chain
- 70%+ coverage

### Seam Contracts

- ✅ Image generation is best-effort
- ✅ null is valid return value
- ✅ Cache transparent to consumers
- ✅ Failed image doesn't block game

---

## 🎯 Agent 8: Testing & Quality Engineer

**Priority**: MEDIUM
**Estimated Time**: 30-40 minutes
**Location**: `tests/`

### Responsibilities

Create comprehensive test suite ensuring all seams are validated.

### Deliverables

1. **Unit Tests** (`tests/unit/`)
   - Test each engine
   - Test each store
   - Test each executor
   - Test each service

2. **Integration Tests** (`tests/integration/`)
   - Test Engine → State integration
   - Test AI Service → Command integration
   - Test Flow → Engine → Command integration
   - Test UI → Store integration

3. **Mock Implementations** (`tests/mocks/`)
   - Mock AI services
   - Mock image services
   - Mock stores
   - Mock contexts

4. **Test Utilities** (`tests/utils/`)
   - Context builders
   - Store initializers
   - Assertion helpers

5. **Coverage Report Configuration** (`vitest.config.ts`)
   - Configure coverage thresholds
   - Target: 80% overall
   - Exclude type files

### Testing Requirements

- 80%+ overall coverage
- All seam boundaries tested
- Integration tests for critical paths

### Seam Contracts

- ✅ Test interface compliance
- ✅ Test error handling at boundaries
- ✅ Mock dependencies properly
- ✅ Validate with Zod schemas

---

## 🔄 Integration Order

Once all agents complete their work:

1. **Phase 1**: Types + Config (Foundation)
   - Validate all type definitions
   - Ensure config loads properly

2. **Phase 2**: State + Engines (Core)
   - Integrate stores
   - Register engines
   - Test engine execution

3. **Phase 3**: AI + Commands (Execution)
   - Integrate AI services
   - Wire up command executors
   - Test command execution

4. **Phase 4**: Flows + Images (Orchestration)
   - Integrate flows
   - Wire up image pipeline
   - Test full choice flow

5. **Phase 5**: UI (Presentation)
   - Integrate React components
   - Connect stores to UI
   - Test end-to-end flow

6. **Phase 6**: Testing (Validation)
   - Run all tests
   - Verify coverage
   - Fix any integration issues

---

## ✅ Agent Checklist

Before marking work complete, each agent must:

- [ ] All interfaces from seams implemented
- [ ] TypeScript strict mode passes (zero errors)
- [ ] Unit tests written and passing
- [ ] Coverage meets target
- [ ] No circular dependencies
- [ ] No direct store mutations
- [ ] Error handling at seam boundaries
- [ ] Zod schemas for external data
- [ ] Documentation comments added
- [ ] Code formatted and linted

---

## 🚀 Deployment Command

Once all agents complete:

```bash
npm run build
npm test
npm run lint
```

All must pass before committing.

---

This deployment plan ensures all 8 agents can work in parallel without conflicts, honoring the architectural seams defined in SEAMS.md.
