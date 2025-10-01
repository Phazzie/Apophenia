const { imageGenerationService } = require('./imageGeneration');

const testImageGeneration = async () => {
  console.log('--- Testing Image Generation ---');
  const prompt = 'A desolate, cosmic landscape with swirling nebulae.';
  try {
    const result = await imageGenerationService.generateImageVariations(prompt);
    console.log('Image generation service call successful:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Image generation service call failed:', error);
  }
  console.log('--- Test Complete ---');
};

testImageGeneration();
