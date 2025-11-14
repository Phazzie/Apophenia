/**
 * Response Parser - Extracts and validates AI responses
 *
 * Implements ResponseParser interface from seams.ts
 * Handles malformed responses gracefully with Zod validation
 */

import { z } from 'zod';
import { ResponseParser, Command } from '../../core/types/seams';

// Zod schema for Command validation
const ChoiceSchema = z.object({
  id: z.string(),
  text: z.string(),
  consequence: z.string().optional(),
  isIntrusive: z.boolean().default(false), // Required but defaults to false if not provided
  psychologicalWeight: z.number().optional(),
});

const BrowserEffectSchema = z.object({
  type: z.enum(['changeTitle', 'openTab', 'manipulateHistory', 'vibrate']),
  value: z.string().optional(),
});

const CommandSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('createSegment'), payload: z.object({ id: z.string() }) }),
  z.object({ type: z.literal('displayText'), payload: z.object({ content: z.string(), segmentId: z.string() }) }),
  z.object({ type: z.literal('displayChoices'), payload: z.object({ choices: z.array(ChoiceSchema), intrusiveThought: ChoiceSchema.optional() }) }),
  z.object({ type: z.literal('generateImage'), payload: z.object({ prompt: z.string(), segmentId: z.string(), priority: z.enum(['high', 'low']).optional() }) }),
  z.object({ type: z.literal('updateWorldState'), payload: z.record(z.unknown()) }),
  z.object({ type: z.literal('wait'), payload: z.object({ duration: z.number() }) }),
  z.object({ type: z.literal('applyCorruption'), payload: z.object({ level: z.number(), effects: z.array(z.string()) }) }),
  z.object({ type: z.literal('browserEffect'), payload: BrowserEffectSchema }),
  z.object({ type: z.literal('reviseHistory'), payload: z.object({ segmentId: z.string(), newText: z.string() }) }),
  z.object({ type: z.literal('quantumShift'), payload: z.object({ timeline: z.string() }) }),
]);

export class ResponseParserImpl implements ResponseParser {
  /**
   * Extract commands from AI response text
   * Handles both JSON arrays and JSON embedded in markdown
   */
  extractCommands(response: string): Command[] {
    try {
      // First, try to extract JSON from markdown code blocks
      const cleanedResponse = this.extractJSONFromMarkdown(response);

      // Parse the JSON
      const parsed = JSON.parse(cleanedResponse);

      // Validate it's an array
      if (!Array.isArray(parsed)) {
        console.warn('Response is not an array, wrapping in array');
        return this.validateCommands([parsed]);
      }

      return this.validateCommands(parsed);
    } catch (error) {
      console.error('Failed to extract commands from response:', error);
      console.error('Response text:', response);
      return [];
    }
  }

  /**
   * Extract JSON from markdown code blocks
   */
  private extractJSONFromMarkdown(text: string): string {
    // Remove markdown code blocks ```json ... ``` or ``` ... ```
    const jsonBlockMatch = text.match(/```(?:json)?\s*(\[[\s\S]*?\]|\{[\s\S]*?\})\s*```/);
    if (jsonBlockMatch) {
      return jsonBlockMatch[1];
    }

    // Try to find raw JSON array or object
    const jsonMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) {
      return jsonMatch[1];
    }

    return text;
  }

  /**
   * Validate commands using Zod schema
   */
  private validateCommands(commands: unknown[]): Command[] {
    const validated: Command[] = [];

    for (const cmd of commands) {
      try {
        const validatedCommand = CommandSchema.parse(cmd);
        validated.push(validatedCommand);
      } catch (error) {
        console.warn('Invalid command skipped:', cmd, error);
      }
    }

    return validated;
  }

  /**
   * Extract and validate JSON using a custom Zod schema
   */
  extractJSON<T>(response: string, schema: z.ZodSchema<T>): T | null {
    try {
      const cleanedResponse = this.extractJSONFromMarkdown(response);
      const parsed = JSON.parse(cleanedResponse);
      return schema.parse(parsed);
    } catch (error) {
      console.error('Failed to extract and validate JSON:', error);
      return null;
    }
  }

  /**
   * Sanitize text by removing unwanted characters and normalizing whitespace
   */
  sanitizeText(text: string): string {
    return text
      // Remove markdown code block markers
      .replace(/```(?:json|typescript|javascript)?\s*/g, '')
      .replace(/```/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }
}

// Export singleton instance
export const responseParser = new ResponseParserImpl();
