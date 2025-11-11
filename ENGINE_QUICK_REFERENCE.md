# Engine Quick Reference Guide

## Priority Execution Order (Highest to Lowest)

```
9️⃣ AdaptiveHorrorEngine          → Personalizes horror to player fears
8️⃣ TemporalRevisionEngine        → Rewrites past to create false memories
7️⃣ QuantumNarrativeEngine        → Manages parallel timelines
6️⃣ RealityCorruptionEngine       → Calculates UI corruption effects
5️⃣ MetaConsciousnessEngine       → Breaks fourth wall
4️⃣ NeuralEchoChamberEngine       → Cross-session memory persistence
3️⃣ SemanticChoiceArchaeologyEngine → Analyzes choice patterns
2️⃣ AdaptiveNarrativeDNAEngine    → Evolves story themes
1️⃣ FifthWallEngine               → Browser manipulation
```

---

## Activation Conditions Quick Reference

| Engine | Horror Min | Corruption Min | Choices Min | History Min |
|--------|-----------|----------------|-------------|-------------|
| AdaptiveHorror | 2 | - | 2 | - |
| TemporalRevision | 4 | - | 5 | 3 segments |
| QuantumNarrative | 5 | - | 3 | - |
| RealityCorruption | Always active when corruption > 0 or horror >= 3 |
| MetaConsciousness | 6 | 30 | 7 | - |
| NeuralEcho | Always on first 3 choices OR every 5th choice |
| SemanticArchaeology | - | - | 5 (every 4th) | - |
| AdaptiveNarrativeDNA | - | - | Every 3rd | - |
| FifthWall | 7 | 50 | 10 | - |

---

## What Each Engine Does

### 🎭 AdaptiveHorrorEngine
**Input**: Player fear profile, choice patterns
**Output**: Personalized horror instructions
**Example**: "Player fears claustrophobia (0.8) → Emphasize confined spaces"

### ⏰ TemporalRevisionEngine
**Input**: Story history, horror intensity
**Output**: Revised past segments
**Example**: Changes "opened the door" to "closed the door" retroactively

### 🌌 QuantumNarrativeEngine
**Input**: World state, system health
**Output**: Timeline shifts, merged realities
**Example**: Creates alternate timeline where protagonist took different path

### 💥 RealityCorruptionEngine
**Input**: Horror, health, choices
**Output**: Corruption level (0-100), visual effects list
**Example**: Level 75 → ["severe-distortion", "inverted-colors", "reality-tear"]

### 🎬 MetaConsciousnessEngine
**Input**: Corruption, horror
**Output**: Fourth-wall breaking content
**Example**: "The protagonist realizes they are being controlled by you"

### 🧠 NeuralEchoChamberEngine
**Input**: Previous session data (localStorage)
**Output**: Loaded memories, merged fear profiles
**Example**: "You've been here before. You remember the darkness."

### 🔍 SemanticChoiceArchaeologyEngine
**Input**: Choice history
**Output**: Dominant pattern, subconscious observations
**Example**: Detects "violence" pattern → "Every problem met with aggression"

### 🧬 AdaptiveNarrativeDNAEngine
**Input**: Current genome, player fears
**Output**: Mutated themes
**Example**: Genome mutates from ["isolation", "decay"] to ["isolation", "body horror"]

### 🌐 FifthWallEngine
**Input**: Extreme corruption + horror
**Output**: Browser effects
**Example**: Changes page title to "Help me" or triggers vibration

---

## Engine Output Structure

```typescript
interface EngineOutput {
  engineName: string;              // "AdaptiveHorror"
  instructions: string[];          // ["Target player's claustrophobia"]
  effects: {
    worldUpdates?: Partial<WorldState>;
    historyRevisions?: Array<{ id: string; newText: string }>;
    profileUpdates?: Partial<PlayerProfile>;
    corruptionChanges?: number;
  };
  metadata: Record<string, unknown>; // Engine-specific data
}
```

---

## Usage Example

```typescript
import { initializeEngineRegistry } from './core/engines';
import { createMockEngineContext } from './tests/unit/engines/testHelpers';

// Initialize registry with all engines
const registry = initializeEngineRegistry();

// Create context from game state
const context = {
  worldState: currentWorldState,
  recentHistory: last10Segments,
  playerProfile: currentProfile,
  currentChoice: playerSelectedChoice
};

// Execute all active engines
const outputs = await registry.executeAll(context);

// Aggregate instructions for AI
const allInstructions = outputs.flatMap(o => o.instructions);

// Aggregate effects for StateManager
const allEffects = outputs.reduce((acc, o) => ({
  worldUpdates: { ...acc.worldUpdates, ...o.effects.worldUpdates },
  historyRevisions: [...(acc.historyRevisions || []), ...(o.effects.historyRevisions || [])],
  profileUpdates: { ...acc.profileUpdates, ...o.effects.profileUpdates },
  corruptionChanges: (acc.corruptionChanges || 0) + (o.effects.corruptionChanges || 0)
}), {});
```

---

## File Locations

```
src/core/engines/
├── base/
│   └── Engine.ts                           # Abstract base class
├── AdaptiveHorrorEngine.ts                 # Priority 9
├── TemporalRevisionEngine.ts               # Priority 8
├── QuantumNarrativeEngine.ts               # Priority 7
├── RealityCorruptionEngine.ts              # Priority 6
├── MetaConsciousnessEngine.ts              # Priority 5
├── NeuralEchoChamberEngine.ts              # Priority 4
├── SemanticChoiceArchaeologyEngine.ts      # Priority 3
├── AdaptiveNarrativeDNAEngine.ts           # Priority 2
├── FifthWallEngine.ts                      # Priority 1
├── EngineRegistry.ts                       # Coordinator
└── index.ts                                # Exports

tests/unit/engines/
├── testHelpers.ts                          # Mock utilities
├── AllEngines.test.ts                      # Comprehensive tests
└── [other test files]
```

---

## Dependencies

### Engines Import From:
- `../types/seams` (interface definitions)
- `./base/Engine` (base class)

### Engines Do NOT Import:
- ❌ React components
- ❌ Zustand stores
- ❌ DOM APIs (except FifthWall metadata)
- ❌ Other engines (loose coupling)

---

## Key Principles

1. **Stateless**: Context in, effects out
2. **Pure TypeScript**: No React, no DOM access
3. **Priority-Based**: Higher priority = executes first
4. **Fault-Tolerant**: One engine failure doesn't break others
5. **Composable**: Engines work independently but enhance each other

---

## Troubleshooting

### Engine Not Activating?
- Check `isActive()` conditions in engine file
- Verify horror/corruption/choice thresholds met
- Use `registry.getActive(context)` to see which are active

### Effects Not Applying?
- Ensure StateManager is calling `applyEngineEffects()`
- Check that engine returned effects in `EngineOutput`
- Verify effects structure matches `EngineEffects` interface

### Instructions Not Appearing in AI Prompts?
- Ensure PromptBuilder is calling `injectEngineInstructions()`
- Check that `generateInstructions()` returns non-empty array
- Verify AI service is receiving full context

---

**Quick Start**: `const registry = initializeEngineRegistry();` → Ready to use!
