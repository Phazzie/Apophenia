# Remaining Issues for PR #34 - Fix/Test Suite Stabilization

Based on the CodeRabbit review comments, here are the remaining critical issues that need to be addressed before merging PR #34:

## Critical Issues (Must Fix Before Merge)

### 1. Missing AI Call Timeouts
**File**: `src/services/ai/engines/QuantumNarrativeEngine.ts` (Line 70)
**Issue**: `generateWithSelectedModel` call lacks timeout protection, violating service guidelines for `src/services/ai/**/*`
**Fix Required**: Implement timeout wrapper with graceful fallback (6000ms suggested)

### 2. Case-Insensitive Agency Detection  
**File**: `src/services/ai/engines/SemanticChoiceArchaeology.ts` (Lines 94-100)
**Issue**: Agency detection fails for capitalized phrases like "i WILL comply"
**Fix Required**: Normalize input to lowercase before pattern matching

### 3. Invalid Persisted Patterns Handling
**File**: `src/services/ai/engines/NeuralEchoChambers.ts` (Lines 19-28)
**Issue**: No validation of localStorage data before assignment, can break echo generation
**Fix Required**: Validate array structure and string content before accepting persisted patterns

### 4. Missing Meta Message Timeout + Fallback
**File**: `src/services/ai/engines/MetaConsciousnessEngine.ts` (Lines 45-51)
**Issue**: Direct `generateWithSelectedModel` await without required Grok-4 → Gemini Pro → Gemini Flash fallback
**Fix Required**: Implement bounded Promise.race timeout with model cascade

### 5. System Health Math Bug
**File**: `src/services/gameService.ts` (Lines 102-109) 
**Issue**: Truthy check excludes `systemHealth === 0`, undercounting corruption when system is most compromised
**Fix Required**: Explicit numeric validation before corruption calculation

### 6. Hard-coded Response Latency
**File**: `src/services/gameService.ts` (Lines 113-114)
**Issue**: 5000ms constant defeats AdaptiveNarrativeDNA selection pressure logic
**Fix Required**: Pass actual measured latency instead of constant

### 7. Wrong Parameter to Next-Step Generator
**File**: `src/services/gameService.ts` (Lines 134-139)
**Issue**: Passing `personalizedPrompt` instead of raw `playerChoice` breaks downstream flows
**Fix Required**: Use original `playerChoice` parameter, surface enriched prompt via world state

## Current Status
- **PR State**: Open, 1/3 checks failing
- **Files Modified**: Major refactor of AI engines architecture
- **Test Coverage**: Comprehensive tests added for new engine classes
- **Documentation**: Added collaboration playbook and merge status log

## Next Steps
1. Address all 7 critical issues above
2. Re-run tests to ensure no regressions
3. Verify all CI checks pass
4. Request final review from CodeRabbit and other reviewers

## Notes
- All issues flagged by CodeRabbit with specific code suggestions
- Focus on service reliability and defensive programming patterns
- Maintain strict TypeScript typing (zero `any` types)