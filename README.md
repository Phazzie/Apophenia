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
- **🤖 Dynamic AI Storytelling**: Google Gemini generates unique narratives based on your choices
- **🎨 Atmospheric Visuals**: Enhanced image generation for immersive scenes
- **🧠 Psychological Profiling**: AI adapts story direction based on player decisions
- **👁️ Intrusive Thoughts**: Disturbing choice options that reveal character psychology
- **📱 Responsive Design**: Seamless experience on mobile and desktop
- **🌙 Horror Aesthetic**: Carefully crafted cosmic horror visual theme

![Game Screen](https://github.com/user-attachments/assets/2a604160-3455-4215-bd2d-2c0e19300231)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini API key (optional - works with fallbacks)

### Installation

```bash
# Clone the repository
git clone https://github.com/Phazzie/Apophenia.git
cd Apophenia

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# (Optional) Add your Google Gemini API key to .env.local
# VITE_GEMINI_API_KEY=your-api-key-here

# Start development server
npm run dev
```

The game will be available at `http://localhost:5173`

### Development Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run test suite

# Deployment (when configured)
npm run deploy       # Deploy to Vercel
```

---

## 🏗️ Architecture

Apophenia follows a clean command-driven architecture:

**Flow: User Input → AI Processing → Command Queue → State Updates → UI**

```
src/
├── components/          # React UI components
│   ├── StartScreen.tsx  # Game entry point
│   ├── GameScreen.tsx   # Main gameplay interface
│   └── EndScreen.tsx    # Game completion
├── stores/             # Zustand state management
│   ├── gameStateStore.ts    # Current game state
│   ├── worldStateStore.ts   # Story world context
│   └── storyHistoryStore.ts # Narrative history
├── services/           # Business logic
│   ├── ai/             # AI integration
│   ├── flows/          # Game flow orchestration
│   └── gameService.ts  # Core game controller
├── commands/           # Command executors
├── styles/            # CSS styling
└── types.ts           # TypeScript definitions
```

### 🔧 Key Technologies
- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Zustand with persistence
- **AI Integration**: Google Gemini AI
- **Styling**: Custom CSS with horror aesthetic
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel/Netlify ready

---

## 🎯 Gameplay

1. **🎭 Choose Your Genre**: Select from cosmic horror themes
2. **📖 Experience Dynamic Stories**: AI generates unique narratives
3. **🤔 Make Crucial Decisions**: Choose from AI-generated options
4. **😱 Face Intrusive Thoughts**: Encounter disturbing psychological choices
5. **🌌 Witness Consequences**: Watch as your choices shape reality

![Mobile View](https://github.com/user-attachments/assets/0aa5631d-9947-4ce2-a87a-1a239db1d0ed)

---

## 🌐 Deployment

### Vercel (Recommended)

1. **Deploy to Vercel**:
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Configure Environment Variables** in Vercel Dashboard:
   - `VITE_GEMINI_API_KEY`: Your Google Gemini API key

3. **Access your deployed app** at the provided URL

### Alternative Platforms

**Netlify**:
```bash
npm run build
netlify deploy --prod --dir=dist
```

**GitHub Pages**:
```bash
npm install --save-dev gh-pages
npm run deploy
```

---

## 🔑 Environment Setup

### Required Environment Variables

Create `.env.local` file:

```env
# Google Gemini AI (Optional - graceful fallbacks included)
VITE_GEMINI_API_KEY=your-google-gemini-api-key

# Additional AI services (Future)
# VITE_OPENAI_API_KEY=your-openai-key
```

### API Key Setup

1. **Google Gemini API**:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Generate an API key
   - Add to `.env.local`

> **Note**: The game includes graceful fallbacks and works without API keys for development and testing.

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

**Current Coverage**: 11 passing tests covering core game logic and command executors.

---

## 🚨 Error Handling

Apophenia includes robust error handling:

- **🛡️ Error Boundaries**: Graceful error recovery with thematic messages
- **🔄 Fallback Systems**: Works without API keys using mock data
- **⚠️ Thematic Errors**: Error messages fit the cosmic horror aesthetic
- **🔧 Recovery Options**: Users can retry actions or continue with fallbacks

---

## 🎨 Design System

The visual design follows a **cosmic horror aesthetic**:

- **🎨 Color Palette**: Dark blues, purples, and reds
- **✍️ Typography**: Creepster for titles, Courier Prime for body text
- **🌟 Effects**: Glowing elements, atmospheric gradients, hover animations
- **📱 Responsive**: Mobile-first design with desktop enhancements

---

## 📈 Performance

- **📦 Bundle Size**: ~252KB (74KB gzipped)
- **⚡ Load Time**: <3 seconds on average connection
- **📱 Mobile Optimized**: Responsive design for all screen sizes
- **🖼️ Image Optimization**: Smart caching and progressive loading

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
- Follow TypeScript best practices
- Maintain test coverage for new features
- Follow the command-driven architecture pattern
- Use semantic commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Architecture & Core Systems**: Phazzie
- **AI Integration**: Google Gemini AI
- **Visual Design**: Custom horror aesthetic
- **Testing Framework**: Jest + React Testing Library

---

## 📞 Support

- **🐛 Bug Reports**: [Open an issue](https://github.com/Phazzie/Apophenia/issues)
- **💡 Feature Requests**: [Start a discussion](https://github.com/Phazzie/Apophenia/discussions)
- **📖 Documentation**: Check the [docs](./docs) folder

---

*"In the depths of cosmic indifference, every choice echoes through infinity..."*

**Apophenia** - Where AI meets cosmic horror. 🌌👁️