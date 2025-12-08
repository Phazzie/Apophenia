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
const GlitchEffectComponent: React.FC<GlitchEffectProps> = ({
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

    // Create flickering effect using requestAnimationFrame for better performance
    let frameId: number;
    let lastUpdateTime = 0;
    const frameInterval = 50; // Target 50ms update frequency

    const animate = () => {
      const now = Date.now();
      if (now - lastUpdateTime >= frameInterval) {
        createGlitchShadow();
        lastUpdateTime = now;
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
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

const GlitchTextComponent: React.FC<GlitchTextProps> = ({
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

    // Use requestAnimationFrame for better performance
    let frameId: number;
    let lastUpdateTime = 0;
    const frameInterval = 100; // Target 100ms update frequency

    const animate = () => {
      const now = Date.now();
      if (now - lastUpdateTime >= frameInterval) {
        corruptText();
        lastUpdateTime = now;
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      setDisplayText(text);
    };
  }, [text, intensity]);

  return (
    <GlitchEffect intensity={intensity} className={className}>
      <span className="glitch-text">{displayText}</span>
    </GlitchEffect>
  );
};

// Memoize components to prevent unnecessary re-renders
export const GlitchEffect = React.memo(GlitchEffectComponent);
export const GlitchText = React.memo(GlitchTextComponent);

export default GlitchEffect;
