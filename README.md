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
- **🚀 Revolutionary AI Engines**: Features like Temporal Revision, Quantum Narratives, and a Reality Corruption Engine are all driven by AI.
- **🧠 Grok-2 Image Generation**: Atmospheric visuals are generated using X.AI's `grok-2-image` model.
- **🤖 Advanced Psychological Profiling**: The AI analyzes player choices to create a deep, evolving psychological profile.
- **👁️ Dynamic Intrusive Thoughts**: AI-generated intrusive thoughts that adapt to the player's psychological state.
- **📱 Responsive Design**: Seamless experience on mobile and desktop.
- **🌙 Horror Aesthetic**: Carefully crafted cosmic horror visual theme.

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
npm test             # Run Jest test suite (40+ tests)
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

Apophenia features a sophisticated AI system that uses a variety of models to create a dynamic and personalized horror experience.

### 🚀 Revolutionary AI Engines
- **Temporal Revision Engine**: Uses AI to analyze player choices and retroactively rewrite past memories, creating an unsettling and unreliable narrative.
- **Quantum Narrative Engine**: Branches the narrative into parallel threads based on the significance of player choices, as determined by AI analysis.
- **Reality-Bending Engine**: A unified engine that uses AI to generate meta-narrative messages, UI corruption effects, and browser manipulations.
- **Psychological Profiling Engine**: Performs a deep, AI-driven analysis of player choices to build a psychological profile, which is then used to personalize the horror experience.

### 🎨 Image Generation
- **Grok-2-Image**: Atmospheric visuals are generated using X.AI's `grok-2-image` model, which can produce multiple image variations for each scene.

### 🛡️ Fallback System
The application is designed to be resilient. If an AI service fails, the system will gracefully fall back to simpler, less dynamic alternatives, ensuring that the game remains playable.

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