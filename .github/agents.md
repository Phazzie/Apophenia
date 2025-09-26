# Apophenia - AI Agent Development Guide

**ALWAYS follow these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

This guide is specifically for AI agents (Claude, GPT-4, ChatGPT, etc.) working on the Apophenia codebase. Unlike GitHub Copilot, AI agents typically work in conversational mode with broader context understanding and can handle complex architectural decisions.

## Project Overview for AI Agents

Apophenia is a React + TypeScript + Zustand psychological horror game that uses AI-driven storytelling. The architecture follows: **flows → command queue → executors → stores → UI**.

### Key Differences from Copilot Instructions
- **Context Reasoning**: AI agents can understand complex architectural patterns and make informed decisions about system design
- **Multi-step Planning**: Capable of planning and executing complex refactoring across multiple files
- **Error Analysis**: Better at diagnosing and fixing systemic issues vs. syntax errors
- **Creative Problem Solving**: Can propose novel solutions and architectural improvements

## Bootstrap & Development (AI Agent Optimized)

**Quick validation (for AI agents who prefer verification first):**
```bash
# Verify project state
npm install && npm run build && npm test
# NEVER CANCEL: Full sequence takes ~90 seconds. Set timeout to 300+ seconds.

# Start development with hot reload
npm run dev
# Test in browser at http://localhost:5173/
```

**AI-specific environment setup:**
```bash
# Create environment file for AI service integration
cp .env.example .env.local

# Critical: Configure these for full functionality
# VITE_XAI_API_KEY=your-xai-api-key-here          # X.AI Grok-4 Fast Reasoning (primary)
# VITE_GEMINI_API_KEY=your-google-gemini-api-key  # Google Gemini (fallback)

# AI Model Priority: Grok-4 Fast Reasoning → Gemini 2.5 Pro → Gemini 2.5 Flash
# Without keys: App runs with mock data and graceful error handling
```

## Architecture Deep Dive (AI Agent Level)

### Command System Architecture
The entire application operates through a discriminated union command system:

```typescript
type Command = 
  | CreateSegmentCommand 
  | DisplayTextCommand 
  | GenerateImageCommand 
  | DisplayChoicesCommand
  | UpdateWorldStateCommand
  // ... more commands
```

**Key Principle**: Every game action is a command. Commands are:
- **Type-safe** via discriminated unions
- **Async-aware** (blocking vs non-blocking)
- **Testable** in isolation
- **Cancellable** (TODO: implement cancellation)

### AI Integration Points (Critical for AI Agents)

1. **X.AI Grok-4 Fast Reasoning Integration**: `src/services/ai/grokService.ts`
   - Primary AI provider with 2M token context window
   - Advanced reasoning capabilities for complex narrative decisions
   - Enhanced thinking mode for deeper story analysis

2. **Google Gemini Integration**: `src/services/ai/genkit.ts`
   - Fallback AI service with Gemini 2.5 Pro and Flash models
   - Handles concept generation, story progression, choices
   - Implements safety settings and content filtering

3. **Unified AI Service**: `src/services/ai/unifiedAIService.ts`
   - Multi-model routing and fallback management
   - Intelligent provider selection based on task complexity
   - Performance monitoring and error recovery

4. **Flow Orchestration**: `src/services/flows/`
   - `conceptFlow.ts` - Initial story concept generation
   - `nextStepFlow.ts` - Story progression logic with advanced reasoning
   - `summaryFlow.ts` - Context summarization for AI
   - `generateImageFlow.ts` - Visual content generation with AI

5. **Command Execution**: `src/services/commandExecutor.ts`
   - Central orchestrator for all commands
   - Handles async execution and error boundaries
   - Manages blocking vs non-blocking operations

### State Management (Zustand)

**Game State** (`src/stores/gameStore.ts`):
- Story segments with unique IDs
- Current choices and loading states  
- Game session management

**UI State** (`src/stores/uiStore.ts`):
- Interface responsiveness and theming
- Error state management
- User interaction tracking

**Critical Rule**: Always update by `segmentId`, never by array index or "last" segment.

## AI Agent Development Workflows

### Adding New AI Features
1. **Define Command Type**: Add to discriminated union in `src/types.ts`
2. **Create Executor**: Implement in `src/commands/newFeature.ts`
3. **Register Executor**: Add to `src/services/commandExecutor.ts`
4. **Add Flow Integration**: Connect in appropriate flow file
5. **Add Tests**: Create tests in `src/commands/__tests__/`

### Modifying AI Flows
```bash
# Key files for AI behavior modification:
src/services/ai/grokService.ts          # X.AI Grok-4 Fast Reasoning integration
src/services/ai/unifiedAIService.ts     # Multi-model AI routing and fallback
src/services/ai/genkit.ts               # Gemini integration and fallback handling
src/services/flows/nextStepFlow.ts      # Core game progression with advanced reasoning
src/services/flows/conceptFlow.ts       # Story initialization with thinking mode
src/types.ts                            # Type definitions for AI responses
```

### Debugging AI Integration
```bash
# Check AI service responses
npm run dev
# Browser console shows AI service calls and responses
# Look for "AI flow" messages and error details

# Test without API keys to verify error handling
rm .env.local && npm run dev
```

## Testing Strategy for AI Agents

**Unit Tests**: Focus on command executors and state management
```bash
npm test
# Tests cover command execution, state updates, error scenarios
```

**Integration Testing**: Manual validation of AI flows
```bash
# Start app, trigger AI flows, verify graceful degradation
npm run dev
# Test scenarios: new game, story progression, error handling
```

**AI Service Testing**: Mock AI responses for consistent testing
- Use mock data in tests for predictable outcomes
- Test with real API keys for integration validation
- Verify error handling when APIs are unavailable

## Common AI Agent Tasks

### Implementing New AI Services
- Follow the pattern in `src/services/ai/genkit.ts`
- Add configuration to `src/services/config.ts`
- Implement safety settings and content filtering
- Add proper error handling and fallbacks

### Optimizing AI Performance  
- Implement caching for repeated AI calls
- Add request deduplication for similar prompts
- Consider streaming responses for better UX
- Monitor token usage and costs

### Enhancing Story Quality
- Adjust prompt engineering in flow files
- Tune AI model parameters (temperature, top-p, etc.)
- Implement content validation and filtering
- Add psychological profiling for personalized content

## Architecture Constraints (Important for AI Agents)

**Must Preserve**:
- Command/executor separation
- Zustand store immutability patterns
- TypeScript strict typing
- Async command execution model

**Never Do**:
- Direct store mutations outside actions
- Hardcode AI service responses
- Skip error boundaries in AI flows
- Commit API keys to repository

## Advanced AI Agent Capabilities

### System-wide Architecture Understanding

AI agents working on Apophenia must understand and preserve the core architectural principles:

```typescript
// Command System Flow
type GameFlow = {
  userAction: UserChoice | GameAction,
  aiProcessing: ConceptGeneration | StoryProgression | ImageGeneration,
  commandGeneration: Command[],
  stateUpdate: StoreUpdate,
  uiRendering: ComponentRerender
}

// Critical Architectural Constraints
const ARCHITECTURE_RULES = {
  commandPattern: 'All game actions must be commands with discriminated unions',
  stateImmutability: 'Zustand stores must never be directly mutated',
  typesafety: 'Zero any types allowed, full TypeScript strict mode',
  asyncHandling: 'Non-blocking operations with proper error boundaries',
  segmentIdentification: 'Always update by segmentId, never by array index'
} as const;
```

### Expert-Level Refactoring Patterns

```typescript
// 1. Adding New AI Features (Safe Pattern)
interface NewAICommand extends BaseCommand {
  type: 'NEW_AI_FEATURE';
  payload: {
    segmentId: string;
    correlationId: string;
    aiFeatureData: FeatureData;
    metadata: CommandMetadata;
  };
}

// 2. State Update Pattern (Always Use)
const safeStateUpdate = (segmentId: string, update: Partial<StorySegment>) => {
  useGameStore.getState().updateSegment(segmentId, update);
  // Never: segments[segments.length - 1] = update; (WRONG)
};

// 3. Error Recovery Pattern
const withAIErrorRecovery = async <T>(
  operation: () => Promise<T>,
  fallback: () => T
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error('AI operation failed:', error);
    return fallback();
  }
};
```

### Advanced Problem-Solving Scenarios

#### Scenario 1: AI Service Integration
```typescript
// Problem: Adding a new AI service (e.g., Claude, GPT-4)
// Solution: Follow the established pattern

// 1. Extend service interface
interface AIService {
  generateStory(context: StoryContext): Promise<StoryResponse>;
  generateChoices(context: ChoiceContext): Promise<Choice[]>;
  generateImage(prompt: string): Promise<ImageResponse>;
}

// 2. Implement service with fallbacks
class ClaudeAIService implements AIService {
  async generateStory(context: StoryContext): Promise<StoryResponse> {
    return withAIErrorRecovery(
      () => this.callClaude(context),
      () => getGenericStoryFallback()
    );
  }
}

// 3. Register in service factory
const createAIService = (provider: AIProvider): AIService => {
  switch (provider) {
    case 'claude': return new ClaudeAIService();
    case 'gemini': return new GeminiAIService(); 
    default: return new FallbackAIService();
  }
};
```

#### Scenario 2: Performance Optimization
```typescript
// Problem: AI calls are too slow, affecting UX
// Solution: Implement intelligent caching and prefetching

class AIResponseCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 30 * 60 * 1000; // 30 minutes
  
  async getOrGenerate<T>(
    key: string,
    generator: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data;
    }
    
    const result = await generator();
    this.cache.set(key, { data: result, timestamp: Date.now() });
    return result;
  }
}

// Usage in flows
const cachedStoryGeneration = async (context: StoryContext) => {
  const cacheKey = hashStoryContext(context);
  return aiCache.getOrGenerate(cacheKey, () => 
    generateStoryWithAI(context)
  );
};
```

#### Scenario 3: Complex State Synchronization
```typescript
// Problem: Multiple async operations updating the same story segment
// Solution: Use correlation IDs and atomic updates

class GameStateManager {
  private pendingOperations = new Map<string, Promise<void>>();
  
  async executeAtomicUpdate(
    segmentId: string,
    operation: (segment: StorySegment) => Promise<Partial<StorySegment>>
  ): Promise<void> {
    const operationId = `${segmentId}-${Date.now()}`;
    
    // Prevent concurrent modifications
    await this.pendingOperations.get(segmentId);
    
    const updatePromise = this.performUpdate(segmentId, operation);
    this.pendingOperations.set(segmentId, updatePromise);
    
    try {
      await updatePromise;
    } finally {
      this.pendingOperations.delete(segmentId);
    }
  }
  
  private async performUpdate(
    segmentId: string,
    operation: (segment: StorySegment) => Promise<Partial<StorySegment>>
  ): Promise<void> {
    const gameStore = useGameStore.getState();
    const segment = gameStore.getSegmentById(segmentId);
    
    if (!segment) throw new Error(`Segment ${segmentId} not found`);
    
    const updates = await operation(segment);
    gameStore.updateSegment(segmentId, updates);
  }
}
```

## Latest AI Enhancements (2025)

### X.AI Grok-4 Fast Reasoning Integration
The project now uses X.AI's Grok-4 Fast Reasoning as the primary AI provider:

- **2M Token Context**: Maintains perfect story consistency across long narratives
- **Advanced Reasoning**: Deep analysis of player psychology and narrative coherence  
- **Thinking Mode**: Internal reasoning before generating responses
- **Reality Distortion Engine**: Gradual horror escalation through subtle inconsistencies
- **Foreshadowing System**: Plants narrative seeds that pay off in future segments

### Revolutionary AI Features
Located in `src/services/ai/revolutionaryFeatures.ts`:

- **Neural Echo Chambers**: Cross-session pattern recognition for player behavior
- **Adaptive Narrative DNA**: Dynamic story evolution based on player engagement
- **Quantum Narrative Shifts**: Subtle reality alterations that build psychological tension
- **Meta-Consciousness Events**: Fourth-wall breaking moments for enhanced immersion
- **Fifth Wall Breaking**: Browser manipulation effects for ultimate horror experience

### AI Service Architecture
```typescript
// Current AI Provider Hierarchy
const AI_PROVIDERS = {
  primary: 'grok-4-fast-reasoning',    // X.AI with 2M context
  fallback: 'gemini-2.5-pro',         // Google Gemini Pro
  emergency: 'gemini-2.5-flash'       // Fast Gemini for basic responses
} as const;
```

### Advanced Prompt Engineering
The system now uses sophisticated prompt engineering techniques:

- **System-level context injection** for consistent world building
- **Psychological profiling integration** for personalized horror experiences
- **Dynamic difficulty adjustment** based on player engagement metrics
- **Semantic choice archaeology** for understanding deep player motivations

Remember: **AI agents have broader reasoning capabilities than Copilot**. Use this to understand system behavior, propose architectural improvements, and solve complex integration challenges.