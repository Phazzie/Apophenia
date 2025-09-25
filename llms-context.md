# Apophenia - LLM Context Documentation

This document provides comprehensive context for Large Language Models working with the Apophenia codebase.

## Project Overview

**Apophenia** is a sophisticated AI-driven interactive narrative game built with modern web technologies. It creates psychological horror experiences that adapt to player choices using advanced AI reasoning capabilities.

### Core Technologies
- **Frontend**: React 18.x with TypeScript 5.x
- **State Management**: Zustand (atomic, immutable state updates)
- **Build System**: Vite with hot module replacement
- **Testing**: Jest with 50+ comprehensive unit tests
- **AI Integration**: X.AI Grok-4 Fast Reasoning (primary), Google Gemini (fallback)
- **Deployment**: Static build for Vercel/Netlify with environment configuration

### Architecture Pattern
```
User Input → Flows → Command Queue → Executors → Store Updates → UI Rendering
```

The application follows a strict command-driven architecture where every game action is represented as a type-safe command with discriminated unions.

## Directory Structure

```
src/
├── components/          # React UI components
│   ├── StartScreen.tsx    # Game initialization and AI model selection
│   ├── GameInterface.tsx  # Main gameplay interface
│   └── ...
├── stores/             # Zustand state management
│   ├── gameStore.ts       # Core game state (segments, choices, world state)
│   ├── uiStore.ts         # Interface state and theming
│   ├── aiModelStore.ts    # AI model selection and testing
│   └── ...
├── services/           # Business logic and orchestration
│   ├── ai/                # AI service integrations
│   │   ├── grokService.ts       # X.AI Grok-4 Fast Reasoning (2M context)
│   │   ├── unifiedAIService.ts  # Multi-model routing and fallback
│   │   ├── genkit.ts           # Google Gemini integration
│   │   └── revolutionaryFeatures.ts # Advanced AI features
│   ├── flows/             # Game flow orchestration
│   │   ├── conceptFlow.ts    # Initial story generation
│   │   ├── nextStepFlow.ts   # Story progression logic
│   │   ├── summaryFlow.ts    # Context summarization
│   │   └── generateImageFlow.ts # Visual content generation
│   ├── gameService.ts     # Central game controller
│   ├── commandExecutor.ts # Type-safe command execution
│   └── config.ts          # Environment and configuration
├── commands/           # Command executors (business logic)
│   ├── displayText.ts     # Narrative text presentation
│   ├── displayChoices.ts  # Choice generation and validation
│   ├── generateImage.ts   # Asynchronous image generation
│   ├── createSegment.ts   # Story segment creation
│   └── __tests__/         # Command executor tests
├── types.ts           # Centralized TypeScript definitions
└── App.tsx            # Main application entry point
```

## Key Architectural Concepts

### 1. Command System
Every game action is represented as a command with discriminated unions:

```typescript
type Command = 
  | CreateSegmentCommand 
  | DisplayTextCommand 
  | GenerateImageCommand 
  | DisplayChoicesCommand
  | UpdateWorldStateCommand;

interface BaseCommand {
  type: string;
  payload: unknown;
  metadata: {
    correlationId: string;
    timestamp: number;
    blocking?: boolean;
  };
}
```

**Critical Rule**: Always use the discriminated union pattern. Never create commands without proper type safety.

### 2. State Management with Zustand
State is managed through atomic, immutable updates:

```typescript
// CORRECT: Update by segmentId
const updateStorySegment = (segmentId: string, updates: Partial<StorySegment>) => {
  useGameStore.getState().updateSegment(segmentId, updates);
};

// INCORRECT: Never mutate directly or use array indices
// segments[segments.length - 1] = newData; // WRONG
```

**Critical Rule**: Always update by `segmentId`, never by array index or "last" segment reference.

### 3. AI Service Integration
The system uses a sophisticated multi-model AI architecture:

- **Primary**: X.AI Grok-4 Fast Reasoning with 2M token context
- **Fallback**: Google Gemini 2.5 Pro for complex reasoning
- **Emergency**: Google Gemini 2.5 Flash for basic responses

All AI calls include error boundaries, fallback mechanisms, and graceful degradation.

## Environment Configuration

### Required Environment Variables
```bash
# Primary AI service
VITE_XAI_API_KEY=your-xai-api-key-here

# Fallback AI services
VITE_GEMINI_API_KEY=your-google-gemini-api-key

# Optional: Additional AI services (future)
# VITE_OPENAI_API_KEY=your-openai-key
```

### Graceful Degradation
The application works without API keys by:
- Using mock data for development
- Providing thematic error messages
- Maintaining gameplay flow with fallback content

## Development Workflows

### Quick Start
```bash
# Install dependencies (30s-1min)
npm install

# Type check and build verification
npx tsc --noEmit && npm run build

# Run comprehensive test suite
npm test

# Start development server
npm run dev
# Available at http://localhost:5173
```

### Adding New Features
1. **Define Command Type**: Add to discriminated union in `src/types.ts`
2. **Create Executor**: Implement in `src/commands/newFeature.ts`
3. **Register Executor**: Add to `src/services/commandExecutor.ts`
4. **Add Tests**: Create tests in `src/commands/__tests__/`
5. **Update Flows**: Integrate in appropriate flow file

### AI Service Development
```bash
# Key files for AI modifications:
src/services/ai/grokService.ts          # Primary AI service
src/services/ai/unifiedAIService.ts     # Service routing
src/services/flows/nextStepFlow.ts      # Story progression
src/types.ts                            # AI response types
```

## Advanced AI Features

### X.AI Grok-4 Integration
- **2M Token Context**: Maintains perfect narrative consistency
- **Thinking Mode**: Internal reasoning before generating responses
- **Advanced Reasoning**: Deep analysis of player psychology and choices
- **Reality Distortion Engine**: Gradual horror escalation through subtle inconsistencies

### Revolutionary Features (`src/services/ai/revolutionaryFeatures.ts`)
- **Neural Echo Chambers**: Cross-session pattern recognition
- **Adaptive Narrative DNA**: Dynamic story evolution
- **Quantum Narrative Shifts**: Reality alterations for psychological tension
- **Meta-Consciousness Events**: Fourth-wall breaking moments
- **Fifth Wall Breaking**: Browser manipulation effects

## Testing Strategy

### Test Coverage
- **50+ Unit Tests** across 5 test suites
- **Command Executors**: Business logic validation
- **State Management**: Store operations and immutability
- **AI Integration**: Error handling and fallback mechanisms
- **Mock Data**: Predictable testing without API dependencies

### Validation Workflow
```bash
# Full validation pipeline
npx tsc --noEmit     # TypeScript compilation
npm run build        # Production build verification  
npm test             # Test suite execution
```

## Code Quality Standards

### TypeScript Excellence
- **Zero `any` Types**: Strict TypeScript with comprehensive definitions
- **Discriminated Unions**: All commands use the discriminated union pattern
- **Branded Types**: Domain-specific type safety (SegmentId, CorrelationId)
- **Template Literal Types**: Type-safe string manipulation

### Error Handling
- **Thematic Error Messages**: Horror-themed error responses
- **Graceful Degradation**: Application continues functioning during failures
- **AI Service Fallbacks**: Multiple provider redundancy
- **Error Boundaries**: Component-level error recovery

### Performance Considerations
- **Image Caching**: LRU+TTL caching for generated images
- **Debounced Input**: User interaction optimization
- **Async Command Execution**: Non-blocking operations
- **Memory Management**: Efficient state updates and cleanup

## Security Guidelines

### API Key Management
- **Never commit secrets**: All API keys in environment variables
- **Environment prefixing**: Use `VITE_` prefix for client-side variables
- **Fallback mechanisms**: Graceful operation without keys
- **Proxy recommendations**: Suggest serverless proxy for production

### Content Safety
- **AI Safety Settings**: Configured for appropriate content generation
- **Content Filtering**: Multiple layers of content validation
- **User Privacy**: No personal data stored or transmitted
- **CORS Configuration**: Secure cross-origin resource sharing

## Deployment Information

### Build Pipeline
- **CI/CD**: GitHub Actions with Node.js 20.x
- **Quality Gates**: TypeScript + Build + Tests must pass
- **Security Scans**: Weekly automated security analysis
- **Environment Configuration**: Platform-specific variable management

### Hosting Platforms
- **Vercel** (recommended): Zero-config deployment
- **Netlify**: Alternative static hosting
- **DigitalOcean**: Full deployment guide available
- **Docker**: Containerization support available

## Common Patterns and Anti-Patterns

### ✅ Correct Patterns
```typescript
// Type-safe command creation
const createCommand = (segmentId: SegmentId, data: CommandData): TypedCommand => ({
  type: 'COMMAND_TYPE',
  payload: { segmentId, ...data },
  metadata: {
    correlationId: generateCorrelationId(),
    timestamp: Date.now()
  }
});

// Atomic state updates
const safeUpdate = (segmentId: string, updates: Partial<StorySegment>) => {
  useGameStore.getState().updateSegment(segmentId, updates);
};

// AI error recovery
const withErrorRecovery = async <T>(
  operation: () => Promise<T>,
  fallback: () => T
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error('Operation failed:', error);
    return fallback();
  }
};
```

### ❌ Anti-Patterns
```typescript
// NEVER: Direct mutations
segments[segments.length - 1].text = "new text";

// NEVER: Unsafe command creation
const badCommand = {
  type: 'COMMAND',
  payload: { text: "data" } // Missing segmentId
};

// NEVER: Hardcoded secrets
const API_KEY = "sk-1234567890"; // Use environment variables

// NEVER: Array index updates
const updateLastSegment = (text: string) => {
  const segments = gameStore.segments;
  segments[segments.length - 1] = { ...segments[segments.length - 1], text };
};
```

## Troubleshooting Common Issues

### Build Failures
1. **TypeScript Errors**: Run `npx tsc --noEmit` for detailed error information
2. **Missing Dependencies**: Ensure `npm install` completed successfully
3. **Import Errors**: Verify all file paths and export/import statements

### Runtime Issues
1. **API Key Errors**: Check environment variable configuration and prefixing
2. **State Sync Issues**: Verify segmentId usage in all state updates
3. **AI Service Failures**: Review fallback mechanisms and error handling

### Performance Issues
1. **Slow AI Responses**: Implement caching and request deduplication
2. **Memory Leaks**: Check for proper cleanup in useEffect hooks
3. **Build Size**: Analyze bundle with `npm run build` and optimize imports

## Contributing Guidelines

### Pull Request Process
1. **Branch Naming**: Use descriptive names (`feature/ai-enhancement`)
2. **Small Changes**: Keep PRs focused on single concerns
3. **Test Coverage**: Add tests for new features and fixes
4. **Documentation**: Update relevant docs for API changes
5. **Type Safety**: Maintain zero `any` types policy

### Code Review Checklist
- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] Commands use discriminated unions
- [ ] State updates use segmentId
- [ ] No secrets in source code
- [ ] Error handling includes graceful degradation

---

This document provides comprehensive context for LLMs working with the Apophenia codebase. For specific technical guidance, refer to `.github/copilot-instructions.md` (GitHub Copilot) or `.github/agents.md` (AI agents).