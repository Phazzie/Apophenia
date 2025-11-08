/**
 * Image Prompt Enhancement Utilities
 * Consolidates horror keyword enhancement and intensity scaling logic
 */

import { useWorldStateStore } from '../../../stores/worldStateStore';

/**
 * Enhance prompt with horror-specific keywords based on intensity level
 * @param prompt Base image prompt
 * @param horrorIntensity Intensity level (0-10)
 * @returns Enhanced prompt with horror keywords and styling directives
 */
export function enhancePromptWithHorrorIntensity(
  prompt: string,
  horrorIntensity: number
): string {
  const intensityKeywords = [
    '', // 0
    'subtle unease,', // 1
    'eerie, unsettling,', // 2
    'dread-filled, macabre,', // 3
    'disturbing, nightmarish,', // 4
    'grotesque, body horror,', // 5
    'surreal, reality-bending,', // 6
    'mind-shattering, cosmic horror,', // 7
    'incomprehensible, sanity-breaking,', // 8
    'eldritch abomination, visceral,', // 9
    'apocalyptic, pure terror,', // 10
  ];

  const keyword = intensityKeywords[Math.round(horrorIntensity)] || '';

  return `${prompt}. ${keyword}Photorealistic cosmic horror style, atmospheric nightmare lighting, surreal otherworldly aesthetics, lovecraftian eldritch elements, psychological horror atmosphere, high contrast cinematic composition, digital consciousness themes, reality distortion effects`;
}

/**
 * Enhance prompt with horror keywords using current world state
 * @param prompt Base image prompt
 * @param useIntensity Whether to use horror intensity from world state
 * @returns Enhanced prompt
 */
export function enhancePromptWithWorldState(
  prompt: string,
  useIntensity: boolean = true
): string {
  if (!useIntensity) {
    return prompt;
  }

  const { horrorIntensity } = useWorldStateStore.getState().worldState;
  return enhancePromptWithHorrorIntensity(prompt, horrorIntensity);
}

/**
 * Generate variation prompts with different perspectives and emphasis
 * @param basePrompt Base prompt (can be pre-enhanced)
 * @param count Number of variations to generate
 * @returns Array of varied prompts
 */
export function generatePromptVariations(
  basePrompt: string,
  count: number = 3
): string[] {
  const variations = [
    `${basePrompt}, close-up perspective, intimate horror`,
    `${basePrompt}, wide-angle view, environmental terror`,
    `${basePrompt}, dramatic lighting, shadow play emphasis`,
    `${basePrompt}, high contrast composition, stark atmosphere`,
    `${basePrompt}, abstract surrealism, reality distortion`,
  ];

  return variations.slice(0, count);
}
