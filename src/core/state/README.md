# State Management System

## Overview

This directory contains the complete state management implementation for Apophenia, built with Zustand and implementing the interfaces defined in `src/core/types/seams.ts`.

## Architecture

The state management system consists of 4 specialized stores plus a coordinator:

```
src/core/state/
├── gameStateStore.ts       # Game phase & choices
├── worldStateStore.ts      # World state & metrics
├── historyStore.ts         # Narrative history
├── playerProfileStore.ts   # Psychological profile
├── StateManager.ts         # Atomic operations coordinator
└── index.ts                # Public API exports
```

## Store Descriptions

### 1. GameStateStore (`gameStateStore.ts`)

**Purpose**: Manages the core game state machine and player choices.

**State**:
- `gameState`: Current game phase (MENU, GENERATING, DESCENDING, UNRAVELING, COLLAPSED)
- `choices`: Array of available choices for the player
- `intrusiveThought`: Special disturbing choice (optional)
- `isGenerating`: Whether AI is currently generating content

**Actions**:
- `setGameState(state)`: Transition to a new game state
- `setChoices(choices, intrusive?)`: Update available choices
- `setGenerating(generating)`: Set generation status
- `reset()`: Reset to initial state

**Persistence**: Only persists `gameState` to localStorage (choices are transient).

### 2. WorldStateStore (`worldStateStore.ts`)

**Purpose**: Manages the game world state, horror metrics, and corruption levels.

**State**:
- `worldState`: Complete world state object containing:
  - `protagonist`: Character name/description
  - `setting`: Current location/environment
  - `dilemma`: Current situation/problem
  - `psychologicalStatus`: Player's mental state (STABLE → SHATTERED)
  - `systemHealth`: Reality integrity (0-100)
  - `horrorIntensity`: Horror level (0-10)
  - `corruptionLevel`: UI/reality corruption (0-100)
  - `genreConfig`: Active genre configuration
  - `summary`: Optional narrative summary

**Actions**:
- `updateWorld(partial)`: Update any world state properties
- `increaseHorror(amount)`: Increment horror intensity (capped at 10)
- `decreaseHealth(amount)`: Decrement system health (floored at 0)
- `setCorruption(level)`: Set corruption level (clamped 0-100)
- `reset()`: Reset to initial state

**Persistence**: Full worldState persisted to localStorage.

### 3. HistoryStore (`historyStore.ts`)

**Purpose**: Maintains the complete narrative history with support for temporal revision.

**State**:
- `segments`: Array of StorySegment objects

**Actions**:
- `addSegment(segment)`: Append a new story segment
- `updateSegment(id, updates)`: Partially update a segment
- `reviseSegment(id, newText)`: Revise a segment (Temporal Revision Engine)
- `getRecent(count)`: Get last N segments
- `reset()`: Clear all segments

**Persistence**: Last 100 segments persisted to localStorage (performance optimization).

**Special Features**:
- Segments can be marked as `isRevised` with `originalText` preserved
- Supports quantum shift markers (`isQuantumShift`)
- Supports meta-event markers (`isMetaEvent`)
- Tracks corruption level per segment

### 4. PlayerProfileStore (`playerProfileStore.ts`)

**Purpose**: Tracks psychological profile and adapts to player behavior.

**State**:
- `profile`: PlayerProfile object containing:
  - `fearProfile`: Fear responses (claustrophobia, isolation, bodyHorror, etc.) - values 0-1
  - `choicePatterns`: Behavioral patterns (riskTaking, curiosity, aggression, avoidance) - values 0-1
  - `engagementMetrics`: Usage statistics (totalChoices, averageResponseTime, sessionDuration)
  - `crossSessionData`: Encrypted data for Neural Echo Chamber

**Actions**:
- `updateFearProfile(fear, intensity)`: Update specific fear intensity
- `recordChoice(choice, responseTime)`: Record a player choice and update patterns
- `analyzePatterns()`: Get current choice patterns
- `reset()`: Reset to initial state

**Persistence**: Full profile persisted to localStorage for cross-session learning.

**Adaptive Features**:
- Auto-detects patterns from choice text (attack → aggression, run → avoidance, investigate → curiosity)
- Updates risk-taking based on psychologicalWeight
- Calculates running average response time
- All values automatically clamped between 0-1

### 5. StateManager (`StateManager.ts`)

**Purpose**: Coordinates atomic multi-store operations ensuring consistency.

**Methods**:
- `resetAllStores()`: Reset all 4 stores to initial state
- `applyEngineEffects(effects)`: Atomically apply engine effects across stores
- `snapshotState()`: Capture complete game state snapshot
- `restoreState(snapshot)`: Restore all stores from snapshot

**Atomicity Guarantees**:
1. Effects applied in specific order to maintain consistency
2. World updates → Corruption changes → History revisions → Profile updates
3. Deep merging for partial profile updates
4. All updates synchronous (no race conditions)

**Usage Example**:
```typescript
import { stateManager } from './StateManager';

// Apply engine effects atomically
stateManager.applyEngineEffects({
  worldUpdates: { horrorIntensity: 8 },
  corruptionChanges: 15,
  historyRevisions: [{ id: 'seg-1', newText: 'Revised text' }],
  profileUpdates: { fearProfile: { madness: 0.9 } }
});

// Create save point
const snapshot = stateManager.snapshotState();

// Later: restore save point
stateManager.restoreState(snapshot);
```

## Design Principles

### 1. Interface Compliance
All stores implement exact interfaces from `src/core/types/seams.ts`. No deviations.

### 2. Synchronous Operations
All store actions are **synchronous** - no async operations in stores. This ensures:
- Predictable state updates
- No race conditions
- Easier testing and debugging

### 3. Immutable Updates
All state updates create new objects - never mutate existing state.

### 4. Bounded Values
Numeric values are automatically clamped to valid ranges:
- Horror intensity: 0-10
- System health: 0-100
- Corruption level: 0-100
- Fear intensities: 0-1
- Choice patterns: 0-1

### 5. Persistence Strategy
- **gameStateStore**: Partial persistence (only gameState)
- **worldStateStore**: Full persistence
- **historyStore**: Partial persistence (last 100 segments)
- **playerProfileStore**: Full persistence

### 6. Single Responsibility
Each store manages one domain:
- Game flow → gameStateStore
- World mechanics → worldStateStore
- Narrative → historyStore
- Player psychology → playerProfileStore
- Coordination → StateManager

## Testing

All stores have comprehensive unit tests in `/tests/unit/state/`:

- `gameStateStore.test.ts` - 12 tests
- `worldStateStore.test.ts` - 16 tests
- `historyStore.test.ts` - 19 tests
- `playerProfileStore.test.ts` - 17 tests
- `StateManager.test.ts` - 14 tests

**Total: 78 tests, 100% passing**

Run tests:
```bash
npm test -- tests/unit/state/
```

## Usage Examples

### Basic Store Usage

```typescript
import {
  useGameStateStore,
  useWorldStateStore,
  useHistoryStore,
  usePlayerProfileStore
} from '@/core/state';

// In a React component
function GameComponent() {
  const gameState = useGameStateStore(state => state.gameState);
  const setGameState = useGameStateStore(state => state.setGameState);

  return <div>Current state: {gameState}</div>;
}

// Outside React (e.g., in engines)
const currentWorld = useWorldStateStore.getState().worldState;
useWorldStateStore.getState().increaseHorror(2);
```

### Coordinated Updates

```typescript
import { stateManager } from '@/core/state';

// Reset everything (e.g., New Game)
stateManager.resetAllStores();

// Apply engine effects atomically
const effects = {
  worldUpdates: {
    psychologicalStatus: PsychologicalStatus.PARANOID,
    horrorIntensity: 7
  },
  corruptionChanges: 10,
  historyRevisions: [
    { id: 'seg-3', newText: 'The memory shifts...' }
  ],
  profileUpdates: {
    fearProfile: { madness: 0.8 }
  }
};

stateManager.applyEngineEffects(effects);
```

### Save/Load System

```typescript
import { stateManager } from '@/core/state';

// Save game
const saveData = stateManager.snapshotState();
localStorage.setItem('manual-save', JSON.stringify(saveData));

// Load game
const saveData = JSON.parse(localStorage.getItem('manual-save'));
stateManager.restoreState(saveData);
```

## Integration Points

### Engines → State
Engines return `EngineEffects` which StateManager applies atomically.

### UI → State
React components subscribe to stores via hooks and call actions directly.

### Commands → State
Command executors update stores via actions.

### Flows → State
Flows read from stores to build context and apply engine effects via StateManager.

## Performance Considerations

1. **Selective Subscriptions**: Use selectors to subscribe only to needed state
   ```typescript
   const horrorLevel = useWorldStateStore(s => s.worldState.horrorIntensity);
   ```

2. **Persistence Throttling**: Zustand's persist middleware automatically throttles writes

3. **History Pruning**: Only last 100 segments persisted (older segments in memory until reset)

4. **Shallow Comparisons**: Zustand uses shallow equality checks for re-renders

## Debugging

Enable Zustand devtools (optional):
```typescript
import { devtools } from 'zustand/middleware';

// Wrap store creation
export const useGameStateStore = create<GameStateStore>()(
  devtools(
    persist(
      (set) => ({ /* ... */ }),
      { name: 'game-state' }
    ),
    { name: 'GameStateStore' }
  )
);
```

View state in browser console:
```javascript
// Get current state
useGameStateStore.getState()
useWorldStateStore.getState()

// Subscribe to changes
useGameStateStore.subscribe(console.log)
```

## Future Enhancements

Potential improvements (not currently implemented):

1. **State Versioning**: Migrate saved games between versions
2. **Undo/Redo**: Stack of snapshots for time travel
3. **State Validation**: Zod schemas for runtime validation
4. **Computed Properties**: Memoized derived state
5. **Middleware Pipeline**: Custom middleware for logging, analytics
6. **Optimistic Updates**: For async operations (images, AI)

## Dependencies

- `zustand@^4.5.2` - State management
- `zustand/middleware` - Persistence

## License

Part of Apophenia - Cosmic Horror Narrative Engine
