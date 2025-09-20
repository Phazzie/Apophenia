# 🌌 Apophenia: Cosmic Narrative (Next.js Edition)
**An AI-driven interactive cosmic horror narrative game, now rebuilt with Next.js for enhanced performance, security, and features.**

![Apophenia Start Screen](https://github.com/user-attachments/assets/1c012011-4c91-4f1b-b385-6fdc42dc3da9)

---

## 🎮 Live Demo
**[Play Apophenia](https://apophenia-cosmic-narrative.vercel.app)** *(Coming soon)*

---

## 🌟 Overview

**Apophenia** creates adaptive psychological horror through AI-driven storytelling. Every playthrough is unique as the AI Director analyzes your choices and generates personalized cosmic horror narratives with atmospheric visuals. This version has been migrated to Next.js, bringing significant improvements in architecture and security.

### ✨ Core Features
- **🤖 Dynamic AI Storytelling**: Google Gemini generates unique narratives based on your choices, now powered by a secure Next.js backend.
- **🔐 Secure by Design**: All AI API calls are handled by the server, ensuring API keys are never exposed to the client.
- **🚀 Server-Side Rendering (SSR)**: Faster initial load times and improved SEO thanks to Next.js.
- **💾 User Accounts & Persistence**: Save and load your game progress across devices (requires GitHub account).
- **🎨 Atmospheric Visuals**: Enhanced image generation for immersive scenes.
- **🧠 Psychological Profiling**: AI adapts story direction based on player decisions.
- **👁️ Intrusive Thoughts**: Disturbing choice options that reveal character psychology.
- **📱 Responsive Design**: Seamless experience on mobile and desktop with Tailwind CSS.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Google Gemini API key (optional - works with fallbacks)
- GitHub account for authentication

### Installation

```bash
# Clone the repository
git clone https://github.com/Phazzie/Apophenia.git
cd Apophenia

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your environment variables to .env.local
# GOOGLE_API_KEY=your-google-gemini-api-key
# GITHUB_ID=your-github-oauth-app-client-id
# GITHUB_SECRET=your-github-oauth-app-client-secret
# NEXTAUTH_SECRET=generate-a-secret-e.g.-openssl-rand-base64-32

# Start development server
npm run dev
```

The game will be available at `http://localhost:3000`

### Development Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run test suite with Vitest
```

---

## 🏗️ Architecture

Apophenia now uses a modern Next.js architecture, separating the client-side UI from the secure backend logic.

**Flow: User Input → Next.js API Route → AI Processing → Server Response → UI Update**

```
.
├── app/                  # Next.js App Router
│   ├── api/              # API routes for AI and game logic
│   ├── (pages)/          # Game pages (start, play, end)
│   └── layout.tsx        # Root layout
├── components/           # React UI components
├── lib/                  # Shared libraries
│   ├── ai/               # Server-side AI logic
│   ├── config/           # Game and AI configuration
│   ├── i18n/             # Internationalization
│   └── stores/           # Zustand state management
└── __tests__/            # Vitest tests
```

### 🔧 Key Technologies
- **Framework**: Next.js 14 + React 18 + TypeScript
- **State Management**: Zustand with persistence
- **Authentication**: NextAuth.js (GitHub provider)
- **Database**: Vercel KV for saving game state
- **AI Integration**: Google Gemini AI (via secure API routes)
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library

---

## 🌐 Deployment

### Vercel (Recommended)

1.  **Fork the repository** and deploy it to Vercel.
2.  **Configure Environment Variables** in the Vercel project settings:
    *   `GOOGLE_API_KEY`
    *   `GITHUB_ID`
    *   `GITHUB_SECRET`
    *   `NEXTAUTH_SECRET`
    *   `NEXTAUTH_URL` (the URL of your Vercel deployment)
3.  **Set up Vercel KV** in the Vercel dashboard and connect it to your project.

---

## 🧪 Testing

Comprehensive test coverage with Vitest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch
```

---

## 🤝 Contributing

1.  **Fork the repository**
2.  **Create a feature branch**: `git checkout -b feature/amazing-feature`
3.  **Make your changes** following the new Next.js architecture.
4.  **Run tests**: `npm test`
5.  **Build successfully**: `npm run build`
6.  **Commit changes**: `git commit -m 'Add amazing feature'`
7.  **Push to branch**: `git push origin feature/amazing-feature`
8.  **Open a Pull Request**