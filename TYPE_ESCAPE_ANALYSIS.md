# Type Escape Analysis Report

**Generated**: 2025-11-12
**Total Violations Found**: 35 lines (31 actual violations, 4 false positives)
**Target**: 0 violations
**Priority**: CRITICAL - SDD Level 3 Compliance

---

## Executive Summary

Found 31 actual `as any` type escapes across 7 files, plus 4 false positives (comments/text). All violations fall into clear categories with specific fix strategies.

---

## Violation Categories

### Category 1: Feature Fallback Dynamic Access (2 violations)
**File**: `src/utils/featureFallbacks.ts`
**Lines**: 141, 152

**Violations**:
```typescript
// Line 141
method in (FEATURE_FALLBACKS as any)[feature]

// Line 152
emptyArray: [] as any[],
```

**Root Cause**: Dynamic property access on const object with unknown keys at runtime

**Fix Strategy**:
- Line 141: Use proper type guard with keyof assertion
- Line 152: Replace with `unknown[]` or specific empty array type

**Complexity**: LOW

---

### Category 2: Test Mock Global Assignment (1 violation)
**File**: `src/services/ai/__tests__/backendAPIService.test.ts`
**Line**: 5

**Violation**:
```typescript
(global as any).fetch = mockFetch;
```

**Root Cause**: Jest global type doesn't include fetch property

**Fix Strategy**: Extend NodeJS global interface or use proper Jest mock utilities

**Complexity**: LOW

---

### Category 3: AI Context Type Mismatches (18 violations)
**Files**:
- `src/services/ai/director.ts` (2 violations)
- `src/services/ai/engines/AdaptiveHorrorEngine.ts` (6 violations)
- `src/services/ai/engines/RealityCorruptionEngine.ts` (3 violations)
- `src/services/ai/engines/QuantumNarrativeEngine.ts` (3 violations)
- `src/services/ai/engines/MetaConsciousnessEngine.ts` (3 violations)
- `src/services/ai/engines/TemporalRevisionEngine.ts` (3 violations)

**Violations Pattern**:
```typescript
context: {
  worldState: worldState as any,
  recentHistory: storyHistory as any,
  playerProfile: {} as any,
  // ...
}
```

**Root Cause**: Type mismatch between legacy `WorldState`/`StorySegment` types and seams `AIContext` interface

**Fix Strategy**:
- Create proper type conversion functions
- Map legacy WorldState to seams WorldState
- Map legacy StorySegment[] to seams StorySegment[]
- Build proper PlayerProfile instead of empty object

**Complexity**: MEDIUM - Requires type mapping utilities

---

### Category 4: Psychological Status Enum Mapping (6 violations)
**File**: `src/flows/FlowContextBuilder.ts`
**Lines**: 151, 153, 155, 157, 159, 161

**Violations**:
```typescript
case 'stable':
  return PsychologicalStatus.STABLE as any;
case 'uneasy':
  return PsychologicalStatus.UNEASY as any;
// ... etc
```

**Root Cause**: Enum values are already correct type, unnecessary `as any` cast

**Fix Strategy**: Remove `as any` - the values are already correct

**Complexity**: TRIVIAL

---

### Category 5: StorySegment Timestamp Access (1 violation)
**File**: `src/flows/FlowContextBuilder.ts`
**Line**: 75

**Violation**:
```typescript
const firstSegmentTime = storyHistory[0]
  ? (storyHistory[0] as any).timestamp || Date.now()
  : Date.now();
```

**Root Cause**: Legacy segments may not have timestamp property

**Fix Strategy**: Use type guard to check for timestamp property

**Complexity**: LOW

---

### Category 6: Command Queue Type Assertion (1 violation)
**File**: `src/flows/FlowCoordinator.ts`
**Line**: 152

**Violation**:
```typescript
await executeCommandQueue(commands as any);
```

**Root Cause**: Type mismatch between seams `Command[]` and executor expected type

**Fix Strategy**: Update executeCommandQueue signature or create adapter

**Complexity**: LOW

---

### Category 7: False Positives (4 non-violations)
**Files**:
- `src/services/ai/engines/TemporalRevisionEngine.ts:275` - "was any of this real?" in string
- `src/flows/DescentFlow.ts:160` - Comment mentioning "as any[]"
- `src/flows/UnravelingFlow.ts:193` - Comment mentioning "as any[]"
- `src/flows/FlowCoordinator.ts:95` - Comment mentioning "as any[]"

**Action**: No fix needed - these are not actual type escapes

---

## Fix Priority Order

1. **HIGH PRIORITY** - Category 4 (Trivial fixes, 6 violations)
2. **HIGH PRIORITY** - Category 5 (Simple type guard, 1 violation)
3. **HIGH PRIORITY** - Category 1 (Feature fallbacks, 2 violations)
4. **MEDIUM PRIORITY** - Category 2 (Test mock, 1 violation)
5. **MEDIUM PRIORITY** - Category 6 (Command queue, 1 violation)
6. **LOW PRIORITY** - Category 3 (Requires mapping utilities, 18 violations)

---

## Implementation Plan

### Phase 1: Quick Wins (10 violations)
- Fix Category 4: Remove unnecessary casts
- Fix Category 5: Add type guard for timestamp
- Fix Category 1: Proper keyof typing
- Fix Category 2: Extend global interface

### Phase 2: Medium Complexity (1 violation)
- Fix Category 6: Command queue adapter

### Phase 3: Type System Improvements (18 violations)
- Create type conversion utilities
- Build proper WorldState mapper
- Build proper StorySegment mapper
- Build proper PlayerProfile builder
- Update all AI engine calls

---

## Risk Assessment

**LOW RISK**: Categories 1, 2, 4, 5, 6 - Straightforward type fixes
**MEDIUM RISK**: Category 3 - Requires coordination with type system

All fixes are backwards compatible and will improve type safety without changing runtime behavior.

---

## Success Metrics

- ✅ Grep returns 0 actual violations (4 false positives acceptable)
- ✅ `npx tsc --noEmit` passes without new errors
- ✅ All existing tests pass
- ✅ No runtime behavior changes
