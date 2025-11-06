# Store Responsibility Matrix

A detailed breakdown of what each store does, how they interact, and identified overlaps.

---

## 1. Store Responsibility Grid

### gameStateStore
| Aspect | Details |
|--------|---------|
| **Primary Purpose** | UI flow state and player input management |
| **Data Managed** | Game state enum, available choices, generation flag, intrusive thought |
| **Update Frequency** | High (every state transition, every choice display) |
| **Persistence** | Yes (localStorage: 'cosmic-narrative-gamestate') |
| **Dependencies** | None |
| **Dependents** | GameScreen, StartScreen, EndScreen, useGameLoop |
| **Methods** | setGameState, setChoices, setIsGenerating, reset |
| **Key Decisions** | isGenerating flag prevents double-click, intrusiveThought separate for UI |

---

### worldStateStore
| Aspect | Details |
|--------|---------|
| **Primary Purpose** | Narrative context and atmosphere management |
| **Data Managed** | Protagonist, setting, dilemma, summary, health, intensity, distortion, genre |
| **Update Frequency** | Medium (state transitions, major events, background summary) |
| **Persistence** | Yes (localStorage: 'cosmic-narrative-worldstate') |
| **Dependencies** | storyHistoryStore (for summary generation) |
| **Dependents** | GameScreen, useGameLoop, updateWorldStateExecutor |
| **Methods** | setWorldState, updateWorldState, setGenreConfig, reset |
| **Key Decisions** | summary is derived from history but stored separately for performance |

---

### storyHistoryStore
| Aspect | Details |
|--------|---------|
| **Primary Purpose** | Persistent narrative record and temporal management |
| **Data Managed** | Story segments with text, images, status, revision flags, corruption level |
| **Update Frequency** | High (new segment with every narrative beat, image updates) |
| **Persistence** | Yes (localStorage: 'cosmic-narrative-storyhistory') |
| **Dependencies** | None |
| **Dependents** | GameScreen (display), triggerSummary, useGameLoop, createSegmentExecutor |
| **Methods** | addStorySegment, updateSegmentById, replaceStoryHistory, reset |
| **Key Decisions** | Does NOT store choices (intentional), stores all revolutionary features |

---

### imageCacheStore
| Aspect | Details |
|--------|---------|
| **Primary Purpose** | Image generation result caching with memory management |
| **Data Managed** | Prompt→URL cache, access metadata, TTL tracking, telemetry stats |
| **Update Frequency** | On-demand (when images generated, when cache queried) |
| **Persistence** | Manual localStorage (NOT via Zustand persist) |
| **Dependencies** | CACHE_CONFIG from services |
| **Dependents** | Image generation commands, generateImage service |
| **Methods** | addToCache, getFromCache, evictStaleEntries, clearCache, getTelemetry |
| **Key Decisions** | LRU + TTL eviction, manual persistence for control, separate from game state |

---

### aiModelStore
| Aspect | Details |
|--------|---------|
| **Primary Purpose** | AI model selection and capability tracking |
| **Data Managed** | Selected model ID, test results, testing status, available models list |
| **Update Frequency** | Low (only on model switch or test) |
| **Persistence** | Partial (selectedModelId only, NOT test results) |
| **Dependencies** | xaiClient for testing |
| **Dependents** | CompactModelSelector, AI generation services |
| **Methods** | setSelectedModel, getSelectedModel, testModel, getTestResult, clearTestResults |
| **Key Decisions** | Test results not persisted (transient), model list is static in code |

---

### userStore
| Aspect | Details |
|--------|---------|
| **Primary Purpose** | Authentication state and user session management |
| **Data Managed** | Supabase session, user object, loading flag |
| **Update Frequency** | Low (only on auth events) |
| **Persistence** | None (Supabase-managed) |
| **Dependencies** | supabaseClient |
| **Dependents** | App.tsx, LoginScreen, auth flow |
| **Methods** | setSession, setUser, signUp, signIn, signOut |
| **Key Decisions** | Initialized from Supabase, listens to auth changes, not Zustand persisted |

---

## 2. Data Flow Diagram

```
USER INTERACTION
       ↓
gameStateStore (isGenerating flag, choices, gameState)
       ↓
useGameLoop.handleChoice()
       ↓
getNextStep() → generates commands
       ↓
Commands executed in sequence:
  ├─ createSegment → storyHistoryStore.addStorySegment
  ├─ displayText → storyHistoryStore.updateSegmentById
  ├─ generateImage → (cache first, then store in storyHistoryStore)
  ├─ updateWorldState → worldStateStore.updateWorldState
  ├─ displayChoices → gameStateStore.setChoices
  └─ postgenerateImage → (queued non-blocking)
       ↓
triggerSummary() (background task)
       ↓
summarizeHistory(worldState, lastSegment)
       ↓
worldStateStore.updateWorldState({ summary, lastSummarizedAt })
       ↓
Components re-render based on subscribed stores
```

---

## 3. Overlap Analysis Matrix

### Table: Which stores interact?

```
                gameState  worldState  storyHistory  imageCache  aiModel  user
gameState         —         ←(cmd)        ←(cmd)         —          —       —
worldState        —           —           ←(derive)      —          —       —
storyHistory      —           —             —            ←(store)   —       —
imageCache        —           —             —             —          —       —
aiModel           —           —             —             —          —       —
user              —           —             —             —          —       —
```

Legend:
- `←(cmd)` = indirect via command execution
- `←(derive)` = reads from to calculate derived value
- `←(store)` = stores result in

### Critical Overlap: worldStateStore ← storyHistoryStore

**Type:** Data Denormalization

**Flow:**
```
storyHistoryStore.addStorySegment(segment)
       ↓
[background async task triggers]
       ↓
triggerSummary(worldState, history)
       ↓
summarizeHistory(worldState, lastSegment)
       ↓
returns summary string
       ↓
worldStateStore.updateWorldState({ summary })
```

**Risk Factors:**
1. **Asynchronous** - Summary updates after history updates, creating desync window
2. **Untracked** - No way to know if summary is stale (recommendation: add timestamp)
3. **Background** - Runs outside normal command flow, harder to debug
4. **Network Call** - Depends on AI service, could fail silently

**Mitigation Strategies:**
- Add `lastSummarizedAt: number` timestamp
- Add consistency check in tests
- Add telemetry for staleness
- Consider adding `summaryFresh: boolean` flag

---

## 4. Update Propagation Chart

### High Priority Updates (User-Blocking)
```
Player makes choice
    ↓ setChoices
gameStateStore updates (IMMEDIATE)
    ↓ setGameState(LOADING)
UI changes immediately (1-2ms)
    ↓
AI processes choice (seconds)
    ↓ setIsGenerating(false)
gameStateStore updates (IMMEDIATE)
    ↓
storyHistoryStore.addStorySegment (IMMEDIATE)
    ↓
Components re-render (1-10ms)
```

**Latency:** Immediate (user sees response)

---

### Medium Priority Updates (Background)
```
Story segment added
    ↓
worldStateStore.updateWorldState (command execution) (IMMEDIATE)
    ↓
triggerSummary() scheduled (BACKGROUND)
    ↓ [async, 100-1000ms later]
summarizeHistory() calls AI (NETWORK, seconds)
    ↓
worldStateStore.updateWorldState({ summary }) (EVENTUAL)
```

**Latency:** 100ms - 10s (user doesn't wait)

---

### Low Priority Updates (Opportunistic)
```
Image generation completes
    ↓
imageCacheStore.addToCache (IMMEDIATE)
    ↓
storyHistoryStore.updateSegmentById({ images }) (IMMEDIATE)
    ↓
Components re-render (1-10ms)
```

**Latency:** Immediate once generated

---

## 5. Consolidation Impact Analysis

### If we merged worldStateStore + storyHistoryStore

**Pros:**
- Single source of truth for narrative data
- Simpler to reason about

**Cons:**
- Store would become 2-3x larger
- Different update frequencies would cause unnecessary re-renders
- storyHistory is append-only, worldState is mutated
- worldState has transient UI state (uiDistortion), story shouldn't know about it
- More complex testing
- Harder to persist separately

**Verdict:** ❌ NOT RECOMMENDED

---

### If we merged gameStateStore + worldStateStore

**Pros:**
- One place for all state

**Cons:**
- UI flow state mixed with narrative state
- gameState updates would trigger unnecessary narrative re-renders
- worldState updates would cause unnecessary UI re-renders
- Different persistence requirements
- Breaks separation of concerns
- Would require full re-architecture

**Verdict:** ❌ ABSOLUTELY NOT

---

### If we moved imageCacheStore into worldStateStore

**Pros:**
- Fewer stores

**Cons:**
- Cache is performance optimization, not game logic
- Different TTL and eviction policies
- worldStateStore would grow significantly
- Cache is optional/swappable implementation detail
- Hard to test cache behavior

**Verdict:** ❌ NOT RECOMMENDED

---

## 6. Responsibility Assignment Model (RACI)

### Who does what?

| Responsibility | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| Game flow state | gameStateStore | useGameLoop | - | GameScreen |
| Choices display | gameStateStore | displayChoicesExecutor | - | GameScreen |
| World progression | worldStateStore | updateWorldStateExecutor | - | GameScreen |
| Story recording | storyHistoryStore | createSegmentExecutor | storyHistoryStore | GameScreen |
| Summary generation | worldStateStore | triggerSummary | storyHistoryStore | aiService |
| Image caching | imageCacheStore | generateImage cmd | - | imageCacheStore |
| Model selection | aiModelStore | CompactModelSelector | - | aiService |
| User auth | userStore | supabaseClient | - | App, LoginScreen |

---

## 7. Communication Patterns

### Synchronous (Direct Store Calls)
```typescript
// During command execution
useGameStateStore.getState().setChoices(choices);
useWorldStateStore.getState().updateWorldState(updates);
useStoryHistoryStore.getState().addStorySegment(segment);
```

### Asynchronous (Background Tasks)
```typescript
// Triggered after story updates
triggerSummary(worldState, history) → summarizeHistory() → updateWorldState()
```

### Event-Based (React Subscriptions)
```typescript
const { choices } = useGameStateStore(); // Subscribes to changes
const { worldState } = useWorldStateStore(); // Subscribes to changes
const { storyHistory } = useStoryHistoryStore(); // Subscribes to changes
```

---

## 8. Testing Implications

### Unit Test Isolation

✅ **Good candidates for complete isolation:**
- gameStateStore (no dependencies)
- storyHistoryStore (no dependencies)
- imageCacheStore (only config dependency)
- aiModelStore (only xaiClient dependency)

⚠️ **Require mocking:**
- worldStateStore (depends on storyHistoryStore for summary)
- userStore (depends on supabaseClient)

### Integration Test Coverage

**Must test together:**
1. gameStateStore + storyHistoryStore (via useGameLoop)
2. storyHistoryStore + worldStateStore (via triggerSummary)
3. All stores + GameStateManager (reset coordination)

---

## 9. Performance Implications

### Store Subscription Overhead

| Store | Re-render Frequency | Performance Impact | Size (bytes) |
|-------|-------------------|-------------------|-------------|
| gameStateStore | ~100/min (choices) | Medium | ~500 |
| worldStateStore | ~10/min (updates) | Low | ~1000 |
| storyHistoryStore | ~10/min (new segments) | Medium | grows with game |
| imageCacheStore | ~1-5/min (cache hits) | Low | bounded by max size |
| aiModelStore | ~0.1/min (rare selection) | Negligible | ~200 |
| userStore | ~0.01/min (auth) | Negligible | ~500 |

**Optimization Strategy:**
- Current separation is optimal
- Components subscribe only to what they use
- No unnecessary re-renders

---

## 10. Recommended Documentation

Each store file should include:

```typescript
/**
 * Store Name: [store name]
 * 
 * Purpose:
 * [What this store manages and why]
 * 
 * Data Model:
 * [What shape of data it holds]
 * 
 * Update Frequency:
 * [How often changes, what triggers them]
 * 
 * Dependencies:
 * [What other stores or services it depends on]
 * 
 * Dependents:
 * [What components/services depend on it]
 * 
 * Persistence:
 * [How/where data is saved]
 * 
 * Known Issues:
 * [Any overlaps, denormalization, or technical debt]
 */
```

---

## Summary Tables

### By Responsibility Type

| Type | Stores | Status |
|------|--------|--------|
| UI Flow | gameStateStore, aiModelStore | ✅ Clear |
| Narrative Content | worldStateStore, storyHistoryStore | ⚠️ Overlap (summary) |
| Performance | imageCacheStore | ✅ Clear |
| Authentication | userStore | ✅ Clear |

### By Persistence Layer

| Layer | Stores | Method |
|-------|--------|--------|
| localStorage (Zustand) | gameStateStore, worldStateStore, storyHistoryStore, aiModelStore | ✅ Good |
| localStorage (manual) | imageCacheStore | ✅ Intentional |
| Supabase | userStore | ✅ Backend-synced |

### By Update Mechanism

| Mechanism | Stores | Frequency |
|-----------|--------|-----------|
| Direct updates | gameStateStore, worldStateStore, storyHistoryStore, imageCacheStore | High |
| Async background | worldStateStore (summary via triggerSummary) | Low |
| External sync | userStore (Supabase) | Low |

---

**Last Updated:** 2025-11-06  
**Review Recommended:** Every 6 months or after major feature additions
