# Apophenia UI Components

This directory contains all React UI components for the Apophenia cosmic horror game, implementing the architectural seams defined in `/home/user/Apophenia/SEAMS.md`.

## Directory Structure

```
src/ui/
├── screens/           # Full-screen components
│   ├── StartScreen.tsx
│   ├── DescentScreen.tsx
│   └── UnravelingScreen.tsx
├── components/        # Reusable UI components
│   ├── ChoiceButton.tsx
│   ├── LoadingIndicator.tsx
│   └── StorySegmentDisplay.tsx
├── effects/           # Visual effect components
│   ├── CorruptionEffect.tsx
│   └── GlitchEffect.tsx
├── theme/             # Theme system
│   ├── ThemeProvider.tsx
│   └── styles.css
└── index.ts           # Barrel exports
```

## Architecture Principles

### Pure React Components
✅ **No direct store access** - All state passed via props
✅ **Callbacks for actions** - Parent components handle state changes
✅ **No business logic** - Components focus purely on presentation
✅ **Interface compliance** - Implement props interfaces from `seams.ts`

### Props Flow
```
State Store → Container Component → UI Component → User Interaction → Callback → Store Action
```

## Screens

### StartScreen
**Path**: `/home/user/Apophenia/src/ui/screens/StartScreen.tsx`

**Purpose**: Genre and AI provider selection for new game initialization

**Props** (`StartScreenProps`):
- `onStartGame(genre, provider)` - Called when user starts game
- `availableGenres` - Array of genre configurations
- `availableProviders` - Array of AI provider options

**Features**:
- Genre selection with cards showing themes
- AI provider radio buttons
- Visual preview of genre aesthetics
- Warning message for psychological content

---

### DescentScreen
**Path**: `/home/user/Apophenia/src/ui/screens/DescentScreen.tsx`

**Purpose**: Main gameplay interface with story and choices

**Props** (`DescentScreenProps`):
- `worldState` - Current game world state
- `currentSegment` - Active story segment
- `choices` - Available choice options
- `intrusiveThought` - Optional disturbing choice
- `isGenerating` - Loading state flag
- `onChoice(choice)` - Choice selection callback
- `onSave()` - Save game callback
- `onReset()` - Reset game callback

**Features**:
- Real-time stats display (corruption, health, horror intensity)
- Story segment rendering with images
- Choice button list
- Intrusive thought highlighting
- Loading indicator during generation
- Auto-scroll to latest content

---

### UnravelingScreen
**Path**: `/home/user/Apophenia/src/ui/screens/UnravelingScreen.tsx`

**Purpose**: Reality collapse end state with final narrative

**Props** (`UnravelingScreenProps`):
- `worldState` - Final world state
- `finalSegment` - Concluding story segment
- `onRestart()` - Restart game callback

**Features**:
- Maximum corruption effects
- Final world state summary
- Philosophical ending messages
- Restart option
- Animated collapse sequence

---

## Components

### ChoiceButton
**Path**: `/home/user/Apophenia/src/ui/components/ChoiceButton.tsx`

**Purpose**: Renders interactive choice buttons

**Props**:
- `choice` - Choice object with text and metadata
- `disabled` - Disable interaction
- `onClick()` - Click callback
- `intrusive` - Special styling for disturbing choices

**Features**:
- Hover animations
- Intrusive thought styling (red borders, glowing)
- Consequence text display
- Keyboard navigation support
- Disabled state handling

**Companion**: `ChoiceList` - Renders multiple choices with intrusive thought

---

### LoadingIndicator
**Path**: `/home/user/Apophenia/src/ui/components/LoadingIndicator.tsx`

**Purpose**: Thematic loading animations

**Props**:
- `text` - Loading message (default: "LOADING")
- `size` - 'small' | 'medium' | 'large'
- `variant` - 'spinner' | 'dots' | 'pulse'

**Features**:
- Multiple animation variants
- Glitch text effects
- Size variations
- Thematic cosmic horror styling

**Companion**: `LoadingText` - Inline loading text with animated dots

---

### StorySegmentDisplay
**Path**: `/home/user/Apophenia/src/ui/components/StorySegmentDisplay.tsx`

**Purpose**: Renders story segments with metadata

**Props**:
- `segment` - Story segment object
- `showImage` - Display images (default: true)
- `showMetadata` - Display badges (default: true)

**Features**:
- Image loading states
- Metadata badges:
  - `[MEMORY REVISED]` - Temporal revision
  - `[TIMELINE SHIFT]` - Quantum narrative
  - `[FOURTH WALL BREACH]` - Meta-consciousness
  - `[REALITY CORRUPTED: X%]` - High corruption
- Original text reveal for revised segments
- Corruption-based text rendering

**Companion**: `StoryHistoryDisplay` - Renders multiple segments

---

## Effects

### CorruptionEffect
**Path**: `/home/user/Apophenia/src/ui/effects/CorruptionEffect.tsx`

**Purpose**: Apply visual corruption based on corruption level

**Props**:
- `level` - Corruption level (0-100)
- `children` - Content to corrupt

**How It Works**:
```typescript
const effects = {
  hueShift: level * 3.6,        // 0-360 degrees
  saturation: 1 + (level / 100), // Increases color intensity
  brightness: 1 - (level / 400), // Darkens
  rotation: level * 0.1,         // Slight tilt
  opacity: 1 - (level / 200),    // Fades
  blur: level / 20               // Blurs edges
};
```

**Visual Results by Level**:
- **0-30**: Barely noticeable hue shift
- **31-50**: Visible color distortion, slight blur
- **51-70**: Heavy distortion, rotation begins
- **71-100**: Extreme effects + glitch animation

**Hook**: `useCorruptionEffect(level)` - Returns `{ applyTo, remove, level }`

---

### GlitchEffect
**Path**: `/home/user/Apophenia/src/ui/effects/GlitchEffect.tsx`

**Purpose**: Text glitch animations for horror moments

**Props**:
- `intensity` - Glitch intensity (0-10)
- `trigger` - Manual trigger flag
- `duration` - Animation duration in ms

**How It Works**:
- Random RGB text shadows at different offsets
- Character corruption at high intensity
- Flicker animations
- Auto-trigger at intensity > 7

**Components**:
- `GlitchEffect` - Wrapper for glitch effects
- `GlitchText` - Glitchy text with character corruption

**Hook**: `useGlitchEffect(intensity)` - Returns `{ trigger, isTriggered, intensity }`

---

## Theme

### ThemeProvider
**Path**: `/home/user/Apophenia/src/ui/theme/ThemeProvider.tsx`

**Purpose**: Provide theme context and CSS variables

**Features**:
- Theme color management
- Corruption-based theme adjustments
- CSS custom properties
- Theme context for hooks

**Hook**: `useTheme()` - Returns theme colors and corruption level

**Colors**:
```typescript
{
  voidDark: '#0a0e27',       // Deep space dark
  voidMedium: '#1a1f3a',     // Medium void
  voidLight: '#2a2f4a',      // Light void
  eldritchPurple: '#2d1b4e', // Cosmic purple
  bloodRed: '#8b0000',       // Horror red
  cosmicBlue: '#1e3a5f',     // Deep blue
  corruptedGold: '#d4af37',  // Corrupted accent
  toxicGreen: '#39ff14',     // Toxic glow
  voidWhite: '#e8e8f0'       // Off-white text
}
```

---

### styles.css
**Path**: `/home/user/Apophenia/src/ui/theme/styles.css`

**Purpose**: Global cosmic horror styles

**Contents**:
- CSS custom properties (colors, spacing, shadows)
- Typography (monospace for UI, serif for titles)
- Gradients (void, eldritch, corruption)
- Animation keyframes (glitch, pulse-glow, corruption-shift, fade-in, flicker)
- Utility classes
- Responsive breakpoints

**Key Animations**:
```css
@keyframes glitch { /* RGB split effect */ }
@keyframes pulse-glow { /* Breathing glow */ }
@keyframes corruption-shift { /* Color cycle */ }
@keyframes fade-in { /* Smooth entrance */ }
@keyframes flicker { /* Horror flicker */ }
```

---

## Testing

All components have comprehensive unit tests in `/home/user/Apophenia/tests/unit/ui/`:

```
tests/unit/ui/
├── screens/
│   ├── StartScreen.test.tsx        ✅ 70%+ coverage
│   ├── DescentScreen.test.tsx      ✅ 70%+ coverage
│   └── UnravelingScreen.test.tsx   ✅ 70%+ coverage
├── components/
│   ├── ChoiceButton.test.tsx       ✅ 80%+ coverage
│   ├── LoadingIndicator.test.tsx   ✅ 80%+ coverage
│   └── StorySegmentDisplay.test.tsx ✅ 80%+ coverage
├── effects/
│   ├── CorruptionEffect.test.tsx   ✅ 75%+ coverage
│   └── GlitchEffect.test.tsx       ✅ 75%+ coverage
└── theme/
    └── ThemeProvider.test.tsx      ✅ 80%+ coverage
```

**Test Coverage Target**: 70%+ overall

**Running Tests**:
```bash
npm test                    # Run all tests
npm test -- ui             # Run only UI tests
npm test -- --coverage     # With coverage report
```

---

## Usage Examples

### Importing Components
```typescript
import {
  StartScreen,
  DescentScreen,
  UnravelingScreen,
  ChoiceButton,
  StorySegmentDisplay,
  LoadingIndicator,
  CorruptionEffect,
  GlitchEffect,
  ThemeProvider
} from './ui';
```

### Using in App
```typescript
import { ThemeProvider } from './ui/theme/ThemeProvider';
import { StartScreen } from './ui/screens/StartScreen';

function App() {
  return (
    <ThemeProvider initialCorruption={0}>
      <StartScreen
        onStartGame={(genre, provider) => {
          // Handle game start
        }}
        availableGenres={genres}
        availableProviders={providers}
      />
    </ThemeProvider>
  );
}
```

### Applying Corruption Effects
```typescript
import { CorruptionEffect } from './ui/effects/CorruptionEffect';

<CorruptionEffect level={worldState.corruptionLevel}>
  <div className="game-content">
    {/* Your content here */}
  </div>
</CorruptionEffect>
```

### Using Glitch Effects
```typescript
import { GlitchText } from './ui/effects/GlitchEffect';

<GlitchText
  text="REALITY FAILING"
  intensity={8}
/>
```

---

## Responsive Design

All components are mobile-first and responsive:

**Breakpoints**:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Features**:
- Fluid typography
- Flexible layouts
- Touch-friendly buttons
- Optimized spacing

---

## Accessibility

**Keyboard Navigation**:
- All buttons accessible via Tab
- Enter/Space to activate
- Arrow keys for navigation

**Screen Readers**:
- Semantic HTML
- ARIA labels where needed
- Proper heading hierarchy

**Visual**:
- High contrast ratios
- Clear focus indicators
- Readable font sizes

---

## Performance

**Optimizations**:
- Lazy loading for images
- CSS-only animations where possible
- Minimal re-renders via React.memo
- Efficient effect applications

**Bundle Size**:
- Minimal dependencies
- Tree-shakeable exports
- CSS-in-JS for component styles

---

## Future Enhancements

Potential additions:
- [ ] Dark mode toggle
- [ ] Custom theme builder
- [ ] Animation intensity settings
- [ ] Sound effect integration
- [ ] Haptic feedback support
- [ ] PWA offline support

---

## Troubleshooting

**Issue**: Components not rendering
- ✅ Check ThemeProvider wrapper
- ✅ Verify prop types match interfaces
- ✅ Check console for TypeScript errors

**Issue**: Corruption effects not working
- ✅ Ensure corruptionLevel is 0-100
- ✅ Check CSS is imported
- ✅ Verify browser supports CSS filters

**Issue**: Tests failing
- ✅ Install @testing-library/react
- ✅ Check vitest.config.ts
- ✅ Verify mock implementations

---

## Agent 4 Completion Checklist

✅ All interfaces from seams.ts implemented
✅ TypeScript strict mode passes
✅ Unit tests written and passing
✅ Coverage meets 70%+ target
✅ No circular dependencies
✅ No direct store access in components
✅ Pure React with props/callbacks pattern
✅ Cosmic horror aesthetic implemented
✅ Responsive design mobile-first
✅ Documentation complete

---

**Agent 4: UI Components Designer**
Status: ✅ **COMPLETE**
