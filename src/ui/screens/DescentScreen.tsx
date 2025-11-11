/**
 * Descent Screen Component
 * Main gameplay interface with story display and choice selection
 */

import React, { useEffect, useRef } from 'react';
import { DescentScreenProps } from '../../core/types/seams';
import { StorySegmentDisplay } from '../components/StorySegmentDisplay';
import { ChoiceList } from '../components/ChoiceButton';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { CorruptionEffect } from '../effects/CorruptionEffect';
import { GlitchText } from '../effects/GlitchEffect';

export const DescentScreen: React.FC<DescentScreenProps> = ({
  worldState,
  currentSegment,
  choices,
  intrusiveThought,
  isGenerating,
  onChoice,
  onSave,
  onReset
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new segment appears
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [currentSegment]);

  const getPsychologicalStatusLabel = (status: string): string => {
    return status.toUpperCase().replace('_', ' ');
  };

  const getPsychologicalStatusColor = (status: string): string => {
    switch (status) {
      case 'stable':
        return 'var(--color-cosmic-blue-light)';
      case 'uneasy':
        return 'var(--color-eldritch-purple-light)';
      case 'paranoid':
        return 'var(--color-corrupted-gold)';
      case 'fragmented':
        return 'var(--color-blood-red-light)';
      case 'shattered':
        return 'var(--color-toxic-green)';
      default:
        return 'var(--color-void-white)';
    }
  };

  return (
    <div className="descent-screen screen-container">
      <CorruptionEffect level={worldState.corruptionLevel}>
        <div className="descent-layout">
          {/* Header with stats */}
          <header className="descent-header">
            <div className="stats-bar">
              <div className="stat-group">
                <span className="stat-label">Corruption</span>
                <div className="stat-bar">
                  <div
                    className="stat-fill corruption"
                    style={{ width: `${worldState.corruptionLevel}%` }}
                  />
                </div>
                <span className="stat-value">{worldState.corruptionLevel}%</span>
              </div>

              <div className="stat-group">
                <span className="stat-label">System Health</span>
                <div className="stat-bar">
                  <div
                    className="stat-fill health"
                    style={{ width: `${worldState.systemHealth}%` }}
                  />
                </div>
                <span className="stat-value">{worldState.systemHealth}%</span>
              </div>

              <div className="stat-group">
                <span className="stat-label">Horror Intensity</span>
                <div className="stat-bar">
                  <div
                    className="stat-fill horror"
                    style={{ width: `${(worldState.horrorIntensity / 10) * 100}%` }}
                  />
                </div>
                <span className="stat-value">{worldState.horrorIntensity}/10</span>
              </div>

              <div className="stat-group">
                <span className="stat-label">Psychological Status</span>
                <span
                  className="stat-value status"
                  style={{ color: getPsychologicalStatusColor(worldState.psychologicalStatus) }}
                >
                  {worldState.corruptionLevel > 70 ? (
                    <GlitchText
                      text={getPsychologicalStatusLabel(worldState.psychologicalStatus)}
                      intensity={7}
                    />
                  ) : (
                    getPsychologicalStatusLabel(worldState.psychologicalStatus)
                  )}
                </span>
              </div>
            </div>

            <div className="header-actions">
              <button
                type="button"
                className="button header-button"
                onClick={onSave}
                disabled={isGenerating}
                title="Save game"
              >
                Save
              </button>
              <button
                type="button"
                className="button header-button"
                onClick={onReset}
                disabled={isGenerating}
                title="Reset game"
              >
                Reset
              </button>
            </div>
          </header>

          {/* Main content area */}
          <main className="descent-main">
            <div className="story-container" ref={scrollContainerRef}>
              <div className="world-context">
                <h2 className="world-title">
                  {worldState.protagonist} - {worldState.setting}
                </h2>
                {worldState.dilemma && (
                  <p className="world-dilemma">{worldState.dilemma}</p>
                )}
                {worldState.summary && (
                  <p className="world-summary">{worldState.summary}</p>
                )}
              </div>

              <div className="story-content">
                <StorySegmentDisplay
                  segment={currentSegment}
                  showImage={true}
                  showMetadata={true}
                />
              </div>

              {isGenerating && (
                <div className="generating-indicator">
                  <LoadingIndicator
                    text="PROCESSING REALITY"
                    variant="pulse"
                  />
                </div>
              )}
            </div>

            {/* Choices section */}
            {!isGenerating && choices.length > 0 && (
              <div className="choices-container">
                <h3 className="choices-title">What will you do?</h3>
                <ChoiceList
                  choices={choices}
                  intrusiveThought={intrusiveThought}
                  disabled={isGenerating}
                  onChoice={onChoice}
                />
              </div>
            )}
          </main>
        </div>
      </CorruptionEffect>

      <style>{`
        .descent-screen {
          padding: 0;
          min-height: 100vh;
        }

        .descent-layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          max-width: 1200px;
          margin: 0 auto;
        }

        .descent-header {
          position: sticky;
          top: 0;
          z-index: var(--z-overlay);
          background: rgba(10, 14, 39, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: var(--border-thin) solid var(--color-eldritch-purple);
          padding: var(--spacing-md);
          box-shadow: var(--shadow-depth);
        }

        .stats-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-sm);
        }

        .stat-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .stat-label {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-dim-gray);
        }

        .stat-bar {
          width: 100%;
          height: 8px;
          background: var(--color-void-dark);
          border: var(--border-thin) solid var(--color-void-light);
          border-radius: var(--border-radius);
          overflow: hidden;
        }

        .stat-fill {
          height: 100%;
          transition: width 0.5s ease;
        }

        .stat-fill.corruption {
          background: linear-gradient(90deg, var(--color-blood-red), var(--color-corrupted-gold));
          box-shadow: 0 0 10px var(--color-blood-red);
        }

        .stat-fill.health {
          background: linear-gradient(90deg, var(--color-cosmic-blue), var(--color-eldritch-purple));
        }

        .stat-fill.horror {
          background: linear-gradient(90deg, var(--color-eldritch-purple), var(--color-blood-red));
        }

        .stat-value {
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--color-void-white);
        }

        .stat-value.status {
          font-weight: bold;
          text-shadow: var(--shadow-glow);
        }

        .header-actions {
          display: flex;
          gap: var(--spacing-sm);
          justify-content: flex-end;
        }

        .header-button {
          padding: var(--spacing-xs) var(--spacing-sm);
          font-size: 0.875rem;
        }

        .descent-main {
          flex: 1;
          padding: var(--spacing-lg);
          overflow-y: auto;
        }

        .story-container {
          margin-bottom: var(--spacing-xl);
          max-height: 60vh;
          overflow-y: auto;
          padding-right: var(--spacing-sm);
        }

        .world-context {
          margin-bottom: var(--spacing-lg);
          padding: var(--spacing-md);
          background: rgba(26, 31, 58, 0.6);
          border-left: 3px solid var(--color-eldritch-purple);
          border-radius: var(--border-radius);
        }

        .world-title {
          font-size: 1.5rem;
          margin-bottom: var(--spacing-xs);
          color: var(--color-eldritch-purple-light);
        }

        .world-dilemma {
          font-size: 1rem;
          color: var(--color-dim-gray);
          font-style: italic;
          margin-bottom: var(--spacing-xs);
        }

        .world-summary {
          font-size: 0.875rem;
          color: var(--color-dim-gray);
        }

        .story-content {
          margin-bottom: var(--spacing-md);
        }

        .generating-indicator {
          display: flex;
          justify-content: center;
          padding: var(--spacing-xl);
        }

        .choices-container {
          margin-top: var(--spacing-lg);
        }

        .choices-title {
          font-size: 1.25rem;
          margin-bottom: var(--spacing-md);
          color: var(--color-eldritch-purple-light);
          text-align: center;
        }

        @media (max-width: 768px) {
          .stats-bar {
            grid-template-columns: 1fr;
          }

          .descent-main {
            padding: var(--spacing-sm);
          }

          .story-container {
            max-height: 50vh;
          }

          .header-actions {
            margin-top: var(--spacing-sm);
          }
        }
      `}</style>
    </div>
  );
};

export default DescentScreen;
