import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import TestAPIButtons from '../TestAPIButtons';
import { useAIModelStore } from '../../stores/aiModelStore';

// Mock the Zustand store
jest.mock('../../stores/aiModelStore');

const mockUseAIModelStore = useAIModelStore as jest.Mock;

describe('TestAPIButtons', () => {
  const mockTestModel = jest.fn();
  const mockGetSelectedModel = jest.fn();
  let mockGetTestResult = jest.fn();
  let mockIsTestingModel: string | null = null;

  beforeEach(() => {
    mockTestModel.mockClear();
    mockGetSelectedModel.mockReturnValue({ id: 'test-model', name: 'Test Model' });
    mockGetTestResult = jest.fn().mockReturnValue(null);
    mockIsTestingModel = null;

    mockUseAIModelStore.mockImplementation((selector) => {
      const state = {
        getSelectedModel: mockGetSelectedModel,
        testModel: mockTestModel,
        getTestResult: mockGetTestResult,
        isTestingModel: mockIsTestingModel,
      };
      // Handle being called with or without a selector
      return selector ? selector(state) : state;
    });
  });

  it('renders the two test buttons when a model is selected', () => {
    render(<TestAPIButtons />);
    expect(screen.getByText(/Test Text Generation API/)).toBeInTheDocument();
    expect(screen.getByText(/Test Image Generation API/)).toBeInTheDocument();
  });

  it('calls the testModel function with "text" when the text button is clicked', () => {
    render(<TestAPIButtons />);
    fireEvent.click(screen.getByText(/Test Text Generation API/));
    expect(mockTestModel).toHaveBeenCalledWith('test-model', 'text');
  });

  it('calls the testModel function with "image" when the image button is clicked', () => {
    render(<TestAPIButtons />);
    fireEvent.click(screen.getByText(/Test Image Generation API/));
    expect(mockTestModel).toHaveBeenCalledWith('test-model', 'image');
  });

  it('disables buttons when a test is in progress', () => {
    mockIsTestingModel = 'test-model';
    render(<TestAPIButtons />);
    expect(screen.getByText(/Test Text Generation API/)).toBeDisabled();
    expect(screen.getByText(/Test Image Generation API/)).toBeDisabled();
  });

  it('displays a success message when a test is successful', async () => {
    mockGetTestResult.mockImplementation((modelId, testType) => {
      if (testType === 'text') return { success: true, responseTime: 100, error: null };
      return null;
    });

    render(<TestAPIButtons />);

    await act(async () => {
      fireEvent.click(screen.getByText(/Test Text Generation API/));
    });

    expect(screen.getByText(/Success \(100ms\)/)).toBeInTheDocument();
  });

  it('displays an error message when a test fails', async () => {
    mockGetTestResult.mockImplementation((modelId, testType) => {
      if (testType === 'text') return { success: false, responseTime: null, error: 'API Error' };
      return null;
    });

    render(<TestAPIButtons />);

    await act(async () => {
      fireEvent.click(screen.getByText(/Test Text Generation API/));
    });

    expect(screen.getByText(/Failed: API Error/)).toBeInTheDocument();
  });

  it('does not render buttons if no model is selected', () => {
    mockGetSelectedModel.mockReturnValue(null);
    render(<TestAPIButtons />);
    expect(screen.queryByText(/Test Text Generation API/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Test Image Generation API/)).not.toBeInTheDocument();
  });
});