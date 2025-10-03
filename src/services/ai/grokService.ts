import { backendAPIService } from './backendAPIService';

/**
 * Tests the connection to the Grok AI model via the secure backend API.
 * This function is used by the AI Model Selector to verify that the Grok
 * backend is configured and reachable.
 *
 * @param testType - The type of capability to test ('text' or 'image').
 * @returns A promise that resolves with the test result.
 */
export async function testGrokConnection(testType: 'text' | 'image' = 'text'): Promise<{
  success: boolean;
  model: string;
  contextWindow: number;
  testType: string;
  error?: string;
}> {
  console.log(`Testing Grok backend connection for ${testType} capability...`);
  try {
    // The backend's health check can serve as a proxy for this test.
    // A more specific endpoint could be created in the future if needed.
    const isHealthy = await backendAPIService.healthCheck();

    if (isHealthy) {
      console.log('Grok backend connection test successful.');
      return {
        success: true,
        model: 'grok-4-fast-reasoning',
        contextWindow: 2000000,
        testType,
      };
    } else {
      throw new Error('Backend health check failed.');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Grok backend connection test failed:', errorMessage);
    return {
      success: false,
      model: 'grok-4-fast-reasoning',
      contextWindow: 2000000,
      testType,
      error: errorMessage,
    };
  }
}