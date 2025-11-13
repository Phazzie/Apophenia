
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAIModelStore } from '../../stores/aiModelStore';
import * as gameService from '../../services/gameService';
import * as unifiedAIService from '../../services/ai/unifiedAIService';
import CompactTestAPI from '../CompactTestAPI';
import { vi, Mock } from 'vitest';

// Mock the zustand store and services
vi.mock('../../stores/aiModelStore');
vi.mock('../../services/gameService');
vi.mock('../../services/ai/unifiedAIService');

const mockGetSelectedModel = vi.fn();
const mockGenerateMultipleImages = vi.fn();
const mockGenerateNextStep = vi.fn();

describe('CompactTestAPI', () => {
  beforeEach(() => {
    mockGetSelectedModel.mockReturnValue({ id: 'grok-1' });
    mockGenerateMultipleImages.mockResolvedValue([]);
    mockGenerateNextStep.mockResolvedValue({ content: 'Test story' });

    (useAIModelStore as unknown as Mock).mockReturnValue({
      getSelectedModel: mockGetSelectedModel,
    });
    vi.spyOn(gameService, 'generateMultipleImages').mockImplementation(mockGenerateMultipleImages);
    vi.spyOn(unifiedAIService, 'generateNextStepWithSelectedModel').mockImplementation(mockGenerateNextStep);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the test buttons', () => {
    render(<CompactTestAPI />);
    expect(screen.getByText('Test Image Gen')).toBeInTheDocument();
    expect(screen.getByText('Test Story Gen')).toBeInTheDocument();
  });

  it('calls the image generation service when the button is clicked', async () => {
    render(<CompactTestAPI />);
    fireEvent.click(screen.getByText('Test Image Gen'));
    await waitFor(() => {
      expect(mockGenerateMultipleImages).toHaveBeenCalled();
    });
  });

  it('calls the unified AI service when the story button is clicked', async () => {
    render(<CompactTestAPI />);
    fireEvent.click(screen.getByText('Test Story Gen'));
    await waitFor(() => {
      expect(mockGenerateNextStep).toHaveBeenCalled();
    });
  });
});
