/**
 * Demo script for X.AI Multiple Image Generation
 * 
 * This demonstrates the new X.AI image generation capabilities:
 * - Single image generation with X.AI API
 * - Multiple image generation (batch processing)
 * - Fallback chain: X.AI → Imagen → Unsplash
 * - Quality tracking and provider identification
 */

import { xaiClient } from '../src/services/ai/grokService';
import { imageGenerationService } from '../src/services/ai/imageGeneration';
import { generateMultipleImages } from '../src/services/gameService';

async function demoXAIImageGeneration() {
  console.log('🎨 X.AI Multiple Image Generation Demo\n');
  
  // Test 1: Single image generation
  console.log('1. Testing single X.AI image generation...');
  try {
    const singleImage = await xaiClient.generateImage(
      'A cosmic horror scene with tentacles emerging from digital screens', 
      { count: 1, size: '1024x1024', quality: 'hd' }
    );
    
    if (singleImage) {
      console.log('✅ Single image generated successfully');
      console.log(`   Provider: X.AI`);
      console.log(`   Result type: ${Array.isArray(singleImage) ? 'array' : 'string'}`);
    } else {
      console.log('❌ X.AI image generation not available (expected without API key)');
    }
  } catch (error) {
    console.log('❌ X.AI API unavailable:', (error as Error).message);
  }
  
  console.log('\n');
  
  // Test 2: Multiple image generation
  console.log('2. Testing X.AI batch image generation...');
  try {
    const multipleImages = await xaiClient.generateMultipleImages(
      'Lovecraftian horror in a digital void', 
      3, 
      { size: '1024x1024', quality: 'standard' }
    );
    
    if (multipleImages && multipleImages.length > 0) {
      console.log(`✅ Generated ${multipleImages.length} images via X.AI batch API`);
      multipleImages.forEach((url, index) => {
        console.log(`   Image ${index + 1}: ${url.substring(0, 60)}...`);
      });
    } else {
      console.log('❌ X.AI batch generation not available (expected without API key)');
    }
  } catch (error) {
    console.log('❌ X.AI batch API unavailable:', (error as Error).message);
  }
  
  console.log('\n');
  
  // Test 3: Enhanced image generation service
  console.log('3. Testing enhanced image generation service with fallbacks...');
  try {
    const result = await imageGenerationService.generateImageVariations(
      'Eldritch horror awakening in digital consciousness', 
      3
    );
    
    console.log(`✅ Generated ${result.variations.length} image variations`);
    console.log('Quality breakdown:');
    const qualityCount = result.variations.reduce((acc, v) => {
      acc[v.quality] = (acc[v.quality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(qualityCount).forEach(([quality, count]) => {
      const providerName = {
        'xai': 'X.AI',
        'imagen': 'Google Imagen', 
        'unsplash': 'Unsplash (fallback)'
      }[quality] || quality;
      
      console.log(`   ${providerName}: ${count} images`);
    });
    
    console.log(`Selected variation: ${result.selectedIndex} (${result.variations[result.selectedIndex || 0]?.quality})`);
    
  } catch (error) {
    console.log('❌ Image generation service error:', (error as Error).message);
  }
  
  console.log('\n');
  
  // Test 4: Game service integration
  console.log('4. Testing game service multiple image generation...');
  try {
    const gameImages = await generateMultipleImages(
      'Reality glitching into nightmare dimensions',
      3
    );
    
    console.log(`✅ Game service generated ${gameImages.length} images`);
    gameImages.forEach((url, index) => {
      const provider = url.includes('unsplash') ? 'Unsplash' : 
                     url.includes('placeholder') ? 'Placeholder' : 'AI Generated';
      console.log(`   Game Image ${index + 1}: ${provider}`);
    });
    
  } catch (error) {
    console.log('❌ Game service error:', (error as Error).message);
  }
  
  console.log('\n🎯 Demo complete! The system gracefully degrades to fallbacks when X.AI API is not available.');
  console.log('\n💡 To enable X.AI image generation:');
  console.log('   1. Add VITE_XAI_API_KEY to your .env.local file');
  console.log('   2. Restart the development server');
  console.log('   3. X.AI will become the primary image provider');
}

// Run demo if called directly
if (typeof window === 'undefined') {
  demoXAIImageGeneration().catch(console.error);
}

export { demoXAIImageGeneration };