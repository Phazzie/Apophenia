# 🚀 Apophenia Quick Start Guide

Get started with Apophenia in under 5 minutes!

---

## Prerequisites

- **Node.js 20.19.0+** installed
- **npm** or **yarn** package manager
- **X.AI API key** (optional - works without for demo mode)

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/Phazzie/Apophenia.git
cd Apophenia

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**

---

## Configuration (Optional)

### Using Grok AI (Recommended)

For AI-generated content and images, you'll need an X.AI API key:

1. Get your API key from [X.AI Console](https://console.x.ai)
2. Create a `.env.local` file:

```bash
VITE_XAI_API_KEY=your-xai-api-key-here
```

3. Restart the dev server

### Demo Mode (No API Key)

Apophenia works without any API keys using **Mock AI mode**:
- Pre-written narrative content
- Demo images
- All 9 revolutionary engines active
- Perfect for testing and development

---

## Your First Game

1. **Start Screen**: Choose your genre
   - Cosmic Horror
   - Psychological Thriller

2. **Select AI Provider**:
   - **Grok** (if API key configured)
   - **Mock** (demo mode - always available)

3. **Begin Your Descent**: Click "Start Game"
   - AI generates your opening scenario
   - Make choices to progress the narrative
   - Watch as reality unravels

4. **Experience the Engines**:
   - **Temporal Revision** - Past events change
   - **Quantum Narrative** - Parallel timelines collide
   - **Reality Corruption** - UI itself distorts
   - **Adaptive Horror** - Personalized fears emerge
   - **Meta-Consciousness** - Fourth wall breaks
   - And 4 more revolutionary systems...

---

## Game Controls

- **Make Choices**: Click any choice button
- **Save**: Auto-saves to localStorage
- **Reset**: Return to menu anytime
- **Watch Corruption**: UI distorts as horror intensifies

---

## Features

✨ **Grok-4 Fast Reasoning** - 2M token context for complete session memory
🎨 **Grok-2-image-1212** - AI-generated atmospheric horror imagery
🧠 **9 Revolutionary AI Engines** - Unprecedented narrative complexity
🔄 **Zero-Config Startup** - Works immediately with demo content
💾 **Auto-Save** - Never lose your progress
📱 **Responsive** - Play on any device

---

## Architecture (For Developers)

Apophenia uses a **seams-based architecture** for maximum modularity:

```
📁 src/
├── core/              # Core systems (engines, state, commands)
│   ├── engines/       # 9 revolutionary AI engines
│   ├── state/         # Zustand stores with persistence
│   └── commands/      # Type-safe command execution
├── flows/             # Game flow orchestration
├── services/          # AI & image services
│   ├── ai/            # Grok integration + unified service
│   └── images/        # Image generation pipeline
├── ui/                # React components
│   ├── screens/       # Main game screens
│   └── components/    # Reusable UI elements
└── config/            # Zero-config defaults

```

All architectural seams documented in **SEAMS.md**

---

## Troubleshooting

### Dev server won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
```bash
# Check for compilation errors
npx tsc --noEmit
```

### API key not working
- Ensure `.env.local` exists (not `.env`)
- Verify key starts with `VITE_XAI_API_KEY=`
- Restart dev server after adding key
- Check X.AI console for API quota

### Images not loading
- Grok image service requires valid API key
- Falls back to Unsplash (no key required)
- Demo mode uses placeholder images

---

## Next Steps

- Read **SEAMS.md** for architecture details
- Explore **INTEGRATION_PLAN.md** for development approach
- Check **README.md** for full documentation
- Join discussions on [GitHub](https://github.com/Phazzie/Apophenia/discussions)

---

## Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Phazzie/Apophenia/issues)
- 💬 **Questions**: [GitHub Discussions](https://github.com/Phazzie/Apophenia/discussions)
- 📖 **Docs**: Check `/docs` folder

---

*"Every choice echoes through infinity..." 🌌*

**Enjoy your descent into Apophenia!**
