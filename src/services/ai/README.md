# AI Service Architecture

## Overview

This directory contains the AI service layer for the Apophenia game. The architecture is designed with a clear hierarchy to avoid confusion and ensure maintainability.

## Service Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                          │
│    (gameService.ts, AI Engines, director.ts, etc.)             │
└────────────────┬───────────────────────────────┬────────────────┘
                 │                               │
                 │ (Text Generation)             │ (Image Generation)
                 ▼                               ▼
┌────────────────────────────────┐  ┌───────────────────────────┐
│  unifiedAIService.ts           │  │  secureGenkit.ts          │
│  (PUBLIC API - Text)           │  │  (PUBLIC API - Images)    │
│  • generateWithSelectedModel() │  │  • generateImageFlow()    │
│  • generateConceptWith...()    │  │  • processAdvanced...()   │
│  • generateNextStepWith...()   │  │                           │
│                                │  │  Uses backend API to      │
│  Routes to Grok or Gemini     │  │  keep keys secure         │
└──────┬──────────────┬──────────┘  └───────────────────────────┘
       │              │
       │ (Grok)       │ (Gemini)
       ▼              ▼
┌─────────────┐  ┌──────────────┐
│ grokService │  │  genkit.ts   │
│ (INTERNAL)  │  │  (INTERNAL)  │
│             │  │              │
│ X.AI Grok-4 │  │ Gemini Models│
│ 2M context  │  │ Pro/Flash    │
└─────────────┘  └──────────────┘
                       │
                       ▼
              ┌────────────────────┐
              │ backendAPIService  │
              │ (INTERNAL)         │
              │                    │
              │ Backend API calls  │
              └────────────────────┘
```

**Key Split:**
- **Text Generation:** Frontend-based, uses `unifiedAIService.ts` → routes to Grok or Gemini
- **Image Generation:** Backend-based, uses `secureGenkit.ts` → keeps API keys secure on server

## Usage Guidelines

### ✅ DO: Use the Public APIs

**For text generation, use `unifiedAIService.ts`:**

```typescript
// ✅ CORRECT - Use unified service for text
import {
  generateWithSelectedModel,
  generateConceptWithSelectedModel,
  generateNextStepWithSelectedModel,
} from './services/ai/unifiedAIService';

// Generate story content
const commands = await generateNextStepWithSelectedModel(
  playerChoice,
  worldState,
  storyHistory,
  genreConfig
);
```

**For image generation, use `secureGenkit.ts`:**

```typescript
// ✅ CORRECT - Use secure backend for images
import {
  generateImageFlow,
  processAdvancedImageGeneration,
} from './services/ai/secureGenkit';

// Generate atmospheric horror image
const imageUrl = await processAdvancedImageGeneration(prompt);
```

### ❌ DON'T: Import Lower-Level Services

**Don't import genkit.ts or grokService.ts directly:**

```typescript
// ❌ WRONG - Don't import implementation details
import { nextStepFlow } from './services/ai/genkit';
import { xaiClient } from './services/ai/grokService';
```

**Exception:** Test files may import lower-level services for unit testing.

## Service Responsibilities

### unifiedAIService.ts (Public API)

**Purpose:** Single entry point for all AI text generation

**Responsibilities:**
- Route requests to the appropriate AI model (Grok or Gemini)
- Handle model selection based on user preferences
- Provide consistent fallback behavior
- Abstract away implementation details

**Public Functions:**
- `generateWithSelectedModel()` - General-purpose text generation
- `generateConceptWithSelectedModel()` - Story concept generation
- `generateNextStepWithSelectedModel()` - Story progression

### genkit.ts (Internal Implementation)

**Purpose:** Gemini AI model integration

**Responsibilities:**
- Configure and call Google Gemini models (2.5 Pro, 2.5 Flash)
- Handle Gemini-specific response parsing
- Manage Gemini safety settings and generation config
- Image generation with Google Imagen
- Fallback to Unsplash for images

**Internal Functions:**
- `generateConceptFlow()` - Gemini concept generation
- `nextStepFlow()` - Gemini story progression
- `generateImageFlow()` - Image generation orchestration
- `processAdvancedImageGeneration()` - Advanced image generation with horror intensity

**Note:** This service uses the shared `jsonExtractor.ts` utility for parsing responses.

### grokService.ts (Internal Implementation)

**Purpose:** X.AI Grok model integration

**Responsibilities:**
- Configure and call X.AI Grok-4 Fast Reasoning model
- Handle Grok-specific response parsing
- Leverage 2M token context window
- Extended thinking mode support

**Internal API:**
- `xaiClient.generateText()` - Core Grok text generation

**Note:** This service uses the shared `jsonExtractor.ts` utility for parsing responses.

### backendAPIService.ts (Internal Implementation)

**Purpose:** Backend API integration for advanced features

**Responsibilities:**
- Proxy requests to backend `/api/generate-image` endpoint
- Handle backend-side Grok + Imagen fallback chain
- Error handling and retries
- Network error recovery

**Internal API:**
- `backendAPIService.generateImage()` - Image generation via backend

## AI Engines and Revolutionary Features

The following AI engines use `generateWithSelectedModel()` from `unifiedAIService.ts`:

- **AdaptiveHorrorEngine.ts** - Learns player fears, personalizes horror
- **TemporalRevisionEngine.ts** - Retroactively modifies story history
- **QuantumNarrativeEngine.ts** - Manages parallel story threads
- **MetaConsciousnessEngine.ts** - Fourth-wall breaking AI narrator
- **RealityCorruptionEngine.ts** - Visual UI distortion effects

**Correct Usage Pattern:**

```typescript
// Inside an AI engine
import { generateWithSelectedModel } from '../unifiedAIService';

const response = await generateWithSelectedModel(
  systemInstruction,
  prompt,
  worldState,
  storyHistory,
  'story'
);
```

## Shared Utilities

### jsonExtractor.ts

**Purpose:** Centralized JSON parsing for AI responses

**Functions:**
- `extractJSONFromText()` - Extract JSON from text with markdown/artifacts
- `extractAndParseJSON()` - Extract and parse in one operation
- `extractJSONArray()` - Specifically for array responses (game commands)
- `extractJSONObject()` - Specifically for object responses (concepts)

**Usage:**

```typescript
import { extractJSONArray, extractJSONObject } from '../../utils/jsonExtractor';

// For command arrays
const commands = extractJSONArray(aiResponse, true); // true = clean markdown

// For concept objects
const concept = extractJSONObject(aiResponse, true);
```

## Model Selection

Model selection is managed by `aiModelStore.ts`:

```typescript
import { useAIModelStore } from '../../stores/aiModelStore';

// Get current model
const selectedModel = useAIModelStore.getState().getSelectedModel();

// Models available:
// - Gemini 2.5 Pro (8M context)
// - Gemini 2.5 Flash (2M context, faster)
// - Grok-4 Fast Reasoning (2M context, thinking mode)
```

The unified service automatically routes to the selected model.

## Error Handling and Fallbacks

The service hierarchy implements multi-level fallbacks:

1. **Primary Model** - Selected model (Grok or Gemini Pro)
2. **Secondary Model** - Gemini Flash (if primary fails)
3. **Thematic Fallback** - Hardcoded narrative options (if all AI fails)

This ensures the game never completely breaks due to AI failures.

## Configuration

AI model configurations are centralized in `services/config.ts`:

```typescript
export const AI_MODELS = {
  STORY_PROGRESSION: { model: 'gemini-2.5-pro', temperature: 1.15, ... },
  CONCEPT_GENERATION: { model: 'gemini-2.5-pro', temperature: 1.3, ... },
  SUMMARIZATION: { model: 'gemini-2.5-flash', temperature: 0.7, ... },
  FALLBACK_TEXT: 'gemini-2.5-flash',
  FALLBACK_IMAGE: 'imagen-3.0-generate-001',
  SECONDARY_FALLBACK_IMAGE: 'imagen-3.0-fast-generate-001',
};
```

## Migration Guide

If you find code importing lower-level services, update it:

```typescript
// BEFORE (incorrect)
import { nextStepFlow } from '../ai/genkit';

const commands = await nextStepFlow({
  playerChoice,
  worldState,
  history,
  genreConfig,
});

// AFTER (correct)
import { generateNextStepWithSelectedModel } from '../ai/unifiedAIService';

const commands = await generateNextStepWithSelectedModel(
  playerChoice,
  worldState,
  history,
  genreConfig
);
```

## Testing

- **Unit Tests:** May import lower-level services directly to test specific implementations
- **Integration Tests:** Should use `unifiedAIService.ts` to test the full stack
- **Test Files Location:** `src/services/ai/__tests__/`

## Future Improvements

Potential areas for enhancement:

1. **Response Caching** - Cache AI responses for common patterns
2. **Streaming Support** - Implement streaming for real-time text generation
3. **Rate Limiting** - Add rate limiting to prevent API quota exhaustion
4. **Prompt Templates** - Centralize prompt engineering patterns
5. **A/B Testing** - Framework for comparing model outputs
6. **Telemetry** - Track model performance, response times, error rates

## Related Documentation

- **Game Service:** `src/services/gameService.ts` - Main game orchestration
- **AI Engines:** `src/services/ai/engines/` - Revolutionary feature implementations
- **Types:** `src/types.ts` - Game command types and schemas
- **Configuration:** `src/services/config.ts` - AI model configurations

---

**Last Updated:** 2025-11-06
**Architecture Version:** 2.0 (Post-Refactor)
