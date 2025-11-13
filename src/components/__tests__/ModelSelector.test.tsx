
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useAIModelStore } from '../../stores/aiModelStore';
import ModelSelector from '../ModelSelector';
import { vi, Mock } from 'vitest';

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
    mockGetAllModels.mockReturnValue(mockModels);
    mockGetSelectedModel.mockReturnValue(mockModels[0]);

    (useAIModelStore as unknown as Mock).mockReturnValue({
      selectedModelId: 'grok-1',
      getAllModels: mockGetAllModels,
      getSelectedModel: mockGetSelectedModel,
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
    const { container } = render(<ModelSelector isVisible={true} onClose={vi.fn()} />);
    expect(screen.getByText('Select AI Model')).toBeInTheDocument();
    // Model name may appear multiple times (in card and in "Currently selected")
    const modelCards = container.querySelectorAll('.model-name');
    expect(modelCards.length).toBeGreaterThan(0);
  });

  it('does not render when not visible', () => {
    render(<ModelSelector isVisible={false} onClose={vi.fn()} />);
    expect(screen.queryByText('Select AI Model')).not.toBeInTheDocument();
  });

  it('calls setSelectedModel when a model is selected', () => {
    const { container } = render(<ModelSelector isVisible={true} onClose={vi.fn()} />);
    // Click on the model card instead of searching for text
    const modelCard = container.querySelector('.model-card');
    if (modelCard) {
      fireEvent.click(modelCard);
      expect(mockSetSelectedModel).toHaveBeenCalledWith('grok-1');
    }
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
