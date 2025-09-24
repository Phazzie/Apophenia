/**
 * Compact Test API Component
 * 
 * Small unobtrusive API testing with text and image options
 */

import React, { useState } from 'react';
import { useAIModelStore } from '../stores/aiModelStore';

const CompactTestAPI: React.FC = () => {
  const {
    getSelectedModel,
    testModel,
    getTestResult,
    isTestingModel,
  } = useAIModelStore();

  const [showOptions, setShowOptions] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lastTestType, setLastTestType] = useState<'text' | 'image'>('text');
  
  const selectedModel = getSelectedModel();
  const isCurrentlyTesting = isTestingModel === selectedModel?.id;
  const textResult = selectedModel ? getTestResult(selectedModel.id, 'text') : undefined;
  const imageResult = selectedModel ? getTestResult(selectedModel.id, 'image') : undefined;

  const handleTest = async (testType: 'text' | 'image') => {
    if (!selectedModel || isCurrentlyTesting) return;
    
    console.log(`Testing ${testType} API for ${selectedModel.name}`);
    setLastTestType(testType);
    setShowOptions(false);
    
    try {
      const result = await testModel(selectedModel.id, testType);
      setShowResult(true);
      
      // Auto-hide result after 4 seconds
      setTimeout(() => {
        setShowResult(false);
      }, 4000);
    } catch (error) {
      console.error('Test failed:', error);
      setShowResult(true);
      setTimeout(() => {
        setShowResult(false);
      }, 4000);
    }
  };

  const getStatusIcon = () => {
    if (isCurrentlyTesting) return '⏳';
    
    // Show status based on both text and image results
    const hasTextSuccess = textResult?.success;
    const hasImageSuccess = imageResult?.success;
    
    if (hasTextSuccess && hasImageSuccess) return '✅';
    if (hasTextSuccess || hasImageSuccess) return '🟡';
    if (textResult?.success === false || imageResult?.success === false) return '❌';
    return '🔍';
  };

  const currentResult = lastTestType === 'text' ? textResult : imageResult;

  return (
    <div className="compact-test-api">
      <button
        className="compact-test-button"
        onClick={() => setShowOptions(!showOptions)}
        disabled={isCurrentlyTesting}
        title={`Test ${selectedModel?.name || 'AI model'} API`}
      >
        <span className="test-icon">{getStatusIcon()}</span>
        <span className="test-text">Test</span>
        <span className={`dropdown-arrow ${showOptions ? 'open' : ''}`}>▼</span>
      </button>

      {showOptions && (
        <div className="test-options-dropdown">
          <button
            className="test-option"
            onClick={() => handleTest('text')}
            disabled={isCurrentlyTesting}
          >
            <span className="option-icon">📝</span>
            <span>Text Generation</span>
            {textResult && (
              <span className={`result-indicator ${textResult.success ? 'success' : 'error'}`}>
                {textResult.success ? '✓' : '✗'}
              </span>
            )}
          </button>
          
          <button
            className="test-option"
            onClick={() => handleTest('image')}
            disabled={isCurrentlyTesting}
          >
            <span className="option-icon">🎨</span>
            <span>Image Generation</span>
            {imageResult && (
              <span className={`result-indicator ${imageResult.success ? 'success' : 'error'}`}>
                {imageResult.success ? '✓' : '✗'}
              </span>
            )}
          </button>
        </div>
      )}

      {showResult && currentResult && (
        <div className={`compact-test-result ${currentResult.success ? 'success' : 'error'}`}>
          <div className="result-header">
            <span className="result-icon">
              {currentResult.success ? '✅' : '❌'}
            </span>
            <span className="result-title">
              {lastTestType === 'text' ? 'Text' : 'Image'} Test {currentResult.success ? 'Passed' : 'Failed'}
            </span>
          </div>
          
          {currentResult.success ? (
            <div className="result-details">
              {currentResult.responseTime && (
                <div>{currentResult.responseTime}ms</div>
              )}
            </div>
          ) : (
            <div className="result-details">
              <div className="error-message">{currentResult.error}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompactTestAPI;