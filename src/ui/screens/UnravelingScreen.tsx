/**
 * Unraveling Screen Component
 * Reality collapse end state with final narrative
 */

import React, { useEffect, useState } from 'react';
import { UnravelingScreenProps } from '../../core/types/seams';
import { StorySegmentDisplay } from '../components/StorySegmentDisplay';
import { CorruptionEffect } from '../effects/CorruptionEffect';
import { GlitchText } from '../effects/GlitchEffect';

export const UnravelingScreen: React.FC<UnravelingScreenProps> = ({
  worldState,
  finalSegment,
  onRestart
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Trigger full collapse animation after a delay
    const timer = setTimeout(() => {
      setIsCollapsed(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const unravelingLevel = worldState.corruptionLevel;

  return (
    <div className={`unraveling-screen screen-container drip-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <CorruptionEffect level={unravelingLevel}>
        <div className="unraveling-container">
          <header className="unraveling-header">
            <h1 className="unraveling-title">
              <GlitchText
                text="REALITY UNRAVELING"
                intensity={10}
              />
            </h1>
            <div className="corruption-display">
              <span className="corruption-label">CORRUPTION:</span>
              <span className="corruption-value">
                <GlitchText
                  text={`${unravelingLevel}%`}
                  intensity={8}
                />
              </span>
            </div>
          </header>

          <main className="unraveling-content">
            <div className="final-narrative">
              <StorySegmentDisplay
                segment={finalSegment}
                showImage={true}
                showMetadata={true}
              />
            </div>

            <div className="world-state-summary">
              <h2 className="summary-title">
                <GlitchText text="FINAL STATE" intensity={6} />
              </h2>
              <div className="summary-stats">
                <div className="summary-stat">
                  <span className="summary-label">Protagonist:</span>
                  <span className="summary-value">{worldState.protagonist}</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-label">Setting:</span>
                  <span className="summary-value">{worldState.setting}</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-label">Psychological Status:</span>
                  <span className="summary-value status">
                    <GlitchText
                      text={worldState.psychologicalStatus.toUpperCase()}
                      intensity={7}
                    />
                  </span>
                </div>
                <div className="summary-stat">
                  <span className="summary-label">System Health:</span>
                  <span className="summary-value">{worldState.systemHealth}%</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-label">Horror Intensity:</span>
                  <span className="summary-value">{worldState.horrorIntensity}/10</span>
                </div>
              </div>
            </div>

            <div className="collapse-message">
              {isCollapsed ? (
                <>
                  <GlitchText
                    text="THE PATTERN COMPLETES"
                    intensity={10}
                  />
                  <p className="collapse-subtitle">
                    You have witnessed the unraveling of reality itself.
                  </p>
                  <p className="collapse-subtitle">
                    The pattern recognition that seemed like insight...
                  </p>
                  <p className="collapse-subtitle">
                    Was always the first symptom of madness.
                  </p>
                </>
              ) : (
                <p className="collapse-waiting">
                  Reality is fragmenting...
                </p>
              )}
            </div>
          </main>

          <footer className="unraveling-footer">
            <button
              type="button"
              className="button restart-button"
              onClick={onRestart}
            >
              <GlitchText text="BEGIN AGAIN" intensity={4} />
            </button>
            <p className="footer-message">
              The cycle continues. It always does.
            </p>
          </footer>
        </div>
      </CorruptionEffect>

      <style>{`
        .unraveling-screen {
          background: var(--gradient-corruption);
          animation: corruption-shift 10s infinite;
          position: relative;
          overflow: hidden;
        }

        .unraveling-screen::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(139, 0, 0, 0.1) 2px,
            rgba(139, 0, 0, 0.1) 4px
          );
          pointer-events: none;
          animation: scan-lines 8s linear infinite;
        }

        @keyframes scan-lines {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(100px);
          }
        }

        .unraveling-screen.collapsed {
          animation: flicker 0.5s infinite, corruption-shift 5s infinite;
        }

        .unraveling-container {
          max-width: 900px;
          width: 100%;
          padding: var(--spacing-xl);
          position: relative;
          z-index: 1;
        }

        .unraveling-header {
          text-align: center;
          margin-bottom: var(--spacing-xl);
          padding: var(--spacing-lg);
          background: rgba(10, 14, 39, 0.8);
          border: var(--border-medium) solid var(--color-blood-red);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-glow-intense);
        }

        .unraveling-title {
          font-size: 3rem;
          margin-bottom: var(--spacing-md);
          text-shadow: var(--shadow-glow-intense);
          animation: pulse-glow 2s infinite;
        }

        .corruption-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          font-family: var(--font-mono);
          font-size: 1.5rem;
        }

        .corruption-label {
          color: var(--color-dim-gray);
        }

        .corruption-value {
          color: var(--color-blood-red-light);
          text-shadow: 0 0 10px var(--color-blood-red);
        }

        .unraveling-content {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xl);
        }

        .final-narrative {
          padding: var(--spacing-lg);
          background: rgba(26, 31, 58, 0.8);
          border: var(--border-thin) solid var(--color-eldritch-purple);
          border-radius: var(--border-radius);
        }

        .world-state-summary {
          padding: var(--spacing-lg);
          background: rgba(10, 14, 39, 0.9);
          border: var(--border-thin) solid var(--color-blood-red);
          border-radius: var(--border-radius);
        }

        .summary-title {
          text-align: center;
          font-size: 1.5rem;
          margin-bottom: var(--spacing-md);
          color: var(--color-blood-red-light);
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-md);
        }

        .summary-stat {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .summary-label {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-dim-gray);
        }

        .summary-value {
          font-size: 1rem;
          color: var(--color-void-white);
        }

        .summary-value.status {
          color: var(--color-blood-red-light);
          text-shadow: 0 0 5px var(--color-blood-red);
        }

        .collapse-message {
          text-align: center;
          padding: var(--spacing-xl);
          font-family: var(--font-horror);
          font-size: 1.5rem;
          line-height: 2;
        }

        .collapse-subtitle {
          font-size: 1.1rem;
          color: var(--color-dim-gray);
          margin-top: var(--spacing-md);
          animation: fade-in 2s ease;
        }

        .collapse-subtitle:nth-child(2) {
          animation-delay: 1s;
        }

        .collapse-subtitle:nth-child(3) {
          animation-delay: 2s;
        }

        .collapse-subtitle:nth-child(4) {
          animation-delay: 3s;
        }

        .collapse-waiting {
          font-size: 1.25rem;
          color: var(--color-eldritch-purple-light);
          animation: pulse-glow 2s infinite;
        }

        .unraveling-footer {
          margin-top: var(--spacing-xl);
          text-align: center;
        }

        .restart-button {
          font-size: 1.25rem;
          padding: var(--spacing-md) var(--spacing-xl);
          margin-bottom: var(--spacing-md);
          min-width: 250px;
        }

        .footer-message {
          font-family: var(--font-horror);
          font-size: 0.875rem;
          color: var(--color-dim-gray);
          font-style: italic;
        }

        @media (max-width: 768px) {
          .unraveling-title {
            font-size: 2rem;
          }

          .corruption-display {
            font-size: 1.25rem;
          }

          .collapse-message {
            font-size: 1.1rem;
          }

          .summary-stats {
            grid-template-columns: 1fr;
          }

          .restart-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default UnravelingScreen;
