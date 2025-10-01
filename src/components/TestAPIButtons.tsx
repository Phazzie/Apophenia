import React, { useState } from 'react';
import { useAIModelStore } from '../stores/aiModelStore';
import { ModelTestResult } from '../types';

const TestAPIButtons: React.FC = () => {
  const { getSelectedModel, testModel, getTestResult, isTestingModel } = useAIModelStore();
  const [lastTest, setLastTest] = useState<'text' | 'image' | null>(null);

  const selectedModel = getSelectedModel();

  const handleTest = async (testType: 'text' | 'image') => {
    if (!selectedModel) return;
    setLastTest(testType);
    await testModel(selectedModel.id, testType);
  };

  const renderTestButton = (testType: 'text' | 'image', label: string) => {
    if (!selectedModel) return null;

    const result = getTestResult(selectedModel.id, testType);
    const isCurrentlyTesting = isTestingModel === selectedModel.id;

    let statusIcon = '';
    if (result) {
      statusIcon = result.success ? '✓' : '✗';
    }

    return (
      <div className="api-test-container">
        <button
          onClick={() => handleTest(testType)}
          disabled={isCurrentlyTesting}
          className="api-test-button"
        >
          {isCurrentlyTesting && lastTest === testType ? 'Testing...' : `Test ${label} API`} {statusIcon}
        </button>
        {result && lastTest === testType && (
          <div className={`api-test-result ${result.success ? 'success' : 'error'}`}>
            {result.success ? `Success (${result.responseTime}ms)` : `Failed: ${result.error}`}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="api-test-controls">
      {renderTestButton('text', 'Text Generation')}
      {renderTestButton('image', 'Image Generation')}
    </div>
  );
};

export default TestAPIButtons;