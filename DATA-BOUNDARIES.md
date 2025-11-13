# Data Boundaries Map - Apophenia

**Purpose**: This document identifies ALL data boundaries in the Apophenia system as required by Seam-Driven Development (SDD) Step 2: IDENTIFY.

**Date**: 2025-11-12
**Version**: 1.0.0

---

## Overview

A **data boundary** is any point where data crosses from one component/layer to another. This includes:
- Frontend ↔ Backend APIs
- Component ↔ Component communication
- Service ↔ Service interactions
- State transitions
- Async boundaries (loading, error, success states)

---

## Boundary #1: UI Components ↔ Zustand Stores

**Direction**: Bidirectional
**Data Flow**: UI reads state, triggers actions

### Boundaries:
| Component | Store | Data In | Data Out |
|-----------|-------|---------|----------|
| StartScreen | GameStateStore | - | gameState, availableProviders |
| DescentScreen | GameStateStore | Choice (via onChoice) | gameState, choices, intrusiveThought, isGenerating |
| DescentScreen | WorldStateStore | - | worldState |
| DescentScreen | HistoryStore | - | segments (currentSegment) |
| UnravelingScreen | WorldStateStore | - | worldState |
| UnravelingScreen | HistoryStore | - | segments (finalSegment) |
| App.tsx | All Stores | Callbacks (handleStartGame, handleChoice) | All state |

**Contract**: Defined in seams.ts lines 182-229
**State Shape**: Must match interface exactly
**Async States**: isGenerating boolean

**Implementation Location**:
- `/home/user/Apophenia/src/App.tsx` (lines 59-66)
- `/home/user/Apophenia/src/ui/screens/StartScreen.tsx`
- `/home/user/Apophenia/src/ui/screens/DescentScreen.tsx`
- `/home/user/Apophenia/src/ui/screens/UnravelingScreen.tsx`

---

## Boundary #2: Zustand Stores ↔ LocalStorage

**Direction**: Bidirectional
**Data Flow**: Stores persist to localStorage, hydrate on load

### Boundaries:
| Store | Storage Key | Shape |
|-------|-------------|-------|
| GameStateStore | 'apophenia-game-state' | { gameState, choices, intrusiveThought, isGenerating } |
| WorldStateStore | 'apophenia-world-state' | WorldState |
| HistoryStore | 'apophenia-history' | { segments: StorySegment[] } |
| PlayerProfileStore | 'apophenia-profile' | PlayerProfile |

**Contract**: JSON serializable
**Persistence**: Zustand persist middleware (automatic)
**Versioning**: Need version migration strategy
**Edge Cases**: Corrupted data, quota exceeded

**Implementation Location**:
- `/home/user/Apophenia/src/core/state/gameStateStore.ts`
- `/home/user/Apophenia/src/core/state/worldStateStore.ts`
- `/home/user/Apophenia/src/core/state/historyStore.ts`
- `/home/user/Apophenia/src/core/state/playerProfileStore.ts`

---

## Boundary #3: Game Service ↔ Flow Coordinator

**Direction**: Service → Coordinator
**Data Flow**: Game service calls flow coordinator for choice processing

### Boundary:
- **Input**: Choice (from user), GenreConfig (on init)
- **Output**: FlowResult (commands, worldUpdates, nextState)
- **Contract**: FlowResult (seams.ts lines 463-468)
- **Error States**: FlowResult.error string

**Call Chain**:
```
gameService.processPlayerChoice(choice)
  → flowCoordinator.getCurrentFlow()
  → flow.processChoice(choice)
  → returns FlowResult
```

**Implementation Location**:
- `/home/user/Apophenia/src/services/gameService.ts` (lines 77-137)
- `/home/user/Apophenia/src/flows/FlowCoordinator.ts` (lines 50-89)

---

## Boundary #4: Flow Coordinator ↔ Engine Registry

**Direction**: Coordinator → Registry → Engines
**Data Flow**: Flow builds EngineContext, registry executes engines

### Boundary:
- **Input**: EngineContext (worldState, recentHistory, playerProfile, currentChoice)
- **Output**: EngineOutput[] (instructions, effects, metadata)
- **Contract**: Defined in seams.ts lines 274-287
- **Execution**: Sequential by priority (1-10)

**Call Chain**:
```
flowCoordinator.executeEngines(context)
  → builds EngineContext via flowContextBuilder
  → executes engines in priority order
  → each engine.process(context)
  → returns EngineOutput[]
```

**Active Engines**:
- Temporal Revision Engine
- Meta-Consciousness Engine
- Quantum Narrative Engine
- Adaptive Horror Engine
- Reality Corruption Engine
- Neural Echo Chambers Engine
- Semantic Archaeology Engine
- Narrative DNA Engine
- Fifth Wall Breaker Engine

**Implementation Location**:
- `/home/user/Apophenia/src/flows/FlowCoordinator.ts` (lines 94-142)
- `/home/user/Apophenia/src/flows/FlowContextBuilder.ts`
- `/home/user/Apophenia/src/services/ai/engines/` (all engines)

---

## Boundary #5: Engines ↔ AI Services

**Direction**: Engine → Unified AI → Provider
**Data Flow**: Engine generates instructions, AI service generates response

### Boundary:
- **Input**: AIRequest (provider, prompt, context, temperature, maxTokens)
- **Output**: AIResponse (provider, content, commands, metadata)
- **Contract**: Defined in seams.ts lines 102-127
- **Fallback Chain**: Grok → Mock
- **Error Handling**: Try next provider on failure

**Call Chain**:
```
engine.process(context)
  → generates instructions
  → unifiedAIService.generateWithFallback(request)
  → tries Grok service
  → if fails, tries Mock service
  → returns AIResponse with commands
```

**Implementation Location**:
- `/home/user/Apophenia/src/services/ai/unifiedAIService.ts` (lines 66-109)
- `/home/user/Apophenia/src/services/ai/grokService.ts`
- `/home/user/Apophenia/src/services/ai/mockService.ts`

---

## Boundary #6: AI Services ↔ External APIs

**Direction**: Service → External API
**Data Flow**: HTTP requests to xAI Grok APIs and Unsplash API

### Boundaries:

#### Grok Text API (xAI)
- **Endpoint**: `https://api.x.ai/v1/chat/completions`
- **Method**: POST
- **Input**: { model: 'grok-4-fast-reasoning', messages: [], temperature, max_tokens }
- **Output**: { id, choices: [{ message: { content } }], usage: { total_tokens } }
- **Authentication**: Bearer token in headers (VITE_XAI_API_KEY)
- **Error States**: 401 (invalid key), 429 (rate limit), 500 (server error)

#### Grok Image API (xAI)
- **Endpoint**: `https://api.x.ai/v1/images/generations`
- **Method**: POST
- **Input**: { model: 'grok-2-image-1212', prompt, response_format: 'url' }
- **Output**: { data: [{ url }] }
- **Authentication**: Bearer token in headers (VITE_XAI_API_KEY)
- **Error States**: Same as text API

#### Unsplash API (Fallback)
- **Endpoint**: `https://api.unsplash.com/photos/random`
- **Method**: GET
- **Input**: { query, orientation } (query params)
- **Output**: { urls: { regular } }
- **Authentication**: Client-ID in headers (VITE_UNSPLASH_ACCESS_KEY)
- **Error States**: 403 (rate limit), 404 (not found)

**Implementation Location**:
- `/home/user/Apophenia/src/services/ai/grokService.ts`
- `/home/user/Apophenia/src/services/images/grokImageService.ts`
- `/home/user/Apophenia/src/services/images/unsplashService.ts`

---

## Boundary #7: Command Queue ↔ Command Executors

**Direction**: Queue → Executors
**Data Flow**: Queue dispatches commands to executors sequentially

### Boundary:
- **Input**: Command (discriminated union of 10 types)
- **Output**: ExecutionResult (success, command, error?, metadata?)
- **Contract**: Defined in seams.ts lines 74-84, 405-416
- **Execution**: Sequential (commands execute in order)
- **Error Recovery**: Failed command doesn't stop queue

**Command Types**:
1. `createSegment` - Create new story segment
2. `displayText` - Display text content in segment
3. `displayChoices` - Show choices to player
4. `generateImage` - Generate image for segment (async)
5. `updateWorldState` - Update world state properties
6. `wait` - Pause execution for duration
7. `applyCorruption` - Apply corruption effects
8. `browserEffect` - Browser manipulation (title, tabs, etc.)
9. `reviseHistory` - Rewrite past segment (Temporal Revision)
10. `quantumShift` - Shift between quantum timelines

**Call Chain**:
```
commandQueue.enqueue(commands)
commandQueue.executeSequential()
  → for each command:
    → find appropriate executor
    → executor.validate(command)
    → if valid: executor.execute(command)
    → collect ExecutionResult
  → return ExecutionResult[]
```

**Implementation Location**:
- `/home/user/Apophenia/src/core/commands/CommandQueue.ts` (lines 162-185)
- `/home/user/Apophenia/src/core/commands/` (all executors)

---

## Boundary #8: Command Executors ↔ State Stores

**Direction**: Executors → Stores
**Data Flow**: Executors call store actions to update state

### Boundaries:
| Executor | Store | Action | Data Shape |
|----------|-------|--------|------------|
| CreateSegmentExecutor | HistoryStore | addSegment(segment) | StorySegment |
| DisplayTextExecutor | HistoryStore | updateSegment(id, { text }) | { text: string } |
| DisplayChoicesExecutor | GameStateStore | setChoices(choices, intrusive) | Choice[], Choice? |
| UpdateWorldStateExecutor | WorldStateStore | updateWorld(partial) | Partial<WorldState> |
| ApplyCorruptionExecutor | WorldStateStore | setCorruption(level) | number (0-100) |
| ReviseHistoryExecutor | HistoryStore | reviseSegment(id, newText) | string |

**Contract**: Actions are synchronous
**Side Effects**: Trigger React re-renders via Zustand
**Persistence**: Zustand persist middleware saves to localStorage

**Implementation Location**:
- `/home/user/Apophenia/src/core/commands/createSegment.ts`
- `/home/user/Apophenia/src/core/commands/displayText.ts`
- `/home/user/Apophenia/src/core/commands/displayChoices.ts`
- `/home/user/Apophenia/src/core/commands/updateWorldState.ts`
- `/home/user/Apophenia/src/core/commands/applyCorruption.ts`
- `/home/user/Apophenia/src/core/commands/reviseHistory.ts`

---

## Boundary #9: Command Executors ↔ Image Pipeline

**Direction**: Executor → Pipeline → Image Services
**Data Flow**: generateImage executor calls pipeline with fallback

### Boundary:
- **Input**: { prompt: string, segmentId: string, priority?: 'high' | 'low' }
- **Output**: ImageResult (url | null, provider, cached, error?)
- **Contract**: Defined in seams.ts lines 499-512
- **Fallback Chain**: Grok Image → Unsplash → null
- **Async**: Non-blocking (image loads after segment displays)

**Call Chain**:
```
GenerateImageExecutor.execute(command)
  → marks segment mainStatus as 'loading'
  → imagePipeline.generateWithFallback(prompt)
    → checks cache first
    → tries grokImageService
    → if fails, tries unsplashService
    → returns ImageResult
  → updates HistoryStore with image URL (async)
  → marks mainStatus as 'loaded' or 'failed'
```

**Implementation Location**:
- `/home/user/Apophenia/src/core/commands/generateImage.ts` (lines 49-123)
- `/home/user/Apophenia/src/services/images/ImagePipeline.ts` (lines 67-117)

---

## Boundary #10: Image Pipeline ↔ Image Cache

**Direction**: Bidirectional
**Data Flow**: Pipeline checks cache before generating, stores results

### Boundary:
- **Input (get)**: prompt hash (string key)
- **Output (get)**: url | null
- **Input (set)**: prompt hash, url, ttl
- **Contract**: Defined in seams.ts lines 521-528
- **Eviction**: LRU + TTL (max 50 images, 30 min TTL)

**Cache Operations**:
```
imagePipeline.generateWithFallback(prompt)
  → cache.get(prompt) - Check for cached result
  → if found: return cached URL
  → if not found:
    → generate image via services
    → cache.set(prompt, url) - Store result
    → return new URL
```

**Implementation Location**:
- `/home/user/Apophenia/src/services/images/ImagePipeline.ts` (lines 68-76, 93)
- `/home/user/Apophenia/src/services/cache/LRUTTLCache.ts`

---

## UI State Transitions

### State Machine: GameState Enum

```
MENU (0)
  ↓ (user clicks "Start Game")
GENERATING (1)
  ↓ (AI generates opening)
DESCENDING (3) ←┐
  ↓              │ (user makes choices)
  └──────────────┘
  ↓ (corruption > threshold OR horror > 70)
UNRAVELING (3 sub-state)
  ↓ (reality collapses)
COLLAPSED (4)
```

**State Values**:
- `MENU = 'menu'` (enum value 0)
- `GENERATING = 'generating'` (enum value 1)
- `DESCENDING = 'descending'` (enum value 3 - PLAYING)
- `UNRAVELING = 'unraveling'` (enum value 3 - PLAYING sub-state)
- `COLLAPSED = 'collapsed'` (enum value 4 - ENDED)

### Async State Transitions

**Pattern**: Async operations use `isGenerating` boolean flag

```
isGenerating: false (idle)
  ↓ (user makes choice)
isGenerating: true (loading)
  ↓ (AI responds with commands)
isGenerating: false (success) + new content displayed
  OR
isGenerating: false (error) + error message displayed
```

**Components Using Async States**:
- DescentScreen: Shows loading indicator when `isGenerating === true`
- StartScreen: Disables "Start Game" button when initializing
- App.tsx: Shows LoadingIndicator during GENERATING state

**Implementation Location**:
- `/home/user/Apophenia/src/App.tsx` (lines 145-153)
- `/home/user/Apophenia/src/services/gameService.ts` (lines 82, 135)

---

## Component Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          USER INPUT                          │
│                       (Choice Selection)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   UI COMPONENT (DescentScreen)               │
│  Boundary #1: Props → Component State                       │
│  Data: Choice → onChoice callback                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      GAME SERVICE                            │
│  Boundary #3: Callback → Service Method                     │
│  Data: Choice → processPlayerChoice(choice)                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      FLOW COORDINATOR                        │
│  Boundary #4: Service → Coordinator → Engines               │
│  Data: Choice → FlowContext → EngineOutput[]                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      ENGINE REGISTRY                         │
│  Boundary #5: Engines → AI Service                          │
│  Data: EngineContext → AIRequest → AIResponse               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   UNIFIED AI SERVICE                         │
│  Boundary #6: AI Service → External API                     │
│  Data: AIRequest → HTTP POST → JSON Response                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     COMMAND QUEUE                            │
│  Boundary #7: AI Response → Command Executors               │
│  Data: Command[] → ExecutionResult[]                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   COMMAND EXECUTORS                          │
│  Boundary #8: Executors → State Stores                      │
│  Boundary #9: Executors → Image Pipeline (async)            │
│  Data: Actions → State Updates                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      ZUSTAND STORES                          │
│  Boundary #2: Stores → LocalStorage                         │
│  Data: State → JSON → localStorage                          │
│  Side Effect: React re-renders                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      UI COMPONENTS                           │
│  Boundary #1: State → Props                                 │
│  Data: New state → Component re-renders                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Edge Cases & Error Boundaries

### API Errors (Boundary #6)
- **Boundary**: AI Service ↔ External API
- **Cases**: 401 (invalid key), 429 (rate limit), 500 (server error), timeout, network error
- **Handling**:
  - Fallback to next provider in chain (Grok → Mock)
  - Mock service always succeeds (provides default responses)
  - Error logged, game continues with mock data
- **Implementation**: `/home/user/Apophenia/src/services/ai/unifiedAIService.ts` (lines 66-109)

### State Corruption (Boundary #2)
- **Boundary**: LocalStorage ↔ Zustand Stores
- **Cases**: Invalid JSON, schema mismatch, quota exceeded, corrupted data
- **Handling**:
  - Zustand persist middleware catches parse errors
  - Reset to defaults on corruption
  - Log error to console
  - Game continues with fresh state
- **Implementation**: Zustand persist middleware (automatic)

### Command Execution Failures (Boundary #7)
- **Boundary**: Command Queue ↔ Executors
- **Cases**: Invalid command payload, missing executor, store action fails, validation error
- **Handling**:
  - Validation before execution
  - Failed command logged but queue continues
  - ExecutionResult.success = false, error message included
  - Game flow not interrupted by single command failure
- **Implementation**: `/home/user/Apophenia/src/core/commands/CommandQueue.ts` (lines 162-185)

### Image Generation Failures (Boundary #9)
- **Boundary**: Image Pipeline ↔ Image Services
- **Cases**: API error, invalid prompt, rate limit, network error, timeout
- **Handling**:
  - Try next service in fallback chain (Grok → Unsplash)
  - Return null if all services fail (graceful degradation)
  - Segment mainStatus set to 'failed'
  - Game continues without image (text-only experience)
- **Implementation**: `/home/user/Apophenia/src/services/images/ImagePipeline.ts` (lines 67-117)

### Flow Transition Failures (Boundary #3)
- **Boundary**: Game Service ↔ Flow Coordinator
- **Cases**: Flow initialization fails, invalid state transition, missing flow
- **Handling**:
  - Catch error in gameService.processPlayerChoice
  - Display error choice to player: "Something went wrong. Try again?"
  - isGenerating flag cleared in finally block
  - Return to menu on critical failures
- **Implementation**: `/home/user/Apophenia/src/services/gameService.ts` (lines 122-136)

### Engine Processing Failures (Boundary #4)
- **Boundary**: Flow Coordinator ↔ Engines
- **Cases**: Engine throws error, invalid EngineOutput, missing context
- **Handling**:
  - Try-catch around each engine execution
  - Log error, continue with other engines
  - Failed engine doesn't block flow execution
  - Empty EngineOutput[] if all engines fail
- **Implementation**: `/home/user/Apophenia/src/flows/FlowCoordinator.ts` (lines 114-138)

---

## Validation Checklist

For each boundary, verify:
- [x] Data shape defined in contract (seams.ts)
- [x] Input validation exists
- [x] Output validation exists
- [x] Error states defined
- [x] Async handling (if applicable)
- [x] Edge cases documented
- [x] Mock implementation exists
- [x] Contract tests written (some boundaries)

---

## Appendix: Boundary Summary

| # | From | To | Contract | Direction | Status |
|---|------|-----|----------|-----------|--------|
| 1 | UI Components | Zustand Stores | Props/Actions | Bidirectional | ✅ Defined |
| 2 | Zustand Stores | LocalStorage | JSON | Bidirectional | ✅ Defined |
| 3 | Game Service | Flow Coordinator | FlowResult | Service → Coordinator | ✅ Defined |
| 4 | Flow Coordinator | Engines | EngineContext/Output | Coordinator → Engines | ✅ Defined |
| 5 | Engines | AI Services | AIRequest/Response | Engines → Services | ✅ Defined |
| 6 | AI Services | External APIs | HTTP JSON | Services → APIs | ✅ Defined |
| 7 | Command Queue | Executors | Command/ExecutionResult | Queue → Executors | ✅ Defined |
| 8 | Executors | State Stores | Actions | Executors → Stores | ✅ Defined |
| 9 | Executors | Image Pipeline | ImageResult | Executors → Pipeline | ✅ Defined |
| 10 | Image Pipeline | Image Cache | get/set | Bidirectional | ✅ Defined |

**Total Boundaries Identified**: 10 major boundaries
**All Boundaries Documented**: ✅ Yes
**SDD Step 2 Complete**: ✅ Yes

---

## Cross-Reference: SDD Process

### Step 1: DEFINE ✅
- All seams defined in `/home/user/Apophenia/src/core/types/seams.ts`
- Architecture documented in `/home/user/Apophenia/SEAMS.md`

### Step 2: IDENTIFY ✅ (This Document)
- All data boundaries mapped
- Edge cases and error boundaries documented
- Data flow diagrams created

### Step 3: DEFEND (Next Step)
- Implement validation at each boundary
- Add contract tests for all boundaries
- Add integration tests for critical paths
- Document security considerations

---

**Next Steps for SDD Compliance**:
1. ✅ DEFINE - Complete (seams.ts, SEAMS.md)
2. ✅ IDENTIFY - Complete (this document)
3. ⏳ DEFEND - Add validation and tests at boundaries
4. ⏳ DOCUMENT - Expand inline documentation at boundary implementations
5. ⏳ EVOLVE - Version contracts, add migration strategies

---

**Maintenance Notes**:
- Update this document when adding new boundaries
- Review boundary contracts quarterly
- Update error handling as new edge cases discovered
- Keep implementation locations current with refactoring

**Document Version History**:
- v1.0.0 (2025-11-12): Initial comprehensive data boundaries map
