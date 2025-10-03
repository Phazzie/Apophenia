/**
 * AI Model Viewer & Backend Diagnostic Tool
 *
 * Displays information about the AI models powering the application
 * and allows users to test the connectivity to the secure backend.
 */

import React, { useState } from 'react';
import { useAIModelStore } from '../stores/aiModelStore';
import { AIModel } from '../types';

interface ModelSelectorProps {
  isVisible: boolean;
  onClose: () => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ isVisible, onClose }) => {
  const {
    getAllModels,
    getTestResult,
    testBackendConnection,
    isTestingModel,
  } = useAIModelStore();

  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const models = getAllModels();

  const handleTestConnection = async (modelId: string) => {
    await testBackendConnection(modelId);
  };

  const renderModelCard = (model: AIModel) => {
    const testResult = getTestResult(model.id);
    const isCurrentlyTesting = isTestingModel === model.id;
    const isExpanded = expandedModel === model.id;

    return (
      <div
        key={model.id}
        className={`model-card ${model.isDefault ? 'selected' : ''}`}
      >
        <div className="model-header">
          <div className="model-info">
            <div className="model-name">{model.name}</div>
            <div className="model-provider">{model.provider}</div>
            {model.isDefault && <span className="default-badge">Primary</span>}
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
              handleTestConnection(model.id);
            }}
            disabled={isCurrentlyTesting}
          >
            {isCurrentlyTesting ? 'Testing...' : 'Test Backend'}
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
                </ul>
              )}
              {model.id.startsWith('gemini-') && (
                <ul>
                  <li>🎨 Image generation capabilities</li>
                  <li>📖 {model.contextWindow / 1000000}M token context window</li>
                  <li>🛡️ Advanced safety filtering</li>
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
          <h2>AI Consciousness Matrix</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="current-selection">
            <strong>Backend orchestrates multiple AI models for this experience.</strong>
          </div>

          <div className="models-grid">
            {models.map(renderModelCard)}
          </div>

          <div className="model-info-section">
            <h3>Why a Multi-Model Backend?</h3>
            <p>
              By using a secure backend, Apophenia can leverage the best features of multiple AI providers,
              ensuring the highest quality narrative generation while providing robust fallbacks. This architecture
              also protects the API keys and centralizes the complex AI logic.
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