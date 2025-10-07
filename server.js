// Backend API server for Apophenia
// Keeps API keys secure on the server side
// This removes the need to expose API keys in frontend Vite environment

import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';
import path from 'path';
import mcpRoutes from './server/mcpServer.js';
import admin from 'firebase-admin';

// --- Firebase Admin SDK Initialization ---
try {
  const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  // Exit if Firebase initialization fails, as it's critical for the application
  process.exit(1);
}

export const db = admin.firestore();

let genAI;
try {
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

// --- Static file serving for production ---\n// This block must be placed before any API routes to ensure the frontend is served correctly.
if (process.env.SERVE_STATIC === 'true') {
  const __dirname = path.resolve(path.dirname(''));
  const distPath = path.join(__dirname, 'dist');

  // Serve the static files from the React app
  app.use(express.static(distPath));

  // Handle all other routes by serving the index.html
  // This is for Single Page Application (SPA) routing
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Apophenia API Server running' });
});

// User login/creation endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username is required.' });
    }

    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('username', '==', username).limit(1).get();

    if (snapshot.empty) {
      // User does not exist, create a new one
      const newUserRef = await usersRef.add({
        username,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      res.status(201).json({ id: newUserRef.id, username });
    } else {
      // User exists, return their data
      const userDoc = snapshot.docs[0];
      res.status(200).json({ id: userDoc.id, ...userDoc.data() });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to log in or create user.' });
  }
});

// Story concept generation and new game session endpoint
app.post('/api/generate-concept', async (req, res) => {
  try {
    const { genreConfig, userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required to start a new game.' });
    }

    // --- Global Narrative Engine: Read ---
    const globalNarrativeRef = db.collection('global_narrative').doc('main');
    let globalNarrativeDoc = await globalNarrativeRef.get();
    if (!globalNarrativeDoc.exists) {
      await globalNarrativeRef.set({
        totalCorruptionEvents: 0,
        dominantTheme: 'paranoia',
        lastMajorEvent: 'The Awakening',
      });
      globalNarrativeDoc = await globalNarrativeRef.get();
    }
    const globalNarrativeData = globalNarrativeDoc.data();

    // --- Player Ghost System: Read ---
    const playerProfileRef = db.collection('player_profiles').doc(userId);
    const playerProfileDoc = await playerProfileRef.get();
    let playerProfileData = null;
    if (playerProfileDoc.exists) {
      playerProfileData = playerProfileDoc.data();
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    let prompt = `The collective consciousness of all players has shaped the world. The current global state is:
- Total Corruption Events: ${globalNarrativeData.totalCorruptionEvents}
- Dominant Theme: ${globalNarrativeData.dominantTheme}
- Last Major Event: ${globalNarrativeData.lastMajorEvent}\n`;

    if (playerProfileData) {
      prompt += `\nThis player's "ghost" haunts this session. Their past actions have revealed the following psychological profile:
- Dominant Traits: ${playerProfileData.dominantTraits.join(', ')}
- Primary Fear: ${playerProfileData.primaryFear}
- Decision Style: ${playerProfileData.decisionStyle}\n`;
    }

    prompt += `\nGenerate a new cosmic horror story concept for this genre: ${JSON.stringify(
      genreConfig,
    )}. The concept should be subtly influenced by the global state and the player's psychological profile (if available). Return a JSON object with keys: "protagonist", "setting", "dilemma".`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const concept = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);

    const initialWorldState = {
      ...concept,
      psychologicalStatus: 'Stable',
      horrorIntensity: 0,
      systemHealth: 100,
      genreConfig: genreConfig,
      globalInfluence: {
        corruptionEvents: globalNarrativeData.totalCorruptionEvents,
        dominantTheme: globalNarrativeData.dominantTheme,
      },
    };

    const initialStoryHistory = [{
      id: `seg-${Date.now()}`,
      text: concept.setting,
      commandSource: 'system',
      timestamp: new Date().toISOString(),
    }];

    const newSessionRef = await db.collection('game_sessions').add({
      userId,
      worldState: initialWorldState,
      storyHistory: initialStoryHistory,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      sessionId: newSessionRef.id,
      worldState: initialWorldState,
      storyHistory: initialStoryHistory,
    });
  } catch (error) {
    console.error('Concept generation error:', error);
    res.status(500).json({ error: 'Failed to generate concept and create game session.' });
  }
});

// Story progression endpoint
app.post('/api/next-step', async (req, res) => {
  try {
    const { playerChoice, sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required.' });
    }

    const sessionRef = db.collection('game_sessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return res.status(404).json({ error: 'Game session not found.' });
    }

    const sessionData = sessionDoc.data();
    const { userId, worldState, storyHistory, genreConfig } = sessionData;

    // --- Narrative Echoes: Read ---
    let narrativeEcho = null;
    if (Math.random() < 0.25) { // 25% chance to encounter an echo
      const echoesSnapshot = await db.collection('narrative_echoes')
        .where('userId', '!=', userId)
        .limit(1)
        .get();
      if (!echoesSnapshot.empty) {
        narrativeEcho = echoesSnapshot.docs[0].data();
      }
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    let prompt = `Based on the following context, generate the next step in the story.
Player Choice: ${playerChoice}
World State: ${JSON.stringify(worldState)}
Story History: ${JSON.stringify(storyHistory)}
Genre: ${JSON.stringify(genreConfig)}\n`;

    if (narrativeEcho) {
      prompt += `\nA faint memory from another reality surfaces: "${narrativeEcho.text}" Weave this echo into the narrative.`;
    }

    prompt += "\nReturn a JSON array of commands.";

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const { commands } = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);

    const newHistory = [...storyHistory];
    let newWorldState = { ...worldState };
    let significantEvent = false;
    let eventDescription = '';
    let echoText = null;

    commands.forEach(command => {
      if (command.type === 'displayText') {
        newHistory.push({
          id: command.payload.segmentId,
          text: command.payload.content,
          commandSource: 'ai',
          timestamp: new Date().toISOString(),
        });
        // Capture text for potential echo
        echoText = command.payload.content;
      }
      if (command.type === 'updateWorldState') {
        if (command.payload.horrorIntensity && command.payload.horrorIntensity > worldState.horrorIntensity) {
          significantEvent = true;
          eventDescription = `Horror intensity escalated to ${command.payload.horrorIntensity}.`;
        }
        newWorldState = { ...newWorldState, ...command.payload };
      }
    });

    if (significantEvent) {
      const globalNarrativeRef = db.collection('global_narrative').doc('main');
      await globalNarrativeRef.update({
        totalCorruptionEvents: admin.firestore.FieldValue.increment(1),
        lastMajorEvent: eventDescription,
      });

      // --- Narrative Echoes: Write ---
      if (echoText) {
        await db.collection('narrative_echoes').add({
          userId,
          sessionId,
          text: echoText,
          worldStateAtEcho: newWorldState,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    await sessionRef.update({
      worldState: newWorldState,
      storyHistory: newHistory,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ commands });
  } catch (error) {
    console.error('Next step generation error:', error);
    res.status(500).json({ error: 'Failed to generate next step.' });
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
    // For now, we\'ll also provide enhanced description and fallback
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

Create a rich summary that demonstrates understanding of the character\'s psychological journey and the cosmic horror elements that have shaped their experience.`;

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

// End-game analysis endpoint for Player Ghost system
app.post('/api/end-game-analysis', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required.' });
    }

    const sessionRef = db.collection('game_sessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return res.status(404).json({ error: 'Game session not found.' });
    }

    const { userId, worldState, storyHistory } = sessionDoc.data();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = `Analyze the following completed game session and generate a concise psychological profile of the player.
Final World State: ${JSON.stringify(worldState)}
Full Story History: ${JSON.stringify(storyHistory)}
Based on their choices, describe their primary traits, fears, and decision-making patterns. Return a JSON object with keys: "dominantTraits", "primaryFear", "decisionStyle".`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const profile = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);

    const profileRef = db.collection('player_profiles').doc(userId);
    await profileRef.set(
      {
        ...profile,
        lastGameSessionId: sessionId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    res.status(200).json({ message: 'Player profile updated.', profile });
  } catch (error) {
    console.error('End-game analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze game session.' });
  }
});

// Optional readiness endpoint (lightweight now, can expand later)
app.get('/api/ready', (_req, res) => {
  // In future: check external dependencies, warmed caches, etc.
  res.json({ ready: true, timestamp: Date.now() });
});

// Ensure root path responds (App Platform may probe '/'). Redirect to /api/ready.
app.get('/', (_req, res) => {
  // Simple OK for health checks at root
  res.json({ ready: true, path: '/', timestamp: Date.now() });
});

// MCP server routes

// Mount MCP control routes under /mcp
app.use('/mcp', mcpRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Apophenia API Server running on port ${PORT}`);
  console.log(`📡 Endpoints available at http://localhost:${PORT}/api/*`);
});

export default app;