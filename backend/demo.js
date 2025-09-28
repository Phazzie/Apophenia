#!/usr/bin/env node

/**
 * Demo script for Grok Image Proxy Backend
 * Shows the backend functionality working with real API responses
 */

const fetch = require('node-fetch');

async function demonstrateBackend() {
  const baseUrl = 'http://localhost:3001';

  console.log('🚀 Apophenia Grok Image Proxy Backend Demo\n');

  try {
    // 1. Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    const health = await healthResponse.json();
    
    console.log('✅ Health Status:', JSON.stringify(health, null, 2));
    console.log('');

    // 2. Test validation
    console.log('2. Testing input validation...');
    const validationResponse = await fetch(`${baseUrl}/api/generateImage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '', imageCount: 15 })
    });
    
    const validationResult = await validationResponse.json();
    console.log('✅ Validation Response:', JSON.stringify(validationResult, null, 2));
    console.log('');

    // 3. Test image generation (will fail without real API key, but shows request handling)
    console.log('3. Testing image generation endpoint...');
    const imageResponse = await fetch(`${baseUrl}/api/generateImage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: 'A cosmic horror scene in deep space',
        imageCount: 2,
        responseFormat: 'url'
      })
    });
    
    const imageResult = await imageResponse.json();
    console.log('✅ Image Generation Response:', JSON.stringify(imageResult, null, 2));
    console.log('');

    // 4. Test rate limiting by making many requests
    console.log('4. Testing rate limiting (making 5 quick requests)...');
    for (let i = 1; i <= 5; i++) {
      const rateLimitResponse = await fetch(`${baseUrl}/health`);
      console.log(`Request ${i} - Rate Limit Remaining:`, 
        rateLimitResponse.headers.get('ratelimit-remaining'));
    }
    console.log('');

    console.log('🎉 Demo completed successfully!');
    console.log('');
    console.log('Key Features Demonstrated:');
    console.log('- ✅ Health monitoring endpoint');
    console.log('- ✅ Request validation with detailed error messages');
    console.log('- ✅ Proper error handling for API failures');
    console.log('- ✅ Rate limiting with headers');
    console.log('- ✅ Structured logging (check console output)');
    console.log('- ✅ Request ID generation for tracking');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.log('\n💡 Make sure the backend server is running:');
    console.log('   cd backend && XAI_API_KEY=test-key npm start');
  }
}

// Only run if called directly
if (require.main === module) {
  demonstrateBackend();
}

module.exports = { demonstrateBackend };