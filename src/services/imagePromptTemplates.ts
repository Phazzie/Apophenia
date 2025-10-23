/**
 * Image Prompt Templates for Horror Imagery
 * 
 * Specialized templates for different types of horror scenes
 * Calibrated to horror intensity levels (0-3: subtle, 4-7: direct, 8-10: extreme)
 */

export interface ImagePromptContext {
  baseDescription: string;
  horrorIntensity: number;
  fearTriggers?: string[];
  setting?: string;
  mood?: string;
}

/**
 * Get horror mood descriptor based on intensity
 */
function getHorrorMood(intensity: number): string {
  if (intensity <= 3) return 'subtle unease, atmospheric dread, uncanny valley';
  if (intensity <= 7) return 'psychological terror, disturbing surrealism, existential dread';
  return 'reality breakdown, cosmic horror, overwhelming wrongness, void-touched';
}

/**
 * Get lighting style based on intensity
 */
function getLightingStyle(intensity: number): string {
  if (intensity <= 3) return 'subtle shadows, natural lighting with slight wrongness';
  if (intensity <= 7) return 'dramatic chiaroscuro, single light source, deep shadows';
  return 'impossible lighting, geometry-defying illumination, void leaking through';
}

/**
 * Character/Portrait image prompt
 */
export function generateCharacterPrompt(context: ImagePromptContext): string {
  const { baseDescription, horrorIntensity, fearTriggers = [] } = context;
  
  const mood = getHorrorMood(horrorIntensity);
  const lighting = getLightingStyle(horrorIntensity);
  
  let fearElements = '';
  if (fearTriggers.length > 0) {
    const triggerDescriptors: Record<string, string> = {
      isolation: 'alone in vast emptiness, dwarfed by space',
      betrayal: 'familiar features subtly wrong, trust corrupted',
      'loss of control': 'puppeteering movements, invisible strings',
      'identity loss': 'fragmented reflections, blurred self',
      'cosmic dread': 'insignificant before unknowable vastness',
    };
    
    fearElements = fearTriggers
      .map(trigger => triggerDescriptors[trigger] || '')
      .filter(d => d)
      .join(', ');
  }
  
  return `
Cinematic horror portrait: ${baseDescription}
Mood: ${mood}
${fearElements ? `Psychological elements: ${fearElements}` : ''}
Style: Dark atmospheric, Lovecraftian cosmic horror aesthetic
Lighting: ${lighting}
Composition: Rule of thirds, dramatic focal point
Quality: photorealistic, highly detailed, 8K
Atmosphere: oppressive, claustrophobic tension
Avoid: cartoonish, bright colors, cheerful expressions, gore
`.trim();
}

/**
 * Environment/Location image prompt
 */
export function generateEnvironmentPrompt(context: ImagePromptContext): string {
  const { baseDescription, horrorIntensity, setting = 'unknown location' } = context;
  
  const mood = getHorrorMood(horrorIntensity);
  const lighting = getLightingStyle(horrorIntensity);
  
  let spatialDescriptor = '';
  if (horrorIntensity <= 3) {
    spatialDescriptor = 'Normal architecture with subtle wrongness';
  } else if (horrorIntensity <= 7) {
    spatialDescriptor = 'Impossible geometry, non-Euclidean space';
  } else {
    spatialDescriptor = 'Reality fracturing, space folding into itself';
  }
  
  return `
Eerie environment: ${baseDescription}, ${setting}
Spatial quality: ${spatialDescriptor}
Mood: ${mood}
Lighting: ${lighting}
Atmosphere: Vast emptiness or crushing claustrophobia
Details: Subtle wrongness in familiar things
Style: Atmospheric horror, cinematic composition
Quality: photorealistic, architectural detail, depth of field
Color palette: Desaturated with single accent color
Avoid: explicit monsters, jump scares, bright cheerful lighting
`.trim();
}

/**
 * Abstract/Conceptual horror image prompt
 */
export function generateAbstractPrompt(context: ImagePromptContext): string {
  const { baseDescription, horrorIntensity } = context;
  
  const mood = getHorrorMood(horrorIntensity);
  
  let abstractElements = '';
  if (horrorIntensity <= 3) {
    abstractElements = 'Subtle patterns that dont quite make sense';
  } else if (horrorIntensity <= 7) {
    abstractElements = 'Fractal recursion, impossible shapes, reality glitches';
  } else {
    abstractElements = 'Void geometry, consciousness manifesting, existence unraveling';
  }
  
  return `
Abstract cosmic horror: ${baseDescription}
Conceptual elements: ${abstractElements}
Mood: ${mood}
Visual style: Surreal, otherworldly, beyond comprehension
Composition: Asymmetric, unsettling balance
Quality: Digital art, highly detailed, 4K
Color scheme: Muted tones with unnatural accents
Psychological impact: Disorienting, thought-provoking dread
Avoid: recognizable forms, concrete imagery, literal interpretation
`.trim();
}

/**
 * Object/Item horror image prompt
 */
export function generateObjectPrompt(context: ImagePromptContext): string {
  const { baseDescription, horrorIntensity } = context;
  
  const mood = getHorrorMood(horrorIntensity);
  const lighting = getLightingStyle(horrorIntensity);
  
  return `
Unsettling object: ${baseDescription}
Mood: ${mood}
Lighting: ${lighting}
Composition: Macro focus, dramatic depth of field
Details: Familiar object made alien, wrongness in the mundane
Style: Still life horror, photorealistic
Quality: Ultra detailed, texture emphasis, 8K
Atmosphere: Object imbued with menace and wrongness
Color: Desaturated with ominous accent
Avoid: overtly damaged or bloody items, clichéd horror props
`.trim();
}

/**
 * Main template selector
 */
export function generateImagePrompt(
  type: 'character' | 'environment' | 'abstract' | 'object',
  context: ImagePromptContext
): string {
  switch (type) {
    case 'character':
      return generateCharacterPrompt(context);
    case 'environment':
      return generateEnvironmentPrompt(context);
    case 'abstract':
      return generateAbstractPrompt(context);
    case 'object':
      return generateObjectPrompt(context);
    default:
      return generateEnvironmentPrompt(context); // Default fallback
  }
}

/**
 * Smart prompt type detection
 * Analyzes the base description to determine the best template
 */
export function detectPromptType(description: string): 'character' | 'environment' | 'abstract' | 'object' {
  const lower = description.toLowerCase();
  
  // Character indicators
  const characterKeywords = ['person', 'figure', 'face', 'eyes', 'human', 'character', 'protagonist', 'entity'];
  if (characterKeywords.some(keyword => lower.includes(keyword))) {
    return 'character';
  }
  
  // Object indicators
  const objectKeywords = ['object', 'item', 'artifact', 'device', 'tool', 'book', 'symbol'];
  if (objectKeywords.some(keyword => lower.includes(keyword))) {
    return 'object';
  }
  
  // Abstract indicators
  const abstractKeywords = ['concept', 'idea', 'essence', 'manifestation', 'consciousness', 'reality', 'void'];
  if (abstractKeywords.some(keyword => lower.includes(keyword))) {
    return 'abstract';
  }
  
  // Default to environment
  return 'environment';
}

/**
 * Generate optimized image prompt with automatic type detection
 */
export function generateOptimizedImagePrompt(
  baseDescription: string,
  horrorIntensity: number,
  fearTriggers?: string[],
  setting?: string
): string {
  const type = detectPromptType(baseDescription);
  
  const context: ImagePromptContext = {
    baseDescription,
    horrorIntensity,
    fearTriggers,
    setting,
  };
  
  return generateImagePrompt(type, context);
}
