/**
 * UI Components - Main Export File
 *
 * Barrel export for all UI components, screens, effects, and theme
 */

// Screens
export { StartScreen } from './screens/StartScreen';
export { DescentScreen } from './screens/DescentScreen';
export { UnravelingScreen } from './screens/UnravelingScreen';

// Components
export { ChoiceButton, ChoiceList } from './components/ChoiceButton';
export type { ChoiceButtonProps, ChoiceListProps } from './components/ChoiceButton';

export { StorySegmentDisplay, StoryHistoryDisplay } from './components/StorySegmentDisplay';
export type { StorySegmentDisplayProps, StoryHistoryDisplayProps } from './components/StorySegmentDisplay';

export { LoadingIndicator, LoadingText } from './components/LoadingIndicator';
export type { LoadingIndicatorProps } from './components/LoadingIndicator';

// Effects
export { CorruptionEffect, useCorruptionEffect } from './effects/CorruptionEffect';
export type { CorruptionEffectProps } from './effects/CorruptionEffect';

export { GlitchEffect, GlitchText, useGlitchEffect } from './effects/GlitchEffect';
export type { GlitchEffectProps, GlitchTextProps } from './effects/GlitchEffect';

// Theme
export { ThemeProvider, useTheme } from './theme/ThemeProvider';
export type { ThemeColors, ThemeContextValue } from './theme/ThemeProvider';
