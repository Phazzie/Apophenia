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
# VITE_GEMINI_API_KEY=your-google-api-key-here  
# VITE_IMAGE_API_KEY=your-image-api-key-here

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

1. **Story Generation**: `src/services/ai/genkit.ts`
   - Uses Google Gemini for narrative content
   - Handles concept generation, story progression, choices
   - Implements safety settings and content filtering

2. **Flow Orchestration**: `src/services/flows/`
   - `conceptFlow.ts` - Initial story concept generation
   - `nextStepFlow.ts` - Story progression logic
   - `summaryFlow.ts` - Context summarization for AI
   - `generateImageFlow.ts` - Visual content generation

3. **Command Execution**: `src/services/commandExecutor.ts`
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
src/services/ai/genkit.ts          # Gemini integration
src/services/flows/nextStepFlow.ts # Core game progression
src/services/flows/conceptFlow.ts  # Story initialization
src/types.ts                       # Type definitions for AI responses
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

### System-wide Refactoring
AI agents can safely perform large-scale changes by:
1. Understanding the command system architecture
2. Maintaining type safety across changes
3. Preserving the flow → command → executor pattern
4. Testing changes incrementally

### Creative Problem Solving
AI agents excel at:
- Proposing architectural improvements
- Optimizing AI service integration
- Designing new game mechanics
- Solving complex async coordination issues

### Error Analysis and Resolution
AI agents can:
- Trace errors through the command system
- Identify state synchronization issues
- Debug AI service integration problems
- Propose systematic solutions

Remember: **AI agents have broader reasoning capabilities than Copilot**. Use this to understand system behavior, propose architectural improvements, and solve complex integration challenges.