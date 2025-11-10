# 🔗 Architectural Seams - Apophenia Rewrite

## Overview

This document defines the **seams** (interfaces, contracts, boundaries) between all major components in the Apophenia rewrite. These seams allow 8 parallel agents to work independently while ensuring clean integration.

---

## 🎯 Core Principles

1. **Single Direction Data Flow**: State → Engines → Commands → UI
2. **Interface Segregation**: Each seam has a minimal, focused interface
3. **Dependency Inversion**: Components depend on interfaces, not implementations
4. **Error Boundaries**: Each seam has defined error handling
5. **Type Safety**: All seams use TypeScript discriminated unions and Zod schemas

---

## 📐 Seam #1: Core Types Layer

**Owner**: All agents reference this
**Location**: `src/core/types/index.ts`

```typescript
// ============================================================================
// GAME STATE TYPES
// ============================================================================

export enum GameState {
  MENU = 'menu',
  GENERATING = 'generating',
  DESCENDING = 'descending',      // Main gameplay
  UNRAVELING = 'unraveling',      // Reality collapse phase
  COLLAPSED = 'collapsed'         // End state
}

export enum PsychologicalStatus {
  STABLE = 'stable',
  UNEASY = 'uneasy',
  PARANOID = 'paranoid',
  FRAGMENTED = 'fragmented',
  SHATTERED = 'shattered'
}

export interface WorldState {
  protagonist: string;
  setting: string;
  dilemma: string;
  psychologicalStatus: PsychologicalStatus;
  systemHealth: number;              // 0-100, decreases with corruption
  horrorIntensity: number;           // 0-10, increases over time
  corruptionLevel: number;           // 0-100, affects UI
  genreConfig: GenreConfig;
  summary?: string;
}

export interface Choice {
  id: string;
  text: string;
  consequence?: string;
  isIntrusive?: boolean;             // Special disturbing choice
  psychologicalWeight?: number;      // How much this affects player profile
}

export interface StorySegment {
  id: string;
  text: string;
  images?: {
    main?: string;
    inset?: string[];
    mainStatus?: 'loading' | 'loaded' | 'failed';
  };
  timestamp: number;

  // Engine metadata
  isRevised?: boolean;               // Temporal Revision
  originalText?: string;             // Before revision
  isQuantumShift?: boolean;          // Quantum Narrative
  isMetaEvent?: boolean;             // Meta-Consciousness
  corruptionLevel?: number;          // Reality Corruption
}

// ============================================================================
// COMMAND TYPES (Discriminated Union)
// ============================================================================

export type Command =
  | { type: 'createSegment'; payload: { id: string } }
  | { type: 'displayText'; payload: { content: string; segmentId: string } }
  | { type: 'displayChoices'; payload: { choices: Choice[]; intrusiveThought?: Choice } }
  | { type: 'generateImage'; payload: { prompt: string; segmentId: string; priority?: 'high' | 'low' } }
  | { type: 'updateWorldState'; payload: Partial<WorldState> }
  | { type: 'wait'; payload: { duration: number } }
  | { type: 'applyCorruption'; payload: { level: number; effects: string[] } }
  | { type: 'browserEffect'; payload: BrowserEffect }
  | { type: 'reviseHistory'; payload: { segmentId: string; newText: string } }
  | { type: 'quantumShift'; payload: { timeline: string } };

export interface BrowserEffect {
  type: 'changeTitle' | 'openTab' | 'manipulateHistory' | 'vibrate';
  value?: string;
}

// ============================================================================
// AI TYPES
// ============================================================================

export enum AIProvider {
  GROK = 'grok',
  GEMINI_PRO = 'gemini-pro',
  GEMINI_FLASH = 'gemini-flash',
  MOCK = 'mock'
}

export interface AIRequest {
  provider: AIProvider;
  prompt: string;
  context: AIContext;
  temperature?: number;
  maxTokens?: number;
}

export interface AIContext {
  worldState: WorldState;
  recentHistory: StorySegment[];    // Last 5-10 segments
  playerProfile: PlayerProfile;      // Psychological profile
  genrePrompts: string[];
  engineInstructions: string[];      // From active engines
}

export interface AIResponse {
  provider: AIProvider;
  content: string;                   // Raw AI response
  commands: Command[];               // Extracted commands
  metadata: {
    tokensUsed?: number;
    latency?: number;
    model?: string;
  };
}

// ============================================================================
// PLAYER PROFILE TYPES
// ============================================================================

export interface PlayerProfile {
  fearProfile: {
    claustrophobia?: number;         // 0-1 scores
    isolation?: number;
    bodyHorror?: number;
    cosmicInsignificance?: number;
    lossOfControl?: number;
    madness?: number;
  };
  choicePatterns: {
    riskTaking: number;              // 0-1
    curiosity: number;
    aggression: number;
    avoidance: number;
  };
  engagementMetrics: {
    totalChoices: number;
    averageResponseTime: number;
    sessionDuration: number;
  };
  crossSessionData?: string;         // Encrypted for Neural Echo Chamber
}

// ============================================================================
// GENRE TYPES
// ============================================================================

export interface GenreConfig {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  themes: string[];
  fearCategories: string[];
  visualStyle: VisualStyle;
}

export interface VisualStyle {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  atmosphere: 'dark' | 'ethereal' | 'oppressive' | 'fragmented';
}
```

---

## 📐 Seam #2: State Store Interface

**Owner**: Agent 2 (State Management Engineer)
**Location**: `src/core/state/`
**Consumers**: All engines, UI components, flows

```typescript
// ============================================================================
// STORE INTERFACE - What everyone else uses
// ============================================================================

export interface GameStateStore {
  // State
  gameState: GameState;
  choices: Choice[];
  intrusiveThought?: Choice;
  isGenerating: boolean;

  // Actions
  setGameState: (state: GameState) => void;
  setChoices: (choices: Choice[], intrusive?: Choice) => void;
  setGenerating: (generating: boolean) => void;
  reset: () => void;
}

export interface WorldStateStore {
  // State
  worldState: WorldState;

  // Actions
  updateWorld: (partial: Partial<WorldState>) => void;
  increaseHorror: (amount: number) => void;
  decreaseHealth: (amount: number) => void;
  setCorruption: (level: number) => void;
  reset: () => void;
}

export interface HistoryStore {
  // State
  segments: StorySegment[];

  // Actions
  addSegment: (segment: StorySegment) => void;
  updateSegment: (id: string, updates: Partial<StorySegment>) => void;
  reviseSegment: (id: string, newText: string) => void;  // Temporal Revision
  getRecent: (count: number) => StorySegment[];
  reset: () => void;
}

export interface PlayerProfileStore {
  // State
  profile: PlayerProfile;

  // Actions
  updateFearProfile: (fear: string, intensity: number) => void;
  recordChoice: (choice: Choice, responseTime: number) => void;
  analyzePatterns: () => ChoicePatterns;
  reset: () => void;
}

// ============================================================================
// ATOMIC OPERATIONS - Coordinated multi-store updates
// ============================================================================

export interface StateManager {
  // Atomic operations that touch multiple stores
  resetAllStores: () => void;
  applyEngineEffects: (effects: EngineEffects) => void;
  snapshotState: () => GameSnapshot;
  restoreState: (snapshot: GameSnapshot) => void;
}

export interface EngineEffects {
  worldUpdates?: Partial<WorldState>;
  historyRevisions?: Array<{ id: string; newText: string }>;
  profileUpdates?: Partial<PlayerProfile>;
  corruptionChanges?: number;
}
```

**Contract**:
- ✅ Stores are **pure Zustand** with persistence middleware
- ✅ Actions are **synchronous** (no async in stores)
- ✅ All updates go through actions (no direct state mutation)
- ✅ StateManager coordinates multi-store atomicity

---

## 📐 Seam #3: Engine Interface

**Owner**: Agent 1 (Core Engines Architect)
**Location**: `src/core/engines/`
**Consumers**: Flow Orchestrator, AI Services

```typescript
// ============================================================================
// BASE ENGINE INTERFACE
// ============================================================================

export interface Engine {
  readonly name: string;
  readonly description: string;
  readonly priority: number;         // 1-10, higher = executes first

  // Core methods
  isActive(context: EngineContext): boolean;
  process(context: EngineContext): Promise<EngineOutput>;
  generateInstructions(context: EngineContext): string[];
}

export interface EngineContext {
  worldState: WorldState;
  recentHistory: StorySegment[];
  playerProfile: PlayerProfile;
  currentChoice?: Choice;
  previousOutput?: EngineOutput;
}

export interface EngineOutput {
  engineName: string;
  instructions: string[];           // Instructions to add to AI prompt
  effects: EngineEffects;           // State changes to apply
  metadata: Record<string, unknown>;
}

// ============================================================================
// SPECIFIC ENGINE INTERFACES
// ============================================================================

export interface TemporalRevisionEngine extends Engine {
  identifyRevisionTarget(history: StorySegment[]): string | null;
  generateRevision(original: string, context: EngineContext): Promise<string>;
}

export interface QuantumNarrativeEngine extends Engine {
  readonly timelines: Map<string, WorldState>;
  shiftTimeline(context: EngineContext): string;
  mergeTimelines(timeline1: string, timeline2: string): WorldState;
}

export interface RealityCorruptionEngine extends Engine {
  calculateCorruptionLevel(context: EngineContext): number;
  generateCorruptionEffects(level: number): string[];
}

export interface AdaptiveHorrorEngine extends Engine {
  analyzeFears(profile: PlayerProfile): Map<string, number>;
  generatePersonalizedHorror(fears: Map<string, number>): string[];
}

export interface MetaConsciousnessEngine extends Engine {
  shouldBreakFourthWall(context: EngineContext): boolean;
  generateMetaContent(context: EngineContext): string;
}

export interface NeuralEchoChamberEngine extends Engine {
  loadCrossSessionMemory(): PlayerProfile | null;
  saveCrossSessionMemory(profile: PlayerProfile): void;
  generateEchoContent(memories: PlayerProfile): string[];
}

export interface SemanticChoiceArchaeologyEngine extends Engine {
  analyzeChoiceSequence(choices: Choice[]): PatternAnalysis;
  generateReflection(analysis: PatternAnalysis): string;
}

export interface AdaptiveNarrativeDNAEngine extends Engine {
  readonly genome: NarrativeGenome;
  mutate(context: EngineContext): NarrativeGenome;
  crossover(genome1: NarrativeGenome, genome2: NarrativeGenome): NarrativeGenome;
}

export interface FifthWallEngine extends Engine {
  canManipulateBrowser(context: EngineContext): boolean;
  generateBrowserEffect(context: EngineContext): BrowserEffect;
}

// ============================================================================
// ENGINE REGISTRY
// ============================================================================

export interface EngineRegistry {
  register(engine: Engine): void;
  getAll(): Engine[];
  getActive(context: EngineContext): Engine[];
  executeAll(context: EngineContext): Promise<EngineOutput[]>;
}
```

**Contract**:
- ✅ Engines are **pure TypeScript classes** (no React dependencies)
- ✅ Engines don't directly mutate state (return effects instead)
- ✅ Engines are **stateless** (context passed in, effects returned)
- ✅ All engines implement base `Engine` interface
- ✅ Execution order determined by `priority` field

---

## 📐 Seam #4: AI Service Interface

**Owner**: Agent 3 (AI Services Integrator)
**Location**: `src/services/ai/`
**Consumers**: Engines, Flows

```typescript
// ============================================================================
// AI SERVICE INTERFACE
// ============================================================================

export interface AIService {
  readonly provider: AIProvider;
  readonly maxTokens: number;
  readonly supportsImages: boolean;

  // Core methods
  isAvailable(): Promise<boolean>;
  generateResponse(request: AIRequest): Promise<AIResponse>;
  estimateTokens(text: string): number;
}

// ============================================================================
// UNIFIED AI SERVICE (Facade)
// ============================================================================

export interface UnifiedAIService {
  // Configuration
  setPrimaryProvider(provider: AIProvider): void;
  setFallbackChain(providers: AIProvider[]): void;

  // Generation
  generate(request: Omit<AIRequest, 'provider'>): Promise<AIResponse>;
  generateWithFallback(request: Omit<AIRequest, 'provider'>): Promise<AIResponse>;

  // Testing
  testProvider(provider: AIProvider): Promise<ProviderTestResult>;
  testAllProviders(): Promise<Map<AIProvider, ProviderTestResult>>;
}

export interface ProviderTestResult {
  provider: AIProvider;
  available: boolean;
  latency?: number;
  error?: string;
}

// ============================================================================
// PROMPT BUILDER
// ============================================================================

export interface PromptBuilder {
  buildSystemPrompt(genre: GenreConfig, engines: string[]): string;
  buildContextPrompt(context: AIContext): string;
  buildChoicePrompt(worldState: WorldState, previousChoice: Choice): string;
  injectEngineInstructions(prompt: string, instructions: string[]): string;
}

// ============================================================================
// RESPONSE PARSER
// ============================================================================

export interface ResponseParser {
  extractCommands(response: string): Command[];
  extractJSON<T>(response: string, schema: z.ZodSchema<T>): T | null;
  sanitizeText(text: string): string;
}
```

**Contract**:
- ✅ AI services are **async** and may fail
- ✅ Services don't know about state stores (receive context, return response)
- ✅ UnifiedAIService handles fallback logic (Grok → Gemini Pro → Gemini Flash → Mock)
- ✅ All responses parsed and validated before returning
- ✅ Token estimation for context management

---

## 📐 Seam #5: Command Executor Interface

**Owner**: Agent 5 (Command System Builder)
**Location**: `src/core/commands/`
**Consumers**: Flows, Game Service

```typescript
// ============================================================================
// COMMAND EXECUTOR INTERFACE
// ============================================================================

export interface CommandExecutor {
  execute(command: Command): Promise<ExecutionResult>;
  canExecute(command: Command): boolean;
  validate(command: Command): ValidationResult;
}

export interface ExecutionResult {
  success: boolean;
  command: Command;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ============================================================================
// COMMAND QUEUE MANAGER
// ============================================================================

export interface CommandQueue {
  enqueue(commands: Command[]): void;
  executeNext(): Promise<ExecutionResult>;
  executeAll(): Promise<ExecutionResult[]>;
  executeSequential(): Promise<ExecutionResult[]>;
  clear(): void;
  size(): number;
}

// ============================================================================
// SPECIFIC EXECUTORS
// ============================================================================

export interface TextDisplayExecutor extends CommandExecutor {
  displayWithEffect(text: string, effect: 'typewriter' | 'glitch' | 'fade'): Promise<void>;
}

export interface ImageGenerationExecutor extends CommandExecutor {
  generateWithFallback(prompt: string): Promise<string | null>;
  getCachedImage(prompt: string): string | null;
}

export interface WorldStateExecutor extends CommandExecutor {
  validateUpdate(update: Partial<WorldState>): boolean;
  applyUpdate(update: Partial<WorldState>): void;
}

export interface BrowserEffectExecutor extends CommandExecutor {
  canExecuteEffect(effect: BrowserEffect): boolean;
  executeEffect(effect: BrowserEffect): Promise<void>;
}
```

**Contract**:
- ✅ All executors are **async** (for consistency)
- ✅ Executors validate before executing
- ✅ Executors return structured results (not just success/fail)
- ✅ CommandQueue handles ordering and error recovery
- ✅ Failed commands don't break the queue

---

## 📐 Seam #6: Flow Orchestrator Interface

**Owner**: Agent 6 (Flow Orchestrator)
**Location**: `src/flows/`
**Consumers**: Game Service, UI

```typescript
// ============================================================================
// FLOW INTERFACE
// ============================================================================

export interface GameFlow {
  readonly name: string;

  // Lifecycle
  initialize(genre: GenreConfig): Promise<void>;
  processChoice(choice: Choice): Promise<FlowResult>;
  shouldTransition(context: FlowContext): GameState | null;
}

export interface FlowResult {
  commands: Command[];
  worldUpdates: Partial<WorldState>;
  nextState?: GameState;
  error?: string;
}

export interface FlowContext {
  worldState: WorldState;
  recentHistory: StorySegment[];
  playerProfile: PlayerProfile;
  currentChoice: Choice;
}

// ============================================================================
// DESCENT FLOW (Main Gameplay)
// ============================================================================

export interface DescentFlow extends GameFlow {
  calculateDescentLevel(): number;      // 0-100
  shouldBeginUnraveling(): boolean;
}

// ============================================================================
// UNRAVELING FLOW (Reality Collapse)
// ============================================================================

export interface UnravelingFlow extends GameFlow {
  calculateUnravelingLevel(): number;   // 0-100
  shouldCollapse(): boolean;
  generateCollapseEffect(): BrowserEffect[];
}

// ============================================================================
// FLOW COORDINATOR
// ============================================================================

export interface FlowCoordinator {
  getCurrentFlow(): GameFlow;
  transitionTo(state: GameState): Promise<void>;
  executeEngines(context: FlowContext): Promise<EngineOutput[]>;
  executeCommands(commands: Command[]): Promise<ExecutionResult[]>;
}
```

**Contract**:
- ✅ Flows coordinate engines but don't implement engine logic
- ✅ Flows determine state transitions (menu → descending → unraveling → collapsed)
- ✅ Flows compose: Engines → AI → Commands → State Updates
- ✅ Flows are testable without UI

---

## 📐 Seam #7: Image Service Interface

**Owner**: Agent 7 (Image & Cache Engineer)
**Location**: `src/services/images/`
**Consumers**: Image Generation Executor

```typescript
// ============================================================================
// IMAGE SERVICE INTERFACE
// ============================================================================

export interface ImageService {
  readonly provider: string;
  readonly priority: number;

  generate(prompt: string): Promise<ImageResult>;
  isAvailable(): Promise<boolean>;
}

export interface ImageResult {
  url: string | null;
  provider: string;
  cached: boolean;
  error?: string;
}

// ============================================================================
// IMAGE PIPELINE
// ============================================================================

export interface ImagePipeline {
  generate(prompt: string, segmentId: string): Promise<string | null>;
  generateWithFallback(prompt: string): Promise<ImageResult>;
  getProviders(): ImageService[];
  testProviders(): Promise<Map<string, boolean>>;
}

// ============================================================================
// CACHE INTERFACE
// ============================================================================

export interface ImageCache {
  get(key: string): string | null;
  set(key: string, url: string, ttl?: number): void;
  has(key: string): boolean;
  clear(): void;
  size(): number;
}

// LRU + TTL Cache implementation
export interface LRUTTLCache extends ImageCache {
  readonly maxSize: number;
  readonly defaultTTL: number;

  evict(): void;
  prune(): void;  // Remove expired entries
}
```

**Contract**:
- ✅ Image generation is **best-effort** (null is valid result)
- ✅ Cache is transparent to consumers
- ✅ Pipeline tries multiple providers: Grok → Gemini → Unsplash → null
- ✅ Failed image generation doesn't block game flow

---

## 📐 Seam #8: UI Component Interface

**Owner**: Agent 4 (UI Components Designer)
**Location**: `src/ui/`
**Consumers**: App.tsx (root)

```typescript
// ============================================================================
// SCREEN INTERFACE
// ============================================================================

export interface Screen {
  readonly name: string;
  render(): JSX.Element;
}

// ============================================================================
// SCREEN PROPS
// ============================================================================

export interface StartScreenProps {
  onStartGame: (genre: GenreConfig, provider: AIProvider) => void;
  availableGenres: GenreConfig[];
  availableProviders: AIProvider[];
}

export interface DescentScreenProps {
  worldState: WorldState;
  currentSegment: StorySegment;
  choices: Choice[];
  intrusiveThought?: Choice;
  isGenerating: boolean;
  onChoice: (choice: Choice) => void;
  onSave: () => void;
  onReset: () => void;
}

export interface UnravelingScreenProps {
  worldState: WorldState;
  finalSegment: StorySegment;
  onRestart: () => void;
}

// ============================================================================
// EFFECT COMPONENTS
// ============================================================================

export interface CorruptionEffect {
  level: number;                     // 0-100
  applyTo(element: HTMLElement): void;
  remove(element: HTMLElement): void;
}

export interface GlitchEffect {
  intensity: number;                 // 0-10
  trigger(): void;
}
```

**Contract**:
- ✅ UI components are **pure React** (no direct store access in props)
- ✅ State passed down as props, callbacks passed for actions
- ✅ Effects are separate components (composition)
- ✅ No business logic in UI (delegated to hooks/services)

---

## 📐 Seam #9: Config Interface

**Owner**: All agents (shared)
**Location**: `src/config/`

```typescript
// ============================================================================
// CONFIGURATION
// ============================================================================

export interface AppConfig {
  // AI Configuration
  ai: {
    primaryProvider: AIProvider;
    fallbackChain: AIProvider[];
    defaultTemperature: number;
    maxTokens: number;
  };

  // Feature Flags
  features: {
    temporalRevision: boolean;
    quantumNarrative: boolean;
    realityCorruption: boolean;
    adaptiveHorror: boolean;
    metaConsciousness: boolean;
    neuralEcho: boolean;
    semanticArchaeology: boolean;
    narrativeDNA: boolean;
    fifthWall: boolean;
  };

  // Cache Configuration
  cache: {
    imageMaxSize: number;
    imageTTL: number;
    enablePersistence: boolean;
  };

  // Game Configuration
  game: {
    defaultGenre: string;
    maxHistorySegments: number;
    horrorIntensityRate: number;
    corruptionThreshold: number;
  };
}

// ============================================================================
// CONFIGURATION PROVIDER
// ============================================================================

export interface ConfigProvider {
  getConfig(): AppConfig;
  updateConfig(partial: Partial<AppConfig>): void;
  resetToDefaults(): void;
}
```

**Contract**:
- ✅ Config is **read-only** at runtime (except via ConfigProvider)
- ✅ Sensible defaults for all values (app works without .env)
- ✅ Environment variables override defaults
- ✅ Feature flags enable/disable engines dynamically

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          USER INPUT                          │
│                       (Choice Selection)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      FLOW COORDINATOR                        │
│  • Receives choice                                          │
│  • Builds FlowContext from stores                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      ENGINE REGISTRY                         │
│  • Executes all active engines in priority order            │
│  • Collects EngineOutputs                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   UNIFIED AI SERVICE                         │
│  • Builds prompt with engine instructions                   │
│  • Calls Grok/Gemini with fallback                          │
│  • Parses response → AIResponse                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     COMMAND QUEUE                            │
│  • Enqueues commands from AIResponse                        │
│  • Validates each command                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   COMMAND EXECUTORS                          │
│  • Execute each command in sequence                         │
│  • Update stores via actions                                │
│  • Trigger image generation (async)                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      ZUSTAND STORES                          │
│  • State updated                                            │
│  • Persist to localStorage                                  │
│  • Trigger React re-renders                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      UI COMPONENTS                           │
│  • Consume state via stores                                 │
│  • Render new story segment                                 │
│  • Display new choices                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Contracts

Each seam must have:

1. **Unit Tests**: Test interface implementation in isolation
2. **Integration Tests**: Test seam boundaries (mocked dependencies)
3. **Contract Tests**: Verify interface compliance (TypeScript + Zod)

Example test structure:
```typescript
// Unit test for Engine
describe('TemporalRevisionEngine', () => {
  it('implements Engine interface', () => {
    const engine = new TemporalRevisionEngine();
    expect(engine.name).toBeDefined();
    expect(engine.process).toBeDefined();
  });
});

// Integration test for Engine → State seam
describe('Engine → State Integration', () => {
  it('applies engine effects to state', async () => {
    const engine = new TemporalRevisionEngine();
    const context = buildMockContext();
    const output = await engine.process(context);

    const manager = new StateManager();
    manager.applyEngineEffects(output.effects);

    // Verify state updated correctly
  });
});
```

---

## 📋 Agent Assignment to Seams

| Agent | Primary Seams | Secondary Seams |
|-------|---------------|-----------------|
| Agent 1 (Engines) | #3 (Engine Interface) | #1 (Types), #9 (Config) |
| Agent 2 (State) | #2 (State Interface) | #1 (Types) |
| Agent 3 (AI Services) | #4 (AI Interface) | #1 (Types), #9 (Config) |
| Agent 4 (UI) | #8 (UI Interface) | #2 (State - consumption) |
| Agent 5 (Commands) | #5 (Command Interface) | #1 (Types), #2 (State - updates) |
| Agent 6 (Flows) | #6 (Flow Interface) | #3 (Engines), #4 (AI), #5 (Commands) |
| Agent 7 (Images) | #7 (Image Interface) | #9 (Config) |
| Agent 8 (Testing) | All seams (testing) | - |

---

## ✅ Validation Checklist

Before integration, each agent must verify:

- [ ] All interfaces implemented
- [ ] TypeScript strict mode passes (no `any`)
- [ ] Zod schemas defined for all external data
- [ ] Unit tests pass (>80% coverage)
- [ ] No circular dependencies
- [ ] No direct store mutations (only via actions)
- [ ] Error handling at seam boundaries
- [ ] Mock implementations for testing

---

## 🚀 Integration Order

1. **Phase 1**: Types (#1) + Config (#9) - Foundation
2. **Phase 2**: State (#2) + Engines (#3) - Core logic
3. **Phase 3**: AI (#4) + Commands (#5) - Execution layer
4. **Phase 4**: Flows (#6) + Images (#7) - Orchestration
5. **Phase 5**: UI (#8) + Testing - Presentation

---

This seams document serves as the **contract** for all 8 agents. Each agent can work independently as long as they honor their seam interfaces.
