/**
 * Mock AI Service - Rich demo data for development
 *
 * Implements AIService interface from seams.ts
 * Provides realistic command sequences without requiring API keys
 */

import {
  AIService,
  AIProvider,
  AIRequest,
  AIResponse,
  Command,
} from '../../core/types/seams';

export class MockService implements AIService {
  readonly provider = AIProvider.MOCK;
  readonly maxTokens = 100000;
  readonly supportsImages = false;

  private narrativeCounter = 0;

  async isAvailable(): Promise<boolean> {
    // Mock service is always available
    return true;
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    // Simulate network latency
    await this.delay(500 + Math.random() * 1000);

    const commands = this.generateMockCommands(request);

    return {
      provider: this.provider,
      content: JSON.stringify(commands, null, 2),
      commands,
      metadata: {
        tokensUsed: Math.floor(Math.random() * 1000) + 500,
        latency: 800,
        model: 'mock-v1',
      },
    };
  }

  estimateTokens(text: string): number {
    // Simple estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Generate realistic mock commands based on request context
   */
  private generateMockCommands(request: AIRequest): Command[] {
    const { context } = request;
    const segmentId = `seg-${Date.now()}-${this.narrativeCounter++}`;

    const commands: Command[] = [];

    // 1. Create segment
    commands.push({
      type: 'createSegment',
      payload: { id: segmentId },
    });

    // 2. Display narrative text
    const narrativeText = this.generateMockNarrative(context);
    commands.push({
      type: 'displayText',
      payload: {
        content: narrativeText,
        segmentId,
      },
    });

    // 3. Optionally generate image (50% chance)
    if (Math.random() > 0.5) {
      commands.push({
        type: 'generateImage',
        payload: {
          prompt: this.generateMockImagePrompt(context),
          segmentId,
          priority: 'low' as const,
        },
      });
    }

    // 4. Update world state (increase horror, maybe decrease health)
    if (context.worldState.horrorIntensity < 10) {
      commands.push({
        type: 'updateWorldState',
        payload: {
          horrorIntensity: Math.min(10, context.worldState.horrorIntensity + 0.5),
          systemHealth: Math.max(0, context.worldState.systemHealth - 5),
        },
      });
    }

    // 5. Possibly apply corruption (if horror is high)
    if (context.worldState.horrorIntensity > 6 && Math.random() > 0.6) {
      const corruptionIncrease = Math.floor(Math.random() * 15) + 5;
      commands.push({
        type: 'applyCorruption',
        payload: {
          level: Math.min(100, context.worldState.corruptionLevel + corruptionIncrease),
          effects: ['hueShift', 'glitchText', 'distortImages'],
        },
      });
    }

    // 6. Display choices
    const choices = this.generateMockChoices(context);
    const intrusiveThought = Math.random() > 0.7 ? this.generateIntrusiveThought(context) : undefined;

    commands.push({
      type: 'displayChoices',
      payload: {
        choices,
        intrusiveThought,
      },
    });

    // 7. Possibly trigger a browser effect (if corruption is very high)
    if (context.worldState.corruptionLevel > 70 && Math.random() > 0.8) {
      commands.push({
        type: 'browserEffect',
        payload: {
          type: 'changeTitle',
          value: 'THEY ARE WATCHING YOU',
        },
      });
    }

    return commands;
  }

  /**
   * Generate mock narrative text
   */
  private generateMockNarrative(context: any): string {
    const narratives = [
      `The shadows in ${context.worldState.setting} seem to move independently of any light source. ${context.worldState.protagonist} notices patterns that shouldn't exist—fractals of impossible geometry that hurt to look at directly.`,
      `Time feels wrong here. ${context.worldState.protagonist} can't remember if they've been here for minutes or hours. The walls whisper in frequencies just below perception.`,
      `Reality fractures at the edges. ${context.worldState.protagonist} sees themselves in the reflection, but the reflection moves a fraction of a second too late. Or too early. It's hard to tell which is more disturbing.`,
      `The air tastes like copper and forgotten memories. ${context.worldState.protagonist} realizes they've been walking in circles, but somehow they're deeper than before. Much deeper.`,
      `Something is watching. Not with eyes, but with the absence of eyes. ${context.worldState.protagonist} feels the weight of impossible attention pressing down from dimensions they can't perceive.`,
      `The narrative begins to repeat itself, but with subtle variations. Words appear that weren't there before. ${context.worldState.protagonist} wonders if they're losing their mind, or if their mind is losing them.`,
    ];

    const index = this.narrativeCounter % narratives.length;
    return narratives[index];
  }

  /**
   * Generate mock image prompt
   */
  private generateMockImagePrompt(context: any): string {
    const prompts = [
      `Dark corridor in ${context.worldState.setting}, impossible geometry, ${context.worldState.genreConfig.visualStyle.atmosphere} atmosphere`,
      `Abstract horror, cosmic insignificance, void staring back, ${context.worldState.genreConfig.visualStyle.primaryColor} tones`,
      `Fractured reality, glitch art, psychological horror, ${context.worldState.genreConfig.visualStyle.atmosphere}`,
      `Shadowy figure watching from dimensions beyond comprehension, unsettling`,
      `Corrupted memory, digital decay, reality breaking down, disturbing`,
    ];

    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  /**
   * Generate mock choices
   */
  private generateMockChoices(context: any): any[] {
    const choiceSets = [
      [
        {
          id: `choice-${Date.now()}-1`,
          text: 'Investigate the source of the whispers',
          psychologicalWeight: 0.7,
        },
        {
          id: `choice-${Date.now()}-2`,
          text: 'Try to find a way back',
          psychologicalWeight: 0.3,
        },
        {
          id: `choice-${Date.now()}-3`,
          text: 'Embrace the impossible geometry',
          psychologicalWeight: 0.9,
        },
      ],
      [
        {
          id: `choice-${Date.now()}-1`,
          text: 'Look directly at the reflection',
          psychologicalWeight: 0.8,
        },
        {
          id: `choice-${Date.now()}-2`,
          text: 'Close your eyes and count to ten',
          psychologicalWeight: 0.4,
        },
        {
          id: `choice-${Date.now()}-3`,
          text: 'Break the mirror',
          psychologicalWeight: 0.6,
        },
      ],
      [
        {
          id: `choice-${Date.now()}-1`,
          text: 'Call out to the presence',
          psychologicalWeight: 0.75,
        },
        {
          id: `choice-${Date.now()}-2`,
          text: 'Hide and wait for it to pass',
          psychologicalWeight: 0.5,
        },
        {
          id: `choice-${Date.now()}-3`,
          text: 'Try to understand what it wants',
          psychologicalWeight: 0.85,
        },
      ],
    ];

    return choiceSets[this.narrativeCounter % choiceSets.length];
  }

  /**
   * Generate an intrusive thought
   */
  private generateIntrusiveThought(context: any): any {
    const thoughts = [
      {
        id: `intrusive-${Date.now()}`,
        text: 'SUBMIT TO THE VOID',
        isIntrusive: true,
        psychologicalWeight: 1.0,
      },
      {
        id: `intrusive-${Date.now()}`,
        text: 'You were never real to begin with',
        isIntrusive: true,
        psychologicalWeight: 1.0,
      },
      {
        id: `intrusive-${Date.now()}`,
        text: 'Let the corruption take you',
        isIntrusive: true,
        psychologicalWeight: 1.0,
      },
    ];

    return thoughts[Math.floor(Math.random() * thoughts.length)];
  }

  /**
   * Simulate async delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const mockService = new MockService();
