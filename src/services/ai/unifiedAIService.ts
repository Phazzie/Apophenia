/**
 * Unified AI Service - Model Selection and Integration
 * 
 * Provides a unified interface for different AI models including
 * Google Gemini and X.AI Grok-4 Fast Reasoning
 */

import { xaiClient } from './grokService';
import type { GenreConfig, StorySegment, WorldState, GameCommand } from '../../types';

// Model selection configuration
export type AIModelType = 'gemini-2.5-pro' | 'grok-4-fast-reasoning';

let selectedModel: AIModelType = 'gemini-2.5-pro'; // Default to Gemini

/**
 * Set the selected AI model for generation
 */
export function setSelectedModel(model: AIModelType): void {
  selectedModel = model;
  console.log(`AI model selected: ${model}`);
}

/**
 * Get current selected model
 */
export function getSelectedModel(): AIModelType {
  return selectedModel;
}

/**
 * Get configuration for different use cases
 */
function getConfigForUseCase(useCase: 'concept' | 'story' | 'summary') {
  const baseConfig = {
    concept: {
      temperature: 1.2,
      maxOutputTokens: 8192,
      topP: 0.95,
      enableThinking: true,
    },
    story: {
      temperature: 1.0,
      maxOutputTokens: 8192,
      topP: 0.95,
      enableThinking: true,
    },
    summary: {
      temperature: 0.3,
      maxOutputTokens: 4096,
      topP: 0.8,
      enableThinking: true,
    },
  };

  return baseConfig[useCase];
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
 * Generate with Google Gemini
 */
async function generateWithGemini(
  systemInstruction: string,
  prompt: string,
  useCase: 'concept' | 'story' | 'summary'
): Promise<GameCommand[]> {
  // For now, delegate to the existing genkit service
  // This can be enhanced to call gemini directly if needed
  console.log('Generating with Gemini via genkit:', { useCase });
  
  // This would need to be implemented based on the genkit service
  // For now, return empty array as placeholder
  console.warn('Gemini generation through unified service not implemented yet');
  return [];
}

/**
 * Concept generation with selected model
 */
export async function generateConceptWithSelectedModel(
  genreConfig: GenreConfig
): Promise<{ protagonist: string; setting: string; dilemma: string }> {
  const systemInstruction = `You are an expert cosmic horror storyteller creating the foundation for an interactive narrative experience.

Create a compelling concept for a ${genreConfig.name} story.
Style: ${genreConfig.style}
Description: ${genreConfig.description}

The concept should establish:
1. A fascinating protagonist with psychological depth
2. An unsettling setting that amplifies the horror
3. A central dilemma that drives the narrative forward

Focus on psychological horror elements that will create lasting unease. The protagonist should be someone the player can relate to initially, but who will face increasingly disturbing revelations.

Consider these advanced storytelling elements:
- Multiple layers of reality that may be unreliable
- Characters whose perceptions cannot be trusted
- Settings that seem normal but hide dark secrets
- Conflicts that challenge fundamental beliefs about reality
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
    console.log('Generating concept with selected model:', selectedModel);
    
    if (selectedModel === 'grok-4-fast-reasoning') {
      const result = await xaiClient.generateText(
        systemInstruction,
        `Create a ${genreConfig.name} concept with the specified requirements.`,
        getConfigForUseCase('concept')
      );
      
      // Parse JSON response from Grok
      let jsonContent = result.content;
      
      // Extract JSON if it's wrapped in other text
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }
      
      const concept = JSON.parse(jsonContent);
      
      // Validate required fields
      if (!concept.protagonist || !concept.setting || !concept.dilemma) {
        throw new Error('Invalid concept structure from Grok');
      }
      
      return concept;
    } else {
      // Default to using genkit for Gemini
      console.warn('Concept generation with Gemini not implemented in unified service');
      
      // Return fallback concept
      return {
        protagonist: "A researcher investigating anomalous phenomena",
        setting: "An abandoned research facility in the Arctic",
        dilemma: "Strange signals are affecting reality itself"
      };
    }
  } catch (error) {
    console.error('Concept generation failed:', error);
    
    // Return fallback concept
    return {
      protagonist: "A researcher investigating anomalous phenomena",
      setting: "An abandoned research facility in the Arctic", 
      dilemma: "Strange signals are affecting reality itself"
    };
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
  const systemInstruction = `You are a master of cosmic horror storytelling, continuing an interactive narrative.

Current Story Context:
- Protagonist: ${worldState.protagonist}
- Setting: ${worldState.setting}  
- Central Dilemma: ${worldState.dilemma}
- Genre: ${genreConfig.name} (${genreConfig.style})
- Psychological Status: ${worldState.psychologicalStatus}

Story History Summary: ${worldState.summary}

The player has just made a choice. Continue the story with 2-3 meaningful choices that:
1. Advance the narrative meaningfully
2. Maintain psychological tension
3. Include at least one "intrusive" choice that reveals darker impulses
4. Build toward the central dilemma resolution

Return a JSON array of game commands in this exact format:
[
  {
    "type": "displayText",
    "payload": {
      "content": "Your story continuation text here...",
      "segmentId": "segment-${Date.now()}"
    }
  },
  {
    "type": "displayChoices", 
    "payload": {
      "choices": [
        { "text": "Choice 1", "isIntrusive": false },
        { "text": "Choice 2", "isIntrusive": false },
        { "text": "Darker choice", "isIntrusive": true }
      ]
    }
  }
]`;

  try {
    if (selectedModel === 'grok-4-fast-reasoning') {
      return await generateWithGrok(systemInstruction, playerChoice, 'story');
    } else {
      return await generateWithGemini(systemInstruction, playerChoice, 'story');
    }
  } catch (error) {
    console.error('Next step generation failed:', error);
    
    // Return fallback commands
    return [
      {
        type: 'displayText',
        payload: {
          content: 'The cosmic forces continue to manifest around you, reality bending in impossible ways.',
          segmentId: `fallback-${Date.now()}`
        }
      },
      {
        type: 'displayChoices',
        payload: {
          choices: [
            { text: 'Continue investigating', isIntrusive: false },
            { text: 'Retreat to safety', isIntrusive: false },
            { text: 'Embrace the unknown', isIntrusive: true }
          ]
        }
      }
    ];
  }
}