/**
 * Start Screen Component
 * Genre and AI provider selection, new game initialization
 */

import React, { useState } from 'react';
import { StartScreenProps, GenreConfig, AIProvider } from '../../core/types/seams';
import { GlitchText } from '../effects/GlitchEffect';

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  availableGenres,
  availableProviders
}) => {
  const [selectedGenre, setSelectedGenre] = useState<GenreConfig | null>(
    availableGenres[0] || null
  );
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(
    availableProviders[0] || AIProvider.MOCK
  );

  const handleStartGame = () => {
    if (selectedGenre) {
      onStartGame(selectedGenre, selectedProvider);
    }
  };

  const getProviderLabel = (provider: AIProvider): string => {
    switch (provider) {
      case AIProvider.GROK:
        return 'Grok-4 (X.AI)';
      case AIProvider.MOCK:
        return 'Demo Mode';
      default:
        return provider;
    }
  };

  return (
    <div className="start-screen screen-container drip-panel">
      <div className="start-screen-content">
        <header className="start-header">
          <h1 className="game-title">
            <GlitchText text="APOPHENIA" intensity={5} />
          </h1>
          <p className="game-subtitle">
            A Descent into Cognitive Horror
          </p>
        </header>

        <div className="start-sections">
          <section className="genre-selection card">
            <h2 className="section-title">Select Your Nightmare</h2>
            <div className="genre-grid">
              {availableGenres.map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  className={`genre-card ${selectedGenre?.id === genre.id ? 'selected' : ''}`}
                  onClick={() => setSelectedGenre(genre)}
                >
                  <h3 className="genre-name">{genre.name}</h3>
                  <p className="genre-description">{genre.description}</p>
                  <div className="genre-themes">
                    {genre.themes.slice(0, 3).map((theme, idx) => (
                      <span key={idx} className="theme-tag">
                        {theme}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="provider-selection card">
            <h2 className="section-title">AI Provider</h2>
            <div className="provider-list">
              {availableProviders.map((provider) => (
                <label
                  key={provider}
                  className={`provider-option ${selectedProvider === provider ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="provider"
                    value={provider}
                    checked={selectedProvider === provider}
                    onChange={() => setSelectedProvider(provider)}
                  />
                  <span className="provider-label">
                    {getProviderLabel(provider)}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <div className="start-actions">
            <button
              type="button"
              className="button start-button"
              onClick={handleStartGame}
              disabled={!selectedGenre}
            >
              Begin Descent
            </button>
          </div>
        </div>

        <footer className="start-footer">
          <p className="warning-text">
            ⚠ Warning: This experience may cause psychological discomfort.
          </p>
        </footer>
      </div>

      <style>{`
        .start-screen {
          padding: var(--spacing-xl);
        }

        .start-screen-content {
          max-width: 900px;
          width: 100%;
        }

        .start-header {
          text-align: center;
          margin-bottom: var(--spacing-xl);
        }

        .game-title {
          font-size: 4rem;
          margin-bottom: var(--spacing-sm);
          text-shadow: var(--shadow-glow-intense);
          animation: pulse-glow 3s infinite;
        }

        .game-subtitle {
          font-family: var(--font-horror);
          font-size: 1.5rem;
          color: var(--color-dim-gray);
          font-style: italic;
        }

        .start-sections {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .section-title {
          font-size: 1.5rem;
          margin-bottom: var(--spacing-md);
          color: var(--color-eldritch-purple-light);
        }

        .genre-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-md);
        }

        .genre-card {
          background: rgba(26, 31, 58, 0.6);
          border: var(--border-medium) solid var(--color-void-light);
          border-radius: var(--border-radius);
          padding: var(--spacing-md);
          cursor: pointer;
          transition: all var(--transition-normal);
          text-align: left;
        }

        .genre-card:hover {
          border-color: var(--color-eldritch-purple);
          transform: translateY(-4px);
          box-shadow: var(--shadow-glow);
        }

        .genre-card.selected {
          border-color: var(--color-eldritch-purple-light);
          background: rgba(45, 27, 78, 0.4);
          box-shadow: var(--shadow-glow);
        }

        .genre-name {
          font-size: 1.25rem;
          margin-bottom: var(--spacing-xs);
          color: var(--color-void-white);
        }

        .genre-description {
          font-size: 0.9rem;
          color: var(--color-dim-gray);
          margin-bottom: var(--spacing-sm);
          line-height: 1.5;
        }

        .genre-themes {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
        }

        .theme-tag {
          font-size: 0.75rem;
          padding: 2px 8px;
          background: rgba(45, 27, 78, 0.5);
          border: 1px solid var(--color-eldritch-purple);
          border-radius: var(--border-radius);
          color: var(--color-eldritch-purple-light);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .provider-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .provider-option {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          border: var(--border-thin) solid var(--color-void-light);
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all var(--transition-normal);
        }

        .provider-option:hover {
          border-color: var(--color-eldritch-purple);
          background: rgba(45, 27, 78, 0.2);
        }

        .provider-option.selected {
          border-color: var(--color-eldritch-purple-light);
          background: rgba(45, 27, 78, 0.3);
          box-shadow: var(--shadow-glow);
        }

        .provider-option input[type="radio"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .provider-label {
          font-size: 1rem;
          color: var(--color-void-white);
        }

        .start-actions {
          margin-top: var(--spacing-lg);
          text-align: center;
        }

        .start-button {
          font-size: 1.25rem;
          padding: var(--spacing-md) var(--spacing-xl);
          min-width: 250px;
        }

        .start-footer {
          margin-top: var(--spacing-xl);
          text-align: center;
        }

        .warning-text {
          font-size: 0.875rem;
          color: var(--color-blood-red-light);
          font-style: italic;
          animation: pulse-glow 2s infinite;
        }

        @media (max-width: 768px) {
          .game-title {
            font-size: 2.5rem;
          }

          .game-subtitle {
            font-size: 1.1rem;
          }

          .genre-grid {
            grid-template-columns: 1fr;
          }

          .start-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default StartScreen;
