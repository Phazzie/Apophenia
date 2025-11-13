/**
 * Theme Provider Component
 * Provides cosmic horror theme context and CSS variables to all child components
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import './styles.css';

export interface ThemeColors {
  voidDark: string;
  voidMedium: string;
  voidLight: string;
  eldritchPurple: string;
  bloodRed: string;
  cosmicBlue: string;
  corruptedGold: string;
  toxicGreen: string;
  voidWhite: string;
}

export interface ThemeContextValue {
  colors: ThemeColors;
  corruptionLevel: number;
  setCorruptionLevel: (level: number) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  initialCorruption?: number;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialCorruption = 0
}) => {
  const [corruptionLevel, setCorruptionLevel] = useState(initialCorruption);

  const colors: ThemeColors = {
    voidDark: '#0a0e27',
    voidMedium: '#1a1f3a',
    voidLight: '#2a2f4a',
    eldritchPurple: '#2d1b4e',
    bloodRed: '#8b0000',
    cosmicBlue: '#1e3a5f',
    corruptedGold: '#d4af37',
    toxicGreen: '#39ff14',
    voidWhite: '#e8e8f0',
  };

  // Apply corruption-based theme adjustments
  useEffect(() => {
    const root = document.documentElement;

    // Calculate corruption effects
    const hueShift = corruptionLevel * 3.6; // 0-360 degrees
    const saturation = 1 + (corruptionLevel / 100);
    const brightness = 1 - (corruptionLevel / 400);

    // Apply filter to body
    document.body.style.filter = `
      hue-rotate(${hueShift}deg)
      saturate(${saturation})
      brightness(${brightness})
    `;

    // Apply subtle rotation to root
    root.style.transform = `rotate(${corruptionLevel * 0.05}deg)`;

    // Update CSS custom property for corruption level
    root.style.setProperty('--corruption-level', corruptionLevel.toString());
  }, [corruptionLevel]);

  const value: ThemeContextValue = {
    colors,
    corruptionLevel,
    setCorruptionLevel,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
