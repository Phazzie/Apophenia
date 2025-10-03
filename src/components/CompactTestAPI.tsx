import React from 'react';
import { useAIModelStore } from '../stores/aiModelStore';
import { AIModel } from '../types';

const CompactTestAPI: React.FC = () => {
  const {
    getAllModels,
    testBackendConnection,
    getTestResult,
    isTestingModel,
  } = useAIModelStore();

  const models = getAllModels();

  const handleTestConnection = (model: AIModel) => {
    // No need to guard, the store handles the `isTestingModel` state.
    testBackendConnection(model.id);
  };

  return (
    <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end', background: 'rgba(0,0,0,0.5)', padding: '5px', borderRadius: '5px' }}>
      <span style={{ fontSize: '10px', color: 'white', alignSelf: 'center' }}>Backend Health</span>
      {models.map(model => {
        const result = getTestResult(model.id);
        const isLoading = isTestingModel === model.id;

        let statusIndicator;
        if (isLoading) {
          statusIndicator = <span style={{ color: 'yellow', marginLeft: '5px' }}>...</span>;
        } else if (result) {
          statusIndicator = result.success ?
            <span style={{ color: 'lightgreen', marginLeft: '5px' }}>✔</span> :
            <span style={{ color: 'red', marginLeft: '5px' }} title={result.error}>✖</span>;
        }

        return (
            <button
              key={model.id}
              onClick={() => handleTestConnection(model)}
              disabled={isLoading}
              style={{ fontSize: '10px', padding: '2px 5px', display: 'flex', alignItems: 'center' }}
            >
              Test {model.provider}
              {statusIndicator}
            </button>
        );
      })}
    </div>
  );
};

export default CompactTestAPI;