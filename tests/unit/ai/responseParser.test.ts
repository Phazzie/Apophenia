/**
 * Response Parser Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { responseParser } from '../../../src/services/ai/responseParser';
import { z } from 'zod';

describe('ResponseParser', () => {
  describe('extractCommands', () => {
    it('should extract commands from valid JSON array', () => {
      const response = JSON.stringify([
        { type: 'createSegment', payload: { id: 'seg-1' } },
        { type: 'displayText', payload: { content: 'Hello', segmentId: 'seg-1' } },
      ]);

      const commands = responseParser.extractCommands(response);

      expect(commands).toHaveLength(2);
      expect(commands[0].type).toBe('createSegment');
      expect(commands[1].type).toBe('displayText');
    });

    it('should extract commands from markdown code block', () => {
      const response = `
Here are the commands:
\`\`\`json
[
  { "type": "createSegment", "payload": { "id": "seg-1" } },
  { "type": "displayText", "payload": { "content": "Test", "segmentId": "seg-1" } }
]
\`\`\`
`;

      const commands = responseParser.extractCommands(response);

      expect(commands).toHaveLength(2);
      expect(commands[0].type).toBe('createSegment');
    });

    it('should extract commands from plain markdown', () => {
      const response = `
\`\`\`
[
  { "type": "createSegment", "payload": { "id": "seg-1" } }
]
\`\`\`
`;

      const commands = responseParser.extractCommands(response);

      expect(commands).toHaveLength(1);
      expect(commands[0].type).toBe('createSegment');
    });

    it('should handle invalid commands gracefully', () => {
      const response = JSON.stringify([
        { type: 'createSegment', payload: { id: 'seg-1' } },
        { type: 'invalidCommand', payload: {} }, // Invalid command
        { type: 'displayText', payload: { content: 'Test', segmentId: 'seg-1' } },
      ]);

      const commands = responseParser.extractCommands(response);

      // Should skip invalid command
      expect(commands).toHaveLength(2);
      expect(commands[0].type).toBe('createSegment');
      expect(commands[1].type).toBe('displayText');
    });

    it('should return empty array for malformed JSON', () => {
      const response = 'This is not JSON at all';

      const commands = responseParser.extractCommands(response);

      expect(commands).toEqual([]);
    });

    it('should wrap single object in array', () => {
      const response = JSON.stringify({ type: 'createSegment', payload: { id: 'seg-1' } });

      const commands = responseParser.extractCommands(response);

      expect(commands).toHaveLength(1);
      expect(commands[0].type).toBe('createSegment');
    });
  });

  describe('extractJSON', () => {
    it('should extract and validate JSON with schema', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const response = JSON.stringify({ name: 'Alice', age: 30 });

      const result = responseParser.extractJSON(response, schema);

      expect(result).toEqual({ name: 'Alice', age: 30 });
    });

    it('should extract from markdown code block', () => {
      const schema = z.object({
        name: z.string(),
      });

      const response = `
\`\`\`json
{ "name": "Bob" }
\`\`\`
`;

      const result = responseParser.extractJSON(response, schema);

      expect(result).toEqual({ name: 'Bob' });
    });

    it('should return null for invalid schema', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const response = JSON.stringify({ name: 'Alice' }); // Missing age

      const result = responseParser.extractJSON(response, schema);

      expect(result).toBeNull();
    });

    it('should return null for malformed JSON', () => {
      const schema = z.object({
        name: z.string(),
      });

      const response = 'Not JSON';

      const result = responseParser.extractJSON(response, schema);

      expect(result).toBeNull();
    });
  });

  describe('sanitizeText', () => {
    it('should remove markdown code blocks', () => {
      const text = '```json\nSome text\n```';

      const sanitized = responseParser.sanitizeText(text);

      expect(sanitized).toBe('Some text');
    });

    it('should normalize whitespace', () => {
      const text = 'Hello    world\n\n\ntest';

      const sanitized = responseParser.sanitizeText(text);

      expect(sanitized).toBe('Hello world test');
    });

    it('should trim leading and trailing whitespace', () => {
      const text = '   Hello world   ';

      const sanitized = responseParser.sanitizeText(text);

      expect(sanitized).toBe('Hello world');
    });

    it('should handle multiple code blocks', () => {
      const text = '```\nBlock 1\n``` some text ```json\nBlock 2\n```';

      const sanitized = responseParser.sanitizeText(text);

      expect(sanitized).toBe('Block 1 some text Block 2');
    });
  });
});
