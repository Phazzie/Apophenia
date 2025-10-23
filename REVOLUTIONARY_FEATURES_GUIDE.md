# 🚀 Revolutionary Features Implementation Guide

Quick reference guide for implementing the 5 paradigm-shifting features identified in the comprehensive code analysis.

---

## 🎤 Feature 1: Voice-Driven Narrative Experience

### Technical Stack
- **Web Speech API**: Built-in browser support
- **SpeechRecognition**: For voice input
- **SpeechSynthesis**: For text-to-speech output
- **Sentiment Analysis**: compromise.js library

### Implementation Steps

#### Phase 1: Basic Voice Input (Sprint 4, Days 1-2)

```typescript
// src/hooks/useVoiceInput.ts
import { useEffect, useState, useCallback } from 'react';

export function useVoiceInput(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, [onResult]);

  const startListening = useCallback(() => {
    if (recognition) {
      recognition.start();
      setIsListening(true);
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  return { isListening, startListening, stopListening, isSupported: !!recognition };
}
```

#### Phase 2: Text-to-Speech (Sprint 4, Days 2-3)

```typescript
// src/hooks/useTextToSpeech.ts
import { useCallback, useState } from 'react';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number; voice?: SpeechSynthesisVoice }) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.rate = options?.rate || 1.0;
      utterance.pitch = options?.pitch || 1.0;
      
      if (options?.voice) {
        utterance.voice = options.voice;
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { speak, stop, isSpeaking, isSupported: 'speechSynthesis' in window };
}
```

#### Usage in Components

```tsx
// In GameScreen.tsx
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

function GameScreen() {
  const { speak } = useTextToSpeech();
  const { startListening, isListening } = useVoiceInput((text) => {
    // Process voice command
    handleVoiceChoice(text);
  });

  const handleNewStorySegment = (text: string) => {
    // Read story aloud
    speak(text, { rate: 0.9, pitch: 0.8 }); // Slower, lower for horror
  };

  return (
    <div>
      <button onClick={startListening} disabled={isListening}>
        🎤 Voice Choice
      </button>
    </div>
  );
}
```

---

## 💓 Feature 2: Adaptive Horror Intensity System

### Implementation Steps

#### Phase 1: Manual Intensity Control (Sprint 4, Days 3-4)

```typescript
// src/stores/horrorIntensityStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface HorrorIntensityState {
  intensity: number; // 0-10
  userPreference: number; // User's manual setting
  behavioralScore: number; // Calculated from choices
  setIntensity: (intensity: number) => void;
  adjustFromBehavior: (delta: number) => void;
}

export const useHorrorIntensityStore = create<HorrorIntensityState>()(
  persist(
    (set) => ({
      intensity: 5,
      userPreference: 5,
      behavioralScore: 5,
      
      setIntensity: (intensity) => set({ intensity, userPreference: intensity }),
      
      adjustFromBehavior: (delta) => set((state) => {
        const newBehavioral = Math.max(0, Math.min(10, state.behavioralScore + delta));
        const newIntensity = (state.userPreference * 0.6) + (newBehavioral * 0.4);
        return {
          behavioralScore: newBehavioral,
          intensity: newIntensity,
        };
      }),
    }),
    { name: 'horror-intensity' }
  )
);
```

#### Phase 2: Behavioral Analysis (Sprint 4-5)

```typescript
// src/services/behavioralAnalysis.ts
import { Choice } from '../types';

export function analyzeBehavior(choice: Choice, history: Choice[]): {
  avoidanceScore: number;
  confrontationScore: number;
  intensityAdjustment: number;
} {
  // Analyze choice pattern
  const recentChoices = history.slice(-10);
  
  // Count intrusive thoughts selected (confrontational)
  const intrusiveCount = recentChoices.filter(c => c.isIntrusive).length;
  
  // Analyze text patterns
  const avoidanceKeywords = ['flee', 'hide', 'avoid', 'escape', 'safe'];
  const confrontationKeywords = ['investigate', 'confront', 'challenge', 'explore'];
  
  const avoidanceScore = avoidanceKeywords.some(k => 
    choice.text.toLowerCase().includes(k)
  ) ? 1 : 0;
  
  const confrontationScore = confrontationKeywords.some(k => 
    choice.text.toLowerCase().includes(k)
  ) ? 1 : 0;
  
  // More avoidance = reduce intensity
  // More confrontation = increase intensity
  const intensityAdjustment = confrontationScore - avoidanceScore;
  
  return {
    avoidanceScore,
    confrontationScore,
    intensityAdjustment: intensityAdjustment * 0.5, // Gradual changes
  };
}
```

---

## 👥 Feature 3: Collaborative Narrative Threading

### Technical Stack
- **WebSocket**: Socket.IO or native WebSockets
- **CRDT**: Yjs for conflict-free replicated data types
- **State Sync**: Custom protocol

### Implementation Steps

#### Phase 1: WebSocket Server (Sprint 6, Days 1-2)

```typescript
// server/collaborative.ts
import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

interface GameRoom {
  id: string;
  players: Set<string>;
  currentStorySegment: string;
  choices: Map<string, string>; // playerId -> choiceId
}

const rooms = new Map<string, GameRoom>();

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        players: new Set([socket.id]),
        currentStorySegment: '',
        choices: new Map(),
      });
    } else {
      rooms.get(roomId)!.players.add(socket.id);
    }
    
    socket.emit('room-joined', { roomId, playerCount: rooms.get(roomId)!.players.size });
  });

  socket.on('submit-choice', ({ roomId, choiceId }: { roomId: string; choiceId: string }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    
    room.choices.set(socket.id, choiceId);
    
    // Broadcast choice submission
    io.to(roomId).emit('choice-submitted', {
      playerId: socket.id,
      choiceId,
      totalVotes: room.choices.size,
      playersInRoom: room.players.size,
    });
    
    // If all players voted, determine consensus
    if (room.choices.size === room.players.size) {
      const voteCounts = new Map<string, number>();
      room.choices.forEach((choice) => {
        voteCounts.set(choice, (voteCounts.get(choice) || 0) + 1);
      });
      
      // Find majority choice
      let winningChoice = '';
      let maxVotes = 0;
      voteCounts.forEach((votes, choice) => {
        if (votes > maxVotes) {
          maxVotes = votes;
          winningChoice = choice;
        }
      });
      
      io.to(roomId).emit('consensus-reached', { choiceId: winningChoice });
      room.choices.clear();
    }
  });

  socket.on('disconnect', () => {
    rooms.forEach((room, roomId) => {
      if (room.players.has(socket.id)) {
        room.players.delete(socket.id);
        room.choices.delete(socket.id);
        
        if (room.players.size === 0) {
          rooms.delete(roomId);
        } else {
          io.to(roomId).emit('player-left', { playerId: socket.id, playerCount: room.players.size });
        }
      }
    });
  });
});

httpServer.listen(3001, () => {
  console.log('Collaborative server running on port 3001');
});
```

#### Phase 2: Client Integration (Sprint 6, Days 3-5)

```typescript
// src/hooks/useCollaborative.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useCollaborative(roomId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [playerCount, setPlayerCount] = useState(0);
  const [votingStatus, setVotingStatus] = useState({ submitted: 0, total: 0 });

  useEffect(() => {
    const socketInstance = io('http://localhost:3001');
    
    socketInstance.on('connect', () => {
      console.log('Connected to collaborative server');
      socketInstance.emit('join-room', roomId);
    });
    
    socketInstance.on('room-joined', ({ playerCount }: { playerCount: number }) => {
      setPlayerCount(playerCount);
    });
    
    socketInstance.on('choice-submitted', ({ totalVotes, playersInRoom }: { totalVotes: number; playersInRoom: number }) => {
      setVotingStatus({ submitted: totalVotes, total: playersInRoom });
    });
    
    setSocket(socketInstance);
    
    return () => {
      socketInstance.disconnect();
    };
  }, [roomId]);

  const submitChoice = (choiceId: string) => {
    if (socket) {
      socket.emit('submit-choice', { roomId, choiceId });
    }
  };

  return { socket, playerCount, votingStatus, submitChoice };
}
```

---

## 📊 Feature 4: AI Director Analytics Dashboard

### Implementation Steps

#### Phase 1: Event Tracking (Sprint 5, Days 1-2)

```typescript
// src/services/analytics.ts
interface AnalyticsEvent {
  type: 'choice_made' | 'story_completed' | 'session_start' | 'session_end' | 'drop_off';
  timestamp: number;
  sessionId: string;
  data: Record<string, unknown>;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    // Use crypto.randomUUID() for cryptographically secure session IDs
    return `session_${Date.now()}_${crypto.randomUUID()}`;
  }

  trackEvent(type: AnalyticsEvent['type'], data: Record<string, unknown> = {}) {
    const event: AnalyticsEvent = {
      type,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data,
    };
    
    this.events.push(event);
    
    // Persist to localStorage
    this.persistEvents();
    
    // Send to backend (if available)
    this.sendToBackend(event);
  }

  private persistEvents() {
    try {
      localStorage.setItem('analytics_events', JSON.stringify(this.events));
    } catch (error) {
      console.error('Failed to persist analytics:', error);
    }
  }

  private async sendToBackend(event: AnalyticsEvent) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      console.debug('Analytics backend unavailable');
    }
  }

  getEngagementMetrics() {
    const sessionDuration = this.events.length > 0 
      ? Date.now() - this.events[0].timestamp 
      : 0;
    
    const choicesMade = this.events.filter(e => e.type === 'choice_made').length;
    const storiesCompleted = this.events.filter(e => e.type === 'story_completed').length;
    
    return {
      sessionDuration,
      choicesMade,
      storiesCompleted,
      engagementScore: this.calculateEngagementScore(),
    };
  }

  private calculateEngagementScore(): number {
    // Simple engagement formula
    const metrics = this.getEngagementMetrics();
    const minutesPlayed = metrics.sessionDuration / 60000;
    const choicesPerMinute = minutesPlayed > 0 ? metrics.choicesMade / minutesPlayed : 0;
    
    // Score: 0-100
    return Math.min(100, (choicesPerMinute * 10) + (metrics.storiesCompleted * 20));
  }
}

export const analytics = new AnalyticsService();
```

---

## 📱 Feature 5: Progressive Web App with Offline Mode

### Implementation Steps

#### Phase 1: Service Worker Setup (Sprint 5, Days 1-2)

```typescript
// public/service-worker.js
// Use build timestamp or version for cache busting
// You can inject this value during build with your build tool (Vite, Webpack, etc.)
const CACHE_VERSION = self.APP_VERSION || 'v1';
const CACHE_NAME = `apophenia-${CACHE_VERSION}`;
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/index.tsx',
  '/src/App.tsx',
  '/src/styles/game.css',
  '/src/styles/accessibility.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      
      // Clone the request
      const fetchRequest = event.request.clone();
      
      return fetch(fetchRequest).then((response) => {
        // Check if valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone the response
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      });
    })
  );
});
```

#### Phase 2: PWA Manifest (Sprint 5, Day 2)

```json
// public/manifest.json
{
  "name": "Apophenia - Cosmic Horror Narrative",
  "short_name": "Apophenia",
  "description": "An AI-driven interactive cosmic horror narrative game",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

#### Phase 3: IndexedDB Story Persistence (Sprint 5, Days 3-4)

```typescript
// src/services/offlineStorage.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { StorySegment, WorldState } from '../types';

interface ApopheniaDB extends DBSchema {
  'story-segments': {
    key: string;
    value: StorySegment;
  };
  'world-states': {
    key: string;
    value: WorldState;
  };
  'cached-responses': {
    key: string;
    value: {
      prompt: string;
      response: string;
      timestamp: number;
    };
  };
}

class OfflineStorageService {
  private db: IDBPDatabase<ApopheniaDB> | null = null;
  
  // Cache expiry time: 1 hour in milliseconds
  private readonly CACHE_EXPIRY_MS = 3600000;

  async init() {
    this.db = await openDB<ApopheniaDB>('apophenia-db', 1, {
      upgrade(db) {
        db.createObjectStore('story-segments');
        db.createObjectStore('world-states');
        db.createObjectStore('cached-responses');
      },
    });
  }

  async saveStorySegment(id: string, segment: StorySegment) {
    if (!this.db) await this.init();
    await this.db!.put('story-segments', segment, id);
  }

  async getStorySegment(id: string): Promise<StorySegment | undefined> {
    if (!this.db) await this.init();
    return await this.db!.get('story-segments', id);
  }

  async saveWorldState(id: string, state: WorldState) {
    if (!this.db) await this.init();
    await this.db!.put('world-states', state, id);
  }

  async getWorldState(id: string): Promise<WorldState | undefined> {
    if (!this.db) await this.init();
    return await this.db!.get('world-states', id);
  }

  async cacheAIResponse(prompt: string, response: string) {
    if (!this.db) await this.init();
    await this.db!.put('cached-responses', {
      prompt,
      response,
      timestamp: Date.now(),
    }, prompt);
  }

  async getCachedResponse(prompt: string) {
    if (!this.db) await this.init();
    const cached = await this.db!.get('cached-responses', prompt);
    
    // Return cached response if less than CACHE_EXPIRY_MS old
    if (cached && Date.now() - cached.timestamp < this.CACHE_EXPIRY_MS) {
      return cached.response;
    }
    
    return null;
  }
}

export const offlineStorage = new OfflineStorageService();
```

---

## 📋 Implementation Checklist

### Sprint 4: Revolutionary Features Phase 1
- [ ] Voice Input Hook
- [ ] Text-to-Speech Hook
- [ ] Voice Command Recognition
- [ ] Emotion Detection Integration
- [ ] Manual Horror Intensity Controls
- [ ] Behavioral Analysis System
- [ ] Adaptive Story Adjustment

### Sprint 5: Revolutionary Features Phase 2
- [ ] Service Worker Registration
- [ ] PWA Manifest Creation
- [ ] Install Prompt UI
- [ ] IndexedDB Setup
- [ ] Story Persistence
- [ ] Response Caching
- [ ] Analytics Event Tracking
- [ ] Engagement Metrics Dashboard
- [ ] Biometric Feedback (Optional)

### Sprint 6: Social & Collaboration
- [ ] WebSocket Server Setup
- [ ] Room Management
- [ ] Voting System
- [ ] Real-time Synchronization
- [ ] Social Sharing
- [ ] Achievement System
- [ ] Leaderboards

---

## 🧪 Testing Strategy

### Voice Features Testing
```typescript
describe('Voice Features', () => {
  it('should recognize voice commands', async () => {
    const { startListening } = useVoiceInput(jest.fn());
    // Mock SpeechRecognition
    expect(startListening).toBeDefined();
  });

  it('should speak text aloud', async () => {
    const { speak } = useTextToSpeech();
    // Mock SpeechSynthesis
    expect(speak).toBeDefined();
  });
});
```

### Collaborative Features Testing
```typescript
describe('Collaborative Features', () => {
  it('should connect to WebSocket', async () => {
    const { socket } = useCollaborative('test-room');
    await waitFor(() => expect(socket).toBeDefined());
  });

  it('should handle voting', async () => {
    const { submitChoice } = useCollaborative('test-room');
    submitChoice('choice-1');
    // Assert vote was submitted
  });
});
```

---

## 📚 Resources

### Documentation
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Socket.IO](https://socket.io/docs/v4/)
- [Yjs CRDT](https://docs.yjs.dev/)

### Libraries
- `idb`: IndexedDB wrapper with promises
- `socket.io-client`: WebSocket client
- `compromise`: Natural language processing

### Browser Support
- Voice features: Chrome, Edge, Safari (limited)
- PWA: All modern browsers
- WebSockets: All modern browsers
- IndexedDB: All modern browsers

---

**Last Updated**: Sprint 2 Progress  
**Next Review**: After Sprint 3 Completion  
**Owner**: Development Team
