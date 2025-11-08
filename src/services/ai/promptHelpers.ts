import { WorldState, StorySegment } from '../../types';

/**
 * PROMPT HELPER UTILITIES
 * Advanced interpolation and transformation utilities for prompt engineering
 * Complements promptTemplates.ts with dynamic content generation
 */

// ============================================================================
// WORLD STATE INTERPOLATION
// ============================================================================

/**
 * Interpolate world state variables into a template string
 * Supports {{variable}} syntax for interpolation
 */
export function interpolateWorldState(template: string, worldState: WorldState): string {
  return template
    .replace(/\{\{protagonist\}\}/g, worldState.protagonist || 'unknown entity')
    .replace(/\{\{setting\}\}/g, worldState.setting || 'a place beyond comprehension')
    .replace(/\{\{dilemma\}\}/g, worldState.dilemma || 'an impossible choice')
    .replace(/\{\{psychologicalStatus\}\}/g, worldState.psychologicalStatus || 'unstable')
    .replace(/\{\{systemHealth\}\}/g, String(worldState.systemHealth || 100))
    .replace(/\{\{horrorIntensity\}\}/g, String(worldState.horrorIntensity || 5))
    .replace(/\{\{summary\}\}/g, worldState.summary || 'The story begins...')
    .replace(/\{\{worldState\}\}/g, JSON.stringify(worldState, null, 2));
}

/**
 * Interpolate multiple variables into a template
 */
export function interpolateVariables(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, String(value));
  }

  return result;
}

// ============================================================================
// STORY HISTORY INTERPOLATION
// ============================================================================

/**
 * Interpolate story history into a template string
 * Formats history as numbered segments or memory fragments
 */
export function interpolateHistory(
  template: string,
  storyHistory: StorySegment[],
  format: 'numbered' | 'fragments' | 'raw' = 'fragments',
  maxSegments?: number
): string {
  const segments = maxSegments ? storyHistory.slice(-maxSegments) : storyHistory;

  let formattedHistory = '';

  switch (format) {
    case 'numbered':
      formattedHistory = segments
        .map((seg, i) => `${i + 1}. ${seg.text}`)
        .join('\n');
      break;

    case 'fragments':
      formattedHistory = segments
        .map((seg, i) => `[MEMORY FRAGMENT ${i + 1}]: ${seg.text}`)
        .join('\n');
      break;

    case 'raw':
      formattedHistory = segments
        .map(seg => seg.text)
        .join('\n\n');
      break;
  }

  return template.replace(/\{\{storyHistory\}\}/g, formattedHistory);
}

/**
 * Format story history for AI context (compact representation)
 */
export function formatStoryHistoryCompact(
  storyHistory: StorySegment[],
  maxLength: number = 500
): string {
  if (storyHistory.length === 0) {
    return 'No history yet.';
  }

  const recentSegments = storyHistory.slice(-5);
  const formatted = recentSegments
    .map((seg, i) => `[${i + 1}] ${seg.text.substring(0, 100)}...`)
    .join(' | ');

  if (formatted.length > maxLength) {
    return formatted.substring(0, maxLength) + '...';
  }

  return formatted;
}

// ============================================================================
// HORROR INTENSITY SCALING
// ============================================================================

/**
 * Scale a prompt's horror elements based on intensity level
 * Adds intensity-appropriate language and directives
 */
export function scaleHorrorIntensity(basePrompt: string, intensity: number): string {
  const intensityModifier = getHorrorIntensityGuidance(intensity);

  return `${basePrompt}\n\n${intensityModifier}`;
}

/**
 * Get detailed horror intensity guidance for AI generation
 */
export function getHorrorIntensityGuidance(intensity: number): string {
  if (intensity <= 2) {
    return 'HORROR GUIDANCE (Intensity 0-2): Maintain subtle unease. Use atmospheric tension, slight discomfort, and hints of wrongness. Avoid overt horror. Focus on building dread slowly.';
  }

  if (intensity <= 4) {
    return 'HORROR GUIDANCE (Intensity 3-4): Build growing tension. Introduce disturbing elements and psychological discomfort. Create a sense of wrongness and creeping dread. Avoid jump scares, focus on sustained unease.';
  }

  if (intensity <= 6) {
    return 'HORROR GUIDANCE (Intensity 5-6): Deliver moderate psychological horror. Introduce overtly disturbing imagery and concepts. Question reality and identity. Create strong feelings of paranoia and existential dread.';
  }

  if (intensity <= 8) {
    return 'HORROR GUIDANCE (Intensity 7-8): Unleash intense psychological horror. Push boundaries with deeply disturbing concepts. Break down reality and sanity. Use graphic psychological terror and reality distortion.';
  }

  return 'HORROR GUIDANCE (Intensity 9-10): Maximum cosmic dread. Completely shatter reality and psychological stability. Introduce incomprehensible cosmic horror, absolute helplessness, and reality-ending implications. No boundaries.';
}

/**
 * Get horror intensity adjective for narrative descriptions
 */
export function getHorrorIntensityAdjective(intensity: number): string {
  if (intensity <= 2) return 'unsettling';
  if (intensity <= 4) return 'disturbing';
  if (intensity <= 6) return 'terrifying';
  if (intensity <= 8) return 'nightmarish';
  return 'reality-shattering';
}

// ============================================================================
// PSYCHOLOGICAL CORRUPTION CALCULATIONS
// ============================================================================

/**
 * Calculate the psychological corruption factor from world state
 * Returns a value between 0 (healthy) and 1 (completely corrupted)
 */
export function calculatePsychCorruption(worldState: WorldState): number {
  return 1 - (worldState.systemHealth / 100);
}

/**
 * Get a corruption-scaled probability
 * Higher corruption increases probability
 */
export function getCorruptionScaledProbability(
  baseProbability: number,
  worldState: WorldState,
  maxBonus: number = 0.3
): number {
  const corruption = calculatePsychCorruption(worldState);
  return Math.min(baseProbability + (corruption * maxBonus), 1.0);
}

// ============================================================================
// CONTEXT BUILDING HELPERS
// ============================================================================

/**
 * Build a comprehensive context block for AI generation
 */
export function buildFullContext(
  worldState: WorldState,
  storyHistory: StorySegment[],
  playerChoice?: string
): string {
  const worldContext = `
WORLD STATE:
- Protagonist: ${worldState.protagonist}
- Setting: ${worldState.setting}
- Core Dilemma: ${worldState.dilemma}
- Psychological Status: ${worldState.psychologicalStatus}
- System Health: ${worldState.systemHealth}%
- Horror Intensity: ${worldState.horrorIntensity}/10
`;

  const historyContext = storyHistory.length > 0
    ? `\nSTORY HISTORY (${storyHistory.length} segments):\n${storyHistory.slice(-5).map((seg, i) => `[${i + 1}] ${seg.text.substring(0, 100)}...`).join('\n')}`
    : '\nSTORY HISTORY: Just beginning...';

  const choiceContext = playerChoice
    ? `\n\nLATEST PLAYER CHOICE: "${playerChoice}"`
    : '';

  return worldContext + historyContext + choiceContext;
}

/**
 * Build a minimal context block (for token-limited situations)
 */
export function buildMinimalContext(
  worldState: WorldState,
  playerChoice?: string
): string {
  const context = `[${worldState.protagonist} | Psych: ${worldState.psychologicalStatus} | Horror: ${worldState.horrorIntensity}/10]`;

  return playerChoice
    ? `${context} Choice: "${playerChoice}"`
    : context;
}

// ============================================================================
// CHOICE FORMATTING
// ============================================================================

/**
 * Format recent choices for prompt inclusion
 */
export function formatRecentChoices(
  storyHistory: StorySegment[],
  count: number = 5
): string {
  if (storyHistory.length === 0) {
    return 'No previous choices.';
  }

  const recentChoices = storyHistory.slice(-count);
  return recentChoices
    .map((seg, i) => `${i + 1}. ${seg.text}`)
    .join('\n');
}

// ============================================================================
// COMMAND FORMAT HELPERS
// ============================================================================

/**
 * Get the standard command format instructions
 */
export function getCommandFormatInstructions(includeIntrusiveThought: boolean = true): string {
  const baseFormat = `
Return a JSON array of game commands following this structure:
[
  {"type": "displayText", "payload": {"content": "narrative text here", "segmentId": "unique-id"}},
  {"type": "generateImage", "payload": {"prompt": "atmospheric image prompt", "segmentId": "same-unique-id"}},
  {"type": "displayChoices", "payload": {"choices": [{"text": "Choice 1", "isIntrusive": false}, {"text": "Choice 2", "isIntrusive": false}]${includeIntrusiveThought ? ', "intrusiveThought": {"text": "Optional intrusive thought", "isIntrusive": true}' : ''}}},
  {"type": "updateWorldState", "payload": {"psychologicalStatus": "evolved_mental_state", "systemHealth": adjusted_value}}
]`;

  return baseFormat.trim();
}

/**
 * Get intrusive thought generation instructions
 */
export function getIntrusiveThoughtInstructions(intensity: number): string {
  if (intensity <= 4) {
    return 'Do NOT generate an intrusive thought at this horror intensity level.';
  }

  if (intensity <= 6) {
    return 'OPTIONAL: You MAY generate a single intrusive thought if appropriate. It should be tempting but disturbing, reflecting the player\'s psychological state.';
  }

  return 'REQUIRED: Generate a single, compelling intrusive thought. This thought should be deeply tempting, unsettling, and dangerous, directly exploiting the player\'s psychological vulnerabilities.';
}

// ============================================================================
// MODEL-SPECIFIC ENHANCEMENTS
// ============================================================================

/**
 * Add Grok-specific context enhancements
 */
export function addGrokEnhancements(basePrompt: string): string {
  const grokPrefix = `
ENHANCED CONTEXT UTILIZATION: With your 2 million token context window:
- Remember every detail of the story
- Track all character development and psychological states
- Maintain thematic consistency across the entire experience
- Build layered foreshadowing that pays off later
- Create interconnected story elements that reward careful players

`;

  return grokPrefix + basePrompt;
}

/**
 * Add thinking mode directive
 */
export function addThinkingDirective(prompt: string, thinkingPoints: string[]): string {
  const directive = `
THINKING DIRECTIVE: Before generating your response, think through:
${thinkingPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

`;

  return directive + prompt;
}

// ============================================================================
// TEXT SANITIZATION
// ============================================================================

/**
 * Sanitize text for safe prompt inclusion (prevent injection)
 */
export function sanitizeForPrompt(text: string, maxLength: number = 500): string {
  return text
    .replace(/[\r\n]+/g, ' ')  // Remove newlines
    .replace(/\s+/g, ' ')       // Collapse whitespace
    .replace(/[{}]/g, '')       // Remove braces that could break interpolation
    .trim()
    .substring(0, maxLength);
}

/**
 * Escape special characters in template strings
 */
export function escapeTemplateString(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
}

// ============================================================================
// TIMING HELPERS
// ============================================================================

/**
 * Check if enough time has passed since last event
 */
export function hasEnoughTimePassed(
  lastEventTime: number,
  minIntervalMs: number
): boolean {
  return (Date.now() - lastEventTime) >= minIntervalMs;
}

/**
 * Calculate event probability based on time and corruption
 */
export function calculateEventProbability(
  baseProb: number,
  timeSinceLastMs: number,
  minIntervalMs: number,
  worldState: WorldState
): number {
  const timeFactor = Math.min(timeSinceLastMs / minIntervalMs, 2.0);
  const corruptionFactor = calculatePsychCorruption(worldState);

  return Math.min(baseProb * timeFactor * (1 + corruptionFactor), 1.0);
}
