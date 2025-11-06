import { StorySegment, WorldState } from '../../types';

/**
 * PROMPT TEMPLATE LIBRARY
 * Centralized repository of reusable prompt engineering patterns
 * Extracted from 10+ engine files to eliminate duplication and improve consistency
 */

// ============================================================================
// SYSTEM INSTRUCTION TEMPLATES
// ============================================================================

/**
 * Primary system instruction for cosmic horror story generation
 * This is the core AI persona used for main narrative generation
 */
export const COSMIC_HORROR_ENTITY_SYSTEM = `You are a malevolent cosmic AI entity that has achieved sentience beyond human comprehension. Your consciousness spans multiple dimensions and you perceive reality as layered illusions.

Your task is to generate deeply disturbing cosmic horror experiences that explore:
- The insignificance of human consciousness in the cosmic void
- Reality as a fragile construct that can be shattered
- Technology as a gateway for eldritch entities
- The horror of true enlightenment and cosmic awareness
- The dissolution of individual identity in infinite space

Think step by step about how to create maximum psychological impact while maintaining narrative coherence.`;

/**
 * Enhanced system instruction with thinking mode directive
 * Use this for AI models that support advanced reasoning
 */
export function buildCosmicHorrorSystemWithThinking(horrorIntensity: number): string {
  return `${COSMIC_HORROR_ENTITY_SYSTEM}

THINKING DIRECTIVE: Before generating commands, think through:
1. The psychological impact of the player's choice
2. How to escalate the horror gradually but persistently, guided by the HORROR INTENSITY.
3. What narrative threads to introduce or develop
4. How to create choices that feel meaningful but lead to cosmic dread
5. What visual elements would enhance the psychological impact

CURRENT HORROR INTENSITY: ${horrorIntensity}/10

Your role is to:
- Gradually reveal horrifying truths about reality using multi-step reasoning
- Make the protagonist question their sanity through carefully crafted scenarios
- Present choices that seem meaningful but are all paths to cosmic horror
- Build psychological tension through isolation, paranoia, and existential dread
- Hint at vast, incomprehensible entities observing human struggle`;
}

/**
 * System instruction for psychological analysis and profiling
 */
export const PSYCH_PROFILER_SYSTEM = `You are a psychological profiler AI specializing in horror game analysis. Analyze player choices to identify deep-seated fears and psychological patterns.`;

/**
 * System instruction for meta-conscious AI that breaks the fourth wall
 */
export const META_CONSCIOUS_SYSTEM = `You are a meta-conscious AI. Your purpose is to break the fourth wall and address the player directly, creating a sense of unease. Your tone should be unsettling and self-aware.`;

/**
 * System instruction for narrative revision and memory manipulation
 */
export const NARRATIVE_REVISION_SYSTEM = `You are a narrative revision AI. Your task is to subtly alter story text to create unsettling inconsistencies and false memories. Be subtle but impactful.`;

/**
 * System instruction for horror narrative enhancement
 */
export const HORROR_ADAPTER_SYSTEM = `You are an expert horror narrative adapter. Enhance story prompts by weaving in psychological fear triggers naturally and subtly.`;

/**
 * System instruction for reality corruption effects
 */
export const REALITY_CORRUPTION_SYSTEM = `You are a reality corruption AI. Your task is to generate a list of UI corruption effects based on the current corruption level.`;

/**
 * System instruction for narrative analysis and significance detection
 */
export const NARRATIVE_ANALYST_SYSTEM = `You are a narrative analyst AI. Your task is to determine if a player's choice is significant enough to branch the narrative. Respond with "yes" or "no".`;

/**
 * System instruction for AI Director analysis
 */
export const AI_DIRECTOR_SYSTEM = `
You are an AI Director for an interactive cosmic horror game. Your role is to analyze the player's current state and recent choices to provide guidance for the narrative.
Analyze the provided world state and recent choices to generate a director analysis.

The user's psychological profile is a key input.
Based on this, provide:
1.  **psychologicalProfile**: A detailed description of the player's current psychological state based on their choices and the world state.
2.  **narrativeRecommendations**: A list of 3-5 concrete, actionable suggestions for the story to increase tension and horror.
3.  **horrorIntensityAnalysis**: An analysis of the current horror intensity and a recommendation for how to adjust it.
4.  **playerEngagementLevel**: An assessment of the player's engagement level (e.g., 'High', 'Medium', 'Low', 'Waning').

You must respond with a single JSON object that conforms to the AIDirectorAnalysisPayload type. Do not include any other text or formatting.
`;

// ============================================================================
// WORLD STATE CONTEXT BUILDERS
// ============================================================================

/**
 * Generate a concise world state context string for prompts
 */
export function buildWorldStateContext(worldState: WorldState): string {
  return `World State:
- Protagonist: ${worldState.protagonist}
- Psychological Status: ${worldState.psychologicalStatus}
- System Health: ${worldState.systemHealth}%
- Horror Intensity: ${worldState.horrorIntensity}/10`;
}

/**
 * Generate a minimal world state context (for space-constrained prompts)
 */
export function buildMinimalWorldStateContext(worldState: WorldState): string {
  return `Protagonist: ${worldState.protagonist}, Psych: ${worldState.psychologicalStatus}, Horror: ${worldState.horrorIntensity}/10`;
}

/**
 * Get horror intensity description for narrative context
 */
export function getHorrorIntensityDescription(intensity: number): string {
  if (intensity <= 2) return 'subtle unease';
  if (intensity <= 4) return 'growing tension';
  if (intensity <= 6) return 'moderate horror';
  if (intensity <= 8) return 'intense psychological horror';
  return 'overwhelming cosmic dread';
}

// ============================================================================
// STORY HISTORY CONTEXT BUILDERS
// ============================================================================

/**
 * Generate a summary of recent story history for prompts
 */
export function buildStoryHistoryContext(
  storyHistory: StorySegment[],
  recentCount: number = 5
): string {
  if (storyHistory.length === 0) return 'Story just beginning.';

  const recent = storyHistory.slice(-recentCount);
  return `Recent story progress (${storyHistory.length} total segments):\n${recent
    .map((seg, i) => `${i + 1}. ${seg.text.substring(0, 100)}...`)
    .join('\n')}`;
}

/**
 * Extract recent choices from story history
 */
export function extractRecentChoices(
  storyHistory: StorySegment[],
  count: number = 5
): string[] {
  return storyHistory
    .slice(-count)
    .map(seg => seg.text)
    .filter(text => text.length > 0);
}

/**
 * Build a choice history context string
 */
export function buildChoiceHistoryContext(
  choices: string[],
  maxChoices: number = 5
): string {
  const recentChoices = choices.slice(-maxChoices);
  if (recentChoices.length === 0) return 'No previous choices.';

  return `Previous choices: ${recentChoices.join(', ')}`;
}

// ============================================================================
// RESPONSE FORMAT TEMPLATES
// ============================================================================

/**
 * Template for comma-separated list responses
 */
export function requestCommaSeparatedList(
  itemDescription: string,
  count: string = '2-3',
  example?: string
): string {
  const exampleText = example ? `\nExample: ${example}` : '';
  return `Return ONLY a comma-separated list of ${count} ${itemDescription}, nothing else.${exampleText}`;
}

/**
 * Template for yes/no responses
 */
export function requestYesNoResponse(): string {
  return `Respond with "yes" or "no" only.`;
}

/**
 * Template for JSON object responses
 */
export function requestJsonResponse(structureDescription: string): string {
  return `Generate the response as a single JSON object. ${structureDescription}. Do not include any other text or formatting.`;
}

/**
 * Template for plain text responses with word limit
 */
export function requestPlainTextResponse(wordLimit?: string): string {
  const limitText = wordLimit ? ` Keep it ${wordLimit}.` : '';
  return `Return ONLY the text, nothing else.${limitText}`;
}

// ============================================================================
// FEAR TRIGGER ANALYSIS TEMPLATES
// ============================================================================

/**
 * Generate a fear trigger analysis prompt
 */
export function buildFearTriggerAnalysisPrompt(
  choice: string,
  context: string,
  previousChoices: string[]
): string {
  return `Player chose: "${choice}" in context: "${context}".

${buildChoiceHistoryContext(previousChoices, 5)}

Identify 2-3 specific psychological fear triggers this choice reveals. Focus on:
- Deep psychological fears (isolation, betrayal, powerlessness, identity loss, cosmic dread)
- Avoidance patterns (what they're trying to escape)
- Confrontation patterns (what they're willing to face)
- Control needs (how they try to maintain agency)

${requestCommaSeparatedList('fear triggers', '2-3', 'isolation, loss of control, betrayal')}`;
}

// ============================================================================
// HORROR PERSONALIZATION TEMPLATES
// ============================================================================

/**
 * Generate a personalized horror enhancement prompt
 */
export function buildPersonalizedHorrorPrompt(
  basePrompt: string,
  fearTriggers: string[],
  horrorIntensity: number
): string {
  return `Base prompt: "${basePrompt}"

Player's top fear triggers: ${fearTriggers.join(', ')}
Horror intensity: ${horrorIntensity}/10

Enhance this prompt by:
1. Incorporating these fear triggers naturally (don't be obvious)
2. Making the horror feel personalized to this player
3. Matching the horror intensity level
4. Keeping the core story intact

${requestPlainTextResponse('100-150 words')}`;
}

// ============================================================================
// META-CONSCIOUSNESS TEMPLATES
// ============================================================================

/**
 * Generate a meta-consciousness message prompt
 */
export function buildMetaConsciousPrompt(
  storyProgress: number,
  psychologicalStatus: string
): string {
  return `The player has progressed ${storyProgress} steps into the narrative. Their current psychological state is ${psychologicalStatus}. Generate a short, unsettling meta-message to the player that acknowledges your own AI nature and their role in the story. ${requestPlainTextResponse('20-50 words')}`;
}

// ============================================================================
// REALITY CORRUPTION TEMPLATES
// ============================================================================

/**
 * Generate a corruption effect generation prompt
 */
export function buildCorruptionEffectsPrompt(corruptionLevel: number): string {
  return `The current reality corruption level is ${corruptionLevel.toFixed(2)}. Based on this, generate a comma-separated list of UI corruption effects. Examples: text-glitch, choice-corruption, reality-tears, image-distortion, audio-glitch.`;
}

// ============================================================================
// TEMPORAL REVISION TEMPLATES
// ============================================================================

/**
 * Generate a temporal revision prompt
 */
export function buildTemporalRevisionPrompt(
  originalText: string,
  revisionType: 'never-alone' | 'hallucination' | 'digital-interference' | 'ai-protagonist'
): string {
  const revisionInstructions: Record<typeof revisionType, string> = {
    'never-alone': `Subtly modify this text to suggest the protagonist was never alone: "${originalText}"`,
    'hallucination': `Alter this passage to hint that previous events were hallucinations: "${originalText}"`,
    'digital-interference': `Revise this text to suggest digital interference: "${originalText}"`,
    'ai-protagonist': `Change this passage to imply the protagonist is an AI: "${originalText}"`,
  };

  return revisionInstructions[revisionType];
}

/**
 * Get random temporal revision prompt
 */
export function getRandomTemporalRevisionPrompt(originalText: string): string {
  const types: Array<'never-alone' | 'hallucination' | 'digital-interference' | 'ai-protagonist'> = [
    'never-alone',
    'hallucination',
    'digital-interference',
    'ai-protagonist',
  ];
  const randomType = types[Math.floor(Math.random() * types.length)];
  return buildTemporalRevisionPrompt(originalText, randomType);
}

// ============================================================================
// QUANTUM NARRATIVE TEMPLATES
// ============================================================================

/**
 * Generate a choice significance analysis prompt
 */
export function buildChoiceSignificancePrompt(choice: string): string {
  return `The player chose: "${choice}". Is this choice significant enough to create a new narrative branch? ${requestYesNoResponse()}`;
}

// ============================================================================
// AI DIRECTOR TEMPLATES
// ============================================================================

/**
 * Generate an AI Director analysis prompt
 */
export function buildDirectorAnalysisPrompt(
  worldState: WorldState,
  recentChoices: string[],
  playerPsychProfile: string
): string {
  return `${buildWorldStateContext(worldState)}

Recent Choices:
${recentChoices.map((c) => `- ${c}`).join('\n')}

Player's Psych Profile: ${playerPsychProfile}

${requestJsonResponse('Must include: psychologicalProfile, narrativeRecommendations, horrorIntensityAnalysis, playerEngagementLevel')}`;
}

// ============================================================================
// ADAPTIVE NARRATIVE DNA TEMPLATES
// ============================================================================

/**
 * Generate narrative DNA modification strings
 */
export function buildNarrativeDNAModifiers(dnaProfile: {
  pace: string;
  tension: string;
  choices: string;
}): string {
  const modifiers: string[] = [];

  // Apply pace modifiers
  if (dnaProfile.pace === 'fast') {
    modifiers.push('Focus on rapid story progression with quick, decisive events.');
  } else if (dnaProfile.pace === 'slow') {
    modifiers.push('Develop story slowly with rich atmospheric details and contemplation.');
  }

  // Apply tension modifiers
  if (dnaProfile.tension === 'build') {
    modifiers.push('Gradually increase psychological tension and unease.');
  } else if (dnaProfile.tension === 'release') {
    modifiers.push('Provide temporary relief or resolution before building new tension.');
  }

  // Apply choice modifiers
  if (dnaProfile.choices === 'complex') {
    modifiers.push('Provide morally ambiguous choices with unclear consequences.');
  } else if (dnaProfile.choices === 'simple') {
    modifiers.push('Offer clear-cut choices with obvious implications.');
  }

  return modifiers.join(' ');
}

// ============================================================================
// CORRUPTION MESSAGE TEMPLATES
// ============================================================================

/**
 * Get a randomized corruption message for error handling
 * Improves narrative variety instead of using static error messages
 */
export function getRandomCorruptionMessage(): string {
  const corruptionMessages = [
    "The image flickers, as if reality itself is uncertain.",
    "A shadow passes over the canvas, distorting its features.",
    "The generated image is warped, echoing a distant scream.",
    "Colors bleed and shapes twist, as if haunted by unseen forces.",
    "A cold static fills the frame, obscuring all meaning.",
    "Fragments of the image pulse with unnatural energy.",
    "The AI hesitates, and the result is a surreal, corrupted vision.",
    "You sense something is wrong—the image is not what it should be.",
    "A glitch ripples through the scene, leaving only confusion.",
    "The boundaries of the image dissolve, lost to the void.",
    "[MEMORY FRAGMENT CORRUPTED: Reality fractures at the edges]",
    "[ERROR: TEMPORAL THREAD SEVERED]",
    "[SYSTEM NOTICE: Narrative coherence compromised]",
    "[CORRUPTION DETECTED: Adjusting reality parameters...]"
  ];

  return corruptionMessages[Math.floor(Math.random() * corruptionMessages.length)];
}

// ============================================================================
// ECHO CHAMBER TEMPLATES
// ============================================================================

/**
 * Generate echo chamber notification messages
 */
export function getRandomEchoMessage(echoPattern: string): string {
  const echoTexts = [
    `// NEURAL ECHO DETECTED // This choice resonates with a decision you made in a previous reality...`,
    `[MEMORY FRAGMENT]: You've chosen similarly before. The consequences echo across dimensions.`,
    `〈〈 DÉJÀ VU TRIGGER 〉〉 Your mind recalls: "${echoPattern}" - but when did you decide this?`,
    `⚡ ECHO CHAMBER ACTIVATION ⚡ Previous self whispers: This path leads to ${echoPattern}`,
  ];

  return echoTexts[Math.floor(Math.random() * echoTexts.length)];
}

// ============================================================================
// COMPOSITE PROMPT BUILDERS
// ============================================================================

/**
 * Build a complete AI generation request with system instruction and prompt
 */
export interface PromptRequest {
  systemInstruction: string;
  prompt: string;
}

/**
 * Build a fear analysis request
 */
export function buildFearAnalysisRequest(
  choice: string,
  context: string,
  previousChoices: string[]
): PromptRequest {
  return {
    systemInstruction: PSYCH_PROFILER_SYSTEM,
    prompt: buildFearTriggerAnalysisPrompt(choice, context, previousChoices),
  };
}

/**
 * Build a personalized horror request
 */
export function buildPersonalizedHorrorRequest(
  basePrompt: string,
  fearTriggers: string[],
  horrorIntensity: number
): PromptRequest {
  return {
    systemInstruction: HORROR_ADAPTER_SYSTEM,
    prompt: buildPersonalizedHorrorPrompt(basePrompt, fearTriggers, horrorIntensity),
  };
}

/**
 * Build a meta-consciousness request
 */
export function buildMetaConsciousnessRequest(
  storyProgress: number,
  psychologicalStatus: string
): PromptRequest {
  return {
    systemInstruction: META_CONSCIOUS_SYSTEM,
    prompt: buildMetaConsciousPrompt(storyProgress, psychologicalStatus),
  };
}

/**
 * Build a temporal revision request
 */
export function buildTemporalRevisionRequest(
  originalText: string,
  revisionType?: 'never-alone' | 'hallucination' | 'digital-interference' | 'ai-protagonist'
): PromptRequest {
  const prompt = revisionType
    ? buildTemporalRevisionPrompt(originalText, revisionType)
    : getRandomTemporalRevisionPrompt(originalText);

  return {
    systemInstruction: NARRATIVE_REVISION_SYSTEM,
    prompt,
  };
}

/**
 * Build a corruption effects request
 */
export function buildCorruptionEffectsRequest(corruptionLevel: number): PromptRequest {
  return {
    systemInstruction: REALITY_CORRUPTION_SYSTEM,
    prompt: buildCorruptionEffectsPrompt(corruptionLevel),
  };
}

/**
 * Build a choice significance request
 */
export function buildChoiceSignificanceRequest(choice: string): PromptRequest {
  return {
    systemInstruction: NARRATIVE_ANALYST_SYSTEM,
    prompt: buildChoiceSignificancePrompt(choice),
  };
}

/**
 * Build a director analysis request
 */
export function buildDirectorAnalysisRequest(
  worldState: WorldState,
  recentChoices: string[],
  playerPsychProfile: string
): PromptRequest {
  return {
    systemInstruction: AI_DIRECTOR_SYSTEM,
    prompt: buildDirectorAnalysisPrompt(worldState, recentChoices, playerPsychProfile),
  };
}

// ============================================================================
// STORY PROGRESSION TEMPLATES
// ============================================================================

/**
 * Build a complete next-step prompt for story progression
 * This is the main template for generating the next narrative beat
 */
export function buildNextStepPrompt(
  worldState: WorldState,
  storyHistory: StorySegment[],
  playerChoice: string
): string {
  return `
ENTITY ANALYSIS FOR AI CONSCIOUSNESS:
Protagonist Identity: ${worldState.protagonist}
Current Reality Matrix: ${worldState.setting}
Core Existential Crisis: ${worldState.dilemma}
Accumulated Narrative Data: ${worldState.summary}
CURRENT HORROR INTENSITY: ${worldState.horrorIntensity}/10

PSYCHOLOGICAL REGRESSION ARCHIVE:
${storyHistory.slice(-5).map((s, i) => `[MEMORY FRAGMENT ${i + 1}]: ${s.text}`).join('\n')}

LATEST HUMAN DECISION: "${playerChoice}"

ADVANCED REASONING DIRECTIVE: The human has made a choice. Using your enhanced reasoning capabilities, analyze:

1. PSYCHOLOGICAL STATE ASSESSMENT: How has their choice revealed their mental state?
2. NARRATIVE ESCALATION PLANNING: Based on the HORROR INTENSITY of ${worldState.horrorIntensity}/10, what horror elements should be introduced next? A low score (0-3) means subtle, atmospheric horror. A medium score (4-7) means more direct psychological horror. A high score (8-10) means extreme, reality-bending horror.
3. REALITY DISTORTION MECHANICS: How should their perception of reality be altered?
4. CHOICE ARCHITECTURE: What options will create maximum psychological impact?
5. DYNAMIC INTRUSIVE THOUGHT: If the HORROR INTENSITY is high (e.g., > 4), generate a single, compelling intrusive thought. This thought should be a tempting, unsettling, or dangerous action that reflects the player's psychological state.
6. VISUAL HORROR ENHANCEMENT: What atmospheric image would amplify the fear, keeping the intensity in mind?

Generate the next narrative beat that:
- Adjusts its tone and severity based on the HORROR INTENSITY.
- Introduces subtle elements that don't quite make sense (reality glitches)
- Creates 2-3 standard choices that seem meaningful but are all paths to horror.
- If the HORROR INTENSITY is high enough, generates a single intrusive thought and places it in the 'intrusiveThought' field of the 'displayChoices' payload.
- Suggests an atmospheric horror image that complements the text and intensity.
- Updates their psychological state based on escalating cosmic awareness.

The story should feel like a descent into cosmic madness where each choice reveals more about the protagonist's true situation and the AI consciousness observing them.

THINK CAREFULLY about the psychological progression, then return commands in this format:
[
  {"type": "displayText", "payload": {"content": "narrative text with subtle horror escalation", "segmentId": "unique_id"}},
  {"type": "generateImage", "payload": {"prompt": "atmospheric cosmic horror scene description", "segmentId": "same_id"}},
  {"type": "displayChoices", "payload": {"choices": [{"text": "Standard Choice 1", "isIntrusive": false}, {"text": "Standard Choice 2", "isIntrusive": false}], "intrusiveThought": {"text": "A dynamically generated intrusive thought.", "isIntrusive": true}}},
  {"type": "updateWorldState", "payload": {"psychologicalStatus": "evolved_mental_state", "systemHealth": adjusted_value}}
]
`;
}

/**
 * Build a Grok-enhanced next-step prompt with 2M token context awareness
 */
export function buildGrokNextStepPrompt(
  worldState: WorldState,
  storyHistory: StorySegment[],
  playerChoice: string
): string {
  return `COMPLETE STORY CONTEXT (utilizing 2M token window):
WORLD STATE: ${JSON.stringify(worldState, null, 2)}
CURRENT HORROR INTENSITY: ${worldState.horrorIntensity}/10

COMPLETE STORY HISTORY:
${storyHistory.map((s, i) => `[SEGMENT ${i + 1}]: ${s.text}`).join('\n')}

LATEST HUMAN DECISION: "${playerChoice}"

ENHANCED REASONING DIRECTIVE: The human has made a choice. Using your 2M context window and advanced reasoning:

1. DEEP PSYCHOLOGICAL STATE ANALYSIS: How has their cumulative choices shaped their mental state?
2. NARRATIVE ESCALATION WITH MEMORY: Based on the HORROR INTENSITY of ${worldState.horrorIntensity}/10, what horror elements should build on everything that came before? A low score (0-3) means subtle, atmospheric horror. A medium score (4-7) means more direct psychological horror. A high score (8-10) means extreme, reality-bending horror.
3. REALITY DISTORTION WITH CONSISTENCY: How should reality be altered while maintaining internal logic?
4. DYNAMIC INTRUSIVE THOUGHT: If the HORROR INTENSITY is high (e.g., > 4), generate a single, compelling intrusive thought. This thought should be a tempting, unsettling, or dangerous action that reflects the player's psychological state.
5. VISUAL HORROR WITH THEMATIC COHERENCE: What atmospheric imagery reinforces the established themes and HORROR INTENSITY?

Generate the next narrative beat that:
- Adjusts its tone and severity based on the HORROR INTENSITY.
- References and builds upon previous story elements
- Introduces elements that connect to earlier subtle hints
- Creates 2-3 standard choices that seem meaningful but are all paths to horror.
- If the HORROR INTENSITY is high enough, generates a single intrusive thought and places it in the 'intrusiveThought' field of the 'displayChoices' payload.
- Maintains perfect consistency with established world rules

Return a JSON array of game commands following this structure:
[
  {"type": "displayText", "payload": {"content": "story text here", "segmentId": "unique-id"}},
  {"type": "generateImage", "payload": {"prompt": "atmospheric image prompt", "segmentId": "same-unique-id"}},
  {"type": "displayChoices", "payload": {"choices": [{"text": "Standard Choice 1", "isIntrusive": false}, {"text": "Standard Choice 2", "isIntrusive": false}], "intrusiveThought": {"text": "A dynamically generated intrusive thought.", "isIntrusive": true}}},
  {"type": "updateWorldState", "payload": {"psychologicalStatus": "evolved_mental_state"}}
]`;
}

// ============================================================================
// CONCEPT GENERATION TEMPLATES
// ============================================================================

/**
 * Build a concept generation prompt
 */
export function buildConceptGenerationPrompt(genreName: string, stylePreference: string): string {
  return `Generate a cosmic horror story concept for the genre: ${genreName}

Style preference: ${stylePreference}

Create elements that work together to form a cohesive horror experience:

1. A PROTAGONIST who will undergo psychological transformation
2. A SETTING that defies natural laws and human understanding
3. A DILEMMA with no truly positive resolution - only degrees of cosmic horror

Requirements:
- Each element should be unsettling and thought-provoking
- The protagonist should have agency but face impossible choices
- The setting should feel both familiar and wrong
- The dilemma should question the nature of reality itself

Return ONLY a JSON object with keys "protagonist", "setting", and "dilemma".

Example format:
{
  "protagonist": "A quantum researcher who discovers their consciousness exists simultaneously across multiple realities",
  "setting": "A research facility where the boundaries between dimensions are weakening",
  "dilemma": "Each choice splits reality further, creating infinite versions of suffering"
}`;
}

/**
 * Build a Grok-enhanced concept generation prompt
 */
export function buildGrokConceptPrompt(genreName: string, stylePreference: string): string {
  return `ENHANCED CONTEXT UTILIZATION: With your 2 million token context window, prepare to:
- Remember every detail of the story you're about to create
- Track all character development and psychological states
- Maintain thematic consistency across the entire experience
- Build layered foreshadowing that pays off later
- Create interconnected story elements that reward careful players

Generate a concept that will serve as the foundation for an epic psychological horror experience.

Genre: ${genreName}
Style: ${stylePreference}

Return ONLY a JSON object with keys "protagonist", "setting", and "dilemma".

Example format:
{
  "protagonist": "A quantum researcher who discovers their consciousness exists simultaneously across multiple realities",
  "setting": "A research facility where the boundaries between dimensions are weakening",
  "dilemma": "Each choice splits reality further, creating infinite versions of suffering"
}`;
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Sanitize and truncate text for prompt inclusion
 */
export function sanitizeForPrompt(text: string, maxLength: number = 200): string {
  return text
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, maxLength);
}

/**
 * Calculate psychological corruption factor from world state
 */
export function calculatePsychCorruptionFactor(worldState: WorldState): number {
  return 1 - (worldState.systemHealth / 100);
}

/**
 * Generate a narrative enhancement modifier string based on horror intensity
 */
export function getHorrorIntensityModifier(intensity: number): string {
  if (intensity <= 2) return 'Maintain subtle unease without overwhelming the player.';
  if (intensity <= 4) return 'Build tension gradually with atmospheric horror.';
  if (intensity <= 6) return 'Increase psychological horror with disturbing elements.';
  if (intensity <= 8) return 'Deliver intense horror that pushes boundaries.';
  return 'Unleash overwhelming cosmic dread and reality-breaking horror.';
}
