
import React from 'react';
import { imageGenerationService } from '../services/ai/imageGeneration';
import { unifiedAIService } from '../services/ai/unifiedAIService';
import { useAIModelStore } from '../stores/aiModelStore';

const CompactTestAPI: React.FC = () => {
  const { getSelectedModel } = useAIModelStore();

  const handleTestImageGeneration = async () => {
    console.log("--- Testing Image Generation ---");
    const prompt = "A desolate, cosmic landscape with swirling nebulae.";
    try {
      const result = await imageGenerationService.generateImageVariations(prompt);
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
      const result = await unifiedAIService.generateText({
        prompt,
        model: getSelectedModel()?.id || 'default', // Or specify a model directly
      });
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
