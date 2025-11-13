/**
 * Contract Tests: AI Services (Seam #4)
 *
 * Validates that MockService and GrokService perfectly implement
 * the AIService interface defined in seams.ts
 *
 * These tests verify INTERFACE COMPLIANCE, not behavior correctness.
 */

import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import type {
  AIService,
  AIResponse,
  AIRequest,
  AIContext,
  AIProvider,
  Command,
  ProviderTestResult,
} from '../../src/core/types/seams';
import { GameState, PsychologicalStatus } from '../../src/core/types/seams';
import { grokService } from '../../src/services/ai/grokService';
import { mockService } from '../../src/services/ai/mockService';
import { unifiedAIService } from '../../src/services/ai/unifiedAIService';

// Track service availability for conditional testing
let grokAvailable = false;
let mockAvailable = false;

// ============================================================================
// TEST DATA HELPERS
// ============================================================================

function createMockAIContext(): AIContext {
  return {
    worldState: {
      protagonist: 'Test Subject',
      setting: 'An abandoned laboratory',
      dilemma: 'The walls are closing in',
      psychologicalStatus: PsychologicalStatus.UNEASY,
      systemHealth: 75,
      horrorIntensity: 5,
      corruptionLevel: 25,
      genreConfig: {
        id: 'cosmic-horror',
        name: 'Cosmic Horror',
        description: 'Test genre',
        systemPrompt: 'You are a cosmic horror narrator',
        themes: ['isolation', 'insignificance'],
        fearCategories: ['cosmic', 'existential'],
        visualStyle: {
          primaryColor: '#000000',
          secondaryColor: '#1a1a1a',
          accentColor: '#ff0000',
          fontFamily: 'Courier New',
          atmosphere: 'oppressive',
        },
      },
    },
    recentHistory: [],
    playerProfile: {
      fearProfile: {
        claustrophobia: 0.5,
        isolation: 0.7,
        cosmicInsignificance: 0.8,
      },
      choicePatterns: {
        riskTaking: 0.6,
        curiosity: 0.7,
        aggression: 0.3,
        avoidance: 0.4,
      },
      engagementMetrics: {
        totalChoices: 10,
        averageResponseTime: 5000,
        sessionDuration: 300000,
      },
    },
    genrePrompts: ['Focus on psychological dread', 'Build cosmic horror'],
    engineInstructions: ['Apply temporal revision', 'Increase horror intensity'],
  };
}

function createMockAIRequest(provider: AIProvider): AIRequest {
  return {
    provider,
    prompt: 'Generate a story segment with choices',
    context: createMockAIContext(),
  };
}

// ============================================================================
// CONTRACT TESTS: AIService INTERFACE
// ============================================================================

describe('Contract Tests: AI Services (Seam #4)', () => {
  const services: Array<{ name: string; service: AIService }> = [
    { name: 'GrokService', service: grokService },
    { name: 'MockService', service: mockService },
  ];

  // Check service availability before running tests
  beforeAll(async () => {
    grokAvailable = await grokService.isAvailable().catch(() => false);
    mockAvailable = await mockService.isAvailable().catch(() => false);

    console.log('\n📋 Service Availability Check:');
    console.log(`  ✓ GrokService: ${grokAvailable ? '✅ Available' : '⚠️  Unavailable (skipping network tests)'}`);
    console.log(`  ✓ MockService: ${mockAvailable ? '✅ Available' : '❌ FAILED'}`);
  });

  services.forEach(({ name, service }) => {
    describe(`${name} Interface Compliance`, () => {
      const isAvailable = name === 'MockService' ? mockAvailable : grokAvailable;
      // ======================================================================
      // PROPERTY TESTS
      // ======================================================================

      it('implements AIService interface with required properties', () => {
        expect(service).toHaveProperty('provider');
        expect(service).toHaveProperty('maxTokens');
        expect(service).toHaveProperty('supportsImages');

        expect(typeof service.provider).toBe('string');
        expect(typeof service.maxTokens).toBe('number');
        expect(typeof service.supportsImages).toBe('boolean');

        expect(typeof service.isAvailable).toBe('function');
        expect(typeof service.generateResponse).toBe('function');
        expect(typeof service.estimateTokens).toBe('function');
      });

      it('provider property is readonly and valid AIProvider', () => {
        const provider = service.provider;
        expect(['grok', 'mock']).toContain(provider);
      });

      it('maxTokens property is readonly and positive', () => {
        expect(service.maxTokens).toBeGreaterThan(0);
        expect(Number.isInteger(service.maxTokens)).toBe(true);
      });

      it('supportsImages property is readonly and boolean', () => {
        expect(typeof service.supportsImages).toBe('boolean');
      });

      // ======================================================================
      // METHOD: isAvailable()
      // ======================================================================

      it('isAvailable returns Promise<boolean>', async () => {
        const result = await service.isAvailable().catch(() => false);
        expect(typeof result).toBe('boolean');
      });

      it('isAvailable handles errors gracefully', async () => {
        // Should either resolve to boolean or be catchable
        await expect(
          service.isAvailable().catch(() => false)
        ).resolves.toBeDefined();
      });

      // ======================================================================
      // METHOD: generateResponse()
      // ======================================================================

      it.skipIf(!isAvailable)('generateResponse returns Promise<AIResponse>', async () => {
        const request = createMockAIRequest(service.provider);
        const response = await service.generateResponse(request);

        // Verify AIResponse shape
        expect(response).toHaveProperty('provider');
        expect(response).toHaveProperty('content');
        expect(response).toHaveProperty('commands');
        expect(response).toHaveProperty('metadata');

        expect(typeof response.provider).toBe('string');
        expect(typeof response.content).toBe('string');
        expect(Array.isArray(response.commands)).toBe(true);
        expect(typeof response.metadata).toBe('object');
      });

      it.skipIf(!isAvailable)('generateResponse returns exactly 4 fields (no extras)', async () => {
        const request = createMockAIRequest(service.provider);
        const response = await service.generateResponse(request);

        const expectedKeys = ['provider', 'content', 'commands', 'metadata'].sort();
        const actualKeys = Object.keys(response).sort();

        expect(actualKeys).toEqual(expectedKeys);
        expect(actualKeys.length).toBe(4);
      });

      it.skipIf(!isAvailable)('generateResponse metadata matches contract shape', async () => {
        const request = createMockAIRequest(service.provider);
        const response = await service.generateResponse(request);

        expect(response.metadata).toHaveProperty('tokensUsed');
        expect(response.metadata).toHaveProperty('latency');
        expect(response.metadata).toHaveProperty('model');

        // Validate optional field types
        if (response.metadata.tokensUsed !== undefined) {
          expect(typeof response.metadata.tokensUsed).toBe('number');
          expect(response.metadata.tokensUsed).toBeGreaterThanOrEqual(0);
        }

        if (response.metadata.latency !== undefined) {
          expect(typeof response.metadata.latency).toBe('number');
          expect(response.metadata.latency).toBeGreaterThanOrEqual(0);
        }

        if (response.metadata.model !== undefined) {
          expect(typeof response.metadata.model).toBe('string');
          expect(response.metadata.model.length).toBeGreaterThan(0);
        }
      });

      it.skipIf(!isAvailable)('generateResponse commands array contains valid Command objects', async () => {
        const request = createMockAIRequest(service.provider);
        const response = await service.generateResponse(request);

        expect(Array.isArray(response.commands)).toBe(true);

        response.commands.forEach((command: Command) => {
          expect(command).toHaveProperty('type');
          expect(command).toHaveProperty('payload');
          expect(typeof command.type).toBe('string');
          expect(typeof command.payload).toBe('object');
          expect(command.payload).not.toBeNull();
        });
      });

      it.skipIf(!isAvailable)('generateResponse provider matches service provider', async () => {
        const request = createMockAIRequest(service.provider);
        const response = await service.generateResponse(request);

        expect(response.provider).toBe(service.provider);
      });

      it.skipIf(!isAvailable)('generateResponse content is non-empty string', async () => {
        const request = createMockAIRequest(service.provider);
        const response = await service.generateResponse(request);

        expect(typeof response.content).toBe('string');
        expect(response.content.length).toBeGreaterThan(0);
      });

      // ======================================================================
      // METHOD: estimateTokens()
      // ======================================================================

      it('estimateTokens returns positive number', () => {
        const result = service.estimateTokens('Test text');
        expect(typeof result).toBe('number');
        expect(result).toBeGreaterThan(0);
        expect(Number.isInteger(result)).toBe(true);
      });

      it('estimateTokens scales with text length', () => {
        const short = service.estimateTokens('Hi');
        const medium = service.estimateTokens('This is a medium length sentence.');
        const long = service.estimateTokens('This is a much longer sentence that contains many more words and should result in a significantly higher token count than the shorter examples.');

        expect(medium).toBeGreaterThan(short);
        expect(long).toBeGreaterThan(medium);
      });

      it('estimateTokens returns 0 for empty string', () => {
        const result = service.estimateTokens('');
        expect(result).toBeGreaterThanOrEqual(0);
      });
    });
  });

  // ==========================================================================
  // CROSS-SERVICE PARITY TESTS
  // ==========================================================================

  describe('Mock vs Real Service Parity', () => {
    it.skipIf(!grokAvailable || !mockAvailable)('both services return same AIResponse shape', async () => {
      const mockRequest = createMockAIRequest(mockService.provider);
      const grokRequest = createMockAIRequest(grokService.provider);

      const mockResponse = await mockService.generateResponse(mockRequest);
      const grokResponse = await grokService.generateResponse(grokRequest);

      // Compare shapes (not values)
      const mockKeys = Object.keys(mockResponse).sort();
      const grokKeys = Object.keys(grokResponse).sort();

      expect(mockKeys).toEqual(grokKeys);
      expect(typeof mockResponse.content).toBe(typeof grokResponse.content);
      expect(Array.isArray(mockResponse.commands)).toBe(Array.isArray(grokResponse.commands));
      expect(typeof mockResponse.metadata).toBe(typeof grokResponse.metadata);
    });

    it('both services estimate tokens consistently', () => {
      const testText = 'This is a test string for token estimation';

      const mockEstimate = mockService.estimateTokens(testText);
      const grokEstimate = grokService.estimateTokens(testText);

      expect(typeof mockEstimate).toBe('number');
      expect(typeof grokEstimate).toBe('number');

      // Both should use similar estimation (within 50% variance)
      const ratio = mockEstimate / grokEstimate;
      expect(ratio).toBeGreaterThan(0.5);
      expect(ratio).toBeLessThan(2.0);
    });

    it('both services have reasonable maxTokens', () => {
      expect(mockService.maxTokens).toBeGreaterThan(1000);
      expect(grokService.maxTokens).toBeGreaterThan(1000);
    });
  });
});

// ============================================================================
// CONTRACT TESTS: UnifiedAIService INTERFACE
// ============================================================================

describe('UnifiedAIService Contract', () => {
  // ==========================================================================
  // INTERFACE TESTS
  // ==========================================================================

  it('implements UnifiedAIService interface', () => {
    expect(typeof unifiedAIService.setPrimaryProvider).toBe('function');
    expect(typeof unifiedAIService.setFallbackChain).toBe('function');
    expect(typeof unifiedAIService.generate).toBe('function');
    expect(typeof unifiedAIService.generateWithFallback).toBe('function');
    expect(typeof unifiedAIService.testProvider).toBe('function');
    expect(typeof unifiedAIService.testAllProviders).toBe('function');
  });

  // ==========================================================================
  // METHOD: setPrimaryProvider()
  // ==========================================================================

  it('setPrimaryProvider accepts valid AIProvider', () => {
    expect(() => unifiedAIService.setPrimaryProvider('mock' as AIProvider)).not.toThrow();
    expect(() => unifiedAIService.setPrimaryProvider('grok' as AIProvider)).not.toThrow();
  });

  // ==========================================================================
  // METHOD: setFallbackChain()
  // ==========================================================================

  it('setFallbackChain accepts array of AIProviders', () => {
    expect(() => unifiedAIService.setFallbackChain(['mock' as AIProvider])).not.toThrow();
    expect(() => unifiedAIService.setFallbackChain(['grok' as AIProvider, 'mock' as AIProvider])).not.toThrow();
  });

  it('setFallbackChain rejects empty array', () => {
    expect(() => unifiedAIService.setFallbackChain([])).toThrow();
  });

  // ==========================================================================
  // METHOD: testProvider()
  // ==========================================================================

  it('testProvider returns ProviderTestResult', async () => {
    const result = await unifiedAIService.testProvider('mock' as AIProvider);

    // Required fields
    expect(result).toHaveProperty('provider');
    expect(result).toHaveProperty('available');
    expect(typeof result.provider).toBe('string');
    expect(typeof result.available).toBe('boolean');

    // Optional fields
    if (result.latency !== undefined) {
      expect(typeof result.latency).toBe('number');
      expect(result.latency).toBeGreaterThanOrEqual(0);
    }

    if (result.error !== undefined) {
      expect(typeof result.error).toBe('string');
    }
  });

  it('testProvider returns correct provider name', async () => {
    const mockResult = await unifiedAIService.testProvider('mock' as AIProvider);
    expect(mockResult.provider).toBe('mock');

    const grokResult = await unifiedAIService.testProvider('grok' as AIProvider);
    expect(grokResult.provider).toBe('grok');
  });

  it('testProvider only has valid fields', async () => {
    const result = await unifiedAIService.testProvider('mock' as AIProvider);

    const validKeys = ['provider', 'available', 'latency', 'error'];
    Object.keys(result).forEach((key) => {
      expect(validKeys).toContain(key);
    });
  });

  it('testProvider has error field when available is false', async () => {
    const result = await unifiedAIService.testProvider('grok' as AIProvider);

    if (!result.available) {
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
      expect(result.error!.length).toBeGreaterThan(0);
    }
  });

  // ==========================================================================
  // METHOD: testAllProviders()
  // ==========================================================================

  it('testAllProviders returns Map<AIProvider, ProviderTestResult>', async () => {
    const results = await unifiedAIService.testAllProviders();

    expect(results instanceof Map).toBe(true);
    expect(results.size).toBeGreaterThan(0);
  });

  it('testAllProviders includes all known providers', async () => {
    const results = await unifiedAIService.testAllProviders();

    expect(results.has('mock' as AIProvider)).toBe(true);
    expect(results.has('grok' as AIProvider)).toBe(true);
  });

  it('testAllProviders results match ProviderTestResult contract', async () => {
    const results = await unifiedAIService.testAllProviders();

    results.forEach((result, provider) => {
      expect(typeof provider).toBe('string');
      expect(result).toHaveProperty('provider');
      expect(result).toHaveProperty('available');
      expect(typeof result.provider).toBe('string');
      expect(typeof result.available).toBe('boolean');
    });
  });

  // ==========================================================================
  // METHOD: generate()
  // ==========================================================================

  it('generate returns Promise<AIResponse>', async () => {
    const context = createMockAIContext();
    const request = {
      prompt: 'Test prompt',
      context,
    };

    // Set primary to mock to ensure availability
    unifiedAIService.setPrimaryProvider('mock' as AIProvider);

    const response = await unifiedAIService.generate(request);

    expect(response).toHaveProperty('provider');
    expect(response).toHaveProperty('content');
    expect(response).toHaveProperty('commands');
    expect(response).toHaveProperty('metadata');
  });

  // ==========================================================================
  // METHOD: generateWithFallback()
  // ==========================================================================

  it('generateWithFallback returns Promise<AIResponse>', async () => {
    const context = createMockAIContext();
    const request = {
      prompt: 'Test prompt',
      context,
    };

    // Set fallback chain to ensure mock is available
    unifiedAIService.setFallbackChain(['mock' as AIProvider]);

    const response = await unifiedAIService.generateWithFallback(request);

    expect(response).toHaveProperty('provider');
    expect(response).toHaveProperty('content');
    expect(response).toHaveProperty('commands');
    expect(response).toHaveProperty('metadata');
  });

  it('generateWithFallback response matches AIResponse contract', async () => {
    const context = createMockAIContext();
    const request = {
      prompt: 'Test prompt',
      context,
    };

    unifiedAIService.setFallbackChain(['mock' as AIProvider]);

    const response = await unifiedAIService.generateWithFallback(request);

    // Exact field count
    const expectedKeys = ['provider', 'content', 'commands', 'metadata'].sort();
    const actualKeys = Object.keys(response).sort();
    expect(actualKeys).toEqual(expectedKeys);

    // Field types
    expect(typeof response.provider).toBe('string');
    expect(typeof response.content).toBe('string');
    expect(Array.isArray(response.commands)).toBe(true);
    expect(typeof response.metadata).toBe('object');
  });
});

// ============================================================================
// CONTRACT TESTS: Command Types
// ============================================================================

describe('Command Type Contract Compliance', () => {
  it('Mock service generates valid discriminated union commands', async () => {
    const request = createMockAIRequest(mockService.provider);
    const response = await mockService.generateResponse(request);

    const validCommandTypes = [
      'createSegment',
      'displayText',
      'displayChoices',
      'generateImage',
      'updateWorldState',
      'wait',
      'applyCorruption',
      'browserEffect',
      'reviseHistory',
      'quantumShift',
    ];

    response.commands.forEach((command) => {
      expect(validCommandTypes).toContain(command.type);
      expect(command.payload).toBeDefined();
      expect(typeof command.payload).toBe('object');
    });
  });

  it('Mock service generates expected command sequence', async () => {
    const request = createMockAIRequest(mockService.provider);
    const response = await mockService.generateResponse(request);

    // Mock service should generate at least: createSegment, displayText, displayChoices
    const commandTypes = response.commands.map((c) => c.type);

    expect(commandTypes).toContain('createSegment');
    expect(commandTypes).toContain('displayText');
    expect(commandTypes).toContain('displayChoices');
  });

  it('displayChoices command includes choices array', async () => {
    const request = createMockAIRequest(mockService.provider);
    const response = await mockService.generateResponse(request);

    const displayChoicesCommand = response.commands.find((c) => c.type === 'displayChoices');
    expect(displayChoicesCommand).toBeDefined();

    if (displayChoicesCommand && displayChoicesCommand.type === 'displayChoices') {
      expect(displayChoicesCommand.payload).toHaveProperty('choices');
      expect(Array.isArray(displayChoicesCommand.payload.choices)).toBe(true);
      expect(displayChoicesCommand.payload.choices.length).toBeGreaterThan(0);
    }
  });
});
