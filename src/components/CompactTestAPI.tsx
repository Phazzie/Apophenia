<<<<<<< audit-todo-system-13448203675236679220
// #TODO DEPRECATED: This file is part of the Legacy System. Migrate logic to src/ui/ and delete.
=======
// #TODO DEPRECATED: Migrate to src/ui and use src/core/state.
>>>>>>> feature/main

import React from 'react';
import { generateMultipleImages } from '../services/gameService';
import { generateNextStepWithSelectedModel } from '../services/ai/unifiedAIService';
import { useAIModelStore } from '../stores/aiModelStore';
import { WorldState, StorySegment, GenreConfig, PsychologicalStatus } from '../types';
import { DEFAULT_GENRE } from '../config/genres';

// Create mock data for testing
const mockGenreConfig: GenreConfig = DEFAULT_GENRE;

const mockWorldState: WorldState = {
  protagonist: 'A test subject',
  setting: 'A sterile, white room',
  dilemma: 'The walls are starting to melt.',
  summary: 'A test of the AI system.',
  psychologicalStatus: PsychologicalStatus.STABLE,
  systemHealth: 100,
  horrorIntensity: 1,
  corruptionLevel: 0,
  genreConfig: mockGenreConfig,
};

const mockStoryHistory: StorySegment[] = [
    { id: 'seg-1', text: 'The experiment began.', images: {}, timestamp: Date.now() }
];


const CompactTestAPI: React.FC = () => {
  const { getSelectedModel } = useAIModelStore();

  const handleTestImageGeneration = async () => {
    console.log("--- Testing Image Generation ---");
    const prompts = [
      "A desolate, cosmic landscape with swirling nebulae.",
      "A dark, mysterious void with distant stars."
    ];
    try {
      const result = await generateMultipleImages(prompts);
      console.log("Image generation service call successful:", result);
    } catch (error) {
      console.error("Image generation service call failed:", error);
    }
    console.log("--- Test Complete ---");
  };

  const generateHorrorStory = async () => {
    console.log('--- Generating story with selected AI model ---');
    const prompt = "Write a 100-word short story about someone's descent into insanity, in a cosmic horror style.";
    try {
      // Create mock player profile for testing
      const mockPlayerProfile = {
        fearProfile: {
          cosmicInsignificance: 0.7,
          madness: 0.6,
          isolation: 0.5,
        },
        choicePatterns: {
          riskTaking: 0.5,
          curiosity: 0.8,
          aggression: 0.2,
          avoidance: 0.3,
        },
        engagementMetrics: {
          totalChoices: 1,
          averageResponseTime: 5000,
          sessionDuration: 60000,
        },
      };

      const response = await generateNextStepWithSelectedModel({
        prompt,
        context: {
          worldState: mockWorldState,
          recentHistory: mockStoryHistory,
          playerProfile: mockPlayerProfile,
          genrePrompts: [mockGenreConfig.systemPrompt],
          engineInstructions: [],
        },
      });

      // Extract the text from the response
      const result = response.content || "No text returned.";

      console.log('Story generated:', result);
    } catch (error) {
      console.error('Story generation failed:', error);
    }
    console.log("--- Test Complete ---");
  };

  return (
    <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
      <button onClick={handleTestImageGeneration} style={{ fontSize: '10px', padding: '2px 5px' }}>
        Test Image Gen
      </button>
      <button onClick={generateHorrorStory} style={{ fontSize: '10px', padding: '2px 5px' }}>
        Test Story Gen
      </button>
    </div>
  );
};

export default CompactTestAPI;
