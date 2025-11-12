/**
 * Shared JSON Extraction Utilities
 *
 * Centralized logic for extracting and parsing JSON from AI model responses
 * that may include markdown code blocks, thinking mode output, or other artifacts.
 */

export interface JSONExtractionOptions {
  /** Remove markdown code block markers (```json, ```) */
  cleanMarkdown?: boolean;
  /** Look for array brackets specifically */
  expectArray?: boolean;
  /** Look for object braces specifically */
  expectObject?: boolean;
  /** Throw error if no valid JSON found (default: true) */
  throwOnError?: boolean;
  /** Custom error message prefix */
  errorMessage?: string;
}

/**
 * Extract JSON from text that may contain markdown, thinking output, or other artifacts
 *
 * @param text The raw text response from an AI model
 * @param options Configuration for extraction behavior
 * @returns The extracted JSON text, ready for parsing
 * @throws Error if no valid JSON found and throwOnError is true
 */
export function extractJSONFromText(
  text: string,
  options: JSONExtractionOptions = {}
): string {
  const {
    cleanMarkdown = true,
    expectArray = true,
    expectObject = false,
    throwOnError = true,
    errorMessage = 'No valid JSON found in response',
  } = options;

  // Step 1: Clean markdown code blocks if requested
  let cleanedText = text;
  if (cleanMarkdown) {
    cleanedText = text.replace(/```json|```/g, '').trim();
  }

  // Step 2: Find JSON boundaries based on expected type
  let jsonStart = -1;
  let jsonEnd = -1;

  if (expectArray) {
    jsonStart = cleanedText.indexOf('[');
    jsonEnd = cleanedText.lastIndexOf(']') + 1;
  } else if (expectObject) {
    jsonStart = cleanedText.indexOf('{');
    jsonEnd = cleanedText.lastIndexOf('}') + 1;
  } else {
    // Try array first, then object
    const arrayStart = cleanedText.indexOf('[');
    const objectStart = cleanedText.indexOf('{');

    if (arrayStart !== -1 && (objectStart === -1 || arrayStart < objectStart)) {
      jsonStart = arrayStart;
      jsonEnd = cleanedText.lastIndexOf(']') + 1;
    } else if (objectStart !== -1) {
      jsonStart = objectStart;
      jsonEnd = cleanedText.lastIndexOf('}') + 1;
    }
  }

  // Step 3: Validate boundaries
  if (jsonStart === -1 || jsonEnd === 0 || jsonEnd <= jsonStart) {
    if (throwOnError) {
      throw new Error(errorMessage);
    }
    return '';
  }

  // Step 4: Extract JSON text
  const jsonText = cleanedText.substring(jsonStart, jsonEnd);
  return jsonText;
}

/**
 * Extract and parse JSON from text in one operation
 *
 * @param text The raw text response from an AI model
 * @param options Configuration for extraction behavior
 * @returns The parsed JSON object or array
 * @throws Error if extraction or parsing fails
 */
export function extractAndParseJSON<T = unknown>(
  text: string,
  options: JSONExtractionOptions = {}
): T {
  const jsonText = extractJSONFromText(text, options);

  try {
    return JSON.parse(jsonText) as T;
  } catch (parseError) {
    const errorMessage = options.errorMessage || 'Failed to parse JSON from response';
    throw new Error(`${errorMessage}: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
  }
}

/**
 * Extract JSON array specifically (common for game commands)
 *
 * @param text The raw text response from an AI model
 * @param cleanMarkdown Whether to remove markdown code blocks (default: true)
 * @returns The parsed JSON array
 * @throws Error if not a valid array
 */
export function extractJSONArray<T = unknown>(
  text: string,
  cleanMarkdown: boolean = true
): T[] {
  const result = extractAndParseJSON<T[]>(text, {
    cleanMarkdown,
    expectArray: true,
    errorMessage: 'No valid JSON array found in response',
  });

  if (!Array.isArray(result)) {
    throw new Error('Extracted JSON is not an array');
  }

  return result;
}

/**
 * Extract JSON object specifically (common for concept generation)
 *
 * @param text The raw text response from an AI model
 * @param cleanMarkdown Whether to remove markdown code blocks (default: true)
 * @returns The parsed JSON object
 * @throws Error if not a valid object
 */
export function extractJSONObject<T extends object = Record<string, unknown>>(
  text: string,
  cleanMarkdown: boolean = true
): T {
  const result = extractAndParseJSON<T>(text, {
    cleanMarkdown,
    expectObject: true,
    errorMessage: 'No valid JSON object found in response',
  });

  if (typeof result !== 'object' || result === null || Array.isArray(result)) {
    throw new Error('Extracted JSON is not an object');
  }

  return result;
}
