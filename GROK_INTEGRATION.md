# Grok-4 Integration Guide

This guide explains how to use the X.AI Grok-4 Fast Reasoning model integration in Apophenia.

## Setup

### 1. Get X.AI API Key

1. Sign up at [console.x.ai](https://console.x.ai)
2. Create an API key from your account dashboard
3. Copy the API key for the next step

### 2. Configure Environment Variables

Add your X.AI API key to your environment file:

```bash
# .env.local (for development)
VITE_XAI_API_KEY=your-xai-api-key-here
```

### 3. Using Grok-4 in the Game

1. Start the application with `npm run dev`
2. On the start screen, you'll see an "AI Model" selector
3. Choose "X.AI Grok-4 Fast Reasoning" from the dropdown
4. Click "New Game" to start a new game using Grok-4

## Features

### Grok-4 Fast Reasoning Capabilities

- **2M Token Context Window**: Twice the context of Gemini 2.5 Pro
- **Advanced Reasoning**: Thinking mode for complex decision making
- **Fast Generation**: Optimized for quick response times
- **Cosmic Horror Optimization**: Specially tuned prompts for horror narratives

### Model Comparison

| Feature | Gemini 2.5 Pro | Grok-4 Fast Reasoning |
|---------|----------------|----------------------|
| Context Window | 1M tokens | 2M tokens |
| Thinking Mode | ✓ | ✓ |
| Response Speed | Fast | Very Fast |
| Creative Writing | Excellent | Excellent |
| Horror Specialization | Good | Optimized |

## Fallbacks

The system provides graceful fallbacks:

1. **Grok-4 Selected**: Uses X.AI API directly
2. **API Failure**: Falls back to secure backend (Gemini)  
3. **Complete Failure**: Uses hardcoded fallback content

## Technical Details

### Architecture

- `src/services/ai/grokService.ts` - Direct X.AI API integration
- `src/services/ai/unifiedAIService.ts` - Model selection and management
- `src/components/AIModelSelector.tsx` - UI for model selection
- `src/stores/aiModelStore.ts` - Model selection state management

### API Integration

The service makes requests to `https://api.x.ai/v1/chat/completions` with:

```json
{
  "model": "grok-4-fast-reasoning",
  "messages": [...],
  "temperature": 1.0,
  "max_tokens": 8192,
  "thinking": true
}
```

### Error Handling

- Network failures gracefully degrade to backend API
- Invalid API keys show user-friendly warnings
- Malformed responses trigger automatic fallbacks
- All errors are logged for debugging

## Development

### Testing

```bash
# Run Grok service tests
npm test -- --testPathPatterns="grokService"

# Run all tests
npm test
```

### Building

```bash
# Type checking
npx tsc --noEmit

# Build for production
npm run build
```

## Security

- API keys are handled securely through environment variables
- No API keys are exposed in the browser console
- Fallback mechanisms prevent service interruption
- Error messages don't leak sensitive information