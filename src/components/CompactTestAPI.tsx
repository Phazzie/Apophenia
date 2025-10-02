
import React from 'react';
import { generateMultipleImages } from '../services/gameService';
import { generateNextStepWithSelectedModel } from '../services/ai/unifiedAIService';
import { useAIModelStore } from '../stores/aiModelStore';
import { WorldState, StorySegment, GenreConfig } from '../types';
import { DEFAULT_GENRE } from '../config/genres';

// Create mock data for testing
const mockGenreConfig: GenreConfig = DEFAULT_GENRE;

const mockWorldState: WorldState = {
  protagonist: 'A test subject',
  setting: 'A sterile, white room',
  dilemma: 'The walls are starting to melt.',
  summary: 'A test of the AI system.',
  psychologicalStatus: 'Stable',
  systemHealth: 100,
  horrorIntensity: 1,
  uiDistortion: { transform: 'none', filter: 'none', transition: '0.5s' },
  genreConfig: mockGenreConfig,
};

const mockStoryHistory: StorySegment[] = [
    { id: 'seg-1', text: 'The experiment began.', images: {} }
];


const CompactTestAPI: React.FC = () => {
  const { getSelectedModel } = useAIModelStore();

  const handleTestImageGeneration = async () => {
    console.log("--- Testing Image Generation ---");
    const prompt = "A desolate, cosmic landscape with swirling nebulae.";
    try {
      const result = await generateMultipleImages(prompt, 2);
      console.log("Image generation service call successful:", result);
    } catch (error) {
      console.error("Image generation service call failed:", error);
    }
    console.log("--- Test Complete ---");
  };

  const generateHorrorStory = async (model: 'groq' | 'gemini') => {
    console.log(`--- Generating story with ${model} ---`);
    const prompt = "Write a 100-word short story about someone's descent into insanity, in a cosmic horror style.";
    try {
      const commands = await generateNextStepWithSelectedModel(
        prompt, // This acts as the "playerChoice"
        mockWorldState,
        mockStoryHistory,
        mockGenreConfig
      );

      // Extract the text from the returned commands
      const textCommand = commands.find(c => c.type === 'displayText');
      const result = textCommand && 'content' in textCommand.payload ? textCommand.payload.content : "No text returned.";

      console.log(`Story from ${model}:`, result);
    } catch (error) {
      console.error(`Story generation with ${model} failed:`, error);
    }
    console.log("--- Test Complete ---");
  };

  return (
    <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
      <button onClick={handleTestImageGeneration} style={{ fontSize: '10px', padding: '2px 5px' }}>
        Test Image Gen
      </button>
      <button onClick={() => generateHorrorStory('groq')} style={{ fontSize: '10px', padding: '2px 5px' }}>
        Story (Groq)
      </button>
      <button onClick={() => generateHorrorStory('gemini')} style={{ fontSize: '10px', padding: '2px 5px' }}>
        Story (Gemini)
      </button>
    </div>
  );
};

export default CompactTestAPI;
