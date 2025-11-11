/**
 * Loading Indicator Component
 * Thematic loading animation for cosmic horror aesthetic
 */

import React from 'react';
import { GlitchText } from '../effects/GlitchEffect';

export interface LoadingIndicatorProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'dots' | 'pulse';
  className?: string;
}

/**
 * Loading Indicator Component
 * Shows cosmic horror themed loading state
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  text = 'LOADING',
  size = 'medium',
  variant = 'spinner',
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  const spinnerSize = sizeClasses[size];

  const renderVariant = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className="loading-container">
            <div className={`loading-spinner ${spinnerSize}`} />
            {text && (
              <GlitchText
                text={text}
                intensity={3}
                className="loading-text"
              />
            )}
          </div>
        );

      case 'dots':
        return (
          <div className="loading-container">
            <div className="loading-dots">
              <span className="loading-dot" />
              <span className="loading-dot" />
              <span className="loading-dot" />
            </div>
            {text && (
              <GlitchText
                text={text}
                intensity={3}
                className="loading-text"
              />
            )}
          </div>
        );

      case 'pulse':
        return (
          <div className="loading-container">
            <div className="loading-pulse">
              {text && (
                <GlitchText
                  text={text}
                  intensity={3}
                  className="loading-text pulse"
                />
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`loading-indicator ${className}`}>
      {renderVariant()}
      <style>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
        }

        .loading-text {
          font-family: var(--font-mono);
          color: var(--color-eldritch-purple-light);
          font-size: 0.875rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .loading-text.pulse {
          animation: pulse-glow 1.5s infinite;
          font-size: 1.5rem;
        }

        .loading-dots {
          display: flex;
          gap: var(--spacing-xs);
        }

        .loading-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--color-eldritch-purple);
          animation: dot-pulse 1.4s infinite ease-in-out;
        }

        .loading-dot:nth-child(1) {
          animation-delay: -0.32s;
        }

        .loading-dot:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes dot-pulse {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .w-6 {
          width: 24px;
          height: 24px;
        }

        .w-10 {
          width: 40px;
          height: 40px;
        }

        .w-16 {
          width: 64px;
          height: 64px;
        }
      `}</style>
    </div>
  );
};

/**
 * Inline Loading Text Component
 */
export const LoadingText: React.FC<{ text?: string }> = ({ text = 'Loading' }) => (
  <span className="loading-text-inline">
    <GlitchText text={text} intensity={2} />
    <span className="loading-dots-inline">
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </span>
    <style>{`
      .loading-text-inline {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .loading-dots-inline span {
        animation: dot-fade 1.4s infinite;
      }

      .loading-dots-inline span:nth-child(1) {
        animation-delay: 0s;
      }

      .loading-dots-inline span:nth-child(2) {
        animation-delay: 0.2s;
      }

      .loading-dots-inline span:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes dot-fade {
        0%, 80%, 100% {
          opacity: 0;
        }
        40% {
          opacity: 1;
        }
      }
    `}</style>
  </span>
);

export default LoadingIndicator;
