/**
 * Unsplash Fallback Utilities
 * Consolidated logic for generating Unsplash fallback URLs with horror keywords
 */

/**
 * Base horror keywords for Unsplash searches
 */
const HORROR_KEYWORDS = [
  'dark',
  'horror',
  'nightmare',
  'cosmic',
  'surreal',
  'atmospheric',
  'eerie',
  'ominous',
  'mysterious',
  'otherworldly',
  'abstract',
  'shadows',
] as const;

/**
 * Extract meaningful keywords from a prompt
 * @param prompt The image generation prompt
 * @param maxWords Maximum number of words to extract
 * @returns Comma-separated keywords
 */
export function extractPromptKeywords(prompt: string, maxWords: number = 2): string {
  const keywords = prompt
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter((word) => word.length > 3)
    .slice(0, maxWords)
    .join(',');

  return keywords;
}

/**
 * Select random horror keywords for variety
 * @param count Number of keywords to select
 * @returns Comma-separated horror keywords
 */
export function selectRandomHorrorKeywords(count: number = 3): string {
  const shuffled = [...HORROR_KEYWORDS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).join(',');
}

/**
 * Generate Unsplash URL with horror-specific keywords
 * @param prompt The original image prompt
 * @param width Image width (default: 1920)
 * @param height Image height (default: 1080)
 * @returns Unsplash source URL with horror keywords
 */
export function generateUnsplashUrl(
  prompt: string,
  width: number = 1920,
  height: number = 1080
): string {
  const horrorKeywords = selectRandomHorrorKeywords(3);
  const promptKeywords = extractPromptKeywords(prompt, 2);

  const keywords = promptKeywords
    ? `${horrorKeywords},${promptKeywords}`
    : horrorKeywords;

  const imageUrl = `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(keywords)}`;

  console.log(`Generated Unsplash URL with keywords: ${keywords}`);
  return imageUrl;
}

/**
 * Extract horror-relevant keywords from a prompt
 * Backward compatibility method for existing code
 * @param prompt The image prompt
 * @returns Array of horror keywords
 */
export function extractHorrorKeywords(prompt: string): string[] {
  const baseKeywords = ['horror', 'dark', 'eerie', 'shadows', 'abandoned', 'mysterious'];
  const promptWords = prompt.toLowerCase().split(' ');

  // Extract relevant words from prompt
  const relevantWords = promptWords.filter(
    (word) =>
      word.length > 3 &&
      !['the', 'and', 'but', 'for', 'are', 'with', 'that', 'this'].includes(word)
  );

  return [...relevantWords.slice(0, 3), ...baseKeywords];
}
