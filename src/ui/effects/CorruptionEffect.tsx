/**
 * Corruption Effect Component
 * Applies visual corruption effects based on corruption level (0-100)
 */

import React, { useEffect, useRef } from 'react';

export interface CorruptionEffectProps {
  level: number; // 0-100
  children: React.ReactNode;
  className?: string;
}

/**
 * Corruption Effect Component
 * Wraps children with corruption-based visual effects
 */
export const CorruptionEffect: React.FC<CorruptionEffectProps> = ({
  level,
  children,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const element = containerRef.current;

    // Calculate corruption effects
    const hueShift = level * 3.6; // 0-360 degrees
    const saturation = 1 + (level / 100);
    const brightness = 1 - (level / 400);
    const rotation = level * 0.1;
    const opacity = Math.max(0.3, 1 - (level / 200));
    const blur = level / 20;

    // Apply CSS transformations
    element.style.filter = `
      hue-rotate(${hueShift}deg)
      saturate(${saturation})
      brightness(${brightness})
      blur(${blur}px)
    `;
    element.style.transform = `rotate(${rotation}deg)`;
    element.style.opacity = opacity.toString();

    // Apply glitch effect at high corruption
    if (level > 70) {
      element.style.animation = 'glitch 0.3s infinite';
    } else {
      element.style.animation = 'none';
    }

    // Cleanup
    return () => {
      element.style.filter = '';
      element.style.transform = '';
      element.style.opacity = '';
      element.style.animation = '';
    };
  }, [level]);

  return (
    <div
      ref={containerRef}
      className={`corruption-effect ${className}`}
      data-corruption-level={level}
      style={{ transition: 'all 0.3s ease' }}
    >
      {children}
    </div>
  );
};

/**
 * Hook for programmatic corruption effect application
 */
export const useCorruptionEffect = (level: number) => {
  const applyTo = (element: HTMLElement) => {
    if (!element) return;

    const hueShift = level * 3.6;
    const saturation = 1 + (level / 100);
    const brightness = 1 - (level / 400);
    const rotation = level * 0.1;
    const opacity = Math.max(0.3, 1 - (level / 200));
    const blur = level / 20;

    element.style.filter = `
      hue-rotate(${hueShift}deg)
      saturate(${saturation})
      brightness(${brightness})
      blur(${blur}px)
    `;
    element.style.transform = `rotate(${rotation}deg)`;
    element.style.opacity = opacity.toString();

    if (level > 70) {
      element.style.animation = 'glitch 0.3s infinite';
    }
  };

  const remove = (element: HTMLElement) => {
    if (!element) return;

    element.style.filter = '';
    element.style.transform = '';
    element.style.opacity = '';
    element.style.animation = '';
  };

  return { applyTo, remove, level };
};

export default CorruptionEffect;
