/**
 * ARCHITECTURAL SEAMS - Type Definitions
 *
 * This file defines all interfaces and contracts between components.
 * All agents MUST reference these types and implement these interfaces.
 *
 * DO NOT modify interfaces without updating SEAMS.md documentation.
 */

import { z } from 'zod';

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
  isIntrusive: boolean;              // Special disturbing choice (required)
  psychologicalWeight?: number;      // How much this affects player profile
}

export interface StorySegment {
  id: string;
  text: string;
  images?: {
    main?: string;
    inset?: string[];
    mainStatus?: 'loading' | 'loaded' | 'failed' | 'retrying';
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
  | { type: 'pregenerateImage'; payload: { prompt: string } }
  | { type: 'generateAmbiance'; payload: { description: string } }
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
  // GEMINI_PRO = 'gemini-pro',     // REMOVED - Grok-only deployment
  // GEMINI_FLASH = 'gemini-flash', // REMOVED - Grok-only deployment
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

// ============================================================================
// SEAM #2: STATE STORE INTERFACE
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
  reviseSegment: (id: string, newText: string) => void;
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

export interface ChoicePatterns {
  riskTaking: number;
  curiosity: number;
  aggression: number;
  avoidance: number;
}

export interface EngineEffects {
  worldUpdates?: Partial<WorldState>;
  historyRevisions?: Array<{ id: string; newText: string }>;
  profileUpdates?: Partial<PlayerProfile>;
  corruptionChanges?: number;
}

export interface GameSnapshot {
  gameState: GameState;
  worldState: WorldState;
  segments: StorySegment[];
  profile: PlayerProfile;
  timestamp: number;
}

export interface StateManager {
  resetAllStores: () => void;
  applyEngineEffects: (effects: EngineEffects) => void;
  snapshotState: () => GameSnapshot;
  restoreState: (snapshot: GameSnapshot) => void;
}

// ============================================================================
// SEAM #3: ENGINE INTERFACE
// ============================================================================

export interface Engine {
  readonly name: string;
  readonly description: string;
  readonly priority: number;         // 1-10, higher = executes first

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
  instructions: string[];
  effects: EngineEffects;
  metadata: Record<string, unknown>;
}

export interface TemporalRevisionEngine extends Engine {
  identifyRevisionTarget(history: StorySegment[]): string | null;
  generateRevision(original: string, context: EngineContext): Promise<string>;
}

export interface QuantumNarrativeEngine extends Engine {
  readonly timelines: Map<string, WorldState>;
  shiftTimeline(context: EngineContext): string;
  mergeTimelines(timeline1: string, timeline2: string): WorldState | null;
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

export interface PatternAnalysis {
  dominantPattern: string;
  subconscious: string[];
  interpretation: string;
}

export interface NarrativeGenome {
  themes: string[];
  mutations: number;
  generation: number;
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

export interface EngineRegistry {
  register(engine: Engine): void;
  getAll(): Engine[];
  getActive(context: EngineContext): Engine[];
  executeAll(context: EngineContext): Promise<EngineOutput[]>;
}

// ============================================================================
// SEAM #4: AI SERVICE INTERFACE
// ============================================================================

export interface AIService {
  readonly provider: AIProvider;
  readonly maxTokens: number;
  readonly supportsImages: boolean;

  isAvailable(): Promise<boolean>;
  generateResponse(request: AIRequest): Promise<AIResponse>;
  estimateTokens(text: string): number;
}

export interface UnifiedAIService {
  setPrimaryProvider(provider: AIProvider): void;
  setFallbackChain(providers: AIProvider[]): void;

  generate(request: Omit<AIRequest, 'provider'>): Promise<AIResponse>;
  generateWithFallback(request: Omit<AIRequest, 'provider'>): Promise<AIResponse>;

  testProvider(provider: AIProvider): Promise<ProviderTestResult>;
  testAllProviders(): Promise<Map<AIProvider, ProviderTestResult>>;
}

export interface ProviderTestResult {
  provider: AIProvider;
  available: boolean;
  latency?: number;
  error?: string;
}

export interface PromptBuilder {
  buildSystemPrompt(genre: GenreConfig, engines: string[]): string;
  buildContextPrompt(context: AIContext): string;
  buildChoicePrompt(worldState: WorldState, previousChoice: Choice): string;
  injectEngineInstructions(prompt: string, instructions: string[]): string;
}

export interface ResponseParser {
  extractCommands(response: string): Command[];
  extractJSON<T>(response: string, schema: z.ZodSchema<T>): T | null;
  sanitizeText(text: string): string;
}

// ============================================================================
// SEAM #5: COMMAND EXECUTOR INTERFACE
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

export interface CommandQueue {
  enqueue(commands: Command[]): void;
  executeNext(): Promise<ExecutionResult>;
  executeAll(): Promise<ExecutionResult[]>;
  executeSequential(): Promise<ExecutionResult[]>;
  clear(): void;
  size(): number;
}

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

// ============================================================================
// SEAM #6: FLOW ORCHESTRATOR INTERFACE
// ============================================================================

export interface GameFlow {
  readonly name: string;

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

export interface DescentFlow extends GameFlow {
  calculateDescentLevel(): number;
  shouldBeginUnraveling(): boolean;
}

export interface UnravelingFlow extends GameFlow {
  calculateUnravelingLevel(): number;
  shouldCollapse(): boolean;
  generateCollapseEffect(): BrowserEffect[];
}

export interface FlowCoordinator {
  getCurrentFlow(): GameFlow;
  transitionTo(state: GameState): Promise<void>;
  executeEngines(context: FlowContext): Promise<EngineOutput[]>;
  executeCommands(commands: Command[]): Promise<ExecutionResult[]>;
}

// ============================================================================
// SEAM #7: IMAGE SERVICE INTERFACE
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

export interface ImagePipeline {
  generate(prompt: string, segmentId: string): Promise<string | null>;
  generateWithFallback(prompt: string): Promise<ImageResult>;
  getProviders(): ImageService[];
  testProviders(): Promise<Map<string, boolean>>;
}

export interface ImageCache {
  get(key: string): string | null;
  set(key: string, url: string, ttl?: number): void;
  has(key: string): boolean;
  clear(): void;
  size(): number;
}

export interface LRUTTLCache extends ImageCache {
  readonly maxSize: number;
  readonly defaultTTL: number;

  evict(): void;
  prune(): void;
}

// ============================================================================
// SEAM #8: UI COMPONENT INTERFACE
// ============================================================================

export interface Screen {
  readonly name: string;
  render(): JSX.Element;
}

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

export interface CorruptionEffect {
  level: number;
  applyTo(element: HTMLElement): void;
  remove(element: HTMLElement): void;
}

export interface GlitchEffect {
  intensity: number;
  trigger(): void;
}

// ============================================================================
// SEAM #9: CONFIG INTERFACE
// ============================================================================

export interface AppConfig {
  ai: {
    primaryProvider: AIProvider;
    fallbackChain: AIProvider[];
    defaultTemperature: number;
    maxTokens: number;
  };

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

  cache: {
    imageMaxSize: number;
    imageTTL: number;
    enablePersistence: boolean;
  };

  game: {
    defaultGenre: string;
    maxHistorySegments: number;
    horrorIntensityRate: number;
    corruptionThreshold: number;
  };
}

export interface ConfigProvider {
  getConfig(): AppConfig;
  updateConfig(partial: Partial<AppConfig>): void;
  resetToDefaults(): void;
}
