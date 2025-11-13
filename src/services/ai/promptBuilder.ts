/**
 * Prompt Builder - Constructs AI prompts with context and instructions
 *
 * Implements PromptBuilder interface from seams.ts
 * Builds prompts with genre configuration, engine instructions, and game context
 */

import {
  PromptBuilder,
  GenreConfig,
  AIContext,
  WorldState,
  Choice,
  StorySegment,
  PlayerProfile,
} from '../../core/types/seams';
import { sanitizeForPrompt } from './promptHelpers';

export class PromptBuilderImpl implements PromptBuilder {
  /**
   * Build system prompt with genre and active engines
   */
  buildSystemPrompt(genre: GenreConfig, engines: string[]): string {
    const engineList = engines.length > 0 ? engines.join(', ') : 'None';

    return `You are the narrative AI for Apophenia, a psychological horror game.

GENRE: ${genre.name}
${genre.description}

THEMES: ${genre.themes.join(', ')}
FEAR CATEGORIES: ${genre.fearCategories.join(', ')}

ACTIVE ENGINES: ${engineList}

CORE DIRECTIVES:
1. Generate narrative that evolves based on player choices
2. Create psychological horror that targets player-specific fears
3. Return responses as JSON arrays of commands
4. Maintain narrative coherence while introducing unsettling elements
5. Build tension gradually, increasing horror intensity over time

VISUAL STYLE:
- Atmosphere: ${genre.visualStyle.atmosphere}
- Use colors: ${genre.visualStyle.primaryColor}, ${genre.visualStyle.secondaryColor}, ${genre.visualStyle.accentColor}

COMMAND STRUCTURE:
All responses must be valid JSON arrays containing command objects.

Example commands:
[
  { "type": "createSegment", "payload": { "id": "seg-123" } },
  { "type": "displayText", "payload": { "content": "Your story text...", "segmentId": "seg-123" } },
  { "type": "generateImage", "payload": { "prompt": "A dark corridor...", "segmentId": "seg-123" } },
  { "type": "displayChoices", "payload": {
      "choices": [
        { "id": "c1", "text": "Choice text..." },
        { "id": "c2", "text": "Another choice..." }
      ]
    }
  }
]

${genre.systemPrompt}`;
  }

  /**
   * Build context prompt from game state
   */
  buildContextPrompt(context: AIContext): string {
    const recentHistory = this.summarizeHistory(context.recentHistory);
    const fearProfile = this.summarizeFearProfile(context.playerProfile);
    const choicePatterns = this.summarizeChoicePatterns(context.playerProfile);

    // Sanitize user-provided text to prevent prompt injection
    const sanitizedProtagonist = sanitizeForPrompt(context.worldState.protagonist || '', 300);
    const sanitizedSetting = sanitizeForPrompt(context.worldState.setting || '', 300);
    const sanitizedDilemma = sanitizeForPrompt(context.worldState.dilemma || '', 300);
    const sanitizedPsychStatus = sanitizeForPrompt(context.worldState.psychologicalStatus || '', 200);

    return `CURRENT WORLD STATE:
Protagonist: ${sanitizedProtagonist}
Setting: ${sanitizedSetting}
Dilemma: ${sanitizedDilemma}
Psychological Status: ${sanitizedPsychStatus}
System Health: ${context.worldState.systemHealth}/100
Horror Intensity: ${context.worldState.horrorIntensity}/10
Corruption Level: ${context.worldState.corruptionLevel}/100

RECENT HISTORY:
${recentHistory}

PLAYER PSYCHOLOGICAL PROFILE:
${fearProfile}

PLAYER CHOICE PATTERNS:
${choicePatterns}

ENGINE INSTRUCTIONS:
${context.engineInstructions.length > 0 ? context.engineInstructions.join('\n') : 'No special instructions'}

GENRE PROMPTS:
${context.genrePrompts.join('\n')}`;
  }

  /**
   * Build prompt for player choice processing
   */
  buildChoicePrompt(worldState: WorldState, previousChoice: Choice): string {
    // Sanitize user choice text to prevent prompt injection
    const sanitizedChoiceText = sanitizeForPrompt(previousChoice.text, 500);
    const sanitizedConsequence = previousChoice.consequence
      ? sanitizeForPrompt(previousChoice.consequence, 300)
      : '';

    return `PLAYER CHOSE: "${sanitizedChoiceText}"
Choice ID: ${previousChoice.id}
${sanitizedConsequence ? `Expected Consequence: ${sanitizedConsequence}` : ''}
${previousChoice.isIntrusive ? 'This was an INTRUSIVE THOUGHT - reflect the psychological weight of this choice' : ''}
${previousChoice.psychologicalWeight ? `Psychological Weight: ${previousChoice.psychologicalWeight}` : ''}

Based on this choice and the current world state, generate the next narrative segment.

RESPONSE FORMAT:
Return a JSON array of commands that:
1. Create a new segment
2. Display the consequence of the player's choice
3. Optionally generate an atmospheric image
4. Present 2-4 new choices for the player
5. Update world state if needed (increase horror, decrease health, etc.)

Remember:
- Horror intensity: ${worldState.horrorIntensity}/10 (increase gradually)
- Corruption level: ${worldState.corruptionLevel}/100 (affects reality stability)
- System health: ${worldState.systemHealth}/100 (decreases with corruption)`;
  }

  /**
   * Inject engine instructions into an existing prompt
   */
  injectEngineInstructions(prompt: string, instructions: string[]): string {
    if (instructions.length === 0) {
      return prompt;
    }

    const instructionBlock = `
ACTIVE ENGINE INSTRUCTIONS:
${instructions.map((instruction, i) => `${i + 1}. ${instruction}`).join('\n')}
`;

    return `${prompt}\n\n${instructionBlock}`;
  }

  /**
   * Summarize recent story history
   */
  private summarizeHistory(segments: StorySegment[]): string {
    if (segments.length === 0) {
      return 'No history yet (game just started)';
    }

    return segments
      .slice(-5) // Last 5 segments
      .map((seg, i) => {
        const flags = [];
        if (seg.isRevised) flags.push('REVISED');
        if (seg.isQuantumShift) flags.push('QUANTUM SHIFT');
        if (seg.isMetaEvent) flags.push('META EVENT');
        const flagStr = flags.length > 0 ? ` [${flags.join(', ')}]` : '';

        return `${i + 1}. ${seg.text.substring(0, 150)}...${flagStr}`;
      })
      .join('\n');
  }

  /**
   * Summarize player fear profile
   */
  private summarizeFearProfile(profile: PlayerProfile): string {
    const fears = profile.fearProfile || {};
    const fearEntries = Object.entries(fears)
      .filter(([_, value]) => (value as number) > 0)
      .sort(([_, a], [__, b]) => (b as number) - (a as number))
      .map(([fear, intensity]) => `  - ${fear}: ${((intensity as number) * 100).toFixed(0)}%`)
      .join('\n');

    return fearEntries.length > 0
      ? `Detected Fears:\n${fearEntries}`
      : 'No fear profile established yet';
  }

  /**
   * Summarize player choice patterns
   */
  private summarizeChoicePatterns(profile: PlayerProfile): string {
    const patterns = profile.choicePatterns || {};
    return `Risk Taking: ${((patterns.riskTaking || 0) * 100).toFixed(0)}%
Curiosity: ${((patterns.curiosity || 0) * 100).toFixed(0)}%
Aggression: ${((patterns.aggression || 0) * 100).toFixed(0)}%
Avoidance: ${((patterns.avoidance || 0) * 100).toFixed(0)}%
Total Choices Made: ${profile.engagementMetrics?.totalChoices || 0}`;
  }
}

// Export singleton instance
export const promptBuilder = new PromptBuilderImpl();
