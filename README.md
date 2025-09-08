# Apophenia — AI-Driven Interactive Horror

Apophenia is an AI-directed, choice-driven psychological horror game. The AI (“Director”) generates story segments, images, and choices (including intrusive thoughts) as you play. The UI reflects the protagonist’s degrading psychological state.

Status: Functional MVP in active development. Updated: September 8, 2025

## Core loop
1. Player chooses an option
2. AI generates the next story segment and choices
3. UI updates and shows loading states while generating
4. Repeat until ending

## Tech stack
- React + TypeScript + Vite
- State: Zustand stores (game, world, story, image cache)
- Types: Zod schemas, discriminated command union
- Tests: Jest + ts-jest
- AI: Google Gemini (text); image generation via backend (planned)

## Project structure
```
src/
  components/         # React UI components (StartScreen, GameScreen, EndScreen, ErrorBoundary)
  services/           # AI flows, game orchestration, config
  commands/           # Typed command executors
  stores/             # Zustand state stores (persisted)
  types.ts            # Zod schemas and inferred TS types
```

## Setup
```bash
npm install

# Create .env (see .env.example)
cp .env.example .env
# Set your key
echo "VITE_GEMINI_API_KEY=your-google-api-key-here" >> .env

# Start dev
npm run dev

# Run tests
npm test

# Build
npm run build
```

## Environment variables
- VITE_GEMINI_API_KEY: Google Generative AI key for text generation (required)
- VITE_IMAGE_API_KEY: Placeholder for image service (not used client-side yet)

## Current capabilities
- Text generation via Gemini 1.5 Flash with robust error handling and recovery commands
- Genre selection persisted into world state; used by AI system instruction
- Loading states and “New Game” reset
- Image generation stub that falls back to Unsplash

## Near-term roadmap
- Add backend service (Express) for server-side image generation using Gemini’s image-capable model; call from `processImageGeneration`
- DigitalOcean App Platform deployment: static frontend + Node backend
- Expand genre configurations and polish UI effects

## Contributing
Use conventional commits. Update CHANGELOG.md for user-facing changes.

## License
Proprietary (TBD). Contact the author for details.
