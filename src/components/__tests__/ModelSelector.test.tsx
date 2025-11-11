
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useAIModelStore } from '../../stores/aiModelStore';
import ModelSelector from '../ModelSelector';
import { vi } from 'vitest';

// Mock the zustand store
vi.mock('../../stores/aiModelStore');

const mockGetAllModels = vi.fn();
const mockGetSelectedModel = vi.fn();
const mockSetSelectedModel = vi.fn();
const mockTestModel = vi.fn();

const mockModels = [
  { id: 'grok-1', name: 'Grok 1', provider: 'xAI', contextWindow: 1000, supportsThinking: true, supportsImages: false, isDefault: true },
];

describe('ModelSelector', () => {
  beforeEach(() => {
    (useAIModelStore as unknown as jest.Mock).mockReturnValue({
      selectedModelId: 'grok-1',
      getAllModels: mockGetAllModels.mockReturnValue(mockModels),
      getSelectedModel: mockGetSelectedModel.mockReturnValue(mockModels[0]),
      getTestResult: vi.fn().mockReturnValue(null),
      setSelectedModel: mockSetSelectedModel,
      testModel: mockTestModel,
      isTestingModel: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the model selector when visible', () => {
    render(<ModelSelector isVisible={true} onClose={vi.fn()} />);
    expect(screen.getByText('Select AI Model')).toBeInTheDocument();
    expect(screen.getByText('Grok 1')).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    render(<ModelSelector isVisible={false} onClose={vi.fn()} />);
    expect(screen.queryByText('Select AI Model')).not.toBeInTheDocument();
  });

  it('calls setSelectedModel when a model is selected', () => {
    render(<ModelSelector isVisible={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Grok 1'));
    expect(mockSetSelectedModel).toHaveBeenCalledWith('grok-1');
  });

  it('calls testModel when the test button is clicked', () => {
    render(<ModelSelector isVisible={true} onClose={vi.fn()} />);
    // Get all buttons with the text "Test API"
    const testButtons = screen.getAllByText('Test API');
    // Click the first one
    fireEvent.click(testButtons[0]);
    expect(mockTestModel).toHaveBeenCalledWith('grok-1');
  });
});
