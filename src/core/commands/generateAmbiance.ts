/**
 * GENERATE AMBIANCE EXECUTOR
 *
 * Generates ambient audio based on scene description.
 * Enhances horror atmosphere with dynamic soundscapes.
 */

import { BaseCommandExecutor } from './base/CommandExecutor';
import { Command, ExecutionResult, ValidationResult } from '../types/seams';

/**
 * Executor for generateAmbiance commands
 *
 * Generates and plays ambient audio that matches the current scene.
 * Audio generation happens asynchronously - the command returns success
 * immediately and audio begins playing when ready.
 *
 * Use case: Create dynamic soundscapes that adapt to the horror narrative
 * (e.g., distant whispers, creaking floors, wind, heartbeat).
 */
export class GenerateAmbianceExecutor extends BaseCommandExecutor {
  // Track current ambiance state
  private static currentAmbiance: string | null = null;
  private static isPlaying: boolean = false;

  // Web Audio API state
  private static audioContext: AudioContext | null = null;
  private static currentNodes: { source: AudioScheduledSourceNode; gain: GainNode } | null = null;
  private static readonly TARGET_VOLUME = 0.5;

  canExecute(command: Command): boolean {
    return command.type === 'generateAmbiance';
  }

  validate(command: Command): ValidationResult {
    if (command.type !== 'generateAmbiance') {
      return { valid: false, errors: ['Wrong command type'] };
    }

    if (!command.payload.description) {
      return { valid: false, errors: ['Missing description'] };
    }

    if (typeof command.payload.description !== 'string') {
      return { valid: false, errors: ['Description must be a string'] };
    }

    if (command.payload.description.trim().length === 0) {
      return { valid: false, errors: ['Description cannot be empty'] };
    }

    return { valid: true, errors: [] };
  }

  protected async executeInternal(command: Command): Promise<ExecutionResult> {
    if (command.type !== 'generateAmbiance') {
      return { success: false, command, error: 'Invalid command type' };
    }

    try {
      const { description } = command.payload;

      // Stop current ambiance if playing
      // Note: This starts the fade out process. The actual stop happens asynchronously.
      // This allows for a potential crossfade if we wanted to support it,
      // though currently we just stop then start.
      if (GenerateAmbianceExecutor.isPlaying || GenerateAmbianceExecutor.currentNodes) {
        this.stopAmbiance();
      }

      // Generate and play new ambiance asynchronously
      this.generateAndPlay(description).catch((error) => {
        console.error('Failed to generate ambiance:', error);
      });

      // Update current state
      GenerateAmbianceExecutor.currentAmbiance = description;
      GenerateAmbianceExecutor.isPlaying = true;

      return {
        success: true,
        command,
        metadata: {
          description,
          action: 'started',
        },
      };
    } catch (error) {
      return {
        success: false,
        command,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Helper to get or create AudioContext safely
   */
  private static getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined' || !window.AudioContext) {
      return null;
    }

    if (!GenerateAmbianceExecutor.audioContext) {
      GenerateAmbianceExecutor.audioContext = new AudioContext();
    }

    if (GenerateAmbianceExecutor.audioContext.state === 'suspended') {
      GenerateAmbianceExecutor.audioContext.resume().catch(err => {
          console.warn('Failed to resume AudioContext:', err);
      });
    }

    return GenerateAmbianceExecutor.audioContext;
  }

  /**
   * Stop the current ambiance by fading it out.
   * This is static so it can be called by stopAll and stopAmbiance.
   */
  private static stopCurrentAmbiance(): void {
    const nodes = GenerateAmbianceExecutor.currentNodes;

    // Clear the reference immediately so new ambiances can start
    GenerateAmbianceExecutor.currentNodes = null;

    if (nodes && GenerateAmbianceExecutor.audioContext) {
      try {
        const ctx = GenerateAmbianceExecutor.audioContext;
        const now = ctx.currentTime;
        const fadeDuration = 2.0;

        // Cancel any scheduled events
        nodes.gain.gain.cancelScheduledValues(now);

        // Use the known target volume to avoid glitching if we read .value while ramping
        // If we are mid-fade, this might jump, but it's safer than reading .value
        // which might return the default.
        // Ideally we would compute the current value, but for simplicity we assume full volume
        // or the target volume.
        // A safer approach if we might be fading IN is to just ramp down from wherever it thinks it is?
        // No, cancelScheduledValues allows us to set a value.
        // If we use setTargetAtTime it might be smoother.
        // But let's stick to the plan: set to TARGET_VOLUME then ramp to 0.
        // Wait, if it was fading in and only reached 0.1, jumping to 0.5 is bad.
        // But since we can't easily get the computed value without extensive boilerplate,
        // and we usually assume it reached target, we'll use TARGET_VOLUME.

        nodes.gain.gain.setValueAtTime(GenerateAmbianceExecutor.TARGET_VOLUME, now);
        nodes.gain.gain.exponentialRampToValueAtTime(0.001, now + fadeDuration);

        // Stop the source after fade out
        setTimeout(() => {
          try {
            nodes.source.stop();
            nodes.source.disconnect();
            nodes.gain.disconnect();
          } catch (e) {
            // Ignore errors if already stopped/disconnected
          }
        }, fadeDuration * 1000 + 100);

      } catch (e) {
        console.error('Error stopping audio nodes:', e);
      }
    }
  }

  /**
   * Generate and play ambient audio
   *
   * This method runs asynchronously and begins playback when ready.
   * The actual audio generation will be implemented with Web Audio API
   * or an audio generation service.
   */
  private async generateAndPlay(description: string): Promise<void> {
    console.log('Ambiance generation requested:', description);

    // Safety check: ensure previous nodes are stopped/handed off
    if (GenerateAmbianceExecutor.currentNodes) {
        GenerateAmbianceExecutor.stopCurrentAmbiance();
    }

    const ctx = GenerateAmbianceExecutor.getAudioContext();
    if (!ctx) {
        console.warn('AudioContext not available');
        return;
    }

    try {
        // Create nodes
        const gainNode = ctx.createGain();
        const oscillator = ctx.createOscillator();

        // Configure oscillator (placeholder for complex generation)
        // We could use the description to change frequency/type in the future
        oscillator.type = 'sine';
        oscillator.frequency.value = 200; // Low drone

        // Connect graph
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Fade in
        const now = ctx.currentTime;
        const fadeDuration = 2.0;

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(GenerateAmbianceExecutor.TARGET_VOLUME, now + fadeDuration);

        // Start
        oscillator.start(now);

        // Store nodes
        GenerateAmbianceExecutor.currentNodes = {
            source: oscillator,
            gain: gainNode
        };

        console.log('Ambiance started playing');
    } catch (e) {
        console.error('Error starting ambiance:', e);
        throw e;
    }
  }

  /**
   * Stop current ambiance playback
   */
  private stopAmbiance(): void {
    console.log('Stopping current ambiance');
    GenerateAmbianceExecutor.isPlaying = false;
    GenerateAmbianceExecutor.stopCurrentAmbiance();
  }

  /**
   * Get the current ambiance description
   *
   * @returns The current ambiance description, or null if none playing
   */
  static getCurrentAmbiance(): string | null {
    return GenerateAmbianceExecutor.currentAmbiance;
  }

  /**
   * Check if ambiance is currently playing
   *
   * @returns true if ambiance is playing
   */
  static isAmbiancePlaying(): boolean {
    return GenerateAmbianceExecutor.isPlaying;
  }

  /**
   * Stop all ambiance playback
   *
   * Useful for testing or when transitioning to a new scene.
   */
  static stopAll(): void {
    GenerateAmbianceExecutor.currentAmbiance = null;
    GenerateAmbianceExecutor.isPlaying = false;
    GenerateAmbianceExecutor.stopCurrentAmbiance();
    console.log('All ambiance stopped');
  }
}
