/**
 * @file ModelSelector.tsx
 * @description A modal component that allows users to select, compare, and test different AI models.
 */

import React, { useState } from 'react';
import { useAIModelStore } from '../stores/aiModelStore';
import { AIModel } from '../types';

/**
 * @interface ModelSelectorProps
 * @description Props for the ModelSelector component.
 * @property {boolean} isVisible - Controls the visibility of the modal.
 * @property {() => void} onClose - Callback function to close the modal.
 */
interface ModelSelectorProps {
  isVisible: boolean;
  onClose: () => void;
}

/**
 * A comprehensive modal for AI model selection.
 * It displays a list of available AI models, showing their features, capabilities, and current status.
 * Users can select a model, test its API connectivity, and view detailed information about its advanced features.
 *
 * @param {ModelSelectorProps} props - The props for the component.
 * @returns {React.ReactElement | null} A React element representing the model selection modal, or null if not visible.
 */
const ModelSelector: React.FC<ModelSelectorProps> = ({ isVisible, onClose }) => {
  const {
    selectedModelId,
    getAllModels,
    getSelectedModel,
    getTestResult,
    setSelectedModel,
    testModel,
    isTestingModel,
  } = useAIModelStore();

  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const models = getAllModels();

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const handleTestModel = async (modelId: string) => {
    await testModel(modelId);
  };

  const renderModelCard = (model: AIModel) => {
    const isSelected = model.id === selectedModelId;
    const testResult = getTestResult(model.id);
    const isCurrentlyTesting = isTestingModel === model.id;
    const isExpanded = expandedModel === model.id;

    return (
      <div
        key={model.id}
        className={`model-card ${isSelected ? 'selected' : ''}`}
        onClick={() => handleModelSelect(model.id)}
      >
        <div className="model-header">
          <div className="model-info">
            <div className="model-name">{model.name}</div>
            <div className="model-provider">{model.provider}</div>
            {model.isDefault && <span className="default-badge">Default</span>}
          </div>
          <div className="model-status">
            {isSelected && <span className="selected-indicator">✓</span>}
          </div>
        </div>

        <div className="model-features">
          <div className="feature-grid">
            <div className="feature">
              <span className="feature-label">Context:</span>
              <span className="feature-value">
                {model.contextWindow >= 1000000 
                  ? `${(model.contextWindow / 1000000).toFixed(1)}M tokens`
                  : `${Math.round(model.contextWindow / 1000)}K tokens`
                }
              </span>
            </div>
            <div className="feature">
              <span className="feature-label">Thinking:</span>
              <span className={`feature-value ${model.supportsThinking ? 'supported' : 'not-supported'}`}>
                {model.supportsThinking ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="feature">
              <span className="feature-label">Images:</span>
              <span className={`feature-value ${model.supportsImages ? 'supported' : 'not-supported'}`}>
                {model.supportsImages ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        <div className="model-actions">
          <button
            className="test-button"
            onClick={(e) => {
              e.stopPropagation();
              handleTestModel(model.id);
            }}
            disabled={isCurrentlyTesting}
          >
            {isCurrentlyTesting ? 'Testing...' : 'Test API'}
          </button>
          
          <button
            className="details-button"
            onClick={(e) => {
              e.stopPropagation();
              setExpandedModel(isExpanded ? null : model.id);
            }}
          >
            {isExpanded ? 'Less' : 'More'}
          </button>
        </div>

        {testResult && (
          <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
            <div className="result-status">
              {testResult.success ? '✓ Connection successful' : '✗ Connection failed'}
            </div>
            {testResult.responseTime && (
              <div className="result-time">{testResult.responseTime}ms</div>
            )}
            {testResult.error && (
              <div className="result-error">{testResult.error}</div>
            )}
          </div>
        )}

        {isExpanded && (
          <div className="model-details">
            <div className="detail-section">
              <h4>Advanced Features for {model.name}:</h4>
              {model.id === 'grok-4-fast-reasoning' && (
                <ul>
                  <li>🧠 Advanced reasoning with thinking mode</li>
                  <li>📚 2M token context for complete session memory</li>
                  <li>🎭 Deep psychological profiling across entire narrative</li>
                  <li>🔗 Cross-reference all story elements for perfect consistency</li>
                  <li>🌌 Multi-layered thematic coherence analysis</li>
                  <li>⚡ Fast reasoning optimized for interactive narratives</li>
                </ul>
              )}
              {model.id.startsWith('gemini-') && (
                <ul>
                  <li>🎨 Image generation capabilities</li>
                  <li>📖 {model.contextWindow / 1000000}M token context window</li>
                  <li>🛡️ Advanced safety filtering</li>
                  <li>🔄 Reliable fallback performance</li>
                  {model.supportsThinking && <li>🧠 Thinking mode support</li>}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div className="model-selector-overlay" onClick={onClose}>
      <div className="model-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Select AI Model</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="current-selection">
            <strong>Currently selected:</strong> {getSelectedModel()?.name || 'None'}
          </div>
          
          <div className="models-grid">
            {models.map(renderModelCard)}
          </div>
          
          <div className="model-info-section">
            <h3>Why Grok-4 Fast Reasoning is the Default:</h3>
            <p>
              Grok-4 offers a massive 2 million token context window (2x larger than Gemini) 
              with advanced reasoning capabilities. This enables unprecedented narrative consistency, 
              deep psychological analysis, and complex story development across your entire gaming session.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="apply-button" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelSelector;