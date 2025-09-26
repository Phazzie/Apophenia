/**
 * Unified AI Service with Model Selection
 * 
 * Routes AI requests to the appropriate service (Grok or Gemini) based on user selection
 */

import { useAIModelStore } from '../../stores/aiModelStore';
import { xaiClient } from './grokService';
import { generateConceptFlow, nextStepFlow } from './genkit';
import { GameCommand, GenreConfig, WorldState, StorySegment } from '../../types';
import { AI_MODELS } from '../config';

/**
 * Unified text generation that routes to the selected AI model
 */
export async function generateWithSelectedModel(
  systemInstruction: string,
  prompt: string,
  useCase: 'concept' | 'story' | 'summary' = 'story'
): Promise<GameCommand[]> {
  const selectedModel = useAIModelStore.getState().getSelectedModel();
  
  if (!selectedModel) {
    console.warn('No AI model selected, falling back to Gemini');
    return generateWithGemini(systemInstruction, prompt, useCase);
  }

  try {
    if (selectedModel.id === 'grok-4-fast-reasoning') {
      console.log('Using X.AI/Grok-4 for text generation');
      return await generateWithGrok(systemInstruction, prompt, useCase);
    } else {
      console.log('Using Gemini for text generation');
      return await generateWithGemini(systemInstruction, prompt, useCase);
    }
  } catch (error) {
    console.error(`${selectedModel.name} failed, falling back to Gemini:`, error);
    return await generateWithGemini(systemInstruction, prompt, useCase);
  }
}

/**
 * Generate with X.AI Grok-4 Fast Reasoning
 */
async function generateWithGrok(
  systemInstruction: string,
  prompt: string,
  useCase: 'concept' | 'story' | 'summary'
): Promise<GameCommand[]> {
  const config = getConfigForUseCase(useCase);
  
  console.log('Generating with X.AI Grok-4:', { useCase, config });
  const result = await xaiClient.generateText(systemInstruction, prompt, {
    temperature: config.temperature,
    maxTokens: config.maxOutputTokens,
    topP: config.topP,
    enableThinking: config.enableThinking,
  });

  // Parse the response to extract game commands
  const content = result.content;
  
  // Extract JSON from response (handling thinking mode output)
  const jsonStart = content.indexOf('[');
  const jsonEnd = content.lastIndexOf(']') + 1;
  
  if (jsonStart === -1 || jsonEnd === 0) {
    console.error('No valid JSON found in X.AI response:', content);
    throw new Error('No valid JSON found in X.AI response');
  }
  
  const jsonText = content.substring(jsonStart, jsonEnd);
  const commands = JSON.parse(jsonText);
  
  // Validate commands structure
  if (!Array.isArray(commands)) {
    console.error('Invalid command format from X.AI:', commands);
    throw new Error('Invalid command format from X.AI');
  }
  
  console.log('X.AI generated', commands.length, 'commands');
  return commands;
}

/**
 * Generate with Gemini (fallback)
 */
async function generateWithGemini(
  systemInstruction: string,
  prompt: string,
  useCase: 'concept' | 'story' | 'summary'
): Promise<GameCommand[]> {
  // For story generation, we need to use nextStepFlow which has a different interface
  // For now, we'll create a mock structure to satisfy the interface
  // This should be properly refactored in a future iteration
  const mockWorldState = {
    protagonist: '',
    setting: '',
    dilemma: '',
    summary: '',
    psychologicalStatus: 'Stable' as const,
    systemHealth: 100,
    uiDistortion: { transform: '', filter: '', transition: '' },
    genreConfig: {
      id: 'cosmic-horror',
      name: 'Cosmic Horror',
      description: '',
      style: '',
      theme: {
        '--background-color': '#0d1117',
        '--text-color': '#c9d1d9',
        '--accent-color': '#58a6ff',
        '--font-family': 'Courier New',
      },
      startScreenImagePrompt: '',
      conceptPrompt: '',
      aiSystemInstruction: systemInstruction,
    }
  };
  
  return await nextStepFlow({
    playerChoice: prompt,
    worldState: mockWorldState,
    history: [],
    genreConfig: mockWorldState.genreConfig
  });
}

/**
 * Get configuration for use case
 */
function getConfigForUseCase(useCase: 'concept' | 'story' | 'summary') {
  switch (useCase) {
    case 'concept':
      return AI_MODELS.CONCEPT_GENERATION;
    case 'summary':
      return AI_MODELS.SUMMARIZATION;
    case 'story':
    default:
      return AI_MODELS.STORY_PROGRESSION;
  }
}

/**
 * Enhanced concept generation with selected model
 */
export async function generateConceptWithSelectedModel(
  genreConfig: GenreConfig
): Promise<{ protagonist: string; setting: string; dilemma: string }> {
  const selectedModel = useAIModelStore.getState().getSelectedModel();
  
  if (selectedModel?.id === 'grok-4-fast-reasoning') {
    console.log('Generating concept with X.AI/Grok-4');
    return await generateConceptWithGrok(genreConfig);
  } else {
    console.log('Generating concept with Gemini');
    return await generateConceptFlow(genreConfig);
  }
}

/**
 * Concept generation with X.AI Grok-4
 */
async function generateConceptWithGrok(
  genreConfig: GenreConfig
): Promise<{ protagonist: string; setting: string; dilemma: string }> {
  const enhancedSystemInstruction = `${genreConfig.aiSystemInstruction}

ENHANCED REASONING DIRECTIVE: You are now powered by X.AI Grok-4 Fast Reasoning with 2 million token context.
Use your advanced reasoning capabilities to create a deeply layered psychological horror concept.

Analyze the genre requirements and craft a concept that:
1. Establishes immediate psychological tension
2. Introduces reality distortion elements
3. Creates a protagonist with complex motivations
4. Sets up a dilemma that questions the nature of consciousness and reality
5. Incorporates cosmic horror elements that build dread

Your 2M token context window will enable you to maintain perfect consistency across the entire narrative.`;

  const enhancedPrompt = `${genreConfig.conceptPrompt}

ENHANCED CONTEXT UTILIZATION: With your 2 million token context window, prepare to:
- Remember every detail of the story you're about to create
- Track all character development and psychological states
- Maintain thematic consistency across the entire experience
- Build layered foreshadowing that pays off later
- Create interconnected story elements that reward careful players

Generate a concept that will serve as the foundation for an epic psychological horror experience.

Return ONLY a JSON object with keys "protagonist", "setting", and "dilemma".

Example format:
{
  "protagonist": "A quantum researcher who discovers their consciousness exists simultaneously across multiple realities",
  "setting": "A research facility where the boundaries between dimensions are weakening", 
  "dilemma": "Each choice splits reality further, creating infinite versions of suffering"
}`;

  try {
    console.log('Generating concept with X.AI/Grok-4...');
    const result = await xaiClient.generateText(enhancedSystemInstruction, enhancedPrompt, {
      temperature: AI_MODELS.CONCEPT_GENERATION.temperature,
      maxTokens: 4096,
      topP: AI_MODELS.CONCEPT_GENERATION.topP,
      enableThinking: true,
    });
    
    const content = result.content;
    const json = JSON.parse(content.replace(/```json|```/g, '').trim());
    
    console.log('X.AI concept generation successful:', json);
    return {
      protagonist: json.protagonist || 'A confused individual facing existential dread',
      setting: json.setting || 'A reality where nothing can be trusted',
      dilemma: json.dilemma || 'Every choice leads to deeper horror',
    };
  } catch (error) {
    console.warn('X.AI concept generation failed, falling back to Gemini:', error);
    return await generateConceptFlow(genreConfig);
  }
}

/**
 * Next step generation with selected model
 */
export async function generateNextStepWithSelectedModel(
  playerChoice: string,
  worldState: WorldState,
  storyHistory: StorySegment[],
  genreConfig: GenreConfig
): Promise<GameCommand[]> {
  const selectedModel = useAIModelStore.getState().getSelectedModel();
  
  if (selectedModel?.id === 'grok-4-fast-reasoning') {
    console.log('Generating next step with X.AI/Grok-4');
    return await generateNextStepWithGrok(playerChoice, worldState, storyHistory, genreConfig);
  } else {
    console.log('Generating next step with Gemini');
    return await nextStepFlow({
      playerChoice,
      worldState,
      history: storyHistory,
      genreConfig
    });
  }
}

/**
 * Next step generation with X.AI Grok-4
 */
/**
 * Generates the next step of the story using the Grok-4 model.
 * This function tailors the AI's prompts to include the current horror intensity,
 * ensuring the narrative scales with the player's experience.
 * @param playerChoice The player's most recent choice.
 * @param worldState The current state of the game world.
 * @param storyHistory The history of the story so far.
 * @param genreConfig The configuration for the selected genre.
 * @returns A promise that resolves to an array of game commands.
 */
async function generateNextStepWithGrok(
  playerChoice: string,
  worldState: WorldState,
  storyHistory: StorySegment[],
  genreConfig: GenreConfig
): Promise<GameCommand[]> {
  // The system instruction sets the persona for the Grok model and includes the horror intensity.
  const systemInstruction = `${genreConfig.aiSystemInstruction}

X.AI GROK-4 ENHANCED REASONING: You have 2 million token context to maintain perfect story consistency.
Use your advanced reasoning to:

1. COMPLETE MEMORY INTEGRATION: Reference all previous story elements for consistency
2. PSYCHOLOGICAL DEPTH ANALYSIS: Understand the deep implications of each choice
3. NARRATIVE COHERENCE ENGINE: Ensure every story beat connects meaningfully
4. FORESHADOWING SYSTEM: Plant seeds that will pay off in future segments
5. REALITY DISTORTION ESCALATION: Gradually increase the horror through subtle inconsistencies, guided by the HORROR INTENSITY of ${worldState.horrorIntensity}/10.

You are creating an interconnected narrative web where every choice matters and every detail serves the larger horror.`;

  // The main prompt for the Grok model, instructing it on how to use the horror intensity.
  const contextualPrompt = `COMPLETE STORY CONTEXT (utilizing 2M token window):
WORLD STATE: ${JSON.stringify(worldState)}
CURRENT HORROR INTENSITY: ${worldState.horrorIntensity}/10

COMPLETE STORY HISTORY:
${storyHistory.map((s, i) => `[SEGMENT ${i + 1}]: ${s.text}`).join('\n')}

LATEST HUMAN DECISION: "${playerChoice}"

ENHANCED REASONING DIRECTIVE: The human has made a choice. Using your 2M context window and advanced reasoning:

1. DEEP PSYCHOLOGICAL STATE ANALYSIS: How has their cumulative choices shaped their mental state?
2. NARRATIVE ESCALATION WITH MEMORY: Based on the HORROR INTENSITY of ${worldState.horrorIntensity}/10, what horror elements should build on everything that came before? A low score (0-3) means subtle, atmospheric horror. A medium score (4-7) means more direct psychological horror. A high score (8-10) means extreme, reality-bending horror.
3. REALITY DISTORTION WITH CONSISTENCY: How should reality be altered while maintaining internal logic?
4. DYNAMIC INTRUSIVE THOUGHT: Generate a single, compelling intrusive thought. This thought should be a tempting, unsettling, or dangerous action.
5. VISUAL HORROR WITH THEMATIC COHERENCE: What atmospheric imagery reinforces the established themes and HORROR INTENSITY?

Generate the next narrative beat that:
- Adjusts its tone and severity based on the HORROR INTENSITY.
- References and builds upon previous story elements
- Introduces elements that connect to earlier subtle hints
- Creates 2-3 standard choices that seem meaningful but are all paths to horror.
- Generates a single intrusive thought and places it in the intrusiveThought field of the displayChoices payload.
- Maintains perfect consistency with established world rules

Return a JSON array of game commands following this structure:
[
  {"type": "displayText", "payload": {"content": "story text here", "segmentId": "unique-id"}},
  {"type": "generateImage", "payload": {"prompt": "atmospheric image prompt", "segmentId": "same-unique-id"}},
  {"type": "displayChoices", "payload": {"choices": [{"text": "Standard Choice 1", "isIntrusive": false}, {"text": "Standard Choice 2", "isIntrusive": false}], "intrusiveThought": {"text": "A dynamically generated intrusive thought.", "isIntrusive": true, "requiredIntensity": 7}}},
  {"type": "updateWorldState", "payload": {"psychologicalStatus": "evolved_mental_state"}}
]`;

  console.log('Generating next step with X.AI/Grok-4...');
  return await generateWithGrok(systemInstruction, contextualPrompt, 'story');
}