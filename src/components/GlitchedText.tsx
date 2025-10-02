import React, { useEffect, useState } from 'react';

interface GlitchedTextProps {
  text: string;
}

const GlitchedText: React.FC<GlitchedTextProps> = ({ text }) => {
  const [glitchedText, setGlitchedText] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newGlitchedText = text.split('').map((char, index) => {
        const shouldGlitch = Math.random() < 0.1;
        if (shouldGlitch) {
          const glitchType = Math.floor(Math.random() * 3);
          switch (glitchType) {
            case 0:
              return <span key={index} style={{ opacity: 0 }}>{char}</span>; // Missing letter
            case 1:
              return <span key={index} style={{ transform: `rotate(${Math.random() * 10 - 5}deg) translateY(${Math.random() * 6 - 3}px)` }}>{char}</span>; // Slightly askew
            default:
              return <span key={index}>{char}</span>; // Normal
          }
        } else {
          return <span key={index}>{char}</span>;
        }
      });
      setGlitchedText(newGlitchedText);
    }, 2000); // Glitch effect updates every 2 seconds

    return () => clearInterval(interval);
  }, [text]);

  return <h1 className="glitched-title">{glitchedText}</h1>;
};

export default GlitchedText;
