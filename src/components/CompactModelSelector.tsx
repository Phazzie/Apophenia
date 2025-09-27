/**
 * @file CompactModelSelector.tsx
 * @description A compact component for selecting the active AI model.
 * It appears as a small button in the corner of the screen, expanding into a list of available models.
 */

import React, { useState } from 'react';
import { useAIModelStore } from '../stores/aiModelStore';

/**
 * Renders a compact AI model selector button that expands into a dropdown menu.
 * This component allows users to switch between different AI models (e.g., Grok, Gemini)
 * and displays key features of each model, such as context window size and special capabilities.
 *
 * @returns {React.ReactElement} A React component for AI model selection.
 */
const CompactModelSelector: React.FC = () => {
  const {
    selectedModelId,
    getAllModels,
    getSelectedModel,
    setSelectedModel,
  } = useAIModelStore();

  const [isOpen, setIsOpen] = useState(false);
  const models = getAllModels();
  const selectedModel = getSelectedModel();

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    setIsOpen(false);
  };

  return (
    <div className="compact-model-selector">
      <button
        className="compact-model-button"
        onClick={() => setIsOpen(!isOpen)}
        title={`Current model: ${selectedModel?.name || 'Unknown'}`}
      >
        <span className="model-icon">🧠</span>
        <span className="model-name">{selectedModel?.name.split(' ')[0] || 'AI'}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="compact-model-dropdown">
          {models.map((model) => (
            <button
              key={model.id}
              className={`model-option ${model.id === selectedModelId ? 'selected' : ''}`}
              onClick={() => handleModelSelect(model.id)}
            >
              <div className="model-info">
                <span className="model-name">{model.name}</span>
                <span className="model-provider">{model.provider}</span>
              </div>
              <div className="model-specs">
                <span title="Context window">{model.contextWindow >= 1000000 ? `${(model.contextWindow / 1000000).toFixed(1)}M` : `${Math.round(model.contextWindow / 1000)}K`}</span>
                {model.supportsThinking && <span title="Supports thinking">🧠</span>}
                {model.supportsImages && <span title="Supports images">🎨</span>}
              </div>
              {model.id === selectedModelId && <span className="check-mark">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompactModelSelector;