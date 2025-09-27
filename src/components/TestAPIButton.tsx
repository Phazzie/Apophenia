/**
 * @file TestAPIButton.tsx
 * @description A component that renders a fixed-position button for testing the selected AI model's API connectivity.
 * @deprecated This component is being replaced by the more integrated `CompactTestAPI` and `CompactModelSelector`.
 */

import React, { useState } from 'react';
import { useAIModelStore } from '../stores/aiModelStore';

/**
 * Renders a button in a fixed position on the screen to allow users to test
 * the current AI model's API connection at any time.
 * When clicked, it initiates a test and displays the result (success or failure) in a small popup.
 *
 * @returns {React.ReactElement} A React component for testing the AI API.
 */
const TestAPIButton: React.FC = () => {
  const {
    getSelectedModel,
    testModel,
    getTestResult,
    isTestingModel,
  } = useAIModelStore();

  const [showResult, setShowResult] = useState(false);
  
  const selectedModel = getSelectedModel();
  const isCurrentlyTesting = isTestingModel === selectedModel?.id;
  const testResult = selectedModel ? getTestResult(selectedModel.id) : undefined;

  const handleTest = async () => {
    if (!selectedModel || isCurrentlyTesting) return;
    
    await testModel(selectedModel.id);
    setShowResult(true);
    
    // Auto-hide result after 3 seconds
    setTimeout(() => {
      setShowResult(false);
    }, 3000);
  };

  const getButtonText = () => {
    if (isCurrentlyTesting) return 'Testing...';
    return 'Test API';
  };

  const getStatusIcon = () => {
    if (isCurrentlyTesting) return '⏳';
    if (testResult?.success) return '✅';
    if (testResult?.success === false) return '❌';
    return '🔍';
  };

  return (
    <>
      <button
        className="test-api-button"
        onClick={handleTest}
        disabled={isCurrentlyTesting || !selectedModel}
        title={`Test ${selectedModel?.name || 'AI model'} connectivity`}
      >
        <span className="test-icon">{getStatusIcon()}</span>
        <span className="test-text">{getButtonText()}</span>
      </button>

      {showResult && testResult && (
        <div className={`test-result-popup ${testResult.success ? 'success' : 'error'}`}>
          <div className="result-header">
            <span className="result-icon">
              {testResult.success ? '✅' : '❌'}
            </span>
            <span className="result-title">
              {selectedModel?.name} {testResult.success ? 'Connected' : 'Failed'}
            </span>
          </div>
          
          <div className="result-details">
            {testResult.success ? (
              <>
                <div>✓ API connection successful</div>
                <div>Context: {selectedModel?.contextWindow.toLocaleString()} tokens</div>
                {testResult.responseTime && (
                  <div>Response time: {testResult.responseTime}ms</div>
                )}
              </>
            ) : (
              <>
                <div>✗ Connection failed</div>
                {testResult.error && <div>Error: {testResult.error}</div>}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TestAPIButton;