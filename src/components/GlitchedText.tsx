// #TODO DEPRECATED: Migrate to src/ui and use src/core/state.
import React, { useEffect, useState, useMemo } from 'react';

interface GlitchedTextProps {
  text: string;
}

// Pre-defined style objects to avoid recreation
const hiddenStyle = { opacity: 0 };
const normalStyle = {};

const GlitchedText: React.FC<GlitchedTextProps> = ({ text }) => {
  const [glitchState, setGlitchState] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Only store the glitch type numbers, not the JSX
      const newGlitchState = text.split('').map(() =>
        Math.random() < 0.1 ? Math.floor(Math.random() * 3) : -1
      );
      setGlitchState(newGlitchState);
    }, 2000); // Glitch effect updates every 2 seconds

    return () => clearInterval(interval);
  }, [text]);

  // Memoize the rendered text to avoid recreating it on every render
  const glitchedText = useMemo(() => {
    return text.split('').map((char, index) => {
      const glitchType = glitchState[index];
      if (glitchType === 0) {
        return <span key={index} style={hiddenStyle}>{char}</span>; // Missing letter
      } else if (glitchType === 1) {
        // Create style object only when needed
        const skewStyle = {
          transform: `rotate(${Math.random() * 10 - 5}deg) translateY(${Math.random() * 6 - 3}px)`
        };
        return <span key={index} style={skewStyle}>{char}</span>; // Slightly askew
      } else {
        return <span key={index} style={normalStyle}>{char}</span>; // Normal
      }
    });
  }, [text, glitchState]);

  return <h1 className="glitched-title">{glitchedText}</h1>;
};

// Memoize to prevent unnecessary re-renders when parent re-renders
// Only re-render when text prop changes
export default React.memo(GlitchedText);
