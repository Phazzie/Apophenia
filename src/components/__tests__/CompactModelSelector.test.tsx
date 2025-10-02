
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useAIModelStore } from '../../stores/aiModelStore';
import CompactModelSelector from '../CompactModelSelector';
import { vi } from 'vitest';

// Mock the zustand store
vi.mock('../../stores/aiModelStore');

const mockGetAllModels = vi.fn();
const mockGetSelectedModel = vi.fn();
const mockSetSelectedModel = vi.fn();

const mockModels = [
  { id: 'grok-1', name: 'Grok 1', provider: 'xAI', contextWindow: 1000, supportsThinking: true, supportsImages: false },
  { id: 'gemini-1', name: 'Gemini 1', provider: 'Google', contextWindow: 2000, supportsThinking: false, supportsImages: true },
];

describe('CompactModelSelector', () => {
  beforeEach(() => {
    (useAIModelStore as unknown as jest.Mock).mockReturnValue({
      selectedModelId: 'grok-1',
      getAllModels: mockGetAllModels.mockReturnValue(mockModels),
      getSelectedModel: mockGetSelectedModel.mockReturnValue(mockModels[0]),
      setSelectedModel: mockSetSelectedModel,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the button with the selected model name', () => {
    render(<CompactModelSelector />);
    expect(screen.getByText('Grok')).toBeInTheDocument();
  });

  it('opens the dropdown on button click', () => {
    render(<CompactModelSelector />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Grok 1')).toBeInTheDocument();
    expect(screen.getByText('Gemini 1')).toBeInTheDocument();
  });

  it('calls setSelectedModel when a new model is selected', () => {
    render(<CompactModelSelector />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Gemini 1'));
    expect(mockSetSelectedModel).toHaveBeenCalledWith('gemini-1');
  });

  it('closes the dropdown after selecting a model', () => {
    render(<CompactModelSelector />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Gemini 1'));
    expect(screen.queryByText('Grok 1')).not.toBeInTheDocument();
  });
});
