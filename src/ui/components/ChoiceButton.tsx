/**
 * Choice Button Component
 * Renders interactive choice buttons with special styling for intrusive thoughts
 */

import React, { useState } from 'react';
import { Choice } from '../../core/types/seams';

export interface ChoiceButtonProps {
  choice: Choice;
  disabled?: boolean;
  onClick: () => void;
  intrusive?: boolean;
  className?: string;
}

/**
 * Choice Button Component
 * Displays a clickable choice with appropriate styling
 */
const ChoiceButtonComponent: React.FC<ChoiceButtonProps> = ({
  choice,
  disabled = false,
  onClick,
  intrusive = false,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const buttonClass = [
    'choice-button',
    'button',
    intrusive || choice.isIntrusive ? 'intrusive' : '',
    disabled ? 'disabled' : '',
    isHovered && !disabled ? 'hovered' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={buttonClass}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={`Choice: ${choice.text}`}
      aria-describedby={choice.consequence ? `consequence-${choice.id}` : undefined}
      tabIndex={disabled ? -1 : 0}
      data-choice-id={choice.id}
      data-intrusive={intrusive || choice.isIntrusive}
    >
      <span className="choice-text">
        {choice.text}
      </span>
      {choice.consequence && (
        <span
          className="choice-consequence"
          id={`consequence-${choice.id}`}
        >
          {choice.consequence}
        </span>
      )}
      <style>{`
        .choice-button {
          width: 100%;
          text-align: left;
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-sm);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
          position: relative;
          overflow: hidden;
        }

        .choice-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(45, 27, 78, 0.3),
            transparent
          );
          transition: left 0.5s ease;
        }

        .choice-button.hovered:not(.disabled)::before {
          left: 100%;
        }

        .choice-text {
          font-size: 1rem;
          line-height: 1.5;
          position: relative;
          z-index: 1;
        }

        .choice-consequence {
          font-size: 0.875rem;
          color: var(--color-dim-gray);
          font-style: italic;
          position: relative;
          z-index: 1;
        }

        .choice-button.intrusive {
          border-color: var(--color-blood-red);
          background: rgba(139, 0, 0, 0.2);
        }

        .choice-button.intrusive:hover:not(.disabled) {
          border-color: var(--color-blood-red-light);
          background: rgba(139, 0, 0, 0.4);
          box-shadow: 0 0 20px rgba(139, 0, 0, 0.6);
        }

        .choice-button.intrusive .choice-text {
          color: var(--color-blood-red-light);
          text-shadow: 0 0 5px rgba(139, 0, 0, 0.8);
        }

        .choice-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .choice-button {
            padding: var(--spacing-sm);
          }

          .choice-text {
            font-size: 0.9rem;
          }

          .choice-consequence {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </button>
  );
};

/**
 * Choice List Component
 * Renders a list of choice buttons
 */
export interface ChoiceListProps {
  choices: Choice[];
  intrusiveThought?: Choice;
  disabled?: boolean;
  onChoice: (choice: Choice) => void;
  className?: string;
}

export const ChoiceList: React.FC<ChoiceListProps> = ({
  choices,
  intrusiveThought,
  disabled = false,
  onChoice,
  className = ''
}) => {
  return (
    <div className={`choice-list ${className}`}>
      {choices.map((choice) => (
        <ChoiceButton
          key={choice.id}
          choice={choice}
          disabled={disabled}
          onClick={() => onChoice(choice)}
        />
      ))}
      {intrusiveThought && (
        <ChoiceButton
          key={intrusiveThought.id}
          choice={intrusiveThought}
          disabled={disabled}
          onClick={() => onChoice(intrusiveThought)}
          intrusive
        />
      )}
      <style>{`
        .choice-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-md);
        }
      `}</style>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const ChoiceButton = React.memo(ChoiceButtonComponent);

export default ChoiceButton;
