# Flow Orchestration System

## Overview

The Flow Orchestration System manages the game's progression through different phases (Descent and Unraveling) and coordinates the execution of engines, AI services, and commands. This is the heart of the game's architecture.

## Architecture

```
User Choice
    ↓
FlowCoordinator (determines active flow)
    ↓
GameFlow (Descent or Unraveling)
    ↓
1. Build Context (FlowContextBuilder)
2. Execute Engines (get instructions & effects)
3. Build AI Prompt (with engine instructions)
4. Generate AI Response (commands)
5. Apply Engine Effects (state updates)
6. Check Transitions (should we change flow?)
7. Execute Commands (update UI)
    ↓
Return FlowResult
```

## Components

### FlowContextBuilder

**Purpose**: Builds context from Zustand stores for engine and AI processing.

**Responsibilities**:
- Read state from multiple stores (game, world, history, user)
- Transform to FlowContext and EngineContext
- Bridge between current implementation and architectural seams
- Calculate derived values (corruption level, etc.)

**Usage**:
```typescript
import { flowContextBuilder } from './flows';

const context = flowContextBuilder.buildFlowContext(choice);
const engineContext = flowContextBuilder.buildEngineContext(choice);
```

### DescentFlow

**Purpose**: Main gameplay loop where players descend into psychological horror.

**Responsibilities**:
- Process player choices during normal gameplay
- Coordinate engine execution
- Call AI service with engine instructions
- Apply engine effects to state
- Monitor descent level (0-100)
- Trigger transition to Unraveling when descent > 70%

**Key Metrics**:
- **Descent Level**: Combination of horror intensity (60%) and corruption (40%)
- **Transition Threshold**: 70% descent triggers Unraveling

**Usage**:
```typescript
import { descentFlow } from './flows';

// Initialize with genre
await descentFlow.initialize(genreConfig);

// Process choice
const result = await descentFlow.processChoice(choice);

// Check descent level
const level = descentFlow.calculateDescentLevel(); // 0-100
const shouldUnravel = descentFlow.shouldBeginUnraveling();
```

### UnravelingFlow

**Purpose**: Reality collapse phase where all horror mechanics intensify.

**Responsibilities**:
- Process choices during reality breakdown
- Amplify all engine effects (1.5x multiplier)
- Generate browser manipulation effects
- Monitor unraveling level (0-100)
- Trigger transition to Collapsed when unraveling > 90%

**Key Mechanics**:
- All engine effects are amplified
- Browser manipulation (title change, history manipulation, vibration)
- More extreme UI distortion
- Aggressive system health degradation

**Usage**:
```typescript
import { unravelingFlow } from './flows';

// Initialize
await unravelingFlow.initialize(genreConfig);

// Process choice with amplified effects
const result = await unravelingFlow.processChoice(choice);

// Check collapse status
const level = unravelingFlow.calculateUnravelingLevel(); // 0-100
const shouldCollapse = unravelingFlow.shouldCollapse();

// Generate browser effects
const effects = unravelingFlow.generateCollapseEffect();
```

### FlowCoordinator

**Purpose**: Central orchestrator that manages flow transitions and provides unified interface.

**Responsibilities**:
- Determine which flow is active based on game state
- Manage transitions between flows
- Execute engines in priority order
- Execute command queues
- Bridge between seams GameState and current GameState enum

**State Mapping**:
```
Current Enum → Seams State
MENU (0) → MENU
GENERATING_CONCEPT (1) → GENERATING
LOADING (2) → GENERATING
PLAYING (3) → DESCENDING or UNRAVELING (based on descent level)
ENDED (4) → COLLAPSED
```

**Usage**:
```typescript
import { flowCoordinator } from './flows';

// Get current active flow
const flow = flowCoordinator.getCurrentFlow(); // Descent or Unraveling

// Transition to new state
await flowCoordinator.transitionTo(GameState.UNRAVELING);

// Execute engines
const outputs = await flowCoordinator.executeEngines(context);

// Execute commands
const results = await flowCoordinator.executeCommands(commands);
```

## Flow Lifecycle

### Descent Phase (Normal Gameplay)

1. **Initialization**
   ```typescript
   await descentFlow.initialize(genreConfig);
   ```

2. **Choice Processing**
   ```typescript
   const result = await descentFlow.processChoice(choice);
   ```

3. **Monitoring**
   ```typescript
   const descentLevel = descentFlow.calculateDescentLevel();
   if (descentFlow.shouldBeginUnraveling()) {
     await flowCoordinator.transitionTo(GameState.UNRAVELING);
   }
   ```

### Unraveling Phase (Reality Collapse)

1. **Initialization**
   ```typescript
   await unravelingFlow.initialize(genreConfig);
   ```

2. **Amplified Processing**
   ```typescript
   const result = await unravelingFlow.processChoice(choice);
   ```

3. **Collapse Monitoring**
   ```typescript
   const unravelingLevel = unravelingFlow.calculateUnravelingLevel();
   if (unravelingFlow.shouldCollapse()) {
     await flowCoordinator.transitionTo(GameState.COLLAPSED);
   }
   ```

## Integration with Other Systems

### Engines

Flows coordinate engines but don't implement engine logic:

```typescript
// Flows collect engine outputs
const outputs = await this.executeEngines(context);

// Extract instructions for AI
const instructions = outputs.flatMap(o => o.instructions);

// Extract effects for state
const effects = this.aggregateEffects(outputs);

// Apply effects to stores
this.applyEngineEffects(effects);
```

### AI Services

Flows build prompts with engine instructions:

```typescript
// Build system prompt with engine guidance
const systemInstruction = this.buildSystemPrompt(
  genrePrompt,
  engineInstructions
);

// Generate AI response
const commands = await generateWithSelectedModel(
  systemInstruction,
  prompt,
  worldState,
  storyHistory
);
```

### Command System

Flows return commands for execution:

```typescript
// Return FlowResult with commands
return {
  commands,           // Array of commands to execute
  worldUpdates,       // State changes to apply
  nextState,          // Optional state transition
};
```

### State Management

Flows read from and write to Zustand stores:

```typescript
// Read state
const worldState = useWorldStateStore.getState().worldState;
const gameState = useGameStateStore.getState().gameState;

// Write state
worldStateStore.updateWorldState({ horrorIntensity: 5 });
gameStateStore.setGameState(GameState.PLAYING);
```

## Testing

Unit tests are located in `tests/unit/flows/`:

- `FlowContextBuilder.test.ts` - Context building and state mapping
- `DescentFlow.test.ts` - Descent mechanics and transitions
- `FlowCoordinator.test.ts` - Flow coordination and execution

Run tests:
```bash
npm test src/flows
```

## Design Principles

1. **Flows coordinate, don't implement**: Engine logic stays in engines, flow logic in flows
2. **Testable without UI**: All flows can be tested with mocked stores
3. **Deterministic transitions**: Clear thresholds for state changes
4. **Error resilience**: Failed engines don't break the flow
5. **Single responsibility**: Each flow handles one phase of gameplay

## Future Enhancements

1. **Save/Load Integration**: Flows should support game state snapshots
2. **PlayerProfile Store**: Dedicated store for psychological profiling
3. **Enhanced Analytics**: Track flow transitions and player patterns
4. **Custom Flow Events**: Allow game service to subscribe to flow events
5. **Difficulty Scaling**: Adjust descent/unraveling thresholds based on player skill

## Dependencies

- `src/stores/*` - Zustand state stores
- `src/services/ai/unifiedAIService` - AI generation
- `src/services/commandExecutor` - Command execution
- `src/services/ai/engines/*` - Revolutionary AI engines
- `src/core/types/seams` - Interface contracts

## Related Documentation

- `/home/user/Apophenia/SEAMS.md` - Architectural seams
- `/home/user/Apophenia/src/core/types/seams.ts` - Type definitions
- `/home/user/Apophenia/AGENT_DEPLOYMENT.md` - Agent responsibilities
