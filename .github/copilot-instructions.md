# Apophenia - AI-Driven Interactive Narrative Game

**ALWAYS follow these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

Apophenia is a React + TypeScript + Zustand web application that creates AI-driven interactive narrative experiences. The architecture follows a clear separation: flows → command queue → executors → stores → UI.

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
VITE_GROK_API_KEY=your-grok-api-key-here
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
- Runs on all pushes and PRs
- Node.js 20.x
- Steps: checkout → setup Node → npm ci → npm run build
- **Must pass** before merging

**No linting configured** - only TypeScript compilation and build validation.

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