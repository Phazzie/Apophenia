# TypeScript Error Analysis

**Total Errors: 40**
**Generated: 2025-11-12**

## Error Categorization

### By Location

#### Components (11 errors)
- **CompactTestAPI.tsx**: 7 errors
- **GameScreen.tsx**: 1 error
- **StartScreen.tsx**: 3 errors

#### Flows (10 errors)
- **DescentFlow.ts**: 4 errors
- **FlowContextBuilder.ts**: 2 errors
- **UnravelingFlow.ts**: 4 errors

#### Hooks (6 errors)
- **useGameLoop.ts**: 6 errors

#### Services (11 errors)
- **ai/engines/NeuralEchoChambers.ts**: 1 error
- **ai/engines/QuantumNarrativeEngine.ts**: 1 error
- **ai/secureGenkit.ts**: 3 errors
- **commandExecutor.ts**: 2 errors
- **flows/gameFlow.ts**: 1 error
- **index.ts**: 2 errors

#### Stores (2 errors)
- **aiModelStore.ts**: 1 error
- **worldStateStore.ts**: 1 error

### By Error Type

#### 1. Case Sensitivity Issues (4 errors) - CRITICAL
- **Pattern**: String literals with incorrect case
- **Impact**: Breaking - runtime type mismatches
- **Locations**:
  - `CompactTestAPI.tsx:17` - "Stable" should be "stable"
  - `UnravelingFlow.ts:56` - "Fragmented" should be "fragmented"
  - `worldStateStore.ts:19` - "Stable" should be "stable"
  - `NeuralEchoChambers.ts:124` - "Paranoid" should be "paranoid"

#### 2. Missing Required Properties (6 errors) - CRITICAL
- **Pattern**: Objects missing `timestamp` or `id` properties
- **Impact**: Breaking - violates interface contracts
- **Locations**:
  - `CompactTestAPI.tsx:25` - Missing `timestamp`
  - `StartScreen.tsx:56` - Missing `timestamp`
  - `QuantumNarrativeEngine.ts:45` - Missing `timestamp`
  - `useGameLoop.ts:73` - Missing `id`
  - `secureGenkit.ts:32,33,34` - Missing `id`

#### 3. Module Not Found (5 errors) - CRITICAL
- **Pattern**: Import statements referencing non-existent modules
- **Impact**: Breaking - prevents compilation
- **Locations**:
  - `GameScreen.tsx:11` - Cannot find '../commands/generateImage'
  - `commandExecutor.ts:1` - Cannot find '../commands'
  - `commandExecutor.ts:2` - Cannot find '../commands/command.types'
  - `index.ts:14` - Cannot find './images/imagePipeline'
  - `index.ts:15` - Cannot find './images/imageCache'

#### 4. Type Incompatibilities (8 errors) - HIGH
- **Pattern**: Type mismatches between expected and actual types
- **Impact**: High - type safety violations
- **Sub-patterns**:
  - **Image Status Type Mismatch** (2 errors):
    - `FlowContextBuilder.ts:29,45` - `"retrying"` not in mainStatus union type
  - **GenreConfig Type Mismatch** (3 errors):
    - `CompactTestAPI.tsx:10`, `StartScreen.tsx:23,137` - GenreConfig missing properties
  - **Command Type Mismatch** (2 errors):
    - `DescentFlow.ts:104`, `UnravelingFlow.ts:98` - `applyCorruption` command not in union
  - **AIResponse Type Issue** (1 error):
    - `CompactTestAPI.tsx:56` - Property 'find' does not exist

#### 5. Wrong Argument Count (6 errors) - HIGH
- **Pattern**: Function calls with incorrect number of arguments
- **Impact**: High - breaking function contracts
- **Locations**:
  - `CompactTestAPI.tsx:36` - Expected 1, got 2
  - `CompactTestAPI.tsx:50` - Expected 1, got 4
  - `DescentFlow.ts:268` - Expected 1, got 5
  - `UnravelingFlow.ts:312` - Expected 1, got 5
  - `useGameLoop.ts:31` - Expected 1, got 4
  - `gameFlow.ts:22` - Expected 0, got 2

#### 6. Property Access on Void (5 errors) - HIGH
- **Pattern**: Accessing properties on void return type
- **Impact**: High - function signature mismatch
- **Locations**:
  - `useGameLoop.ts:37,38,43,46` - Accessing properties on void

#### 7. Implicit Any Type (3 errors) - MEDIUM
- **Pattern**: Variables/parameters without explicit types
- **Impact**: Medium - type safety degradation
- **Locations**:
  - `CompactTestAPI.tsx:56` - Parameter 'c' implicitly any
  - `DescentFlow.ts:263,270` - Variable 'storyHistory' implicitly any[]
  - `UnravelingFlow.ts:308,314` - Variable 'storyHistory' implicitly any[]

#### 8. Export/Import Issues (1 error) - MEDIUM
- **Pattern**: Importing non-existent exports
- **Impact**: Medium - module contract violation
- **Locations**:
  - `aiModelStore.ts:10` - No exported member 'xaiClient'

## Fix Priority Order

### Phase 1: Module Resolution (5 errors) - IMMEDIATE
Fix missing module imports - these prevent compilation entirely.

### Phase 2: Case Sensitivity (4 errors) - IMMEDIATE
Simple string literal fixes with zero risk.

### Phase 3: Type Definitions (8 errors) - HIGH
Fix type incompatibilities in interfaces and unions.

### Phase 4: Missing Properties (6 errors) - HIGH
Add required properties to objects.

### Phase 5: Function Signatures (11 errors) - HIGH
Fix argument counts and return types.

### Phase 6: Type Safety (6 errors) - MEDIUM
Add explicit types to remove implicit any.

## Common Patterns to Address

### Pattern A: Lowercase State Names
The codebase uses lowercase state names ("stable", "uneasy", etc.) but some code uses capitalized versions.
**Fix**: Change all to lowercase.

### Pattern B: StorySegment Timestamp
StorySegment interface requires `timestamp` property but many objects omit it.
**Fix**: Add `timestamp: Date.now()` to all segment creations.

### Pattern C: Choice ID Property
Choice interface requires `id` property but many objects omit it.
**Fix**: Add unique `id` to all choice creations.

### Pattern D: Image Status "retrying"
Some code uses "retrying" status but type only allows "loading" | "loaded" | "failed".
**Fix**: Either add "retrying" to type union or map it to existing status.

### Pattern E: Command Union Types
Flow executors use `applyCorruption` command not in official union type.
**Fix**: Add missing command types to union or use type assertion.

## Estimated Fix Complexity

- **Trivial** (4 errors): Case sensitivity fixes
- **Simple** (11 errors): Add missing properties
- **Moderate** (19 errors): Fix type mismatches and signatures
- **Complex** (6 errors): Module reorganization and type refactoring

## Risk Assessment

- **Low Risk**: Case fixes, adding required properties
- **Medium Risk**: Type union extensions, function signature fixes
- **High Risk**: Module reorganization, major type refactoring

## Next Steps

1. Create stub modules for missing imports
2. Fix all case sensitivity issues
3. Extend type unions to include missing variants
4. Add missing required properties
5. Fix function signatures and return types
6. Add explicit types for implicit any
7. Run `npx tsc --noEmit` after each phase
8. Document all fixes in TYPESCRIPT_FIXES.md
