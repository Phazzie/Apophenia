/**
 * AI Model Selector Component
 * Allows users to choose between different AI models
 */

import React from 'react';
import { useAIModelStore, type AIModelType } from '../stores/aiModelStore';

const AIModelSelector: React.FC = () => {
  const { selectedModel, setSelectedModel, getModelDisplayName, getModelDescription } = useAIModelStore();

  const models: AIModelType[] = ['gemini-2.5-pro', 'grok-4-fast-reasoning'];

  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const model = event.target.value as AIModelType;
    setSelectedModel(model);
  };

  return (
    <div className="ai-model-selector" style={{ 
      marginBottom: '20px',
      padding: '15px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      backgroundColor: 'rgba(0, 0, 0, 0.3)'
    }}>
      <label htmlFor="ai-model-select" style={{ 
        display: 'block', 
        marginBottom: '8px',
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.8)'
      }}>
        AI Model:
      </label>
      
      <select
        id="ai-model-select"
        value={selectedModel}
        onChange={handleModelChange}
        style={{
          width: '100%',
          padding: '8px 12px',
          marginBottom: '8px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '4px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          fontSize: '14px'
        }}
      >
        {models.map(model => (
          <option key={model} value={model}>
            {getModelDisplayName(model)}
          </option>
        ))}
      </select>
      
      <p style={{ 
        fontSize: '12px', 
        color: 'rgba(255, 255, 255, 0.6)',
        margin: 0,
        lineHeight: '1.4'
      }}>
        {getModelDescription(selectedModel)}
      </p>
    </div>
  );
};

export default AIModelSelector;