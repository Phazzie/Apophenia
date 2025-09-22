// Backend API server for Apophenia
// Keeps API keys secure on the server side
// This removes the need to expose API keys in frontend Vite environment

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Google AI with server-side API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Apophenia API Server running' });
});

// Story concept generation endpoint
app.post('/api/generate-concept', async (req, res) => {
  try {
    const { genreConfig } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-experimental" });
    
    const prompt = `Generate a cosmic horror story concept for this genre: ${JSON.stringify(genreConfig)}
    
Return a JSON object with this exact structure:
{
  "protagonist": "character description",
  "setting": "location description", 
  "dilemma": "central conflict",
  "atmosphericDetails": "mood and atmosphere",
  "imagePrompt": "detailed image generation prompt"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const concept = JSON.parse(jsonMatch[0]);
      res.json(concept);
    } else {
      // Fallback response
      res.json({
        protagonist: "A researcher investigating anomalous phenomena",
        setting: "An abandoned research facility in the Arctic",
        dilemma: "Strange signals are affecting reality itself",
        atmosphericDetails: "Cold, sterile corridors echo with impossible sounds",
        imagePrompt: "Abandoned Arctic research station, eerie lighting, cosmic horror atmosphere"
      });
    }
  } catch (error) {
    console.error('Concept generation error:', error);
    res.status(500).json({ error: 'Failed to generate concept' });
  }
});

// Story progression endpoint
app.post('/api/next-step', async (req, res) => {
  try {
    const { playerChoice, worldState, history, genreConfig } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-experimental" });
    
    const prompt = `Continue this cosmic horror story based on player choice: ${playerChoice}
    
Current world state: ${JSON.stringify(worldState)}
Recent history: ${JSON.stringify(history.slice(-3))}

Return a JSON array of commands with this structure:
[
  {
    "type": "displayText",
    "payload": {
      "text": "story continuation text",
      "segmentId": "unique-id"
    }
  },
  {
    "type": "displayChoices", 
    "payload": {
      "choices": ["choice 1", "choice 2", "choice 3"]
    }
  }
]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const commands = JSON.parse(jsonMatch[0]);
      res.json({ commands });
    } else {
      // Fallback response
      res.json({
        commands: [
          {
            type: "displayText",
            payload: {
              text: "The cosmic forces continue to manifest around you, reality bending in impossible ways.",
              segmentId: `fallback-${Date.now()}`
            }
          },
          {
            type: "displayChoices",
            payload: {
              choices: [
                "Continue investigating",
                "Retreat to safety",
                "Embrace the unknown"
              ]
            }
          }
        ]
      });
    }
  } catch (error) {
    console.error('Next step generation error:', error);
    res.status(500).json({ error: 'Failed to generate next step' });
  }
});

// Image generation endpoint
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const enhancedPrompt = `Create a detailed description for an image generation AI: ${prompt}. 
Focus on atmospheric cosmic horror elements, dark lighting, surreal compositions, and otherworldly aesthetics.`;

    const result = await model.generateContent(enhancedPrompt);
    const description = result.response.text();
    
    // For now, return description and fallback to Unsplash
    // In production, this could be sent to an actual image generation service
    res.json({
      description,
      fallbackUrl: `https://source.unsplash.com/1920x1080/?dark,horror,cosmic,${encodeURIComponent(prompt.split(' ').slice(0, 3).join(','))}`
    });
    
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

// History summarization endpoint
app.post('/api/summarize-history', async (req, res) => {
  try {
    const { worldState, lastSegment } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `Summarize this cosmic horror story progress in 2-3 sentences:
    
Current protagonist state: ${worldState.protagonist}
Setting: ${worldState.setting}
Current dilemma: ${worldState.dilemma}
Psychological status: ${worldState.psychologicalStatus}
Last event: ${lastSegment.text}

Create a concise summary that captures the protagonist's current situation and mental state in the cosmic horror narrative.`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();
    
    res.json({ summary });
    
  } catch (error) {
    console.error('History summarization error:', error);
    res.status(500).json({ error: 'Failed to summarize history' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Apophenia API Server running on port ${PORT}`);
  console.log(`📡 Endpoints available at http://localhost:${PORT}/api/*`);
});

module.exports = app;