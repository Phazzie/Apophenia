// Backend API server for Apophenia
// Keeps API keys secure on the server side
// This removes the need to expose API keys in frontend Vite environment

const express = require('express');
const cors = require('cors');
let genAI;
try {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  // Initialize Google AI with server-side API key if available
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } else {
    console.warn('GEMINI_API_KEY not set. AI features will be disabled or use fallback behavior.');
    genAI = null; // fallback - flows should handle null genAI gracefully
  }
} catch (err) {
  console.error('Failed to initialize GoogleGenerativeAI:', err);
  genAI = null;
}
require('dotenv').config();

// Global error handlers to ensure platform logs capture startup/runtime errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // allow platform to capture stack trace then exit
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Apophenia API Server running' });
});

// Story concept generation endpoint
app.post('/api/generate-concept', async (req, res) => {
  try {
    const { genreConfig } = req.body;
    
    // Use Gemini 2.5 Pro for enhanced concept generation
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro",
      generationConfig: {
        temperature: 1.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });
    
    const prompt = `You are an advanced AI storyteller with access to the full context of cosmic horror narratives. Using the massive 1M token context window, create a deeply atmospheric and interconnected story concept.

Generate a cosmic horror story concept for this genre: ${JSON.stringify(genreConfig)}

Consider the psychological depth, atmospheric details, and potential for narrative branching that will utilize the full context window for character development and story consistency.
    
Return a JSON object with this exact structure:
{
  "protagonist": "detailed character description with psychological depth",
  "setting": "atmospheric location description with cosmic horror elements", 
  "dilemma": "complex central conflict that can evolve over time",
  "atmosphericDetails": "rich mood and atmosphere that can deepen with context",
  "imagePrompt": "detailed image generation prompt for cosmic horror visuals",
  "contextHooks": "elements that will benefit from long-term memory and consistency tracking"
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
    
    // Use Gemini 2.5 Pro with full context optimization
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro",
      generationConfig: {
        temperature: 1.0,
        topK: 0,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });
    
    // Enhanced prompt that utilizes the 1M token context window
    const prompt = `You are an advanced AI with a 1 million token context window. Use this massive memory to maintain perfect consistency and deep character development.

FULL CONTEXT ANALYSIS:
Player Choice: ${playerChoice}
Current World State: ${JSON.stringify(worldState)}
Complete Story History (utilize all for consistency): ${JSON.stringify(history)}
Genre Configuration: ${JSON.stringify(genreConfig)}

ADVANCED CONTEXT UTILIZATION:
1. Character Development Arc: Analyze the protagonist's psychological evolution across ALL previous segments
2. Narrative Consistency: Cross-reference all previous events for perfect continuity
3. Choice Consequence Mapping: Show how this choice connects to all previous decisions
4. Atmospheric Progression: Build upon all previous atmospheric elements
5. Revolutionary Feature Integration: Utilize temporal revision, meta-consciousness, quantum narratives

With your massive context window, create a story continuation that demonstrates perfect memory of all previous events and sophisticated character development.

Return a JSON array of commands with this structure:
[
  {
    "type": "displayText",
    "payload": {
      "content": "story continuation that references and builds upon the entire history",
      "segmentId": "unique-id"
    }
  },
  {
    "type": "displayChoices", 
    "payload": {
      "choices": [
        {"text": "choice 1 that reflects character growth", "isIntrusive": false},
        {"text": "choice 2 that builds on past decisions", "isIntrusive": false}, 
        {"text": "choice 3 that may trigger revolutionary features", "isIntrusive": true}
      ]
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

// Image generation endpoint - Updated to use Gemini 2.5 Flash Image Preview
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Use Gemini 2.5 Flash Image Preview for direct image generation
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-image-preview",
      generationConfig: {
        temperature: 0.9,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 4096,
      }
    });
    
    const enhancedPrompt = `Create a detailed cosmic horror image based on: ${prompt}

Visual Requirements:
- Dark, atmospheric lighting with strategic use of shadows
- Surreal, otherworldly compositions that suggest cosmic scale
- Subtle psychological horror elements that create unease
- Rich textures and atmospheric effects
- Color palette favoring deep purples, blacks, and eerie highlights
- Composition that suggests both intimacy and vast cosmic forces

Generate a high-quality, atmospheric image that captures the essence of cosmic horror while maintaining artistic sophistication.`;

    // Attempt to generate image directly with new model
    const result = await model.generateContent(enhancedPrompt);
    
    // If successful, the response should contain image data
    // For now, we'll also provide enhanced description and fallback
    const description = result.response.text();
    
    res.json({
      description,
      // Enhanced fallback with better keywords derived from description
      fallbackUrl: `https://source.unsplash.com/1920x1080/?dark,horror,cosmic,atmospheric,${encodeURIComponent(prompt.split(' ').slice(0, 3).join(','))}`,
      // Note: When Gemini 2.5 Flash Image Preview is fully available, 
      // we can return the actual generated image here
      imageGenerated: false, // Will be true when direct image generation is working
      model: 'gemini-2.5-flash-image-preview'
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
    
    // Use Gemini 2.5 Pro for enhanced summarization
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro",
      generationConfig: {
        temperature: 0.3,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 4096,
      }
    });
    
    const prompt = `Using your 1 million token context window, create a comprehensive summary that captures the psychological depth and narrative complexity:
    
Current protagonist state: ${worldState.protagonist}
Setting: ${worldState.setting}
Current dilemma: ${worldState.dilemma}
Psychological status: ${worldState.psychologicalStatus}
Last event: ${lastSegment.text}

Create a rich summary that demonstrates understanding of the character's psychological journey and the cosmic horror elements that have shaped their experience.`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();
    
    res.json({ summary });
    
  } catch (error) {
    console.error('History summarization error:', error);
    res.status(500).json({ error: 'Failed to summarize history' });
  }
});

// MEGA-CONTEXT FEATURES: New endpoints utilizing 1M token context

// Mega-Context Session Analysis endpoint
app.post('/api/mega-context-analysis', async (req, res) => {
  try {
    const { fullHistory, worldState, sessionData } = req.body;
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro",
      generationConfig: {
        temperature: 0.7,
        topK: 32,
        topP: 0.9,
        maxOutputTokens: 8192,
      }
    });
    
    const prompt = `MEGA-CONTEXT ANALYSIS: Utilize your full 1 million token context window to perform deep analysis.

COMPLETE SESSION DATA:
Full Story History: ${JSON.stringify(fullHistory)}
Current World State: ${JSON.stringify(worldState)}
Session Data: ${JSON.stringify(sessionData)}

DEEP ANALYSIS REQUIREMENTS:
1. CHARACTER PSYCHOLOGY EVOLUTION: Track every psychological change and its triggers
2. NARRATIVE CONSISTENCY: Identify all established facts and continuity requirements  
3. CHOICE CONSEQUENCE WEB: Map how early choices create ripple effects
4. META-NARRATIVE PATTERNS: Identify overarching themes and hidden connections
5. COSMIC HORROR ELEMENTS: Analyze the progression of cosmic awareness

Return a comprehensive JSON analysis with this structure:
{
  "sessionId": "unique-session-id",
  "totalTokensUsed": estimated_tokens,
  "characterPsychologyProfile": {
    "coreTraits": ["trait1", "trait2"],
    "traumaEvents": ["event1", "event2"],
    "copingMechanisms": ["mechanism1", "mechanism2"],
    "fearProfile": ["fear1", "fear2"],
    "psychologicalEvolution": [
      {
        "segment": number,
        "change": "description",
        "triggers": ["trigger1", "trigger2"],
        "futureImplications": ["implication1", "implication2"]
      }
    ]
  },
  "narrativeConsistencyMap": {
    "establishedFacts": {"fact1": "value1", "fact2": "value2"},
    "characterRelationships": {"rel1": "desc1"},
    "worldRules": {"rule1": "desc1"},
    "continuityRequirements": ["req1", "req2"]
  },
  "choiceConsequenceWeb": [
    {
      "choiceSegment": number,
      "choice": "choice text",
      "immediateEffect": "effect",
      "longTermImplications": ["impl1", "impl2"],
      "affectedSegments": [1, 2, 3],
      "psychologicalImpact": "impact description"
    }
  ],
  "metaNarrativeArc": {
    "overarchingTheme": "theme",
    "hiddenConnections": ["conn1", "conn2"],
    "foreshadowing": ["element1", "element2"],
    "symbolism": {"symbol1": "meaning1"},
    "cosmicSignificance": "significance description"
  }
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      res.json(analysis);
    } else {
      // Fallback analysis
      res.json({
        sessionId: `session-${Date.now()}`,
        totalTokensUsed: fullHistory.length * 1000,
        characterPsychologyProfile: {
          coreTraits: ["Curious", "Analytical", "Vulnerable to cosmic horror"],
          traumaEvents: [],
          copingMechanisms: ["Investigation", "Rationalization"],
          fearProfile: ["Unknown", "Loss of control"],
          psychologicalEvolution: []
        },
        narrativeConsistencyMap: {
          establishedFacts: {},
          characterRelationships: {},
          worldRules: {},
          continuityRequirements: []
        },
        choiceConsequenceWeb: [],
        metaNarrativeArc: {
          overarchingTheme: "Descent into cosmic awareness",
          hiddenConnections: [],
          foreshadowing: [],
          symbolism: {},
          cosmicSignificance: "Player choices ripple across dimensions"
        }
      });
    }
  } catch (error) {
    console.error('Mega-context analysis error:', error);
    res.status(500).json({ error: 'Failed to perform mega-context analysis' });
  }
});

// Cross-Session Continuity endpoint
app.post('/api/cross-session-continuity', async (req, res) => {
  try {
    const { previousSessions, currentWorldState } = req.body;
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro",
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 6144,
      }
    });
    
    const prompt = `CROSS-SESSION CONTINUITY ANALYSIS: Use your massive context window to maintain perfect continuity across gaming sessions.

PREVIOUS SESSIONS: ${JSON.stringify(previousSessions)}
CURRENT WORLD STATE: ${JSON.stringify(currentWorldState)}

CONTINUITY ANALYSIS:
1. Identify recurring elements that should carry forward
2. Establish thematic connections between sessions
3. Track character evolution across sessions
4. Map cosmic connections and overarching narrative

Return JSON with this structure:
{
  "continuityElements": ["element1", "element2"],
  "recurringThemes": ["theme1", "theme2"],
  "characterEvolution": ["evolution1", "evolution2"],
  "cosmicConnections": ["connection1", "connection2"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const continuity = JSON.parse(jsonMatch[0]);
      res.json(continuity);
    } else {
      res.json({
        continuityElements: ["Cosmic entities persist", "Dimensional instability grows"],
        recurringThemes: ["Reality fragmentation", "Knowledge corruption"],
        characterEvolution: ["Increased cosmic awareness", "Psychological hardening"],
        cosmicConnections: ["All sessions exist in shared multiverse"]
      });
    }
  } catch (error) {
    console.error('Cross-session continuity error:', error);
    res.status(500).json({ error: 'Failed to establish continuity' });
  }
});

// Optional readiness endpoint (lightweight now, can expand later)
app.get('/api/ready', (req, res) => {
  // In future: check external dependencies, warmed caches, etc.
  res.json({ ready: true, timestamp: Date.now() });
});

// Ensure root path responds (App Platform may probe '/'). Redirect to /api/ready.
app.get('/', (req, res) => {
  // Simple OK for health checks at root
  res.json({ ready: true, path: '/', timestamp: Date.now() });
});

// Optional static file serving for unified deployment scenario
if (process.env.SERVE_STATIC === 'true') {
  const path = require('path');
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));

  // SPA fallback
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// MCP server routes
const mcpRoutes = require('./server/mcpServer');

// Mount MCP control routes under /mcp
app.use('/mcp', mcpRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Apophenia API Server running on port ${PORT}`);
  console.log(`📡 Endpoints available at http://localhost:${PORT}/api/*`);
});

module.exports = app;