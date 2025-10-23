# Apophenia - AI-Driven Interactive Narrative Game

**ALWAYS follow these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

Apophenia is a React + TypeScript + Zustand web application that creates AI-driven interactive narrative experiences. The architecture follows a clear separation: flows → command queue → executors → stores → UI.

## Project Overview

**Technology Stack**: React 18, TypeScript 5.x, Zustand, Vite, Jest  
**AI Integration**: X.AI Grok-4 Fast Reasoning (primary), Google Gemini (fallback)  
**Architecture Pattern**: Command-driven with discriminated unions  
**Testing**: Comprehensive unit tests with 50+ passing tests  
**Deployment**: Vercel/Netlify static hosting with environment variable configuration

## Quick Bootstrap & Development

**Initial setup (may vary from 30 seconds to 1+ minute):**
```bash
# Install dependencies
npm install
# NEVER CANCEL: Takes 30 seconds to 1+ minute depending on network. Set timeout to 300+ seconds.
```

**Build and validate (5 seconds total):**
```bash
# Build production version
npm run build
# NEVER CANCEL: Takes ~4 seconds. Set timeout to 30+ seconds.

# Run TypeScript type checking
npx tsc --noEmit
# NEVER CANCEL: Takes ~3 seconds. Set timeout to 30+ seconds.

# Run tests
npm test
# NEVER CANCEL: Takes ~1.5 seconds. Set timeout to 30+ seconds.
```

**Development server:**
```bash
# Start development server
npm run dev
# Serves on http://localhost:5173/
# Ready in ~0.2 seconds

# Preview production build
npx vite preview
# Serves built files from dist/ folder
```

## Working Effectively

### Environment Variables
**CRITICAL**: Create environment files for AI integration:
```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local with your keys:
VITE_XAI_API_KEY=your-xai-api-key-here
VITE_GEMINI_API_KEY=your-google-api-key-here
```

**AI Model Priority**: Grok-4 Fast Reasoning (primary) → Gemini 2.5 Pro (fallback) → Gemini 2.5 Flash (final fallback)
**Without API keys**: App still runs with mock data and error handling.

### Project Structure Navigation
```
src/
├── components/          # React UI components (ModelSelector, TestAPIButton, etc.)
├── stores/             # Zustand state management (game state, AI model selection)
│   ├── aiModelStore.ts    # AI model selection and testing
│   ├── gameStateStore.ts  # Core game state
│   └── ...
├── services/           # Business logic, AI flows, game controller
│   ├── ai/               # AI service integrations
│   │   ├── grokService.ts      # Grok-4 Fast Reasoning (2M context)
│   │   ├── unifiedAIService.ts # Multi-model routing
│   │   └── genkit.ts           # Gemini fallback
│   └── ...
├── commands/           # Command executors (displayText, generateImage, etc.)
├── types.ts           # Centralized type definitions
└── App.tsx            # Main application entry
```

**Key Files:**
- `src/App.tsx` - Main UI with TestAPIButton integration
- `src/components/StartScreen.tsx` - Model selector integration
- `src/stores/aiModelStore.ts` - AI model selection state
- `src/services/ai/unifiedAIService.ts` - Multi-model AI routing
- `src/services/gameService.ts` - Game controller and flow orchestration
- `src/services/flows/` - AI integration flows (concept, nextStep, etc.)
- `src/commands/` - Command executors for game actions
- `src/types.ts` - All TypeScript type definitions

## Validation & Testing

**Always run before committing:**
```bash
# Type checking (required - CI will fail without this)
npx tsc --noEmit

# Build verification
npm run build

# Test suite
npm test
```

**Manual validation scenarios:**
1. **Basic game flow**: Start app → click "New Game" → verify choices appear
2. **Story progression**: Click choice buttons → verify new story segments load
3. **Save/Load**: Test save game and new game functionality
4. **Error handling**: Test without API keys → verify graceful degradation

**End-to-end validation with Playwright (optional):**
```bash
# Install Playwright (first time only) - may fail due to network limitations
pip install playwright
playwright install

# Start dev server first
npm run dev

# Run verification script (in another terminal)
python verify.py
# Creates verification.png screenshot

# NOTE: If Playwright installation fails, use manual browser testing instead
```

## Common Development Tasks

### Adding New Commands
1. Create command type in `src/types.ts` (Command union)
2. Create executor in `src/commands/newCommand.ts`
3. Register executor in `src/services/commandExecutor.ts`
4. Add tests in `src/commands/__tests__/`

### Modifying AI Flows
- Edit files in `src/services/flows/`
- Test with mock data first, then real API keys
- Update flow types in `src/types.ts` if needed

### UI Changes
- Modify React components in `src/components/` or `src/App.tsx`
- Test with `npm run dev` for hot reloading
- Verify mobile responsiveness

### State Management
- Game state: `src/stores/gameStore.ts`
- UI state: `src/stores/uiStore.ts`
- **IMPORTANT**: Always update by segmentId, not by "last" segment

## Build Pipeline (CI)

**GitHub Actions (`.github/workflows/ci.yml`):**
- **Triggers**: All pushes and PRs to any branch
- **Node.js Version**: 20.x (specified in workflow)
- **Pipeline Steps**: 
  1. Security scan and dependency analysis
  2. Checkout → Setup Node → `npm ci` → `npm run build`
  3. Test execution and coverage reporting
- **Requirements**: Must pass before merging
- **Additional**: Weekly security scans on Sundays

**Quality Gates**: TypeScript compilation + build + tests must all pass

## Deployment

**Vercel/Netlify deployment:**
```bash
# Build static files
npm run build
# Output in dist/ folder

# Configure environment variables in deployment platform:
VITE_GEMINI_API_KEY=your-google-api-key
```

**Security**: Never commit API keys. Use environment variables for all secrets.

## Common Issues & Solutions

**Build failures:**
- Check TypeScript errors with `npx tsc --noEmit`
- Verify all imports are correct
- Check for missing dependencies

**Runtime errors with API keys:**
- App degrades gracefully without keys
- Check browser console for specific API errors
- Verify environment variable names (VITE_ prefix required)

**State synchronization issues:**
- Always use segmentId for updates, not array indices
- Check Zustand store actions in browser DevTools
- Verify command payloads match type definitions

## Expert Development Best Practices

### TypeScript Excellence
- **Zero `any` Types**: Use strict TypeScript with comprehensive type definitions
- **Discriminated Unions**: All commands must use the discriminated union pattern
- **Template Literal Types**: For type-safe string manipulation and validation
- **Branded Types**: For domain-specific type safety (SegmentId, CorrelationId)

### Command System Mastery
```typescript
// CORRECT: Type-safe command creation
const createDisplayTextCommand = (
  segmentId: SegmentId,
  text: string,
  metadata?: CommandMetadata
): DisplayTextCommand => ({
  type: 'DISPLAY_TEXT',
  payload: { segmentId, text },
  metadata: {
    correlationId: generateCorrelationId(),
    timestamp: Date.now(),
    ...metadata
  }
});

// INCORRECT: Unsafe command creation
const badCommand = {
  type: 'DISPLAY_TEXT',
  payload: { text: "Some text" } // Missing segmentId
};
```

### State Management Excellence
```typescript
// CORRECT: Atomic state updates with segmentId
const updateStorySegment = (segmentId: SegmentId, updates: Partial<StorySegment>) => {
  useGameStore.getState().updateSegment(segmentId, updates);
};

// INCORRECT: Direct array manipulation
const badUpdate = () => {
  const { segments } = useGameStore.getState();
  segments[segments.length - 1].text = "New text"; // NEVER DO THIS
};

// CORRECT: Creating new segments
const createNewSegment = (): SegmentId => {
  const segmentId = generateSegmentId();
  useGameStore.getState().addSegment({
    id: segmentId,
    text: '',
    choices: [],
    images: {},
    metadata: { created: Date.now() }
  });
  return segmentId;
};
```

### AI Integration Best Practices
```typescript
// CORRECT: Robust AI service calls with fallbacks
const callAIService = async <T>(
  operation: () => Promise<T>,
  fallback: () => T,
  context: string
): Promise<T> => {
  try {
    const result = await Promise.race([
      operation(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('AI_TIMEOUT')), 30000)
      )
    ]);
    return result;
  } catch (error) {
    console.warn(`AI operation failed in ${context}:`, error);
    return fallback();
  }
};

// CORRECT: Context-aware AI prompts
const generateStoryPrompt = (context: StoryContext): string => {
  const { genre, previousChoices, worldState } = context;
  return [
    `Genre: ${genre.name}`,
    `Tone: ${genre.tone}`,
    `Previous decisions: ${previousChoices.slice(-3).join(', ')}`,
    `World state: ${JSON.stringify(worldState)}`,
    `Generate next story segment with 2-3 meaningful choices.`
  ].join('\n');
};
```

### Error Handling Excellence
```typescript
// CORRECT: Thematic error boundaries
class GameErrorBoundary extends ErrorBoundary {
  getThematicErrorMessage(error: Error): string {
    if (error.name === 'AI_SERVICE_ERROR') {
      return "The cosmic forces refuse to respond... reality flickers uncertainly.";
    }
    if (error.name === 'SEGMENT_NOT_FOUND') {
      return "The narrative thread has snapped... fragments of memory drift away.";
    }
    return "Something stirs in the void... the game struggles against unseen forces.";
  }
}

// CORRECT: Graceful degradation
const withGracefulDegradation = async <T>(
  primaryAction: () => Promise<T>,
  fallbackAction: () => T,
  userMessage: string
): Promise<T> => {
  try {
    return await primaryAction();
  } catch (error) {
    console.error('Primary action failed:', error);
    showUserNotification(userMessage);
    return fallbackAction();
  }
};
```

### Performance Optimization
```typescript
// CORRECT: Efficient image caching with LRU+TTL
class ImageCacheService {
  private cache = new Map<string, CacheEntry>();
  private accessOrder = new Set<string>();
  private readonly MAX_SIZE = 50;
  private readonly TTL = 30 * 60 * 1000;
  
  set(key: string, value: ImageData): void {
    this.evictExpired();
    this.evictLRU();
    
    this.cache.set(key, {
      data: value,
      timestamp: Date.now()
    });
    this.accessOrder.add(key);
  }
  
  get(key: string): ImageData | null {
    const entry = this.cache.get(key);
    if (!entry || this.isExpired(entry)) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      return null;
    }
    
    // Update access order for LRU
    this.accessOrder.delete(key);
    this.accessOrder.add(key);
    
    return entry.data;
  }
}

// CORRECT: Debounced user input handling
const useDebouncedChoice = (delay = 300) => {
  const [debouncedCallback] = useMemo(
    () => debounce((choice: Choice) => {
      executeCommand({
        type: 'MAKE_CHOICE',
        payload: { choice },
        metadata: { timestamp: Date.now() }
      });
    }, delay),
    [delay]
  );
  
  return debouncedCallback;
};
```

### Testing Excellence
```typescript
// CORRECT: Comprehensive command executor tests
describe('DisplayTextExecutor', () => {
  it('should handle empty story history gracefully', async () => {
    const mockStore = createMockGameStore({ segments: [] });
    const command: DisplayTextCommand = {
      type: 'DISPLAY_TEXT',
      payload: { segmentId: 'test-id', text: 'Test text' },
      metadata: { correlationId: 'test-correlation' }
    };
    
    const executor = createDisplayTextExecutor(mockStore);
    
    // Should not throw, should create new segment
    await expect(executor.execute(command)).resolves.not.toThrow();
    
    // Verify new segment created
    expect(mockStore.getState().segments).toHaveLength(1);
    expect(mockStore.getState().segments[0].id).toBe('test-id');
  });
  
  it('should update existing segment when found', async () => {
    const existingSegment: StorySegment = {
      id: 'existing-id',
      text: 'Old text',
      choices: [],
      images: {},
      metadata: {}
    };
    
    const mockStore = createMockGameStore({ 
      segments: [existingSegment] 
    });
    
    const command: DisplayTextCommand = {
      type: 'DISPLAY_TEXT',
      payload: { segmentId: 'existing-id', text: 'New text' },
      metadata: { correlationId: 'test-correlation' }
    };
    
    const executor = createDisplayTextExecutor(mockStore);
    await executor.execute(command);
    
    expect(mockStore.getState().segments[0].text).toBe('New text');
  });
});

// CORRECT: AI service integration tests
describe('GeminiAIService', () => {
  it('should handle API failures gracefully', async () => {
    const mockAI = createMockGeminiClient({
      generateStory: jest.fn().mockRejectedValue(new Error('API_ERROR'))
    });
    
    const service = new GeminiAIService(mockAI);
    const result = await service.generateStory(mockStoryContext);
    
    // Should return fallback, not throw
    expect(result).toMatchObject({
      text: expect.stringContaining('fallback'),
      choices: expect.arrayContaining([expect.any(Object)])
    });
  });
});
```

## GitHub Copilot Coding Agent Guidelines

### When to Deploy Coding Agents

**✅ Use coding agents for**:
- Large, self-contained features (e.g., "Build analytics dashboard")
- Performance optimization tasks with clear metrics
- Comprehensive audits across multiple files
- Refactoring projects with well-defined scope
- Implementation of complex features that take 1+ days

**❌ Don't use coding agents for**:
- Small bug fixes (< 50 lines of code)
- Documentation updates
- Quick configuration changes
- Exploratory work without clear requirements
- Tasks requiring human judgment/design decisions

### Agent Deployment Best Practices

**CRITICAL RULE: Each agent should work in its own separate PR/branch**

```bash
# ✅ CORRECT: Each agent gets its own PR
Agent 1 → New PR: "feat/analytics-dashboard" 
Agent 2 → New PR: "perf/image-cache-optimization"
Agent 3 → New PR: "refactor/ai-prompts-audit"

# ❌ WRONG: Multiple agents in same PR
Agent 1, 2, 3 → Same PR #64 (causes conflicts, unclear ownership)
```

**Why separate PRs?**
1. **Parallel work** - Agents don't block each other
2. **Clear ownership** - Each agent owns its changes
3. **Easy review** - Smaller, focused PRs are easier to review
4. **Rollback safety** - Can revert one feature without affecting others
5. **CI isolation** - Build failures don't block other work

**Exception: Agents can share a PR when**:
- Tasks are strictly sequential (Agent 2 depends on Agent 1's output)
- Tasks are tightly coupled (e.g., "Add feature X" + "Add tests for feature X")
- Total combined scope is still small (< 500 lines of code)

### Agent Performance Expectations

**REALITY CHECK**: Most agents complete tasks in **7-15 minutes**, NOT hours or days.

| Task Complexity | Human Estimate | Agent Reality | Notes |
|----------------|----------------|---------------|-------|
| Small feature | "1-2 days" | **7-15 min** | One coding session |
| Medium feature | "3-5 days" | **15-30 min** | Still just one session |
| Large refactor | "1 week" | **30-60 min** | Multiple commits, same session |
| Comprehensive audit | "2 weeks" | **1-3 hours** | Longest tasks, still same day |

**Actual agent workflow**:
1. **Planning** (1-2 min) - Agent reads context, plans approach
2. **Implementation** (5-12 min) - Agent writes code, commits every 2-3 min
3. **Testing** (1-3 min) - Agent validates changes
4. **Documentation** (1-2 min) - Agent updates docs

**Total**: 7-15 minutes for most tasks, 30-60 min for complex work

**Monitor agent progress**:
- Check PR commits every 1-2 hours
- Agents commit frequently (every 15-30 minutes)
- If no commits for 3+ hours, check agent status
- Intervene if agent appears stuck or off-track

### How to Deploy an Agent

```bash
# Use the github-pull-request_copilot-coding-agent tool

# 1. Create clear, specific task description
# 2. Define success criteria
# 3. Specify files to modify
# 4. Provide context and constraints
# 5. Set realistic expectations

# Example:
{
  "title": "Implement Image Cache with LRU Eviction",
  "body": "Create imageCacheService.ts with memory + IndexedDB tiers...",
  # Agent will create NEW PR automatically
}
```

### Deploying Multiple Agents Simultaneously

**When to deploy multiple agents**:
- ✅ Tasks are **completely independent** (no shared files)
- ✅ Can be reviewed/merged separately
- ✅ Won't cause merge conflicts
- ✅ Each task is self-contained

**How many agents to deploy at once**:
```typescript
// Good: 3-5 agents on independent tasks
Agent 1 → PR "feat/analytics-dashboard"     (src/services/analyticsService.ts)
Agent 2 → PR "perf/image-cache"             (src/services/imageCacheService.ts)
Agent 3 → PR "docs/api-documentation"       (docs/API.md)
Agent 4 → PR "test/unit-test-coverage"      (src/**/__tests__/*.test.ts)
Agent 5 → PR "refactor/error-handling"      (src/utils/errorHandler.ts)

// Bad: 10 agents touching same files
Agent 1-10 → All modifying gameService.ts  ❌ Merge conflict nightmare
```

**Best practices for parallel deployment**:
1. **Analyze file dependencies** - Check which files each task needs
2. **Stagger if overlapping** - Deploy Agent 1, wait 5 min for initial commits, then deploy Agent 2
3. **Monitor all agents** - Check PR commits every 10-15 minutes
4. **Merge in order** - Merge completed PRs as they finish to reduce conflicts
5. **Maximum 5-6 agents** - More than that becomes hard to monitor

**Example workflow**:
```bash
# 9:00 AM - Deploy 4 agents on independent tasks
Agent A → Analytics (services/analytics*)
Agent B → Image optimization (services/image*)
Agent C → Documentation (docs/*)
Agent D → Testing (src/**/__tests__/*)

# 9:15 AM - Check progress (all should have initial commits)
# 9:30 AM - Agents A, C, D complete (review & merge)
# 9:45 AM - Agent B complete (review & merge)

# Total time: 45 minutes for 4 major features
```

**When NOT to deploy multiple agents**:
- ❌ Tasks touch the same core files
- ❌ Tasks have dependencies (B needs A's output)
- ❌ You can't monitor them all
- ❌ Tasks are tightly coupled conceptually

### Agent Task Sizing

**Small task** (1 agent, **7-15 min**):
- Single feature addition
- Isolated bug fix
- Component optimization
- Example: "Add export analytics to JSON"
- Files: 1-3
- Lines changed: <200

**Medium task** (1 agent, **15-30 min**):
- Multi-file feature
- Service refactoring
- Performance optimization
- Example: "Implement image caching system"
- Files: 3-8
- Lines changed: 200-800

**Large task** (1 agent, **30-60 min**):
- Comprehensive audit
- Architecture changes
- Multiple interconnected features
- Example: "Audit all AI services and upgrade prompts"
- Files: 8-20
- Lines changed: 800-2000

**Very large task** (Split into **3-5 agents**, each **15-30 min**):
- Major system overhaul
- Multiple independent features
- Example: "Optimize entire app" → Split into:
  - Agent 1: Image optimization (15 min)
  - Agent 2: React optimization (20 min)
  - Agent 3: Bundle optimization (15 min)
  - Agent 4: API optimization (25 min)
  - Agent 5: Testing suite (30 min)
- Total time: **30 min** (parallel) vs. 105 min (sequential)

## Contributing Guidelines

When contributing to Apophenia, follow these practices:

### Pull Request Guidelines
- **Branch Naming**: Use descriptive names like `feature/ai-enhancement` or `fix/state-sync-issue`
- **Small, Focused Changes**: Keep PRs small and focused on a single concern
- **Test Coverage**: Add tests for new features and bug fixes
- **Type Safety**: Maintain zero `any` types and full TypeScript compliance
- **Documentation**: Update relevant documentation for API changes
- **PR Template**: Fill out the provided `.github/PULL_REQUEST_TEMPLATE.md` completely
- **CHANGELOG**: Update `CHANGELOG.md` in the "Unreleased" section for user-facing changes
- **Agent PRs**: If deploying coding agents, create separate PRs for each agent (see Agent Guidelines above)

### Code Review Checklist
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] Build succeeds (`npm run build`)
- [ ] Commands use discriminated unions correctly
- [ ] State updates use segmentId, not array indices
- [ ] No secrets in source code
- [ ] Error handling includes graceful degradation

### Issue Reporting Guidelines
- **Bug Reports**: Include browser, Node.js version, and reproduction steps
- **Feature Requests**: Explain the use case and expected behavior
- **Architecture Questions**: Reference the command flow: flows → queue → executors → stores → UI

## Project Vision

Apophenia creates AI-driven interactive narratives that adapt to player choices using advanced reasoning capabilities. The architecture prioritizes:

- **Type Safety**: Zero runtime errors through comprehensive TypeScript
- **Modularity**: Clear separation of concerns in the command system
- **AI Integration**: Multi-model fallback system for reliability
- **Performance**: Efficient state management and caching strategies
- **Developer Experience**: Comprehensive testing and documentation