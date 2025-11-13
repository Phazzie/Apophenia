# Contract Blueprint - Template for SDD Contracts

**Purpose**: This template ensures all contracts in Apophenia follow consistent patterns and include all required SDD elements.

**Version**: 1.0.0
**Last Updated**: 2025-11-12

---

## Contract Template

Use this template when creating a new contract (interface):

```typescript
/**
 * [CONTRACT NAME] - [Brief Description]
 *
 * **Seam**: #[NUMBER] ([Seam Name])
 * **Owner**: [Agent/Team Name]
 * **Consumers**: [List of components that use this contract]
 *
 * @requirement [REQ-ID] - [Requirement description]
 * @sdd-step Step 3: DEFINE
 */

// ============================================================================
// [SECTION NAME]
// ============================================================================

/**
 * [Interface Name]
 *
 * **Purpose**: [What this interface represents]
 * **Lifecycle**: [When/how this is used]
 * **Immutability**: [readonly fields, if any]
 *
 * @example
 * ```typescript
 * const example: [InterfaceName] = {
 *   // ... example usage
 * };
 * ```
 */
export interface [InterfaceName] {
  // ---- Required Properties ----

  /**
   * [Property description]
   * @requirement [REQ-ID] if applicable
   */
  [propertyName]: [Type];

  // ---- Optional Properties ----

  /**
   * [Property description]
   * @optional Why this is optional
   */
  [optionalProperty]?: [Type];

  // ---- Methods (if applicable) ----

  /**
   * [Method description]
   * @param [paramName] - [param description]
   * @returns [return description]
   * @throws [error description]
   */
  [methodName]([params]): [ReturnType];
}

/**
 * Zod schema for runtime validation
 */
export const [InterfaceName]Schema = z.object({
  [propertyName]: z.[type](),
  [optionalProperty]: z.[type]().optional(),
});
```

---

## Naming Conventions

### Interfaces
- **PascalCase**: `UserProfile`, `GameState`, `AIResponse`
- **Suffix with purpose**:
  - `Request` for input data (e.g., `AIRequest`)
  - `Response` for output data (e.g., `AIResponse`)
  - `Config` for configuration (e.g., `GenreConfig`)
  - `Store` for Zustand stores (e.g., `GameStateStore`)
  - `Service` for service contracts (e.g., `AIService`)
  - `Executor` for command executors (e.g., `CommandExecutor`)
  - `Result` for operation results (e.g., `ExecutionResult`)
  - `Engine` for game engines (e.g., `AdaptiveHorrorEngine`)
  - `Flow` for game flows (e.g., `DescentFlow`)

### Properties
- **camelCase**: `playerProfile`, `isGenerating`, `worldState`
- **Boolean prefix**: `is`, `has`, `should`, `can` (e.g., `isActive`, `hasError`, `shouldRetry`, `canExecute`)
- **Arrays suffix**: `s` or `List` (e.g., `choices`, `commandList`)
- **Numbers with ranges**: Add inline comment (e.g., `horrorIntensity: number; // 0-10`)

### Types
- **PascalCase** for complex types: `Command`, `GameState`, `Choice`
- **SCREAMING_SNAKE_CASE** for enum values: `GameState.MENU`, `AIProvider.GROK`

---

## Property Ordering

Order properties in this sequence:

1. **Identifiers** (id, name)
2. **Core Data** (main business data)
3. **Metadata** (timestamps, counts, flags)
4. **Optional Data** (nice-to-have fields)
5. **Methods** (if interface includes behavior)

Example:
```typescript
export interface StorySegment {
  // 1. Identifiers
  id: string;

  // 2. Core Data
  text: string;
  images?: {
    main?: string;
    inset?: string[];
  };

  // 3. Metadata
  timestamp: number;
  isRevised?: boolean;
  corruptionLevel?: number;

  // 4. Optional Data
  originalText?: string;
}
```

---

## Type vs Interface Guidelines

### Use `interface` when:
- Defining an object shape
- Creating contracts between components
- Need to extend later
- Describing class shapes

### Use `type` when:
- Creating union types (`type Command = A | B | C`)
- Creating aliases (`type ID = string`)
- Intersection types (`type X = A & B`)
- Tuple types (`type Coords = [number, number]`)

### Use `enum` when:
- Fixed set of string constants
- Need reverse mapping
- Values should be namespaced

Example from Apophenia:
```typescript
// Enum for fixed states
export enum GameState {
  MENU = 'menu',
  GENERATING = 'generating',
  DESCENDING = 'descending',
  UNRAVELING = 'unraveling',
  COLLAPSED = 'collapsed'
}

// Type for discriminated union
export type Command =
  | { type: 'displayText'; payload: { content: string; segmentId: string } }
  | { type: 'displayChoices'; payload: { choices: Choice[] } }
  | { type: 'updateWorldState'; payload: Partial<WorldState> };
```

---

## Comment Requirements

### File Header
Every contract file must have:
```typescript
/**
 * [FILE NAME] - [Purpose]
 *
 * This file defines [what contracts are defined here].
 * All [users] MUST reference these types and implement these interfaces.
 *
 * DO NOT modify interfaces without updating [related docs].
 */
```

### Interface Header
Every interface must have:
```typescript
/**
 * [Interface Name]
 *
 * [1-2 sentence description of what this represents]
 *
 * **Used By**: [List 2-3 main consumers]
 * **Related**: [Link to related interfaces]
 *
 * @example
 * ```typescript
 * // Show typical usage
 * ```
 */
```

### Property Comments
Complex properties need:
```typescript
/**
 * [Property description]
 *
 * **Type**: [Explain if not obvious]
 * **Range**: [For numbers: "0-100", "1-10", etc.]
 * **Default**: [If applicable]
 * **@requirement** [REQ-ID] - [Why this exists]
 */
propertyName: Type;
```

For simple properties, inline comments are acceptable:
```typescript
systemHealth: number;              // 0-100, decreases with corruption
horrorIntensity: number;           // 0-10, increases over time
isIntrusive: boolean;              // Special disturbing choice (required)
```

---

## Requirement Tracing

Link every interface and key property to a requirement:

```typescript
/**
 * AdaptiveHorrorEngine
 *
 * Personalizes horror based on player's fear profile.
 *
 * @requirement HORROR-001 - AI must adapt to player psychology
 * @requirement HORROR-002 - Track fear responses
 */
export interface AdaptiveHorrorEngine extends Engine {
  /**
   * Analyzes player's fear profile
   * @requirement HORROR-001
   */
  analyzeFears(profile: PlayerProfile): Map<string, number>;
}
```

---

## Zod Schema Integration

Every interface that crosses an external boundary needs a Zod schema:

```typescript
// Interface
export interface WorldState {
  protagonist: string;
  setting: string;
  psychologicalStatus: PsychologicalStatus;
  horrorIntensity: number;  // 0-10
}

// Zod Schema (for runtime validation)
export const WorldStateSchema = z.object({
  protagonist: z.string().min(1),
  setting: z.string().min(1),
  psychologicalStatus: z.enum(['stable', 'uneasy', 'paranoid', 'fragmented', 'shattered']),
  horrorIntensity: z.number().min(0).max(10),
});

// Usage
const validated = WorldStateSchema.parse(externalData);
```

---

## Edge Case Handling

Document these edge cases in every contract:

### Empty Collections
```typescript
/**
 * Recent story segments
 *
 * **Edge Case**: May be empty array [] at game start
 */
recentHistory: StorySegment[];
```

### Null vs Undefined
```typescript
/**
 * Image URL
 *
 * **Edge Case**:
 * - `undefined` = not yet generated
 * - `null` = generation failed
 * - `string` = successfully loaded
 */
imageUrl?: string | null;
```

### Numeric Bounds
```typescript
/**
 * Horror intensity level
 *
 * **Range**: 0-10
 * **Edge Cases**:
 * - 0 = no horror (tutorial mode)
 * - 10 = maximum horror (end game)
 */
horrorIntensity: number;
```

---

## Single Responsibility Principle

Each interface should have ONE clear purpose:

❌ **Bad** (multiple concerns):
```typescript
interface UserAndGameData {
  userId: string;
  username: string;
  currentLevel: number;
  score: number;
  settings: object;
}
```

✅ **Good** (single concern each):
```typescript
interface UserProfile {
  userId: string;
  username: string;
}

interface GameProgress {
  currentLevel: number;
  score: number;
}

interface UserSettings {
  theme: string;
  volume: number;
}
```

---

## Anti-Patterns to Avoid

### ❌ Implicit Any
```typescript
// BAD
function process(data) { ... }

// GOOD
function process(data: ProcessData): ProcessResult { ... }
```

### ❌ Optional Everything
```typescript
// BAD - unclear what's required
interface Config {
  field1?: string;
  field2?: number;
  field3?: boolean;
}

// GOOD - clear requirements
interface Config {
  field1: string;        // Required
  field2?: number;       // Optional with reason
  field3: boolean;       // Required
}
```

### ❌ Mixing Concerns
```typescript
// BAD - Engine shouldn't handle HTTP
interface Engine {
  process(): Promise<void>;
  fetchDataFromAPI(): Promise<Data>;
}

// GOOD - Separate concerns
interface Engine {
  process(context: Context): Promise<Output>;
}

interface APIClient {
  fetchData(): Promise<Data>;
}
```

### ❌ No Error States
```typescript
// BAD - no way to handle errors
interface Response {
  data: Data;
}

// GOOD - explicit error handling
interface Response {
  data?: Data;
  error?: string;
  success: boolean;
}
```

---

## Validation Checklist

Before finalizing a contract, verify:

- [ ] Interface name follows convention
- [ ] All properties have comments
- [ ] Required vs optional is clear
- [ ] Edge cases documented
- [ ] Numeric ranges specified
- [ ] Null vs undefined clarified
- [ ] Requirement IDs linked
- [ ] Zod schema created (if needed)
- [ ] Example usage provided
- [ ] Single responsibility
- [ ] No implicit `any`
- [ ] Error states defined
- [ ] Related interfaces linked

---

## Example: Complete Contract

```typescript
/**
 * AIResponse - Response from AI service
 *
 * **Seam**: #4 (AI Service Interface)
 * **Owner**: Agent AI-SERVICE
 * **Consumers**: UnifiedAIService, Engines
 *
 * @requirement AI-001 - AI must return structured responses
 * @sdd-step Step 3: DEFINE
 */

/**
 * Response from an AI service containing generated content and parsed commands
 *
 * **Used By**: UnifiedAIService, all Engines
 * **Related**: AIRequest, Command
 *
 * @example
 * ```typescript
 * const response: AIResponse = {
 *   provider: 'grok',
 *   content: 'The darkness closes in...',
 *   commands: [
 *     { type: 'displayText', payload: { ... } },
 *     { type: 'displayChoices', payload: { ... } },
 *   ],
 *   metadata: {
 *     tokensUsed: 1250,
 *     latency: 850,
 *     model: 'grok-4-fast-reasoning',
 *   },
 * };
 * ```
 */
export interface AIResponse {
  // ---- Required Properties ----

  /**
   * Which AI provider generated this response
   * @requirement AI-001
   */
  provider: AIProvider;

  /**
   * Raw content generated by the AI
   *
   * **Note**: This is the unparsed response. Use `commands` for structured data.
   */
  content: string;

  /**
   * Parsed commands extracted from the AI response
   *
   * **Edge Case**: May be empty array [] if no commands were parsed
   * @requirement AI-002 - Parse structured commands from AI
   */
  commands: Command[];

  /**
   * Metadata about the AI generation
   */
  metadata: {
    /**
     * Number of tokens used
     *
     * **Optional**: Not all providers report this
     */
    tokensUsed?: number;

    /**
     * Response time in milliseconds
     *
     * **Optional**: May be undefined if not measured
     */
    latency?: number;

    /**
     * Specific model used (e.g., "grok-4-fast-reasoning")
     *
     * **Optional**: Not all providers report this
     */
    model?: string;
  };
}

/**
 * Zod schema for AIResponse validation
 */
export const AIResponseSchema = z.object({
  provider: z.enum(['grok', 'mock']),
  content: z.string().min(1),
  commands: z.array(CommandSchema),
  metadata: z.object({
    tokensUsed: z.number().optional(),
    latency: z.number().optional(),
    model: z.string().optional(),
  }),
});
```

---

## Section Organization

Organize related contracts into sections using this header format:

```typescript
// ============================================================================
// [SECTION NAME]
// ============================================================================
```

Examples from Apophenia:
- `GAME STATE TYPES` - Core game state enums and interfaces
- `COMMAND TYPES` - Command discriminated unions
- `AI TYPES` - AI service contracts
- `PLAYER PROFILE TYPES` - Player tracking interfaces
- `SEAM #2: STATE STORE INTERFACE` - Zustand store contracts
- `SEAM #3: ENGINE INTERFACE` - Engine system contracts

---

## Readonly Properties

Use `readonly` for properties that should never change after creation:

```typescript
export interface Engine {
  readonly name: string;              // Engine identity
  readonly description: string;       // Never changes
  readonly priority: number;          // Fixed at creation

  isActive(context: EngineContext): boolean;  // Methods are not readonly
  process(context: EngineContext): Promise<EngineOutput>;
}
```

---

## Discriminated Unions

For command-like types, use discriminated unions with a `type` field:

```typescript
export type Command =
  | { type: 'createSegment'; payload: { id: string } }
  | { type: 'displayText'; payload: { content: string; segmentId: string } }
  | { type: 'displayChoices'; payload: { choices: Choice[] } }
  | { type: 'updateWorldState'; payload: Partial<WorldState> };
```

**Benefits**:
- Type-safe pattern matching
- Exhaustive switch statements
- Clear command structure

---

## Extending Interfaces

Use `extends` for specialization:

```typescript
// Base interface
export interface Engine {
  readonly name: string;
  readonly description: string;
  readonly priority: number;

  isActive(context: EngineContext): boolean;
  process(context: EngineContext): Promise<EngineOutput>;
  generateInstructions(context: EngineContext): string[];
}

// Specialized interface
export interface TemporalRevisionEngine extends Engine {
  identifyRevisionTarget(history: StorySegment[]): string | null;
  generateRevision(original: string, context: EngineContext): Promise<string>;
}
```

---

## Generic Types

Use generics for reusable patterns:

```typescript
/**
 * Result wrapper for operations that may fail
 */
export interface Result<T, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
}

// Usage
const userResult: Result<UserProfile> = await fetchUser();
const imageResult: Result<string, ImageError> = await generateImage();
```

---

## Conclusion

Following this blueprint ensures:
- ✅ Consistent contract structure
- ✅ Complete documentation
- ✅ Clear edge case handling
- ✅ Runtime validation support
- ✅ SDD Level 3 compliance

**Use this template for ALL new contracts in Apophenia.**

---

**Related Documents**:
- `SEAMS.md` - Architectural seams overview
- `DATA-BOUNDARIES.md` - All data boundaries mapped
- `src/core/types/seams.ts` - Actual contract implementations
- `SDD_COMPLIANCE_ANALYSIS.md` - SDD compliance status
