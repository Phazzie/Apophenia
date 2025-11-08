/**
 * Compact Model Selector Component
 *
 * Small bottom-right button for AI model selection
 */

import React, { useState, useCallback } from 'react';
import { useAIModelStore } from '../stores/aiModelStore';

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

  const handleModelSelect = useCallback((modelId: string) => {
    setSelectedModel(modelId);
    setIsOpen(false);
  }, [setSelectedModel]);

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