# Apophenia - AI-Driven Interactive Narrative Game

**ALWAYS follow these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

Apophenia is a React + TypeScript + Zustand web application that creates AI-driven interactive narrative experiences. The architecture follows a clear separation: flows → command queue → executors → stores → UI.

## Quick Bootstrap & Development

**Initial setup (may vary from 30 seconds to 1+ minute):**
```bash
# Install dependencies
npm install
# NEVER CANCEL: Takes 30 seconds to 1+ minute depending on network. Set timeout to 300+ seconds.
```

**Build and validate (5 seconds total):**
```bash
# Build production version
npm run build
# NEVER CANCEL: Takes ~4 seconds. Set timeout to 30+ seconds.

# Run TypeScript type checking
npx tsc --noEmit
# NEVER CANCEL: Takes ~3 seconds. Set timeout to 30+ seconds.

# Run tests
npm test
# NEVER CANCEL: Takes ~1.5 seconds. Set timeout to 30+ seconds.
```

**Development server:**
```bash
# Start development server
npm run dev
# Serves on http://localhost:5173/
# Ready in ~0.2 seconds

# Preview production build
npx vite preview
# Serves built files from dist/ folder
```

## Working Effectively

### Environment Variables
**CRITICAL**: Create environment files for AI integration:
```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local with your keys:
VITE_GEMINI_API_KEY=your-google-api-key-here
VITE_IMAGE_API_KEY=your-image-api-key-here
```

**Without API keys**: App still runs with mock data and error handling.

### Project Structure Navigation
```
src/
├── components/          # React UI components
├── stores/             # Zustand state management (game state, UI state)
├── services/           # Business logic, AI flows, game controller
├── commands/           # Command executors (displayText, generateImage, etc.)
├── types.ts           # Centralized type definitions
└── App.tsx            # Main application entry
```

**Key Files:**
- `src/App.tsx` - Main UI and game interface
- `src/stores/gameStore.ts` - Core game state (story segments, choices)
- `src/services/gameService.ts` - Game controller and flow orchestration
- `src/services/flows/` - AI integration flows (concept, nextStep, etc.)
- `src/commands/` - Command executors for game actions
- `src/types.ts` - All TypeScript type definitions

## Validation & Testing

**Always run before committing:**
```bash
# Type checking (required - CI will fail without this)
npx tsc --noEmit

# Build verification
npm run build

# Test suite
npm test
```

**Manual validation scenarios:**
1. **Basic game flow**: Start app → click "New Game" → verify choices appear
2. **Story progression**: Click choice buttons → verify new story segments load
3. **Save/Load**: Test save game and new game functionality
4. **Error handling**: Test without API keys → verify graceful degradation

**End-to-end validation with Playwright (optional):**
```bash
# Install Playwright (first time only) - may fail due to network limitations
pip install playwright
playwright install

# Start dev server first
npm run dev

# Run verification script (in another terminal)
python verify.py
# Creates verification.png screenshot

# NOTE: If Playwright installation fails, use manual browser testing instead
```

## Common Development Tasks

### Adding New Commands
1. Create command type in `src/types.ts` (Command union)
2. Create executor in `src/commands/newCommand.ts`
3. Register executor in `src/services/commandExecutor.ts`
4. Add tests in `src/commands/__tests__/`

### Modifying AI Flows
- Edit files in `src/services/flows/`
- Test with mock data first, then real API keys
- Update flow types in `src/types.ts` if needed

### UI Changes
- Modify React components in `src/components/` or `src/App.tsx`
- Test with `npm run dev` for hot reloading
- Verify mobile responsiveness

### State Management
- Game state: `src/stores/gameStore.ts`
- UI state: `src/stores/uiStore.ts`
- **IMPORTANT**: Always update by segmentId, not by "last" segment

## Build Pipeline (CI)

**GitHub Actions (`.github/workflows/ci.yml`):**
- Runs on all pushes and PRs
- Node.js 20.x
- Steps: checkout → setup Node → npm ci → npm run build
- **Must pass** before merging

**No linting configured** - only TypeScript compilation and build validation.

## Deployment

**Vercel/Netlify deployment:**
```bash
# Build static files
npm run build
# Output in dist/ folder

# Configure environment variables in deployment platform:
VITE_GEMINI_API_KEY=your-google-api-key
VITE_IMAGE_API_KEY=your-image-api-key
```

**Security**: Never commit API keys. Use environment variables for all secrets.

## Common Issues & Solutions

**Build failures:**
- Check TypeScript errors with `npx tsc --noEmit`
- Verify all imports are correct
- Check for missing dependencies

**Runtime errors with API keys:**
- App degrades gracefully without keys
- Check browser console for specific API errors
- Verify environment variable names (VITE_ prefix required)

**State synchronization issues:**
- Always use segmentId for updates, not array indices
- Check Zustand store actions in browser DevTools
- Verify command payloads match type definitions

## Development Guidelines

**Code style:**
- Use TypeScript strictly (all types defined in `src/types.ts`)
- Follow React hooks patterns
- Maintain command/executor separation
- Keep stores focused and minimal

**Testing:**
- Write tests for new command executors
- Test both success and error scenarios
- Mock AI services for consistent testing
- Use Jest + ts-jest configuration (already set up)

**Performance:**
- Commands are processed asynchronously
- Non-blocking operations don't halt UI
- Image generation can be cancelled (TODO: implement cancellation)

Remember: **The architecture is flows → commands → executors → stores → UI**. Preserve this separation when making changes.