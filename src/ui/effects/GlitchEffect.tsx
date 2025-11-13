/**
 * Glitch Effect Component
 * Creates text glitch animations for horror moments
 */

import React, { useEffect, useRef, useState } from 'react';

export interface GlitchEffectProps {
  intensity: number; // 0-10
  children: React.ReactNode;
  trigger?: boolean; // Manual trigger for glitch
  duration?: number; // Duration in ms
  className?: string;
}

/**
 * Glitch Effect Component
 * Applies glitch animation to text content
 */
export const GlitchEffect: React.FC<GlitchEffectProps> = ({
  intensity,
  children,
  trigger = false,
  duration = 500,
  className = ''
}) => {
  const [isGlitching, setIsGlitching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger glitch effect
  useEffect(() => {
    if (trigger || intensity > 7) {
      setIsGlitching(true);
      const timer = setTimeout(() => setIsGlitching(false), duration);
      return () => clearTimeout(timer);
    }
  }, [trigger, intensity, duration]);

  // Apply glitch styles based on intensity
  useEffect(() => {
    if (!containerRef.current || !isGlitching) return;

    const element = containerRef.current;
    const glitchIntensity = Math.min(intensity, 10);

    // Add glitch class
    element.classList.add('glitching');

    // Apply random text shadows for glitch effect
    const createGlitchShadow = () => {
      const offset = glitchIntensity * 2;
      const shadows = [
        `${Math.random() * offset - offset / 2}px ${Math.random() * offset - offset / 2}px 0 rgba(255, 0, 0, ${0.5 + glitchIntensity / 20})`,
        `${Math.random() * offset - offset / 2}px ${Math.random() * offset - offset / 2}px 0 rgba(0, 255, 0, ${0.5 + glitchIntensity / 20})`,
        `${Math.random() * offset - offset / 2}px ${Math.random() * offset - offset / 2}px 0 rgba(0, 0, 255, ${0.5 + glitchIntensity / 20})`
      ];
      element.style.textShadow = shadows.join(', ');
    };

    // Create flickering effect
    const interval = setInterval(createGlitchShadow, 50);

    // Cleanup
    return () => {
      clearInterval(interval);
      element.classList.remove('glitching');
      element.style.textShadow = '';
    };
  }, [isGlitching, intensity]);

  const glitchStyle = isGlitching ? {
    animation: `glitch ${100 / intensity}ms infinite`,
  } : {};

  return (
    <div
      ref={containerRef}
      className={`glitch-effect ${className} ${isGlitching ? 'active' : ''}`}
      style={glitchStyle}
      data-intensity={intensity}
    >
      {children}
    </div>
  );
};

/**
 * Hook for programmatic glitch triggering
 */
export const useGlitchEffect = (intensity: number = 5) => {
  const [isTriggered, setIsTriggered] = useState(false);

  const trigger = () => {
    setIsTriggered(true);
    setTimeout(() => setIsTriggered(false), 500);
  };

  return { trigger, isTriggered, intensity };
};

/**
 * Glitch Text Component - for inline glitchy text
 */
export interface GlitchTextProps {
  text: string;
  intensity?: number;
  className?: string;
}

export const GlitchText: React.FC<GlitchTextProps> = ({
  text,
  intensity = 5,
  className = ''
}) => {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    if (intensity < 3) {
      setDisplayText(text);
      return;
    }

    // Randomly corrupt characters
    const corruptText = () => {
      const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const result = text.split('').map((char, i) => {
        const shouldCorrupt = Math.random() < (intensity / 50);
        return shouldCorrupt ? chars[Math.floor(Math.random() * chars.length)] : char;
      }).join('');
      setDisplayText(result);
    };

    const interval = setInterval(corruptText, 100);

    return () => {
      clearInterval(interval);
      setDisplayText(text);
    };
  }, [text, intensity]);

  return (
    <GlitchEffect intensity={intensity} className={className}>
      <span className="glitch-text">{displayText}</span>
    </GlitchEffect>
  );
};

export default GlitchEffect;
