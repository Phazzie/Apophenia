# Apophenia — AI-Driven Interactive Horror

Apophenia is an AI-directed, choice-driven psychological horror game. The AI (“Director”) generates story segments, images, and choices (including intrusive thoughts) as you play. The UI reflects the protagonist’s degrading psychological state.

## Product vision
- Deliver a uniquely personal psychological horror experience where an AI Director adapts the story to your choices, mood, and selected genre.
- Balance player agency with mounting tension: choices matter, including tempting “intrusive thoughts” that may derail you.
- Keep the system reliable and safe via typed commands, schema-validated state, and defensive fallbacks.
- Maintain fast, responsive pacing (sub‑3s typical step) so the horror never loses momentum.
- Support replayability through configurable genres and evolving world state, not pre-authored branches.

See [VISION.md](VISION.md) for principles, scope/non‑goals, and success criteria.

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

## Roadmap (near‑term)
- Add backend service (Express) for server-side image generation using Gemini’s image-capable model; call from `processImageGeneration`.
- DigitalOcean App Platform deployment: static frontend + Node backend.
- Expand genre configurations and polish UI effects.

## Contributing
Use conventional commits. Update CHANGELOG.md for user-facing changes.

## License
Proprietary (TBD). Contact the author for details.

## Docs
- Vision: [VISION.md](VISION.md)
- Changelog: [CHANGELOG.md](CHANGELOG.md)
- Deployment plan: [DEPLOYMENT_PLAN.md](DEPLOYMENT_PLAN.md)
- Testing notes (Jest): [docs/testing-notes.md](docs/testing-notes.md)
- Optional Playwright setup: [PLAYWRIGHT_SETUP.md](PLAYWRIGHT_SETUP.md)
