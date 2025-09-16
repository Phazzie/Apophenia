# Gemini AI Integration Guide for Apophenia

**ALWAYS follow these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

This guide is specifically for Google Gemini AI model integration and usage within the Apophenia narrative game. Unlike general development instructions, this focuses on AI service configuration, prompt engineering, and content generation workflows.

## Gemini-Specific Context

Apophenia uses Google Gemini as its primary AI storytelling engine. The integration handles:
- **Story concept generation** - Initial game setup and world building
- **Narrative progression** - Dynamic story continuation based on player choices  
- **Choice generation** - Creating meaningful decision points including psychological elements
- **Content safety** - Filtering and moderation for appropriate horror content

### Key Difference from Other AI Instructions
- **Service Integration Focus**: Unlike development guides, this covers AI service configuration and usage
- **Content Generation**: Specific to narrative AI and creative content workflows
- **Safety & Moderation**: Horror game content requires careful safety configuration
- **Performance Optimization**: AI service calls are expensive and need optimization

## Gemini Configuration & Setup

**Environment Configuration:**
```bash
# Required for Gemini integration
cp .env.example .env.local

# Configure Gemini API access
VITE_GEMINI_API_KEY=your-google-api-key-here
# Get your key from: https://makersuite.google.com/app/apikey
```

**Gemini Service Configuration** (`src/services/ai/genkit.ts`):
```typescript
const generationConfig = {
  temperature: 1,        // High creativity for narrative
  topK: 0,              // Full vocabulary access
  topP: 0.95,           // High diversity
  maxOutputTokens: 8192, // Long responses for rich narrative
};
```

**Safety Settings for Horror Content:**
```typescript
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  // Allows psychological horror while blocking harmful content
];
```

## Gemini Integration Points

### 1. Story Concept Generation (`conceptFlow.ts`)
**Purpose**: Generate initial story premise and world setup
```typescript
// Prompt structure for concept generation
const conceptPrompt = `Generate a psychological horror story concept with:
- Setting and atmosphere
- Main character background
- Initial situation
- Mood and themes
Genre: ${genreConfig.type}
Tone: ${genreConfig.mood}`;
```

**Expected Response**: JSON with story concept, setting, character info, and initial choices.

### 2. Story Progression (`nextStepFlow.ts`)  
**Purpose**: Continue narrative based on player choice
```typescript
// Context-aware progression
const progressionPrompt = `Continue the story based on:
Previous context: ${summarizedHistory}
Player choice: "${choice.text}"
Current psychological state: ${worldState.psychological}
Generate: next story segment + new choices + world updates`;
```

**Expected Response**: Command array with displayText, generateImage, displayChoices, updateWorldState.

### 3. Content Summarization (`summaryFlow.ts`)
**Purpose**: Compress story history for context windows
```typescript
// Summarize for context efficiency  
const summaryPrompt = `Summarize this story history for continued generation:
${storyHistory}
Preserve: key events, character development, psychological themes, mood`;
```

**Expected Response**: Condensed narrative maintaining essential context.

## Prompt Engineering Best Practices

### Narrative Prompts
- **Context First**: Always provide story history and current state
- **Specific Instructions**: Be explicit about tone, genre, and content requirements
- **Output Format**: Specify exact JSON structure expected
- **Safety Boundaries**: Include content guidelines for psychological horror

### Example Effective Prompt:
```typescript
const prompt = `You are writing a psychological horror story.

CONTEXT:
- Setting: ${setting}
- Character: ${character}
- Previous events: ${history}
- Current mood: ${mood}

REQUIREMENTS:
- Generate exactly 3 choices
- Include one "intrusive thought" choice (disturbing but not harmful)
- Maintain psychological tension
- Each choice leads to different psychological states

OUTPUT FORMAT:
{
  "narrative": "story text here",
  "choices": [
    {"text": "choice 1", "psychological_impact": "description"},
    {"text": "choice 2", "psychological_impact": "description"},
    {"text": "choice 3 (intrusive)", "psychological_impact": "description"}
  ],
  "mood_shift": "description of atmospheric change"
}`;
```

### Content Guidelines for Gemini
- **Psychological Horror**: Focus on mental tension, not graphic violence
- **Intrusive Thoughts**: Disturbing choices that reveal character psychology
- **Atmospheric**: Emphasize mood and setting over explicit content
- **Character-Driven**: Story progression through psychological development

## Error Handling & Fallbacks

### Gemini Service Failures
```typescript
// Graceful degradation when Gemini is unavailable
try {
  const response = await model.generateContent(prompt);
  return parseResponse(response);
} catch (error) {
  console.error('Gemini API failed:', error);
  return fallbackContent; // Pre-written story segments
}
```

### Content Filtering
```typescript
// Handle blocked content
if (response.candidates[0].finishReason === 'SAFETY') {
  console.warn('Content blocked by safety filters');
  return generateAlternativeContent();
}
```

### Rate Limiting
```typescript
// Handle API rate limits
if (error.status === 429) {
  console.warn('Rate limited, using cached content');
  return getCachedResponse(promptHash);
}
```

## Testing Gemini Integration

### API Key Validation
```bash
# Test with real API key
npm run dev
# Check browser console for successful AI calls

# Test without API key (graceful degradation)
rm .env.local && npm run dev
# Verify mock content and error handling
```

### Content Quality Testing
1. **Start New Game**: Verify concept generation works
2. **Make Choices**: Test story progression maintains coherence
3. **Check Intrusive Thoughts**: Ensure psychological elements appear
4. **Verify Safety**: Confirm content stays within horror boundaries

### Performance Testing
```bash
# Monitor API response times in browser DevTools
# Network tab → Filter by API calls
# Look for Gemini API responses and timing
```

## Gemini Optimization Strategies

### Context Window Management
- **Summarization**: Use `summaryFlow.ts` to compress long histories
- **Selective Context**: Only send relevant story elements
- **Token Monitoring**: Track context length to avoid limits

### Response Caching
```typescript
// Cache responses for similar prompts
const cacheKey = generatePromptHash(prompt);
if (responseCache.has(cacheKey)) {
  return responseCache.get(cacheKey);
}
```

### Request Batching
- **Combine Requests**: Generate story + choices in single call
- **Parallel Generation**: Image and text generation can run simultaneously
- **Smart Queuing**: Queue non-urgent requests (background world building)

## Content Creation Workflows

### New Story Arc Development
1. **Concept Phase**: Use conceptFlow with specific genre configuration
2. **Expansion Phase**: Generate multiple story branches with nextStepFlow
3. **Refinement**: Test player choice combinations for narrative coherence
4. **Safety Review**: Verify content meets psychological horror guidelines

### Character Development
- **Psychological Profiling**: Track player choices to build character psychology
- **Dynamic Adaptation**: Adjust story tone based on player behavior patterns
- **Intrusive Thought Integration**: Weave disturbing choices naturally into narrative

### Atmospheric Enhancement
- **Mood Progression**: Gradually build psychological tension
- **Environmental Storytelling**: Use setting details to enhance horror
- **Sensory Details**: Incorporate sounds, textures, and visual elements

## Debugging Gemini Issues

### Common Problems
1. **Content Blocked**: Adjust safety settings or rephrase prompts
2. **Incoherent Responses**: Improve context summarization
3. **Format Errors**: Strengthen output format specifications
4. **Rate Limits**: Implement caching and request throttling

### Diagnostic Tools
```bash
# Check Gemini API status
curl -H "Authorization: Bearer $API_KEY" \
     "https://generativelanguage.googleapis.com/v1/models"

# Monitor API calls in browser
# DevTools → Network → Filter: generativelanguage.googleapis.com
```

## Advanced Gemini Features

### Fine-tuning for Horror
- **Custom Safety Thresholds**: Balance safety with horror atmosphere
- **Genre-Specific Prompts**: Tailor prompts for psychological vs supernatural horror
- **Cultural Sensitivity**: Ensure horror elements respect cultural boundaries

### Multi-turn Conversations
- **Context Continuity**: Maintain story thread across multiple API calls
- **Character Consistency**: Keep character voice and development coherent
- **Plot Thread Tracking**: Monitor and resolve story arcs appropriately

Remember: **Gemini is the creative engine of Apophenia**. Quality prompt engineering and proper integration are crucial for engaging psychological horror experiences.