# 🌌 Apophenia: Cosmic Narrative
**An AI-driven interactive cosmic horror narrative game**

![Apophenia Start Screen](https://github.com/user-attachments/assets/1c012011-4c91-4f1b-b385-6fdc42dc3da9)

---

## 🎮 Live Demo
**[Play Apophenia](https://apophenia-cosmic-narrative.vercel.app)** *(Coming soon)*

---

## 🌟 Overview

**Apophenia** creates adaptive psychological horror through AI-driven storytelling. Every playthrough is unique as the AI Director analyzes your choices and generates personalized cosmic horror narratives with atmospheric visuals.

### ✨ Core Features
- **🧠 Grok-4 Fast Reasoning AI**: X.AI's latest model with 2M token context and advanced reasoning
- **🔄 Multi-Model Support**: Switch between Grok-4, Gemini 2.5 Pro, and Gemini Flash
- **🔍 Test API System**: Built-in connectivity testing for all AI providers
- **🎨 Atmospheric Visuals**: Enhanced image generation for immersive scenes
- **🧠 Psychological Profiling**: AI adapts story direction based on player decisions with 2M token memory
- **👁️ Intrusive Thoughts**: Disturbing choice options that reveal character psychology
- **📱 Responsive Design**: Seamless experience on mobile and desktop
- **🌙 Horror Aesthetic**: Carefully crafted cosmic horror visual theme

![Game Screen](https://github.com/user-attachments/assets/2a604160-3455-4215-bd2d-2c0e19300231)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (20+ recommended for optimal performance)
- **npm 8+** or **yarn 3+** for package management  
- **Grok API key** (primary AI model - from X.AI)
- **Google Gemini API key** (fallback model - optional but recommended)
- **Modern browser** with JavaScript enabled

### Expert Installation

```bash
# Clone the repository with full history
git clone --recurse-submodules https://github.com/Phazzie/Apophenia.git
cd Apophenia

# Install dependencies with audit
npm install --audit --audit-level moderate

# Verify installation integrity
npm run build && npm test

# Create environment configuration
cp .env.example .env.local

# Configure API keys for full functionality
echo "VITE_XAI_API_KEY=your-xai-api-key-here" >> .env.local
echo "VITE_GEMINI_API_KEY=your-google-gemini-api-key" >> .env.local

# Start development with hot module replacement
npm run dev
```

**Application will be available at `http://localhost:5173` with hot reload enabled**

### Expert Development Workflow

```bash
# Development lifecycle
npm run dev          # Start dev server with HMR (Hot Module Replacement)
npm run build        # Production build with optimization
npm run preview      # Preview production build locally
npm run test             # Run Jest test suite (35+ tests)
npm run test:watch   # Run tests in watch mode for TDD
npm run type-check   # TypeScript strict type checking

# Code quality and validation
npm run lint         # ESLint code quality checks (when configured)  
npm run format       # Prettier code formatting (when configured)
npm run audit        # Security vulnerability audit

# Deployment options
npm run deploy       # Deploy to Vercel (configured)
npm run build:docker # Build Docker container image
npm run start:prod   # Start production server locally
```

### Advanced Environment Configuration

```bash
# Environment file templates
.env.example         # Template with all available variables
.env.local           # Local development (gitignored)
.env.production      # Production configuration template
.env.test            # Test environment variables

# Production-ready environment setup
NODE_ENV=production
VITE_XAI_API_KEY=your-production-xai-key
VITE_GEMINI_API_KEY=your-production-gemini-key
VITE_API_BASE_URL=https://your-api.domain.com
VITE_ENABLE_ANALYTICS=true
VITE_LOG_LEVEL=error
```

---

## 🧠 AI Model System

Apophenia features a sophisticated multi-model AI system with **Grok-4 Fast Reasoning** as the primary engine, supported by Google Gemini models as reliable fallbacks.

### 🚀 Grok-4 Fast Reasoning (Primary)
- **Provider**: X.AI (xAI)
- **Context Window**: 2 Million tokens (2x larger than Gemini)
- **Advanced Reasoning**: Built-in thinking mode for complex narrative decisions
- **Specialized For**: Interactive storytelling, psychological analysis, narrative consistency

### 🔄 Model Selection Interface
- **Dynamic Switching**: Change AI models without restarting the game
- **Real-time Testing**: Test API connectivity for each provider
- **Feature Comparison**: View context windows, reasoning capabilities, and image support
- **Persistent Selection**: Your choice is saved across sessions

### 🎯 Premium Features (2M Token Context)
- **Complete Session Memory**: Remember every choice and story beat across the entire game
- **Advanced Psychological Profiling**: Deep personality analysis that evolves throughout the narrative
- **Narrative Consistency Engine**: Cross-reference all story elements for perfect continuity
- **Multi-layered Context Awareness**: Maintain thematic coherence and foreshadowing throughout
- **Adaptive Horror Personalization**: Learn from complete player behavior patterns for maximum psychological impact

### 🛡️ Fallback System
```
Grok-4 Fast Reasoning (Primary)
    ↓ (on failure)
Gemini 2.5 Pro (Secondary)
    ↓ (on failure)  
Gemini 2.5 Flash (Final fallback)
    ↓ (on failure)
Static thematic error responses
```

## 🧠 Revolutionary 8-Module AI Engine System

Apophenia features an advanced AI-driven interactive storytelling system consisting of **8 interconnected engines** that work together to create unprecedented personalized horror experiences:

### 🎯 Core Revolutionary Engines

1. **🕰️ Temporal Revision Engine** - AI retroactively modifies past story segments based on current choices, creating "false memory" effects and unreliable narrator experiences.
2. **🌌 Quantum Narrative Engine** - Maintains multiple parallel story threads that can shift between realities, creating horror through inconsistent timelines.
3. **💀 Reality Corruption Engine** - Progressive UI distortions that respond to story corruption levels, physically affecting the game interface.
4. **🧠 Adaptive Horror Engine** - Builds personalized psychological horror profiles from complete player behavior analysis with 2M token memory.
5. **👁️ Meta-Consciousness Engine** - AI occasionally breaks the fourth wall to directly address players, creating self-aware horror experiences.

### 🔬 Advanced Psychological Systems

6. **🧬 Neural Echo Chambers** - Cross-session memory persistence using localStorage, maintaining player psychological profiles between gaming sessions.
7. **⚗️ Semantic Choice Archaeology** - Deep psychological analysis of player choice patterns, excavating meaning from decision sequences to understand player psyche.
8. **🧬 Adaptive Narrative DNA** - Evolutionary story genetics that adapt and mutate over time based on player engagement, creating unique narrative branches.

### 🎮 System Integration

All 8 engines work in harmony during gameplay:
- Every player choice is processed through all 8 modules simultaneously.
- Cross-engine data sharing creates emergent psychological experiences.
- Real-time adaptation ensures no two playthroughs are ever identical.
- Complete session memory with 2M token context for perfect narrative continuity.

---

## 🏗️ Expert Architecture Deep Dive

Apophenia implements a sophisticated command-driven architecture optimized for AI integration and scalable narrative generation:

**Data Flow**: `User Input → AI Processing → Command Queue → State Updates → UI Rendering`

```
src/
├── components/              # React UI components with TypeScript
│   ├── StartScreen.tsx      # Handles game initialization and main menu.
│   ├── GameScreen.tsx       # Primary gameplay interface with real-time updates.
│   ├── EndScreen.tsx        # Game completion and narrative resolution.
│   ├── ModelSelector.tsx    # AI model selection modal with testing.
│   └── ErrorBoundary.tsx    # Thematic error recovery with fallback UI.
├── stores/                 # Zustand state management with persistence
│   ├── gameStateStore.ts    # Manages the core game state (e.g., MENU, PLAYING).
│   ├── worldStateStore.ts   # Holds the narrative world context and genre configuration.
│   ├── aiModelStore.ts      # Manages AI model selection and testing state.
│   └── imageCacheStore.ts   # LRU+TTL image caching for performance.
├── services/               # Business logic and AI orchestration
│   ├── ai/                 # AI service integrations (Grok, Gemini, etc.).
│   │   └── revolutionaryFeatures.ts  # Implementation of the 8 advanced AI engines.
│   ├── flows/              # High-level game flow orchestration.
│   ├── gameService.ts      # Central game controller that integrates all AI engines.
│   ├── commandExecutor.ts  # Type-safe command execution engine.
│   └── gameStateManager.ts # Unified atomic store operations for state consistency.
├── commands/               # Self-contained command executors with discriminated unions
│   ├── displayText.ts      # Displays narrative text.
│   ├── displayChoices.ts   # Renders choices for the player.
│   ├── generateImage.ts    # Asynchronously generates images.
│   └── ...                 # Other commands for various game actions.
├── styles/                 # CSS modules and theme system
│   └── game.css            # Main stylesheet for the game's aesthetic.
└── types.ts               # Centralized Zod schemas and TypeScript type definitions.
```

### 🔧 Core Technologies & Architecture Decisions

**Frontend Stack**:
- **React 18**: Concurrent features, Suspense, automatic batching.
- **TypeScript 5.4+**: Strict mode for robust type safety.
- **Vite 5**: Lightning-fast HMR and optimized production builds.
- **Zustand**: Lightweight, unopinionated state management.

**AI Integration Layer**:
- **Grok-4 Fast Reasoning**: Primary engine for narrative generation and advanced features, leveraging a 2M token context window.
- **Google Gemini**: Secondary and tertiary fallback models for reliability.
- **Multi-service Fallbacks**: Robust error handling and graceful service degradation.
- **Context Management**: Intelligent summarization for long narrative sessions.

**Development & Quality**:
- **Jest + Testing Library**: 35+ tests covering core logic and components.
- **TypeScript Strict Mode**: Ensures type safety across the codebase.
- **Command Pattern**: Decouples command invocation from execution for a clean, scalable architecture.
- **Error Boundaries**: Thematic error recovery to maintain immersion.

**Performance Optimizations**:
- **Bundle Splitting**: Automatic code splitting by route and feature via Vite.
- **Image Caching**: LRU+TTL cache with smart eviction policies to reduce API calls and load times.
- **Async Commands**: Non-blocking operations for a smooth user experience.
- **Memory Management**: Automatic cache cleanup to prevent memory leaks.

---

## 🎯 Gameplay

1. **🎭 Choose Your Genre**: Select from cosmic horror themes.
2. **📖 Experience Dynamic Stories**: The AI generates unique narratives in real-time.
3. **🤔 Make Crucial Decisions**: Choose from AI-generated options that shape the story.
4. **😱 Face Intrusive Thoughts**: Encounter disturbing psychological choices that reveal character.
5. **🌌 Witness Consequences**: Watch as your choices dynamically alter the narrative and game world.

![Mobile View](https://github.com/user-attachments/assets/0aa5631d-9947-4ce2-a87a-1a239db1d0ed)

---

## 🌐 Expert Deployment Guide

### Production Deployment Options

| Platform | Complexity | Cost | Best For | Deployment Time |
|----------|------------|------|----------|----------------|
| **Vercel** | ⭐ | Free/$20+ | Static sites, quick MVP | 2 minutes |
| **Netlify** | ⭐ | Free/$19+ | JAMstack, easy rollbacks | 3 minutes |
| **DigitalOcean** | ⭐⭐ | $5+ | Full control, scalability | 15 minutes |
| **AWS/GCP** | ⭐⭐⭐ | Variable | Enterprise, complex needs | 30+ minutes |

### Vercel Deployment (Recommended for MVP)

```bash
# Global Vercel CLI installation
npm install -g vercel

# Initialize and configure project
vercel init apophenia-narrative

# Configure environment variables (securely)
vercel env add VITE_XAI_API_KEY production
vercel env add VITE_GEMINI_API_KEY production

# Deploy with custom domain
vercel --prod --yes
```

**Advanced Vercel Configuration**:
```json
{
  "version": 2,
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "regions": ["iad1", "sfo1"],
  "functions": {
    "app/**/*": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### DigitalOcean App Platform

```bash
# Using DigitalOcean CLI
doctl apps create --spec=digitalocean-app.yaml

# Or via Web Interface:
# 1. Connect GitHub repository
# 2. Configure build: `npm run build`
# 3. Set environment variables
# 4. Deploy with auto-scaling
```

**Complete DigitalOcean deployment**: See [DIGITALOCEAN_DEPLOYMENT.md](DIGITALOCEAN_DEPLOYMENT.md)

### Docker Production Deployment

```dockerfile
# Multi-stage optimized build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --audit=false
COPY . .
RUN npm run build

FROM nginx:alpine AS runtime
RUN apk add --no-cache nodejs npm
WORKDIR /app
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/server.js .
COPY --from=builder /app/node_modules ./node_modules
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["sh", "-c", "node server.js & nginx -g 'daemon off;'"]
```

### Advanced Environment Configuration

```bash
# Production environment template
NODE_ENV=production
VITE_XAI_API_KEY=${XAI_API_KEY}
VITE_GEMINI_API_KEY=${GEMINI_API_KEY}
VITE_ANALYTICS_ID=${ANALYTICS_ID}
VITE_ERROR_TRACKING=${ERROR_TRACKING_DSN}
VITE_API_BASE_URL=https://api.yournarrative.com
VITE_CDN_URL=https://cdn.yournarrative.com
VITE_FEATURE_FLAGS=${FEATURE_FLAGS}

# Security headers
FORCE_HTTPS=true
SECURE_COOKIES=true
HSTS_MAX_AGE=31536000
```

---

## 🔑 Environment Setup

### Required Environment Variables

Create a `.env.local` file in the root directory:

```env
# Primary AI model from X.AI
VITE_XAI_API_KEY=your-xai-api-key-here

# Fallback AI model from Google
VITE_GEMINI_API_KEY=your-google-gemini-api-key
```

### API Key Setup

1. **Grok API**: Visit [X.AI](https://x.ai) to get an API key.
2. **Google Gemini API**: Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to get an API key.

> **Note**: The game includes graceful fallbacks and can run without API keys for development and testing, though AI features will be limited.

---

## 🧪 Testing

Comprehensive test coverage with Jest:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

**Current Coverage**: 35+ passing tests covering core game logic, command executors, and AI services.

---

## 🚨 Error Handling

Apophenia includes robust error handling:

- **🛡️ Error Boundaries**: Graceful error recovery with thematic messages to maintain immersion.
- **🔄 Fallback Systems**: Works without API keys using mock data and static responses.
- **⚠️ Thematic Errors**: Error messages are styled to fit the cosmic horror aesthetic.
- **🔧 Recovery Options**: Users can retry actions or continue with fallbacks.

---

## 🎨 Design System

The visual design follows a **cosmic horror aesthetic**:

- **🎨 Color Palette**: Dark blues, purples, and reds create an unsettling atmosphere.
- **✍️ Typography**: Creepster for titles and Courier Prime for body text enhance the theme.
- **🌟 Effects**: Glowing elements, atmospheric gradients, and subtle animations add to the experience.
- **📱 Responsive**: Mobile-first design ensures a seamless experience on all devices.

---

## 📈 Performance

- **📦 Bundle Size**: ~252KB (74KB gzipped)
- **⚡ Load Time**: <3 seconds on an average connection
- **📱 Mobile Optimized**: Fully responsive design for all screen sizes.
- **🖼️ Image Optimization**: Smart caching and progressive loading for visual elements.

---

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following the existing code style
4. **Run tests**: `npm test`
5. **Build successfully**: `npm run build`
6. **Commit changes**: `git commit -m 'Add amazing feature'`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices and maintain strict type safety.
- Write tests for new features to maintain coverage.
- Adhere to the command-driven architecture pattern.
- Use semantic commit messages for clear history.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Architecture & Core Systems**: Phazzie
- **AI Integration**: X.AI (Grok), Google (Gemini)
- **Visual Design**: Custom horror aesthetic
- **Testing Framework**: Jest + React Testing Library

---

## 📞 Support

- **🐛 Bug Reports**: [Open an issue](https://github.com/Phazzie/Apophenia/issues)
- **💡 Feature Requests**: [Start a discussion](https://github.com/Phazzie/Apophenia/discussions)
- **📖 Documentation**: Check the [docs](./docs) folder or the JSDoc comments throughout the code.

---

*"In the depths of cosmic indifference, every choice echoes through infinity..."*

**Apophenia** - Where AI meets cosmic horror. 🌌👁️