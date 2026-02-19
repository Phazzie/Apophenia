<<<<<<< audit-todo-system-13448203675236679220
// #TODO DEPRECATED: This file is part of the Legacy System. Migrate logic to src/ui/ and delete.
=======
// #TODO DEPRECATED: Migrate to src/ui and use src/core/state.
>>>>>>> feature/main
import React, { useEffect, useState } from 'react';

const unsettlingPhrases = [
  "Rerouting neural pathways...",
  "Scraping memories from the void...",
  "The abyss gazes also...",
  "Condensing existential dread...",
  "Translating static into prophecy...",
  "Awaiting a sign from the outer gods...",
  "The walls are breathing...",
  "Time is a flat circle...",
  "I have seen the fnords...",
  "The sleeper must awaken...",
  "In his house at R'lyeh, dead Cthulhu waits dreaming...",
  "I am a brain, Watson. The rest of me is a mere appendix...",
  "All work and no play makes Jack a dull boy...",
  "The owls are not what they seem...",
  "We are all prisoners of our own device..."
];

const ThematicLoading: React.FC = () => {
  const [phrase, setPhrase] = useState('');
  const [glitchStyle, setGlitchStyle] = useState({});

  useEffect(() => {
    // Select a new phrase and a new glitch effect every 2 seconds
    const interval = setInterval(() => {
      setPhrase(unsettlingPhrases[Math.floor(Math.random() * unsettlingPhrases.length)]);

      const glitchType = Math.floor(Math.random() * 5);
      switch (glitchType) {
        case 0:
          setGlitchStyle({ transform: `skew(${Math.random() * 10 - 5}deg)` }); // Skewed text
          break;
        case 1:
          setGlitchStyle({ filter: `blur(${Math.random() * 2}px)` }); // Blurry text
          break;
        case 2:
          setGlitchStyle({ textShadow: `0 0 5px #fff, 0 0 10px #fff, 0 0 15px #00ff00, 0 0 20px #00ff00, 0 0 25px #00ff00, 0 0 30px #00ff00, 0 0 35px #00ff00` }); // Ghostly glow
          break;
        case 3:
          setGlitchStyle({ letterSpacing: `${Math.random() * 10 - 5}px` }); // Warped spacing
          break;
        default:
          setGlitchStyle({}); // No effect
          break;
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p style={glitchStyle}>{phrase}</p>
    </div>
  );
};

export default ThematicLoading;
