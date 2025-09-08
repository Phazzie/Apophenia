# 🚀 Apophenia Deployment Plan (Updated)
Target: Deploy frontend + backend with real AI text (Gemini) and a server-side image endpoint.

---

## Phase 1: Environment

Environment variables (see `.env.example`):
- VITE_GEMINI_API_KEY (frontend read, used by current text flows)
- VITE_IMAGE_API_KEY (placeholder)
Backend will use its own env (e.g., GOOGLE_GENAI_API_KEY) and must not expose secrets to the client.

## Phase 2: AI

Status: Text generation implemented with `@google/generative-ai` (Gemini 1.5 Flash) and robust error handling. Image generation is stubbed with Unsplash fallback. Next step is a server-side image endpoint.

---

## Phase 3: User Experience

### 2.1 Essential CSS Styling (1.5-2 hours)
**Priority: HIGH | Effort: MEDIUM**

**Create cohesive visual experience:**

```css
/* src/styles/game.css - NEW FILE */
.game-screen {
  background: linear-gradient(135deg, #0d1117 0%, #21262d 100%);
  color: #c9d1d9;
  font-family: 'Courier New', monospace;
  min-height: 100vh;
}

.story-panel {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.choice-panel button {
  background: #21262d;
  border: 1px solid #30363d;
  color: #c9d1d9;
  padding: 0.75rem 1.5rem;
  margin: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.choice-panel button:hover {
  background: #30363d;
  border-color: #58a6ff;
  box-shadow: 0 0 10px rgba(88, 166, 255, 0.3);
}

.intrusive-thought {
  border-color: #f85149 !important;
  color: #f85149;
  font-style: italic;
}

.loading-spinner {
  /* CSS spinner animation */
}

/* Responsive design */
@media (max-width: 768px) {
  /* Mobile optimizations */
}
```

**Files to create/modify:**
- `src/styles/game.css` → NEW: Main game styling
- `src/styles/cosmic-horror.css` → NEW: Theme-specific styles
- `src/App.tsx` → Import CSS files
- `src/components/*.tsx` → Add CSS classes

**Definition of Done:**
- [ ] Cohesive visual theme (cosmic horror aesthetic)
- [ ] Responsive design (mobile + desktop)
- [ ] Proper loading states and animations
- [ ] Accessibility considerations (contrast, focus states)

### 2.2 Enhanced UI Components (30-45 minutes)
**Priority: HIGH | Effort: LOW-MEDIUM**

**Polish existing components:**

```typescript
// Enhanced GameScreen with better UX
const GameScreen: React.FC = () => {
  // Add typing animation for story text
  // Improve image loading states
  // Better choice button interactions
  // Progress indicators
};
```

**Definition of Done:**
- [ ] Smooth text typing animation
- [ ] Image loading with proper placeholders
- [ ] Clear visual feedback for user actions
- [ ] Professional loading states

---

## Phase 4: Optimization
**Priority: MEDIUM | Effort: LOW**

```typescript
// Code splitting and lazy loading
const GameScreen = lazy(() => import('./components/GameScreen'));
const StartScreen = lazy(() => import('./components/StartScreen'));

// Image optimization
const optimizeImagePrompt = (prompt: string) => {
  return `${prompt}, high quality, detailed, atmospheric, 4k`;
};

// Cache optimization
const CACHE_CONFIG = {
  maxSize: 25, // Reduce for mobile
  ttl: 20 * 60 * 1000, // 20 minutes
};
```

**Definition of Done:**
- [ ] Lazy loading for components
- [ ] Optimized image caching
- [ ] Reduced bundle size
- [ ] Fast loading times

### Deployment: DigitalOcean App Platform

Components:
- Frontend: Vite static build
- Backend: Express service providing POST /api/generateImage

Steps:
1) Create DO App with two components from GitHub repo
2) Frontend build command: `npm ci && npm run build` (root)
3) Backend build command: `npm ci && npm run build` (backend/), start: `npm start`
4) Set env vars for backend: `GOOGLE_GENAI_API_KEY`
5) Set public env vars for frontend: `VITE_BACKEND_URL` pointing to backend service URL

Health checks:
- Backend `/health` returns 200 JSON `{ status: 'ok' }`

---

## Phase 5: MVP Validation

### 4.1 End-to-End Testing
**Smoke test the complete flow:**

1. **Start Game** → Genre selection → Concept generation
2. **Play Game** → Choice selection → Story progression → Image generation
3. **Save/Load** → State persistence verification
4. **Error Handling** → Network failures, API limits
5. **Mobile Experience** → Responsive design validation

**Definition of Done:**
- [ ] Complete game flow works
- [ ] No critical bugs
- [ ] Acceptable performance
- [ ] Mobile-friendly experience

---

## 📋 DETAILED TASK BREAKDOWN

### Immediate Action Items (Start Here):

#### **Task 1: Environment Setup (30 min)**
```bash
# 1. Create environment files
touch .env.example .env.local

# 2. Update config.ts
# Replace hardcoded keys with process.env

# 3. Test environment loading
npm run dev
```

#### **Task 2: Google AI Integration (2 hours)**
```bash
# 1. Install dependencies
npm install @google/generative-ai

# 2. Implement real AI flows
# Focus on genkit.ts file

# 3. Test with real API key
# Start with simple story generation
```

#### **Task 3: Basic Styling (1.5 hours)**
```bash
# 1. Create CSS files
mkdir src/styles
touch src/styles/game.css

# 2. Implement dark theme
# Focus on readability and atmosphere

# 3. Add responsive design
# Test on mobile devices
```

#### Task: Deploy to DigitalOcean
- Link repo in DO App Platform
- Configure two components as above
- Add env vars and deploy

---

## 🚨 RISK MITIGATION

### **High-Risk Items:**
1. **AI API Rate Limits** → Implement exponential backoff
2. **API Key Exposure** → Environment variable validation
3. **Image Generation Costs** → Cache aggressively, use fallbacks
4. **Mobile Performance** → Optimize bundle size, lazy loading

### **Fallback Plans:**
1. **AI Service Down** → Static fallback content
2. **Image Service Down** → Placeholder images
3. **Deployment Issues** → GitHub Pages backup
4. **Performance Issues** → Disable non-essential features

---

## 📈 SUCCESS METRICS

### **MVP Success Criteria:**
- [ ] **Functional:** Complete game loop working
- [ ] **Performance:** <3s initial load time
- [ ] **Mobile:** Responsive on all screen sizes
- [ ] **Accessible:** Basic accessibility compliance
- [ ] **Stable:** No critical errors in normal use

### **User Experience Goals:**
- [ ] **Engaging:** Compelling story generation
- [ ] **Immersive:** Atmospheric visual design
- [ ] **Intuitive:** Clear UI interactions
- [ ] **Fast:** Responsive user interactions

---

## Notes
This document reflects the current codebase: text AI integrated, image AI pending via backend. Replace older Vercel-centric steps with DO App Platform.

Ready to make this happen? Let's start with the environment setup—that's a 30-minute task that will set up everything else for success.