/**
 * Story Segment Display Component
 * Renders story segments with images, metadata, and corruption effects
 */

import React from 'react';
import { StorySegment } from '../../core/types/seams';
import { CorruptionEffect } from '../effects/CorruptionEffect';
import { GlitchText } from '../effects/GlitchEffect';
import { LoadingText } from './LoadingIndicator';

export interface StorySegmentDisplayProps {
  segment: StorySegment;
  showImage?: boolean;
  showMetadata?: boolean;
  className?: string;
}

/**
 * Story Segment Display Component
 * Renders a single story segment with all metadata and effects
 */
const StorySegmentDisplayComponent: React.FC<StorySegmentDisplayProps> = ({
  segment,
  showImage = true,
  showMetadata = true,
  className = ''
}) => {
  const corruptionLevel = segment.corruptionLevel || 0;

  // Determine if this segment has special properties
  const isRevised = segment.isRevised || false;
  const isQuantumShift = segment.isQuantumShift || false;
  const isMetaEvent = segment.isMetaEvent || false;

  const renderImage = () => {
    if (!showImage || !segment.images) return null;

    const { main, mainStatus, inset } = segment.images;

    if (mainStatus === 'loading') {
      return (
        <div className="segment-image-container loading">
          <div className="image-placeholder">
            <LoadingText text="Manifesting reality" />
          </div>
        </div>
      );
    }

    if (mainStatus === 'failed' || !main) {
      return null;
    }

    return (
      <div className="segment-image-container">
        <CorruptionEffect level={corruptionLevel}>
          <img
            src={main}
            alt={`Illustration for: ${segment.text.substring(0, 100)}${segment.text.length > 100 ? '...' : ''}`}
            className="segment-image"
            loading="lazy"
          />
        </CorruptionEffect>
        {inset && inset.length > 0 && (
          <div className="segment-inset-images">
            {inset.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Detail image ${idx + 1} related to story`}
                className="segment-inset-image"
                loading="lazy"
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMetadata = () => {
    if (!showMetadata) return null;

    const badges = [];

    if (isRevised) {
      badges.push(
        <span key="revised" className="metadata-badge revised">
          [MEMORY REVISED]
        </span>
      );
    }

    if (isQuantumShift) {
      badges.push(
        <span key="quantum" className="metadata-badge quantum">
          [TIMELINE SHIFT]
        </span>
      );
    }

    if (isMetaEvent) {
      badges.push(
        <span key="meta" className="metadata-badge meta">
          [FOURTH WALL BREACH]
        </span>
      );
    }

    if (corruptionLevel > 50) {
      badges.push(
        <span key="corruption" className="metadata-badge corruption">
          [REALITY CORRUPTED: {corruptionLevel}%]
        </span>
      );
    }

    if (badges.length === 0) return null;

    return (
      <div className="segment-metadata">
        {badges}
      </div>
    );
  };

  const renderText = () => {
    if (corruptionLevel > 70) {
      return (
        <GlitchText
          text={segment.text}
          intensity={Math.floor(corruptionLevel / 10)}
          className="segment-text"
        />
      );
    }

    return (
      <CorruptionEffect level={corruptionLevel / 2}>
        <p className="segment-text">{segment.text}</p>
      </CorruptionEffect>
    );
  };

  return (
    <article
      className={`story-segment ${className}`}
      data-segment-id={segment.id}
      data-corruption={corruptionLevel}
    >
      {renderMetadata()}
      {renderImage()}
      <div className="segment-content">
        {renderText()}
        {segment.originalText && isRevised && (
          <details className="segment-original">
            <summary className="original-text-toggle">
              [View Original Memory]
            </summary>
            <p className="original-text">{segment.originalText}</p>
          </details>
        )}
      </div>
      <style>{`
        .story-segment {
          margin-bottom: var(--spacing-lg);
          animation: fade-in 0.6s ease;
        }

        .segment-metadata {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
          margin-bottom: var(--spacing-sm);
        }

        .metadata-badge {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: var(--border-radius);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .metadata-badge.revised {
          background: rgba(45, 27, 78, 0.5);
          color: var(--color-eldritch-purple-light);
          border: 1px solid var(--color-eldritch-purple);
        }

        .metadata-badge.quantum {
          background: rgba(30, 58, 95, 0.5);
          color: var(--color-cosmic-blue-light);
          border: 1px solid var(--color-cosmic-blue);
        }

        .metadata-badge.meta {
          background: rgba(139, 0, 0, 0.5);
          color: var(--color-blood-red-light);
          border: 1px solid var(--color-blood-red);
          animation: pulse-glow 2s infinite;
        }

        .metadata-badge.corruption {
          background: rgba(212, 175, 55, 0.2);
          color: var(--color-corrupted-gold);
          border: 1px solid var(--color-corrupted-gold);
          animation: flicker 3s infinite;
        }

        .segment-image-container {
          margin-bottom: var(--spacing-md);
          border-radius: var(--border-radius);
          overflow: hidden;
        }

        .segment-image-container.loading {
          background: rgba(26, 31, 58, 0.5);
          border: 1px dashed var(--color-eldritch-purple);
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-placeholder {
          text-align: center;
          padding: var(--spacing-lg);
        }

        .segment-image {
          width: 100%;
          height: auto;
          display: block;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-depth);
        }

        .segment-inset-images {
          display: flex;
          gap: var(--spacing-xs);
          margin-top: var(--spacing-xs);
        }

        .segment-inset-image {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: var(--border-radius);
          border: 1px solid var(--color-eldritch-purple);
        }

        .segment-content {
          line-height: 1.8;
        }

        .segment-text {
          font-size: 1.1rem;
          margin-bottom: var(--spacing-md);
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .segment-original {
          margin-top: var(--spacing-md);
          padding: var(--spacing-sm);
          background: rgba(45, 27, 78, 0.2);
          border-left: 3px solid var(--color-eldritch-purple);
          border-radius: var(--border-radius);
        }

        .original-text-toggle {
          cursor: pointer;
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--color-eldritch-purple-light);
          margin-bottom: var(--spacing-xs);
        }

        .original-text-toggle:hover {
          color: var(--color-void-white);
        }

        .original-text {
          font-size: 0.95rem;
          color: var(--color-dim-gray);
          font-style: italic;
          margin-top: var(--spacing-xs);
        }

        @media (max-width: 768px) {
          .segment-text {
            font-size: 1rem;
          }

          .segment-inset-image {
            width: 80px;
            height: 80px;
          }
        }
      `}</style>
    </article>
  );
};

/**
 * Story History Display Component
 * Renders multiple story segments
 */
export interface StoryHistoryDisplayProps {
  segments: StorySegment[];
  showImages?: boolean;
  showMetadata?: boolean;
  maxSegments?: number;
  className?: string;
}

const StoryHistoryDisplayComponent: React.FC<StoryHistoryDisplayProps> = ({
  segments,
  showImages = true,
  showMetadata = true,
  maxSegments,
  className = ''
}) => {
  const displaySegments = maxSegments
    ? segments.slice(-maxSegments)
    : segments;

  return (
    <div className={`story-history ${className}`}>
      {displaySegments.map((segment) => (
        <StorySegmentDisplay
          key={segment.id}
          segment={segment}
          showImage={showImages}
          showMetadata={showMetadata}
        />
      ))}
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const StorySegmentDisplay = React.memo(StorySegmentDisplayComponent);
export const StoryHistoryDisplay = React.memo(StoryHistoryDisplayComponent);

export default StorySegmentDisplay;
