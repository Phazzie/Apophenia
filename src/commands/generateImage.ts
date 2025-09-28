import { generateImage } from '../services/gameService';
import { useStoryHistoryStore } from '../stores/storyHistoryStore';
import { useImageCacheStore } from '../stores/imageCacheStore';
import { Command } from '../types';
import { CommandExecutor } from './command.types';
import { imageGenerationService } from '../services/ai/imageGeneration';

interface RetryAttempt {
  attempt: number;
  timestamp: number;
  error?: string;
}

const retryAttempts = new Map<string, RetryAttempt>();

/**
 * Exponential backoff calculation
 */
function calculateBackoff(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt - 1), 30000); // Max 30 seconds
}

/**
 * Retry logic with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  segmentId: string
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Update retry status tracking
      retryAttempts.set(segmentId, {
        attempt,
        timestamp: Date.now(),
      });
      
      if (attempt > 1) {
        const delay = calculateBackoff(attempt - 1);
        console.log(`Retrying image generation (attempt ${attempt}/${maxAttempts}) after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const result = await fn();
      
      // Clean up retry tracking on success
      retryAttempts.delete(segmentId);
      return result;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Update retry status tracking with error
      retryAttempts.set(segmentId, {
        attempt,
        timestamp: Date.now(),
        error: lastError.message,
      });
      
      console.warn(`Image generation attempt ${attempt}/${maxAttempts} failed:`, lastError.message);
      
      if (attempt === maxAttempts) {
        // Clean up retry tracking on final failure
        retryAttempts.delete(segmentId);
        throw lastError;
      }
    }
  }
  
  throw lastError || new Error('Retry failed with unknown error');
}

export const generateImageExecutor: CommandExecutor = {
  command: 'generateImage',
  execute: async (command: Command) => {
    if (command.type !== 'generateImage') {
      return;
    }

    const { storyHistory, updateSegmentById } = useStoryHistoryStore.getState();
    const { segmentId, prompt } = command.payload;

    const segment = storyHistory.find((s) => s.id === segmentId);
    if (!segment) {
      console.error(`generateImage: Segment with id ${segmentId} not found. Story history length: ${storyHistory.length}`);
      return;
    }

    // Check cache first
    const cachedUrl = useImageCacheStore.getState().getFromCache(prompt);
    if (cachedUrl) {
      console.log('Image found in cache, using cached version');
      updateSegmentById(segmentId, {
        images: {
          ...segment.images,
          main: cachedUrl,
          mainStatus: 'loaded',
        },
      });
      return;
    }

    // Set loading state immediately
    updateSegmentById(segmentId, {
      images: {
        ...segment.images,
        mainStatus: 'loading',
      },
    });

    // Generate the image with retry logic
    try {
      const imageUrl = await retryWithBackoff(async () => {
        // Check current retry state
        const retryState = retryAttempts.get(segmentId);
        if (retryState && retryState.attempt > 1) {
          // Update UI to show retry state
          const currentSegment = useStoryHistoryStore
            .getState()
            .storyHistory.find((s) => s.id === segmentId);
          
          if (currentSegment) {
            updateSegmentById(segmentId, {
              images: {
                ...currentSegment.images,
                mainStatus: 'retrying',
              },
            });
          }
        }
        
        // Try multiple variations first
        const result = await imageGenerationService.generateImageVariations(prompt, 3);
        
        if (result.variations.length > 0) {
          // Use the first variation
          console.log(`Generated ${result.variations.length} image variations, selected: ${result.variations[0].quality}`);
          return result.variations[0].url;
        } else {
          // Fallback to original service
          return await generateImage(prompt);
        }
      }, 3, segmentId);

      // Cache the successful result
      useImageCacheStore.getState().addToCache(prompt, imageUrl);

      // Get current segment state (may have changed during retries)
      const currentSegment = useStoryHistoryStore
        .getState()
        .storyHistory.find((s) => s.id === segmentId);
      if (!currentSegment) return;

      updateSegmentById(segmentId, {
        images: {
          ...currentSegment.images,
          main: imageUrl,
          mainStatus: 'loaded',
        },
      });
      
    } catch (error) {
      console.error('Image generation failed after retries:', error);
      const currentSegment = useStoryHistoryStore
        .getState()
        .storyHistory.find((s) => s.id === segmentId);
      if (!currentSegment) return;
      
      // Set failed state with thematic fallback
      const fallbackUrl = generateThematicFallback(prompt);
      
      updateSegmentById(segmentId, {
        images: {
          ...currentSegment.images,
          main: fallbackUrl,
          mainStatus: 'failed',
        },
      });
    }
  },
};

/**
 * Manual retry function for failed image generations
 * Can be called from UI components to retry a specific segment
 */
export const retryImageGeneration = async (segmentId: string, prompt: string): Promise<void> => {
  console.log(`Manual retry requested for segment ${segmentId}`);
  
  // Clear any existing retry state
  retryAttempts.delete(segmentId);
  
  // Call the executor with a retry command
  const retryCommand: Command = {
    type: 'generateImage',
    payload: { segmentId, prompt }
  };
  
  await generateImageExecutor.execute(retryCommand);
};

/**
 * Get retry status for a segment (useful for UI state)
 */
export const getRetryStatus = (segmentId: string): RetryAttempt | null => {
  return retryAttempts.get(segmentId) || null;
};

/**
 * Generate a thematic fallback image that fits the cosmic horror theme
 */
function generateThematicFallback(prompt: string): string {
  const keywords = prompt.toLowerCase().split(' ').slice(0, 3);
  const themeWords = ['cosmic', 'void', 'whispers', 'shadows', 'unknown'];
  const combinedWords = [...keywords, ...themeWords].join(' ');
  
  const svgContent = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#1a1a2e"/>
          <stop offset="70%" stop-color="#16213e"/>
          <stop offset="100%" stop-color="#0f0f23"/>
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <circle cx="400" cy="300" r="150" fill="none" stroke="#e94560" stroke-width="2" opacity="0.3" stroke-dasharray="5,5">
        <animate attributeName="r" values="150;160;150" dur="4s" repeatCount="indefinite"/>
      </circle>
      <text x="50%" y="45%" font-family="serif" font-size="20" fill="#e94560" text-anchor="middle" dy=".3em" filter="url(#glow)">
        The whispers from beyond grow faint...
      </text>
      <text x="50%" y="55%" font-family="monospace" font-size="12" fill="#666" text-anchor="middle" dy=".3em">
        ${combinedWords}
      </text>
      <text x="50%" y="65%" font-family="monospace" font-size="10" fill="#444" text-anchor="middle" dy=".3em">
        [Image generation failed - cosmic forces disrupted]
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${btoa(svgContent)}`;
}
